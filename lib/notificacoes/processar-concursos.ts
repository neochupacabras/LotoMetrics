import pool from "@/lib/db";
import { createAdminClient } from "@/lib/supabase/server";
import { calcularIsPremium } from "@/lib/plano";
import { LOTERIAS } from "@/lib/format";
import { pontuarJogo, type ConcursoConferencia, type FaixaConcurso } from "@/lib/conferencia";
import { contarSequenciaAcumulada, deveAlertarAcumulo } from "@/lib/notificacoes/regras";
import { enviarEmail } from "@/lib/notificacoes/enviar";
import { urlDescadastro } from "@/lib/notificacoes/unsubscribe";
import { emailAlertaAcumulo, emailResultadoConcurso } from "@/lib/email-templates";

// Orquestrador central da Fase 1 (tarefas 1.3/1.4 do plano de
// implementação): processa concursos recém-importados e envia
// e-mail de resultado de jogos + alerta de acúmulo, com idempotência real
// via notificacoes_enviadas (nunca reenvia a mesma chave duas vezes) e
// modos seguros de teste (dryRun / somenteEmails) antes de liberar geral.
//
// Corrige o achado crítico da auditoria de 13/09/2026: o cron antigo
// (app/api/cron/conferir/route.ts) tentava embutir auth_user:user_id(email)
// a partir de user_games — PostgREST não resolve esse embed (auth.users
// não é uma FK exposta), a consulta falhava, o erro era engolido, e o job
// respondia "nenhum jogo ativo" com status success. Nenhum e-mail de
// resultado ou alerta jamais foi enviado. Agora profiles.email (migration
// 20260915000000_notificacoes.sql) elimina a necessidade desse embed.

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lotoanalitica.com.br";
const JANELA_HORAS_PADRAO = 48;

export interface OpcoesProcessamento {
  // Nunca chama o Resend nem grava notificacoes_enviadas — só relata o
  // que teria sido enviado. Usar antes de qualquer liberação em produção.
  dryRun: boolean;
  // Quando definido, só envia de verdade pros e-mails desta lista (mesmo
  // fora de dryRun) — segunda etapa de teste, depois do dry-run.
  somenteEmails?: Set<string>;
  janelaHoras?: number;
}

export interface DetalheEnvio {
  email: string;
  tipo: "resultado_jogos" | "alerta_acumulo";
  loteria: string;
  concurso: number;
  status: "enviado" | "falhou" | "simulado" | "pulado_dedup" | "pulado_filtro";
  erro?: string;
}

export interface ResumoProcessamento {
  concursosProcessados: { loteria: string; numero: number }[];
  emailsEnviados: number;
  emailsFalhos: number;
  emailsSimulados: number;
  detalhes: DetalheEnvio[];
}

interface ConcursoRow {
  concurso_id: number;
  numero: number;
  loteria_codigo: string;
  dezenas: number[];
  dezenas_segundo_sorteio: number[] | null;
  acumulado: boolean;
  valor_estimado_proximo: string | null;
  data_proximo_concurso: string | null;
}

async function buscarConcursosRecentes(janelaHoras: number): Promise<ConcursoRow[]> {
  const { rows } = await pool.query<Omit<ConcursoRow, "data_proximo_concurso"> & { data_proximo_concurso: Date | string | null }>(
    `SELECT c.id AS concurso_id, c.numero, l.codigo AS loteria_codigo, c.dezenas,
            c.dezenas_segundo_sorteio, c.acumulado, c.valor_estimado_proximo,
            c.data_proximo_concurso
     FROM concurso c
     JOIN loteria l ON l.id = c.loteria_id
     WHERE c.criado_em > now() - make_interval(hours => $1::int)
     ORDER BY l.codigo, c.numero`,
    [janelaHoras]
  );
  // pg devolve colunas DATE como objeto Date, não string — mesma
  // normalização já usada em lib/queries.ts.
  return rows.map((r) => ({
    ...r,
    data_proximo_concurso:
      r.data_proximo_concurso instanceof Date
        ? r.data_proximo_concurso.toISOString()
        : r.data_proximo_concurso,
  }));
}

async function buscarFaixas(concursoId: number): Promise<FaixaConcurso[]> {
  const { rows } = await pool.query<{
    faixa: number; descricao_faixa: string; valor_premio: string; qtd_ganhadores: number;
  }>(
    `SELECT faixa, descricao_faixa, valor_premio, qtd_ganhadores
     FROM premiacao_faixa WHERE concurso_id = $1`,
    [concursoId]
  );
  return rows.map((r) => ({
    faixa: r.faixa,
    descricaoFaixa: r.descricao_faixa,
    valorPremio: Number(r.valor_premio),
    qtdGanhadores: r.qtd_ganhadores,
  }));
}

