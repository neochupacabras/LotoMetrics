import { cache } from "react";
import pool from "./db";
import { Concurso, ConcursoResumo, Loteria, PremiacaoFaixa } from "./types";

export const getLoteriaPorCodigo = cache(async (codigo: string): Promise<Loteria | null> => {
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
});

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

export const getUltimoConcurso = cache(async (loteriaId: number): Promise<Concurso | null> => {
  const { rows } = await pool.query(
    `SELECT * FROM concurso WHERE loteria_id = $1 ORDER BY numero DESC LIMIT 1`,
    [loteriaId]
  );
  if (rows.length === 0) return null;
  const concurso = mapConcursoRow(rows[0]);
  const premiacoes = await getPremiacoes(rows[0].id);
  return { ...concurso, premiacoes };
});

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
      `SELECT numero, data_sorteio, dezenas, acumulado
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
