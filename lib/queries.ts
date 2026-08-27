import { cache } from "react";
import { unstable_cache } from "next/cache";
import pool from "./db";
import { Concurso, ConcursoResumo, Loteria, PremiacaoFaixa } from "./types";

// unstable_cache (não o cache() do React, que só dedup dentro de uma
// mesma requisição): esse cache persiste ENTRE requisições. É o que
// realmente evita bater no Postgres a cada visita, já que o site inteiro
// hoje é renderizado dinamicamente (UserMenu lê cookies de auth em toda
// página, o que no Next.js força a rota inteira a pular o cache de rota
// mesmo em páginas com `revalidate` declarado). Invalidado via
// revalidateTag em /api/revalidar após cada importação de concursos.
export const getLoteriaPorCodigo = unstable_cache(
  async (codigo: string): Promise<Loteria | null> => {
    const { rows } = await pool.query(
      `SELECT id, codigo, nome, dezena_min, dezena_max, qtd_dezenas_sorteadas, grid_colunas
       FROM loteria WHERE codigo = $1`,
      [codigo]
    );
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      id: r.id,
      codigo: r.codigo,
      nome: r.nome,
      dezenaMin: r.dezena_min,
      dezenaMax: r.dezena_max,
      qtdDezenasSorteadas: r.qtd_dezenas_sorteadas,
      gridColunas: r.grid_colunas,
    };
  },
  ["loteria-por-codigo"],
  { tags: ["loterias"], revalidate: 86400 }
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapConcursoRow(r: any): Omit<Concurso, "premiacoes"> {
  return {
    numero: r.numero,
    dataSorteio: r.data_sorteio instanceof Date ? r.data_sorteio.toISOString() : r.data_sorteio,
    dezenas: r.dezenas,
    dezenasOrdemSorteio: r.dezenas_ordem_sorteio,
    acumulado: r.acumulado,
    localSorteio: r.local_sorteio,
    municipioUfSorteio: r.municipio_uf_sorteio,
    valorArrecadado: r.valor_arrecadado !== null ? Number(r.valor_arrecadado) : null,
    valorAcumuladoProximo: r.valor_acumulado_proximo !== null ? Number(r.valor_acumulado_proximo) : null,
    valorEstimadoProximo: r.valor_estimado_proximo !== null ? Number(r.valor_estimado_proximo) : null,
    dataProximoConcurso:
      r.data_proximo_concurso instanceof Date
        ? r.data_proximo_concurso.toISOString()
        : r.data_proximo_concurso,
    mesSorte: r.mes_sorte ?? null,
    trevos: r.trevos ?? null,
    dezenasSegundoSorteio: r.dezenas_segundo_sorteio ?? null,
  };
}

