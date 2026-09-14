import { createAdminClient } from "@/lib/supabase/server";
import pool from "@/lib/db";
import { getLoteriaPorCodigo, getUltimoConcurso } from "@/lib/queries";
import { LOTERIAS } from "@/lib/format";
import { gerarDestaques } from "@/lib/destaques";
import { chaveNewsletterSemanal, escolherLoteriaDestaqueSemana, type CandidatoAcumulado } from "@/lib/notificacoes/regras";
import { emailNewsletterSemanal, type ResultadoSemanaEmail, type DestaqueSemanaEmail } from "@/lib/email-templates";
import { enviarEmail } from "@/lib/notificacoes/enviar";
import { urlDescadastro } from "@/lib/notificacoes/unsubscribe";
import type { OpcoesProcessamento, DetalheEnvio } from "@/lib/notificacoes/processar-concursos";

// Newsletter semanal (Fase 3 adiantada, 28/09/2026, segundo item escolhido
// pelo usuário) — resumo dos últimos resultados de todas as loterias, o
// maior prêmio acumulado do momento e uma curiosidade estatística. Roda
// junto do cron de segurança (app/api/cron/conferir), como o pix_vencendo:
// o plano Hobby da Vercel limita o número de crons, então esse job só
// segue adiante quando hoje é o dia escolhido (segunda-feira) — nos outros
// dias o handler chama esta função e ela simplesmente não faz nada.

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lotoanalitica.com.br";

// Mesma ordem de exibição já usada na home (lib/format.ts / app/page.tsx).
const CODIGOS_LOTERIA = Object.keys(LOTERIAS) as (keyof typeof LOTERIAS)[];
const LOTERIA_PADRAO = "lotofacil";

interface PerfilNewsletter {
  id: string;
  email: string | null;
  display_name: string | null;
  receber_emails: boolean;
}

async function montarConteudo(): Promise<{
  resultados: ResultadoSemanaEmail[];
  maiorAcumulado: { nomeLoteria: string; codigoLoteria: string; valor: number } | null;
  destaque: DestaqueSemanaEmail | null;
}> {
  const loterias = await Promise.all(CODIGOS_LOTERIA.map((codigo) => getLoteriaPorCodigo(codigo)));

  const resultados: ResultadoSemanaEmail[] = [];
  const candidatosAcumulado: CandidatoAcumulado[] = [];

  for (const loteria of loterias) {
    if (!loteria) continue;
    const ultimo = await getUltimoConcurso(loteria.id);
    if (!ultimo) continue;

    const nomeLoteria = LOTERIAS[loteria.codigo as keyof typeof LOTERIAS]?.nome ?? loteria.nome;
    resultados.push({
      nomeLoteria,
      codigoLoteria: loteria.codigo,
      numero: ultimo.numero,
      dezenas: ultimo.dezenas,
      acumulado: ultimo.acumulado,
      // Elementos extras que só existem em algumas loterias (Dupla Sena,
      // +Milionária, Dia de Sorte/Timemania) — sem isso o e-mail mostrava
      // um resultado incompleto pra essas quatro loterias.
      dezenasSegundoSorteio: ultimo.dezenasSegundoSorteio,
      trevos: ultimo.trevos,
      mesSorte: ultimo.mesSorte,
    });
    candidatosAcumulado.push({
      codigo: loteria.codigo,
      acumulado: ultimo.acumulado,
      valorEstimadoProximo: ultimo.valorEstimadoProximo,
    });
  }

  const codigoDestaque = escolherLoteriaDestaqueSemana(candidatosAcumulado, LOTERIA_PADRAO);
  const candidatoDestaque = candidatosAcumulado.find((c) => c.codigo === codigoDestaque);
  const maiorAcumulado =
    candidatoDestaque?.acumulado && candidatoDestaque.valorEstimadoProximo != null
      ? {
          nomeLoteria: LOTERIAS[codigoDestaque as keyof typeof LOTERIAS]?.nome ?? codigoDestaque,
          codigoLoteria: codigoDestaque,
          valor: candidatoDestaque.valorEstimadoProximo,
        }
      : null;

  let destaque: DestaqueSemanaEmail | null = null;
  const loteriaDestaque = loterias.find((l) => l?.codigo === codigoDestaque);
  if (loteriaDestaque) {
    const destaques = await gerarDestaques(loteriaDestaque.id, loteriaDestaque.codigo, {
      dezenaMax: loteriaDestaque.dezenaMax,
      gridColunas: loteriaDestaque.gridColunas,
    });
    destaque = destaques[0] ? { ...destaques[0], link: `${BASE_URL}${destaques[0].link}` } : null;
  }

  return { resultados, maiorAcumulado, destaque };
}

export async function enviarNewsletterSemanal(
  opcoes: OpcoesProcessamento & { forcarNewsletter?: boolean }
): Promise<DetalheEnvio[]> {
  // Só envia às segundas-feiras (07h UTC = 04h em América/São_Paulo, sem
  // virar o dia) — `forcarNewsletter` existe só pra teste manual (curl).
  const agora = new Date();
  if (agora.getUTCDay() !== 1 && !opcoes.forcarNewsletter) return [];

  const admin = createAdminClient();
  const { data: perfis } = await admin
    .from("profiles")
    .select("id, email, display_name, receber_emails")
    .not("email", "is", null)
    .eq("receber_emails", true)
    .returns<PerfilNewsletter[]>();

  if (!perfis || perfis.length === 0) return [];

  const { resultados, maiorAcumulado, destaque } = await montarConteudo();
  if (resultados.length === 0) return [];

  const chave = chaveNewsletterSemanal(agora);
  const detalhes: DetalheEnvio[] = [];

  for (const perfil of perfis) {
    if (!perfil.email) continue;

    const base: Omit<DetalheEnvio, "status" | "erro"> = {
      email: perfil.email,
      tipo: "newsletter_semanal",
      loteria: null,
      concurso: null,
    };

    if (opcoes.somenteEmails && !opcoes.somenteEmails.has(perfil.email)) {
      detalhes.push({ ...base, status: "pulado_filtro" });
      continue;
    }
    if (opcoes.dryRun) {
      detalhes.push({ ...base, status: "simulado" });
      continue;
    }

    const { rows } = await pool.query<{ id: number }>(
      `INSERT INTO notificacoes_enviadas (user_id, tipo, chave)
       VALUES ($1, 'newsletter_semanal', $2)
       ON CONFLICT (user_id, tipo, chave) DO NOTHING
       RETURNING id`,
      [perfil.id, chave]
    );
    const notificacaoId = rows[0]?.id;
    if (!notificacaoId) {
      detalhes.push({ ...base, status: "pulado_dedup" });
      continue;
    }

    const nomeUsuario = perfil.display_name ?? perfil.email.split("@")[0];
    const resultado = await enviarEmail({
      to: perfil.email,
      subject: "Seu resumo semanal da loteria",
      html: emailNewsletterSemanal(
        nomeUsuario,
        resultados,
        maiorAcumulado,
        destaque,
        urlDescadastro(perfil.id, BASE_URL)
      ),
    });

    if (!resultado.ok) {
      await pool.query(
        `UPDATE notificacoes_enviadas SET status = 'falhou', erro = $2 WHERE id = $1`,
        [notificacaoId, resultado.erro ?? "erro desconhecido"]
      );
      detalhes.push({ ...base, status: "falhou", erro: resultado.erro });
    } else {
      detalhes.push({ ...base, status: "enviado" });
    }
  }

  return detalhes;
}
