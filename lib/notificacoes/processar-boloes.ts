import pool from "@/lib/db";
import { createAdminClient } from "@/lib/supabase/server";
import { calcularIsPremium } from "@/lib/plano-premium";
import { bolaoEhPro } from "@/lib/bolao-limites";
import { conferirBolao, paraJson } from "@/lib/bolao-conferencia";
import type { FaixaConcurso } from "@/lib/conferencia";
import { LOTERIAS } from "@/lib/format";
import { emailResultadoBolao } from "@/lib/email-templates";
import { enviarEmail } from "@/lib/notificacoes/enviar";
import { urlDescadastro, urlDescadastroParticipante } from "@/lib/notificacoes/unsubscribe";
import {
  reivindicarEEnviar,
  type DetalheEnvio,
  type OpcoesProcessamento,
} from "@/lib/notificacoes/processar-concursos";

// Conferência e rateio automáticos dos bolões (Fase 3, tarefa 3.4). Roda
// logo depois de processarConcursosNovos, tanto no disparo do importador
// quanto no cron diário — ver lib/notificacoes/handler-http.ts.
//
// Diferente dos jogos salvos, NÃO depende da janela de 48h: pega todo bolão
// ainda não conferido cujo concurso-alvo já existe no banco, então um
// disparo perdido (ou um bolão apontado pra concurso já importado) se
// resolve na próxima execução. Idempotente: bolao_resultados tem UNIQUE
// (bolao_id, concurso) e o e-mail do organizador usa notificacoes_enviadas.
//
// Segurança dos modos de teste:
//  - dryRun: nada é gravado nem enviado, só relata;
//  - somenteEmails: envia só pra esses e-mails, mas NÃO grava o resultado
//    nem marca o bolão como conferido — assim a execução real depois ainda
//    confere e avisa todo mundo.

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lotoanalitica.com.br";

interface BolaoRow {
  id: string;
  owner_id: string;
  slug: string;
  titulo: string;
  loteria: string;
  alvo: string;
  concurso_alvo: number | null;
  qtd_cotas: number;
  pro_ate: string | null;
  criado_em: string;
  profiles: {
    plan: string | null;
    plan_expires_at: string | null;
    email: string | null;
    display_name: string | null;
    receber_emails: boolean;
  };
}

interface ConcursoBolaoRow {
  concurso_id: number;
  numero: number;
  dezenas: number[];
  dezenas_segundo_sorteio: number[] | null;
}

