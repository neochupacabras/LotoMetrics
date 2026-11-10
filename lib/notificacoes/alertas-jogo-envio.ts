import pool from "@/lib/db";
import { NOME_LOTERIA } from "@/lib/seo";
import { preposicaoLoteria } from "@/lib/format";
import type { FaixaConcurso } from "@/lib/conferencia";
import { conferirJogoAlerta, textoAviso, DIAS_PARA_CONFIRMAR, type ConcursoAlerta } from "@/lib/alertas-jogo";
import { urlAcaoAlerta } from "@/lib/alertas-jogo-tokens";
import { enviarEmail } from "@/lib/notificacoes/enviar";
import { emailAvisoJogo } from "@/lib/email-templates";
import { enviarParaInscricao, type InscricaoRow } from "@/lib/push/servidor";

// Envio dos avisos de jogo (alertas_jogo) a cada concurso novo. Chamado por
// lib/notificacoes/handler-http.ts no disparo do importador
// (/api/eventos/concursos-novos) e no cron diário (/api/cron/conferir).
//
// Idempotência: para cada concurso, as inscrições são "reivindicadas" com
// um único UPDATE ... SET ultimo_concurso_avisado = n WHERE ... < n
// RETURNING. Quem roda depois (cron no dia seguinte, importador de novo)
// não acha mais nada para esse concurso. Se o envio falhar depois da
// reivindicação, aquele aviso se perde: preferimos isso a mandar duplicado.

const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://lotoanalitica.com.br").replace(/\/$/, "");
const JANELA_HORAS_PADRAO = 48;

export interface DetalheAlerta {
  loteria: string;
  concurso: number;
  canal: "push" | "email";
  status: "enviado" | "falhou" | "expirada" | "simulado";
  premiado: boolean;
  erro?: string;
}

export interface ResumoAlertas {
  enviados: number;
  falhos: number;
  simulados: number;
  pendentesApagados: number;
  detalhes: DetalheAlerta[];
}

interface ConcursoRow {
  concurso_id: number;
  numero: number;
  loteria: string;
  dezenas: number[];
  dezenas_segundo_sorteio: number[] | null;
  trevos: number[] | null;
}

interface AlertaRow {
  id: string;
  canal: "push" | "email";
  email: string | null;
  push_inscricao_id: number | null;
  dezenas: number[];
  trevos: number[] | null;
}

const dz = (n: number) => String(n).padStart(2, "0");

async function concursosRecentesComAlertas(janelaHoras: number): Promise<ConcursoRow[]> {
  const { rows } = await pool.query<ConcursoRow>(
    `SELECT c.id AS concurso_id, c.numero, l.codigo AS loteria, c.dezenas,
            c.dezenas_segundo_sorteio, c.trevos
     FROM concurso c
     JOIN loteria l ON l.id = c.loteria_id
     WHERE c.criado_em > now() - make_interval(hours => $1::int)
       AND EXISTS (SELECT 1 FROM alertas_jogo a WHERE a.loteria = l.codigo AND a.confirmado_em IS NOT NULL)
     ORDER BY l.codigo, c.numero`,
    [janelaHoras]
  );
  return rows;
}

async function faixasDoConcurso(concursoId: number): Promise<FaixaConcurso[]> {
  const { rows } = await pool.query<{ faixa: number; descricao_faixa: string; valor_premio: string; qtd_ganhadores: number }>(
    `SELECT faixa, descricao_faixa, valor_premio, qtd_ganhadores FROM premiacao_faixa WHERE concurso_id = $1`,
    [concursoId]
  );
  return rows.map((r) => ({
    faixa: r.faixa,
    descricaoFaixa: r.descricao_faixa,
    valorPremio: Number(r.valor_premio),
    qtdGanhadores: r.qtd_ganhadores,
  }));
}

// dryRun só lê; fora dele, reivindica o concurso para cada inscrição.
async function alertasParaConcurso(loteria: string, numero: number, dryRun: boolean): Promise<AlertaRow[]> {
  const filtro = `loteria = $1 AND confirmado_em IS NOT NULL
                  AND (ultimo_concurso_avisado IS NULL OR ultimo_concurso_avisado < $2)`;
  const colunas = `id, canal, email, push_inscricao_id, dezenas, trevos`;
  const { rows } = dryRun
    ? await pool.query<AlertaRow>(`SELECT ${colunas} FROM alertas_jogo WHERE ${filtro}`, [loteria, numero])
    : await pool.query<AlertaRow>(
        `UPDATE alertas_jogo SET ultimo_concurso_avisado = $2 WHERE ${filtro} RETURNING ${colunas}`,
        [loteria, numero]
      );
  return rows;
}

