import { cache } from "react";
import { unstable_cache } from "next/cache";
import pool from "./db";
import { Concurso, ConcursoResumo, Loteria, PremiacaoFaixa } from "./types";
import type { ContextoConcurso } from "./resumo-concurso";

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
  return rows.map(mapPremiacaoRow);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPremiacaoRow(r: any): PremiacaoFaixa {
  return {
    faixa: r.faixa,
    descricaoFaixa: r.descricao_faixa,
    qtdGanhadores: r.qtd_ganhadores,
    valorPremio: Number(r.valor_premio),
  };
}

// Premiações vindas como array JSON (json_agg) embutido na query do concurso
// — usado quando concurso + faixas são buscados numa só ida ao banco.
function mapPremiacoesJson(arr: unknown): PremiacaoFaixa[] {
  return Array.isArray(arr) ? arr.map(mapPremiacaoRow) : [];
}

export const getUltimoConcurso = unstable_cache(
  async (loteriaId: number): Promise<Concurso | null> => {
    // Concurso + premiações por faixa numa única query (json_agg) — evita a
    // segunda consulta separada a premiacao_faixa, que, repetida uma vez por
    // loteria na home, era detectada como N+1 pelo tracing (LOTOANALITICA-2).
    const { rows } = await pool.query(
      `SELECT c.*,
         COALESCE(
           (SELECT json_agg(
               json_build_object(
                 'faixa', pf.faixa,
                 'descricao_faixa', pf.descricao_faixa,
                 'qtd_ganhadores', pf.qtd_ganhadores,
                 'valor_premio', pf.valor_premio
               ) ORDER BY pf.faixa)
            FROM premiacao_faixa pf WHERE pf.concurso_id = c.id),
           '[]'::json
         ) AS premiacoes
       FROM concurso c
       WHERE c.loteria_id = $1
       ORDER BY c.numero DESC
       LIMIT 1`,
      [loteriaId]
    );
    if (rows.length === 0) return null;
    const concurso = mapConcursoRow(rows[0]);
    return { ...concurso, premiacoes: mapPremiacoesJson(rows[0].premiacoes) };
  },
  ["ultimo-concurso"],
  { tags: ["concursos"], revalidate: 300 }
);