// Sequência de concursos acumulados terminando no concurso atual — usada
// só pro gatilho "sorteios_sem_ganhador" do alerta de acúmulo.
async function buscarSequenciaAcumulada(loteriaCodigo: string, numeroAtual: number): Promise<number> {
  const { rows } = await pool.query<{ numero: number; acumulado: boolean }>(
    `SELECT c.numero, c.acumulado
     FROM concurso c JOIN loteria l ON l.id = c.loteria_id
     WHERE l.codigo = $1 AND c.numero <= $2
     ORDER BY c.numero DESC
     LIMIT 30`,
    [loteriaCodigo, numeroAtual]
  );
  return contarSequenciaAcumulada(rows);
}

// Reivindica a chave em notificacoes_enviadas antes de enviar (evita
// reenvio se o processo rodar duas vezes) e grava o resultado do envio.
async function reivindicarEEnviar(
  opcoes: OpcoesProcessamento,
  params: { userId: string; email: string; tipo: "resultado_jogos" | "alerta_acumulo"; loteria: string; concurso: number; chave: string },
  montarEmail: () => { subject: string; html: string }
): Promise<DetalheEnvio> {
  const base: Omit<DetalheEnvio, "status" | "erro"> = {
    email: params.email, tipo: params.tipo, loteria: params.loteria, concurso: params.concurso,
  };

  if (opcoes.somenteEmails && !opcoes.somenteEmails.has(params.email)) {
    return { ...base, status: "pulado_filtro" };
  }

  if (opcoes.dryRun) {
    return { ...base, status: "simulado" };
  }

  const { rows } = await pool.query<{ id: number }>(
    `INSERT INTO notificacoes_enviadas (user_id, tipo, loteria, concurso, chave)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id, tipo, chave) DO NOTHING
     RETURNING id`,
    [params.userId, params.tipo, params.loteria, params.concurso, params.chave]
  );
  const notificacaoId = rows[0]?.id;
  if (!notificacaoId) {
    return { ...base, status: "pulado_dedup" };
  }

  const { subject, html } = montarEmail();
  const resultado = await enviarEmail({ to: params.email, subject, html });

  if (!resultado.ok) {
    await pool.query(
      `UPDATE notificacoes_enviadas SET status = 'falhou', erro = $2 WHERE id = $1`,
      [notificacaoId, resultado.erro ?? "erro desconhecido"]
    );
    return { ...base, status: "falhou", erro: resultado.erro };
  }
  return { ...base, status: "enviado" };
}

interface JogoComPerfil {
  id: string;
  user_id: string;
  dezenas: number[];
  label: string | null;
  profiles: { plan: string | null; plan_expires_at: string | null; email: string | null; display_name: string | null; receber_emails: boolean };
}

async function processarResultadoJogos(
  concurso: ConcursoRow,
  faixas: FaixaConcurso[],
  opcoes: OpcoesProcessamento
): Promise<DetalheEnvio[]> {
  const admin = createAdminClient();
  const { data: jogos } = await admin
    .from("user_games")
    .select("id, user_id, dezenas, label, profiles!inner(plan, plan_expires_at, email, display_name, receber_emails)")
    .eq("ativo", true)
    .eq("loteria", concurso.loteria_codigo)
    .returns<JogoComPerfil[]>();

  if (!jogos || jogos.length === 0) return [];

  const concursoConf: ConcursoConferencia = {
    numero: concurso.numero,
    dezenas: concurso.dezenas,
    dezenasSegundoSorteio: concurso.dezenas_segundo_sorteio,
  };
  const nomeLoteria = LOTERIAS[concurso.loteria_codigo as keyof typeof LOTERIAS]?.nome ?? concurso.loteria_codigo;
  const dezenasOficiais = concurso.dezenas.map((d) => String(d).padStart(2, "0")).join("  ");

  const porUsuario = new Map<string, { perfil: JogoComPerfil["profiles"]; jogos: JogoComPerfil[] }>();
  for (const jogo of jogos) {
    if (!calcularIsPremium(jogo.profiles)) continue; // rastreamento é Premium
    if (jogo.profiles.receber_emails === false) continue;
    if (!jogo.profiles.email) continue;
    const entrada = porUsuario.get(jogo.user_id) ?? { perfil: jogo.profiles, jogos: [] };
    entrada.jogos.push(jogo);
    porUsuario.set(jogo.user_id, entrada);
  }

  const detalhes: DetalheEnvio[] = [];
  for (const [userId, { perfil, jogos: jogosDoUsuario }] of porUsuario) {
    const resultadosPorJogo = jogosDoUsuario.map((j) => {
      const [resultado] = pontuarJogo(concurso.loteria_codigo, j.dezenas, concursoConf, faixas);
      return {
        label: j.label,
        dezenas: j.dezenas,
        acertos: resultado.acertos,
        faixa: resultado.faixa?.descricaoFaixa ?? (resultado.faixaIndeterminada ? "confira os trevos" : null),
        premio: resultado.premioReais,
      };
    });
    const temPremio = resultadosPorJogo.some((r) => r.faixa !== null);
    const nomeUsuario = perfil.display_name ?? perfil.email!.split("@")[0];

    const detalhe = await reivindicarEEnviar(
      opcoes,
      { userId, email: perfil.email!, tipo: "resultado_jogos", loteria: concurso.loteria_codigo, concurso: concurso.numero, chave: `${concurso.loteria_codigo}:${concurso.numero}` },
      () => ({
        subject: temPremio
          ? `🎉 Você teve um resultado no concurso ${concurso.numero} da ${nomeLoteria}!`
          : `Resultado ${nomeLoteria} ${concurso.numero}`,
        html: emailResultadoConcurso(
          nomeUsuario, nomeLoteria, concurso.numero, new Date().toISOString(), dezenasOficiais,
          resultadosPorJogo, temPremio, urlDescadastro(userId, BASE_URL)
        ),
      })
    );
    detalhes.push(detalhe);
  }
  return detalhes;
}