async function getPremiacoes(concursoId: number): Promise<PremiacaoFaixa[]> {
  const { rows } = await pool.query(
    `SELECT faixa, descricao_faixa, qtd_ganhadores, valor_premio
     FROM premiacao_faixa WHERE concurso_id = $1 ORDER BY faixa`,
    [concursoId]
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rows.map((r: any) => ({
    faixa: r.faixa,
    descricaoFaixa: r.descricao_faixa,
    qtdGanhadores: r.qtd_ganhadores,
    valorPremio: Number(r.valor_premio),
  }));
}

export const getUltimoConcurso = unstable_cache(
  async (loteriaId: number): Promise<Concurso | null> => {
    const { rows } = await pool.query(
      `SELECT * FROM concurso WHERE loteria_id = $1 ORDER BY numero DESC LIMIT 1`,
      [loteriaId]
    );
    if (rows.length === 0) return null;
    const concurso = mapConcursoRow(rows[0]);
    const premiacoes = await getPremiacoes(rows[0].id);
    return { ...concurso, premiacoes };
  },
  ["ultimo-concurso"],
  { tags: ["concursos"], revalidate: 300 }
);

export interface ConcursoParaExportacao {
  numero: number;
  dataSorteio: string;
  dezenas: number[];
  acumulado: boolean;
  trevos: number[] | null;
  mesSorte: string | null;
  dezenasSegundoSorteio: number[] | null;
}

// Histórico completo de uma loteria pra exportação em CSV (recurso
// Premium) — sem premiações por faixa (seria uma junção pesada pra
// milhares de concursos); só o essencial de cada sorteio.
export async function getConcursosParaExportacao(
  loteriaId: number
): Promise<ConcursoParaExportacao[]> {
  const { rows } = await pool.query(
    `SELECT numero, data_sorteio, dezenas, acumulado, trevos, mes_sorte, dezenas_segundo_sorteio
     FROM concurso WHERE loteria_id = $1 ORDER BY numero`,
    [loteriaId]
  );
  return rows.map((r) => ({
    numero: r.numero,
    dataSorteio: r.data_sorteio instanceof Date ? r.data_sorteio.toISOString() : r.data_sorteio,
    dezenas: r.dezenas as number[],
    acumulado: r.acumulado,
    trevos: r.trevos ?? null,
    mesSorte: r.mes_sorte ?? null,
    dezenasSegundoSorteio: r.dezenas_segundo_sorteio ?? null,
  }));
}

// Versão leve, só número + data — usada para montar o sitemap.xml sem
// puxar dezenas/premiações de milhares de concursos.
export async function getNumerosConcursos(
  loteriaId: number
): Promise<{ numero: number; dataSorteio: string }[]> {
  const { rows } = await pool.query(
    `SELECT numero, data_sorteio FROM concurso WHERE loteria_id = $1 ORDER BY numero ASC`,
    [loteriaId]
  );
  return rows.map((r) => ({
    numero: r.numero,
    dataSorteio: r.data_sorteio.toISOString(),
  }));
}

export const getConcursoPorNumero = cache(
  async (loteriaId: number, numero: number): Promise<Concurso | null> => {
    const { rows } = await pool.query(
      `SELECT * FROM concurso WHERE loteria_id = $1 AND numero = $2`,
      [loteriaId, numero]
    );
    if (rows.length === 0) return null;
    const concurso = mapConcursoRow(rows[0]);
    const premiacoes = await getPremiacoes(rows[0].id);
    return { ...concurso, premiacoes };
  }
);

export async function getConcursosPaginado(
  loteriaId: number,
  pagina: number,
  porPagina: number = 20
): Promise<{ concursos: ConcursoResumo[]; total: number }> {
  const offset = (pagina - 1) * porPagina;

  const [{ rows }, { rows: countRows }] = await Promise.all([
    pool.query(
      `SELECT numero, data_sorteio, dezenas, acumulado, mes_sorte, trevos, dezenas_segundo_sorteio
       FROM concurso WHERE loteria_id = $1
       ORDER BY numero DESC
       LIMIT $2 OFFSET $3`,
      [loteriaId, porPagina, offset]
    ),
    pool.query(`SELECT COUNT(*) FROM concurso WHERE loteria_id = $1`, [loteriaId]),
  ]);

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    concursos: rows.map((r: any) => ({
      numero: r.numero,
      dataSorteio: r.data_sorteio instanceof Date ? r.data_sorteio.toISOString() : r.data_sorteio,
      dezenas: r.dezenas,
      acumulado: r.acumulado,
      mesSorte: r.mes_sorte ?? null,
      trevos: r.trevos ?? null,
      dezenasSegundoSorteio: r.dezenas_segundo_sorteio ?? null,
    })),
    total: Number(countRows[0].count),
  };
}

// Frequência de cada dezena para o heatmap interativo.
// lookback = null → histórico completo; número → últimos N concursos.
export async function getFrequenciaHeatmap(
  loteriaId: number,
  lookback: number | null
): Promise<{ dezena: number; frequencia: number; totalConcursos: number }[]> {
  const sql = lookback == null
    ? `
        WITH base AS (SELECT dezenas FROM concurso WHERE loteria_id = $1)
        SELECT unnest(dezenas) AS dezena,
               count(*) AS frequencia,
               (SELECT count(*) FROM base) AS total_concursos
        FROM base
        GROUP BY dezena
        ORDER BY dezena
      `
    : `
        WITH base AS (
          SELECT dezenas FROM concurso
          WHERE loteria_id = $1
            AND numero > (SELECT MAX(numero) FROM concurso WHERE loteria_id = $1) - $2
        )
        SELECT unnest(dezenas) AS dezena,
               count(*) AS frequencia,
               (SELECT count(*) FROM base) AS total_concursos
        FROM base
        GROUP BY dezena
        ORDER BY dezena
      `;

  const params = lookback == null ? [loteriaId] : [loteriaId, lookback];
  const { rows } = await pool.query(sql, params);
  return rows.map((r) => ({
    dezena: Number(r.dezena),
    frequencia: Number(r.frequencia),
    totalConcursos: Number(r.total_concursos),
  }));
}

export interface AcumuloData {
  concursoInicio: number;
  concursoFim: number;
  duracao: number;
  ganhadores: number;
  premio: number;
  dataInicio: string;
  dataFim: string;
}

export async function getAcumulos(loteriaId: number): Promise<AcumuloData[]> {
  const sql = `
    WITH dados AS (
      SELECT
        c.numero,
        c.data_sorteio,
        pf.qtd_ganhadores,
        pf.valor_premio,
        LAG(pf.qtd_ganhadores, 1, 1) OVER (ORDER BY c.numero) AS prev
      FROM concurso c
      JOIN premiacao_faixa pf ON pf.concurso_id = c.id AND pf.faixa = 1
      WHERE c.loteria_id = $1
    ),
    grupos AS (
      SELECT *,
        SUM(CASE WHEN prev > 0 THEN 1 ELSE 0 END) OVER (ORDER BY numero) AS gid
      FROM dados
    )
    SELECT
      MIN(numero)::int           AS concurso_inicio,
      MAX(numero)::int           AS concurso_fim,
      COUNT(*)::int              AS duracao,
      MAX(qtd_ganhadores)::int   AS ganhadores,
      ROUND(MAX(CASE WHEN qtd_ganhadores > 0 THEN valor_premio ELSE 0 END), 2) AS premio,
      MIN(data_sorteio)::text    AS data_inicio,
      MAX(data_sorteio)::text    AS data_fim
    FROM grupos
    GROUP BY gid
    HAVING MAX(qtd_ganhadores) > 0
    ORDER BY concurso_fim
  `;
  const { rows } = await pool.query(sql, [loteriaId]);
  return rows.map((r) => ({
    concursoInicio: r.concurso_inicio,
    concursoFim:    r.concurso_fim,
    duracao:        r.duracao,
    ganhadores:     r.ganhadores,
    premio:         parseFloat(r.premio),
    dataInicio:     r.data_inicio?.slice(0, 10) ?? "",
    dataFim:        r.data_fim?.slice(0, 10) ?? "",
  }));
}