// Versão em lote do getUltimoConcurso: o último concurso (com premiações) de
// VÁRIAS loterias numa única query. A home mostra um card por loteria; chamar
// getUltimoConcurso uma vez por loteria repetia a mesma query ~9x na mesma
// requisição e era detectado como N+1 (LOTOANALITICA-4). Aqui DISTINCT ON pega
// o concurso mais recente de cada loteria e o json_agg correlato resolve as
// faixas dentro do mesmo SQL — uma ida só ao banco. Retorna um objeto indexado
// por loteriaId (Record, e não Map, para ser serializável pelo unstable_cache).
export const getUltimosConcursos = unstable_cache(
  async (loteriaIds: number[]): Promise<Record<number, Concurso>> => {
    const resultado: Record<number, Concurso> = {};
    if (loteriaIds.length === 0) return resultado;
    const { rows } = await pool.query(
      `WITH ultimos AS (
         SELECT DISTINCT ON (loteria_id) *
         FROM concurso
         WHERE loteria_id = ANY($1)
         ORDER BY loteria_id, numero DESC
       )
       SELECT c.*,
         COALESCE(
           (SELECT json_agg(
               json_build_object(
                 'faixa', pf.faixa,
                 'descricao_faixa', pf.descricao_faixa,
                 'qtd_ganhadores', pf.qtd_ganhadores,
                 'valor_premio', pf.valor_premio
               ) ORDER BY pf.faixa)
            FROM premiacao_faixa pf WHERE pf.concurso_id = c.id),
           '[]'::json
         ) AS premiacoes
       FROM ultimos c`,
      [loteriaIds]
    );
    for (const r of rows) {
      resultado[r.loteria_id] = {
        ...mapConcursoRow(r),
        premiacoes: mapPremiacoesJson(r.premiacoes),
      };
    }
    return resultado;
  },
  ["ultimos-concursos"],
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
// puxar dezenas/premiações de milhares de concursos. `limite` (opcional)
// pega só os N mais recentes — usado pelo sitemap pra não crescer sem
// controle (concursos antigos continuam acessíveis via a paginação de
// /resultados e os links de anterior/próximo em cada página de concurso;
// só não precisam ficar reanunciados num sitemap que só faz sentido
// destacar conteúdo atual).
export async function getNumerosConcursos(
  loteriaId: number,
  limite?: number
): Promise<{ numero: number; dataSorteio: string }[]> {
  const { rows } = await pool.query(
    limite
      ? `SELECT numero, data_sorteio FROM concurso WHERE loteria_id = $1 ORDER BY numero DESC LIMIT $2`
      : `SELECT numero, data_sorteio FROM concurso WHERE loteria_id = $1 ORDER BY numero DESC`,
    limite ? [loteriaId, limite] : [loteriaId]
  );
  return rows.map((r) => ({
    numero: r.numero,
    dataSorteio: r.data_sorteio.toISOString(),
  }));
}

// Versão em lote do getNumerosConcursos: os N concursos mais recentes de
// VÁRIAS loterias numa única query (ROW_NUMBER particionado por loteria), em
// vez de uma query por loteria. Evita o N+1 no sitemap, que percorre todas as
// loterias (LOTOANALITICA-3). Retorna um Map loteriaId -> concursos (recentes
// primeiro).
export async function getNumerosConcursosPorLoterias(
  loteriaIds: number[],
  limitePorLoteria: number
): Promise<Map<number, { numero: number; dataSorteio: string }[]>> {
  const mapa = new Map<number, { numero: number; dataSorteio: string }[]>();
  if (loteriaIds.length === 0) return mapa;
  const { rows } = await pool.query(
    `SELECT loteria_id, numero, data_sorteio FROM (
       SELECT loteria_id, numero, data_sorteio,
         ROW_NUMBER() OVER (PARTITION BY loteria_id ORDER BY numero DESC) AS rn
       FROM concurso WHERE loteria_id = ANY($1)
     ) t
     WHERE rn <= $2
     ORDER BY loteria_id, numero DESC`,
    [loteriaIds, limitePorLoteria]
  );
  for (const r of rows) {
    const lista = mapa.get(r.loteria_id) ?? [];
    lista.push({ numero: r.numero, dataSorteio: r.data_sorteio.toISOString() });
    mapa.set(r.loteria_id, lista);
  }
  return mapa;
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

// Contexto histórico de um concurso para o resumo em texto
// (lib/resumo-concurso.ts), olhando só para concursos ATÉ ele — assim a
// página de um concurso antigo continua dizendo o que era verdade na época
// e o resultado não muda com o tempo (combina com o ISR da página).
// Uma query só; varre a faixa 1 de uma loteria (alguns milhares de linhas).
// unstable_cache por (loteria, número): o site renderiza dinamicamente (ver
// nota no topo), então sem isso a query rodaria a cada visita do Googlebot.
export const getContextoConcurso = unstable_cache(
  async (loteriaId: number, numero: number): Promise<ContextoConcurso | null> => {
    const { rows } = await pool.query(
      `WITH f1 AS (
         SELECT c.numero, c.data_sorteio, pf.qtd_ganhadores, pf.valor_premio
         FROM concurso c
         JOIN premiacao_faixa pf ON pf.concurso_id = c.id AND pf.faixa = 1
         WHERE c.loteria_id = $1 AND c.numero <= $2
       ),
       alvo AS (SELECT * FROM f1 WHERE numero = $2),
       ultimo_ganhador AS (
         SELECT COALESCE(MAX(numero), 0) AS n
         FROM f1 WHERE qtd_ganhadores > 0 AND numero < $2
       )
       SELECT
         (SELECT COUNT(*) FROM f1
           WHERE qtd_ganhadores = 0 AND numero < $2
             AND numero > (SELECT n FROM ultimo_ganhador))::int AS acumulados_antes,
         (SELECT COUNT(*) FROM f1, alvo
           WHERE alvo.qtd_ganhadores > 0 AND f1.qtd_ganhadores > 0
             AND f1.valor_premio > alvo.valor_premio)::int AS maiores_historico,
         (SELECT COUNT(*) FROM f1, alvo
           WHERE alvo.qtd_ganhadores > 0 AND f1.qtd_ganhadores > 0
             AND f1.valor_premio > alvo.valor_premio
             AND date_part('year', f1.data_sorteio) = date_part('year', alvo.data_sorteio))::int AS maiores_ano,
         (SELECT qtd_ganhadores FROM alvo) AS ganhadores_alvo`,
      [loteriaId, numero]
    );
    const r = rows[0];
    if (!r || r.ganhadores_alvo === null) return null;
    const teveGanhador = Number(r.ganhadores_alvo) > 0;
    return {
      acumuladosAntes: r.acumulados_antes,
      premiosMaioresHistorico: teveGanhador ? r.maiores_historico : null,
      premiosMaioresAno: teveGanhador ? r.maiores_ano : null,
    };
  },
  ["contexto-concurso"],
  { tags: ["concursos"], revalidate: 86400 }
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

// Data oficial do próximo concurso de cada loteria (data_proximo_concurso do
// último resultado importado), indexada por código, em "AAAA-MM-DD". Uma query
// só para todas as loterias — usada pelo calendário, que não pode confiar só na
// grade semanal fixa (a Caixa remaneja datas).
export const getDatasProximosConcursos = unstable_cache(
  async (): Promise<Record<string, string>> => {
    const { rows } = await pool.query(
      `SELECT DISTINCT ON (c.loteria_id) l.codigo,
              to_char(c.data_proximo_concurso, 'YYYY-MM-DD') AS data_proximo
       FROM concurso c JOIN loteria l ON l.id = c.loteria_id
       WHERE c.data_proximo_concurso IS NOT NULL
       ORDER BY c.loteria_id, c.numero DESC`
    );
    const out: Record<string, string> = {};
    for (const r of rows) out[r.codigo] = r.data_proximo;
    return out;
  },
  ["datas-proximos-concursos"],
  { tags: ["concursos"], revalidate: 300 }
);