interface AlertaComPerfil {
  user_id: string;
  threshold_brl: string | null;
  sorteios_sem_ganhador: number | null;
  profiles: { email: string | null; display_name: string | null; receber_emails: boolean };
}

async function processarAlertasAcumulo(concurso: ConcursoRow, opcoes: OpcoesProcessamento): Promise<DetalheEnvio[]> {
  if (!concurso.acumulado) return [];

  const admin = createAdminClient();
  const { data: alertas } = await admin
    .from("alert_preferences")
    .select("user_id, threshold_brl, sorteios_sem_ganhador, profiles!inner(email, display_name, receber_emails)")
    .eq("ativo", true)
    .eq("loteria", concurso.loteria_codigo)
    .returns<AlertaComPerfil[]>();

  if (!alertas || alertas.length === 0) return [];

  const sequencia = await buscarSequenciaAcumulada(concurso.loteria_codigo, concurso.numero);
  const valorEstimado = concurso.valor_estimado_proximo ? Number(concurso.valor_estimado_proximo) : null;
  const nomeLoteria = LOTERIAS[concurso.loteria_codigo as keyof typeof LOTERIAS]?.nome ?? concurso.loteria_codigo;

  const detalhes: DetalheEnvio[] = [];
  for (const alerta of alertas) {
    if (alerta.profiles.receber_emails === false || !alerta.profiles.email) continue;
    const dispara = deveAlertarAcumulo(
      { thresholdBrl: alerta.threshold_brl ? Number(alerta.threshold_brl) : null, sorteiosSemGanhador: alerta.sorteios_sem_ganhador },
      valorEstimado,
      sequencia
    );
    if (!dispara) continue;

    const nomeUsuario = alerta.profiles.display_name ?? alerta.profiles.email.split("@")[0];
    const detalhe = await reivindicarEEnviar(
      opcoes,
      { userId: alerta.user_id, email: alerta.profiles.email, tipo: "alerta_acumulo", loteria: concurso.loteria_codigo, concurso: concurso.numero, chave: `${concurso.loteria_codigo}:${concurso.numero}` },
      () => ({
        subject: `🔔 ${nomeLoteria} acumulou — alerta configurado por você`,
        html: emailAlertaAcumulo(
          nomeUsuario, nomeLoteria, valorEstimado ?? 0,
          concurso.numero + 1, concurso.data_proximo_concurso, urlDescadastro(alerta.user_id, BASE_URL)
        ),
      })
    );
    detalhes.push(detalhe);
  }
  return detalhes;
}

export async function processarConcursosNovos(opcoes: OpcoesProcessamento): Promise<ResumoProcessamento> {
  const janelaHoras = opcoes.janelaHoras ?? JANELA_HORAS_PADRAO;
  const concursos = await buscarConcursosRecentes(janelaHoras);

  const detalhes: DetalheEnvio[] = [];
  for (const concurso of concursos) {
    const faixas = await buscarFaixas(concurso.concurso_id);
    detalhes.push(...(await processarResultadoJogos(concurso, faixas, opcoes)));
    detalhes.push(...(await processarAlertasAcumulo(concurso, opcoes)));
  }

  return {
    concursosProcessados: concursos.map((c) => ({ loteria: c.loteria_codigo, numero: c.numero })),
    emailsEnviados: detalhes.filter((d) => d.status === "enviado").length,
    emailsFalhos: detalhes.filter((d) => d.status === "falhou").length,
    emailsSimulados: detalhes.filter((d) => d.status === "simulado").length,
    detalhes,
  };
}