// ─── Dados para o Simulador Histórico ────────────────────────────────────────

export interface ConcessaoSimulacao {
  numero: number;
  dataSorteio: string;
  dezenas: number[];
  dezenasSegundoSorteio: number[] | null; // Dupla Sena: 2º sorteio do mesmo concurso
  trevos: number[] | null; // +Milionária
  // Prêmio por faixa (faixa 1 = maior, ordem crescente de dificuldade)
  premios: Record<number, number>;  // { 1: valor, 2: valor, ... }
}

export async function getDrawsParaSimulacao(
  loteriaId: number,
  dataDesde?: string // ISO — usado pela Carteira do apostador (só concursos após salvar o jogo)
): Promise<ConcessaoSimulacao[]> {
  // Busca todos os sorteios com prêmios por faixa em uma query só
  const { rows } = await pool.query(
    `SELECT c.numero, c.data_sorteio, c.dezenas, c.dezenas_segundo_sorteio, c.trevos,
       json_object_agg(pf.faixa, pf.valor_premio) AS premios
     FROM concurso c
     JOIN premiacao_faixa pf ON pf.concurso_id = c.id
     WHERE c.loteria_id = $1 ${dataDesde ? "AND c.data_sorteio >= $2" : ""}
     GROUP BY c.numero, c.data_sorteio, c.dezenas, c.dezenas_segundo_sorteio, c.trevos
     ORDER BY c.numero`,
    dataDesde ? [loteriaId, dataDesde] : [loteriaId]
  );

  return rows.map((r) => ({
    numero: r.numero,
    dataSorteio: r.data_sorteio instanceof Date ? r.data_sorteio.toISOString() : r.data_sorteio,
    dezenas: r.dezenas as number[],
    dezenasSegundoSorteio: r.dezenas_segundo_sorteio ?? null,
    trevos: r.trevos ?? null,
    premios: Object.fromEntries(
      Object.entries(r.premios as Record<string, string>).map(([k, v]) => [
        Number(k),
        parseFloat(v as string),
      ])
    ),
  }));
}

// Deriva "quantos acertos" -> "qual faixa" a partir do texto real da Caixa
// (descricao_faixa, ex: "15 acertos") em vez de manter um mapa hardcoded
// por loteria — funciona para qualquer loteria cujas faixas sejam descritas
// por contagem de acertos (não serve para +Milionária, cuja faixa depende
// também dos trevos: ver FAIXAS_MILIONARIA em lib/probabilidades.ts).
export const getMapaFaixasPorAcertos = unstable_cache(
  async (loteriaId: number): Promise<Record<number, number>> => {
    const { rows } = await pool.query(
      `SELECT DISTINCT pf.faixa, pf.descricao_faixa
       FROM premiacao_faixa pf
       JOIN concurso c ON c.id = pf.concurso_id
       WHERE c.loteria_id = $1`,
      [loteriaId]
    );
    const mapa: Record<number, number> = {};
    for (const r of rows) {
      const m = String(r.descricao_faixa ?? "").match(/(\d+)\s*acertos?/i);
      if (m) mapa[Number(m[1])] = r.faixa;
    }
    return mapa;
  },
  ["mapa-faixas-por-acertos"],
  { tags: ["concursos"], revalidate: 86400 }
);

// Conta quantos concursos seguidos a faixa 1 ficou acumulada (sem ganhador)
export async function getConcursosAcumulados(loteriaId: number): Promise<number> {
  const { rows } = await pool.query(
    `SELECT COUNT(*) AS total
     FROM (
       SELECT c.id
       FROM concurso c
       JOIN premiacao_faixa pf ON pf.concurso_id = c.id AND pf.faixa = 1
       WHERE c.loteria_id = $1
         AND pf.qtd_ganhadores = 0
         AND c.numero > (
           SELECT COALESCE(MAX(c2.numero), 0)
           FROM concurso c2
           JOIN premiacao_faixa pf2 ON pf2.concurso_id = c2.id AND pf2.faixa = 1
           WHERE c2.loteria_id = $1 AND pf2.qtd_ganhadores > 0
         )
     ) sub`,
    [loteriaId]
  );
  return Number(rows[0]?.total ?? 0);
}