async function inscricoesPush(ids: number[]): Promise<Map<number, InscricaoRow>> {
  if (ids.length === 0) return new Map();
  const { rows } = await pool.query<InscricaoRow>(
    `SELECT id, endpoint, p256dh, auth FROM push_inscricoes WHERE id = ANY($1::bigint[])`,
    [ids]
  );
  return new Map(rows.map((r) => [Number(r.id), r]));
}

export async function processarAlertasJogo(opcoes: { dryRun: boolean; janelaHoras?: number }): Promise<ResumoAlertas> {
  const detalhes: DetalheAlerta[] = [];
  let pendentesApagados = 0;

  // E-mail que ninguém confirmou em 7 dias é apagado (não guardamos
  // endereço de quem não pediu de fato).
  if (!opcoes.dryRun) {
    const r = await pool.query(
      `DELETE FROM alertas_jogo WHERE confirmado_em IS NULL AND criado_em < now() - make_interval(days => $1::int)`,
      [DIAS_PARA_CONFIRMAR]
    );
    pendentesApagados = r.rowCount ?? 0;
  }

  const concursos = await concursosRecentesComAlertas(opcoes.janelaHoras ?? JANELA_HORAS_PADRAO);
  for (const c of concursos) {
    const alertas = await alertasParaConcurso(c.loteria, c.numero, opcoes.dryRun);
    if (alertas.length === 0) continue;

    const faixas = await faixasDoConcurso(c.concurso_id);
    const nomeLoteria = NOME_LOTERIA[c.loteria] ?? c.loteria;
    const superSete = c.loteria === "supersete";
    const concurso: ConcursoAlerta = {
      numero: c.numero,
      dezenas: c.dezenas,
      dezenasSegundoSorteio: c.dezenas_segundo_sorteio,
      trevos: c.trevos,
    };
    const caminhoResultado = `/${c.loteria}/resultados/${c.numero}`;
    const sorteadas = superSete ? c.dezenas.join(" ") : c.dezenas.map(dz).join(" ");
    const push = await inscricoesPush(alertas.filter((a) => a.push_inscricao_id).map((a) => Number(a.push_inscricao_id)));

    for (const a of alertas) {
      const conf = conferirJogoAlerta(c.loteria, { dezenas: a.dezenas, trevos: a.trevos }, concurso, faixas);
      const texto = textoAviso(nomeLoteria, c.loteria, c.numero, conf);
      const base = { loteria: c.loteria, concurso: c.numero, canal: a.canal, premiado: conf.premiado };

      if (opcoes.dryRun) {
        detalhes.push({ ...base, status: "simulado" });
        continue;
      }

      const urlDescadastro = urlAcaoAlerta("descadastrar", a.id, BASE_URL);

      if (a.canal === "push") {
        const inscricao = push.get(Number(a.push_inscricao_id));
        if (!inscricao) {
          detalhes.push({ ...base, status: "expirada" });
          continue;
        }
        const r = await enviarParaInscricao(inscricao, {
          titulo: texto.titulo,
          corpo: texto.corpo,
          url: caminhoResultado,
          // Uma notificação por jogo e concurso.
          tag: `alerta-${a.id.slice(0, 8)}-${c.numero}`,
          categoria: "alerta_jogo",
          acoes: [
            { acao: "resultado", titulo: "Ver resultado", url: caminhoResultado },
            { acao: "parar", titulo: "Parar este aviso", url: urlDescadastro.replace(BASE_URL, "") },
          ],
        }, { urgencia: conf.premiado ? "high" : "normal" });
        detalhes.push({ ...base, status: r.resultado, erro: r.erro });
        continue;
      }

      const jogo = superSete
        ? a.dezenas.join(" ")
        : `${a.dezenas.map(dz).join(" ")}${a.trevos ? `  · trevos ${a.trevos.join(" ")}` : ""}`;
      const r = await enviarEmail({
        to: a.email!,
        subject: texto.titulo,
        html: emailAvisoJogo(
          texto.titulo, nomeLoteria, c.numero, sorteadas, jogo, texto.detalhes, conf.premiado,
          `${BASE_URL}${caminhoResultado}`, urlDescadastro
        ),
        headers: {
          "List-Unsubscribe": `<${urlDescadastro}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      });
      detalhes.push({ ...base, status: r.ok ? "enviado" : "falhou", erro: r.erro });
    }
  }

  return {
    enviados: detalhes.filter((d) => d.status === "enviado").length,
    falhos: detalhes.filter((d) => d.status === "falhou").length,
    simulados: detalhes.filter((d) => d.status === "simulado").length,
    pendentesApagados,
    detalhes,
  };
}

// "na Mega-Sena" — usado pela rota de inscrição no e-mail de confirmação.
export function emLoteria(codigo: string): string {
  return `${preposicaoLoteria(codigo).em} ${NOME_LOTERIA[codigo] ?? codigo}`;
}