async function buscarConcursoDoBolao(b: BolaoRow): Promise<ConcursoBolaoRow | null> {
  if (b.concurso_alvo) {
    const { rows } = await pool.query<ConcursoBolaoRow>(
      `SELECT c.id AS concurso_id, c.numero, c.dezenas, c.dezenas_segundo_sorteio
       FROM concurso c JOIN loteria l ON l.id = c.loteria_id
       WHERE l.codigo = $1 AND c.numero = $2`,
      [b.loteria, b.concurso_alvo]
    );
    return rows[0] ?? null;
  }
  if (b.alvo === "virada") {
    // A Mega da Virada é o concurso sorteado em 31/12 (ou em 01/01, quando o
    // sorteio atrasa — foi o caso da edição de 2025) depois da criação do
    // bolão. Ver os concursos 2330, 2440, 2550, 2670, 2810 e 2955 em produção.
    const { rows } = await pool.query<ConcursoBolaoRow>(
      `SELECT c.id AS concurso_id, c.numero, c.dezenas, c.dezenas_segundo_sorteio
       FROM concurso c JOIN loteria l ON l.id = c.loteria_id
       WHERE l.codigo = 'megasena'
         AND c.data_sorteio >= $1::date
         AND to_char(c.data_sorteio, 'MM-DD') IN ('12-31', '01-01')
       ORDER BY c.data_sorteio
       LIMIT 1`,
      [b.criado_em]
    );
    return rows[0] ?? null;
  }
  return null;
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

export interface ResumoBoloes {
  detalhes: DetalheEnvio[];
  conferidos: { bolaoId: string; concurso: number; persistido: boolean }[];
}

export async function conferirBoloes(opcoes: OpcoesProcessamento): Promise<ResumoBoloes> {
  const admin = createAdminClient();
  const { data: boloes, error } = await admin
    .from("boloes")
    .select(
      "id, owner_id, slug, titulo, loteria, alvo, concurso_alvo, qtd_cotas, pro_ate, criado_em, profiles!inner(plan, plan_expires_at, email, display_name, receber_emails)"
    )
    .neq("status", "conferido")
    .returns<BolaoRow[]>();
  // Erro de consulta nunca vira "nenhum bolão": o job registra como falha
  // (mesma lição do cron antigo, ver processar-concursos.ts).
  if (error) throw new Error(`conferirBoloes: ${error.message}`);

  const resumo: ResumoBoloes = { detalhes: [], conferidos: [] };
  const persistir = !opcoes.dryRun && !opcoes.somenteEmails;

  for (const b of boloes ?? []) {
    const concurso = await buscarConcursoDoBolao(b);
    if (!concurso) continue;

    const [faixas, { data: jogos }, { data: participantes }] = await Promise.all([
      buscarFaixas(concurso.concurso_id),
      admin.from("bolao_jogos").select("dezenas").eq("bolao_id", b.id).order("ordem"),
      admin
        .from("bolao_participantes")
        .select("id, nome, email, recebe_resultado")
        .eq("bolao_id", b.id),
    ]);
    if (!jogos || jogos.length === 0) continue;

    const resultado = conferirBolao(
      b.loteria,
      jogos.map((j) => j.dezenas as number[]),
      { numero: concurso.numero, dezenas: concurso.dezenas, dezenasSegundoSorteio: concurso.dezenas_segundo_sorteio },
      faixas,
      b.qtd_cotas
    );

    // Grava o resultado (idempotente). `novo` = esta execução foi quem
    // gravou; só nesse caso os participantes recebem e-mail, já que eles não
    // têm tabela de deduplicação.
    let novo = false;
    if (persistir) {
      const { data: inserido, error: errInsert } = await admin
        .from("bolao_resultados")
        .upsert(
          {
            bolao_id: b.id,
            concurso: concurso.numero,
            acertos_por_jogo: paraJson(resultado),
            premio_total_cents: resultado.premioTotalCents,
            por_cota_cents: resultado.porCotaCents,
          },
          { onConflict: "bolao_id,concurso", ignoreDuplicates: true }
        )
        .select("id");
      if (errInsert) throw new Error(`conferirBoloes (gravar resultado ${b.id}): ${errInsert.message}`);
      novo = (inserido?.length ?? 0) > 0;
    } else {
      novo = true; // relatório de dryRun / filtro: mostra tudo que seria enviado
    }

    const nomeLoteria = LOTERIAS[b.loteria as keyof typeof LOTERIAS]?.nome ?? b.loteria;
    const dezenasOficiais = concurso.dezenas.map((d) => String(d).padStart(2, "0")).join("  ");
    const resumoEmail = {
      totalJogos: jogos.length,
      melhorAcerto: Math.max(...resultado.acertos),
      premiados: resultado.premiados,
      premioTotal: resultado.premioTotalCents / 100,
      porCota: resultado.porCotaCents / 100,
      indeterminado: resultado.indeterminado,
      acumulado: resultado.acumulado,
    };
    const urlBolao = `${BASE_URL}/b/${b.slug}`;
    const premiumDono = calcularIsPremium(b.profiles);

    // Organizador: sempre (respeitando o descadastro dele).
    if (b.profiles.email && b.profiles.receber_emails !== false) {
      const nomeDono = b.profiles.display_name ?? b.profiles.email.split("@")[0];
      resumo.detalhes.push(
        await reivindicarEEnviar(
          opcoes,
          {
            userId: b.owner_id,
            email: b.profiles.email,
            tipo: "bolao_resultado",
            loteria: b.loteria,
            concurso: concurso.numero,
            chave: `${b.id}:${concurso.numero}`,
          },
          () => ({
            subject:
              resultado.premiados > 0
                ? `🎉 O bolão "${b.titulo}" teve resultado no concurso ${concurso.numero}!`
                : `Resultado do bolão "${b.titulo}" — concurso ${concurso.numero}`,
            html: emailResultadoBolao(
              nomeDono, b.titulo, nomeLoteria, concurso.numero, dezenasOficiais,
              resumoEmail, urlBolao, urlDescadastro(b.owner_id, BASE_URL), true
            ),
          })
        )
      );
    }

    // Participantes com opt-in: só em bolão Pro.
    if (novo && bolaoEhPro(b, premiumDono)) {
      for (const p of participantes ?? []) {
        if (!p.email || !p.recebe_resultado) continue;
        const base = {
          email: p.email, tipo: "bolao_resultado" as const, loteria: b.loteria, concurso: concurso.numero,
        };
        if (opcoes.somenteEmails && !opcoes.somenteEmails.has(p.email)) {
          resumo.detalhes.push({ ...base, status: "pulado_filtro" });
          continue;
        }
        if (opcoes.dryRun) {
          resumo.detalhes.push({ ...base, status: "simulado" });
          continue;
        }
        const envio = await enviarEmail({
          to: p.email,
          subject: `Resultado do bolão "${b.titulo}" — concurso ${concurso.numero}`,
          html: emailResultadoBolao(
            p.nome, b.titulo, nomeLoteria, concurso.numero, dezenasOficiais,
            resumoEmail, urlBolao, urlDescadastroParticipante(p.id, BASE_URL), false
          ),
        });
        resumo.detalhes.push(
          envio.ok ? { ...base, status: "enviado" } : { ...base, status: "falhou", erro: envio.erro }
        );
      }
    }

    if (persistir) {
      const { error: errStatus } = await admin
        .from("boloes")
        .update({ status: "conferido", concurso_alvo: concurso.numero })
        .eq("id", b.id);
      if (errStatus) throw new Error(`conferirBoloes (status ${b.id}): ${errStatus.message}`);
    }
    resumo.conferidos.push({ bolaoId: b.id, concurso: concurso.numero, persistido: persistir });
  }

  return resumo;
}
