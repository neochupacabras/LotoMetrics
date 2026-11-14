import { cache } from "react";
import { unstable_cache } from "next/cache";
import pool from "./db";
import { getAcumulos } from "./queries";
import { faixasPrincipais, maiorSequenciaAcumulo, temRecordesDeDezenas, type MaiorSequencia } from "./recordes-regras";

// Dados das páginas de recordes (semana 5 do roadmap). Tudo vem do banco,
// até o último concurso importado, em valores nominais. Cache de 1 dia com a
// tag "concursos": /api/revalidar limpa a cada concurso novo.

export interface PremioRecorde {
  numero: number;
  data: string; // ISO
  valor: number; // por aposta ganhadora
  ganhadores: number;
  sorteio: 1 | 2 | null; // Dupla Sena: 1º ou 2º sorteio
}

export interface ConcursoTotal {
  numero: number;
  data: string;
  total: number; // soma paga na faixa principal
  ganhadores: number;
}

export interface RecordesLoteria {
  totalConcursos: number;
  primeiraData: string;
  ultimo: { numero: number; data: string };
  maioresPremios: PremioRecorde[];
  maiorTotalConcurso: ConcursoTotal | null;
  maisGanhadores: ConcursoTotal | null;
  totalPagoPrincipal: number;
  concursosComGanhador: number;
  maiorSequencia: MaiorSequencia | null;
  maisSorteada: { dezena: number; vezes: number } | null;
  menosSorteada: { dezena: number; vezes: number } | null;
  maiorAtraso: { dezena: number; concursos: number } | null;
}

const iso = (d: Date | string) => (d instanceof Date ? d.toISOString() : String(d)).slice(0, 10);

export const getRecordesLoteria = cache(unstable_cache(
  async (loteriaId: number, codigoLoteria: string): Promise<RecordesLoteria | null> => {
    const faixas = faixasPrincipais(codigoLoteria);
    const dezenas = temRecordesDeDezenas(codigoLoteria);

    const [geral, top, porConcurso, acumulos, freq, atraso] = await Promise.all([
      pool.query(
        `SELECT count(*)::int AS total, min(data_sorteio) AS primeira,
                (array_agg(numero ORDER BY numero DESC))[1] AS ultimo_numero,
                max(data_sorteio) AS ultima_data
         FROM concurso WHERE loteria_id = $1`,
        [loteriaId]
      ),
      pool.query(
        `SELECT c.numero, c.data_sorteio, pf.faixa, pf.valor_premio, pf.qtd_ganhadores
         FROM premiacao_faixa pf JOIN concurso c ON c.id = pf.concurso_id
         WHERE c.loteria_id = $1 AND pf.faixa = ANY($2::int[]) AND pf.qtd_ganhadores > 0
         ORDER BY pf.valor_premio DESC, c.numero DESC
         LIMIT 10`,
        [loteriaId, faixas]
      ),
      pool.query(
        `WITH t AS (
           SELECT c.numero, c.data_sorteio,
                  sum(pf.valor_premio * pf.qtd_ganhadores) AS total,
                  sum(pf.qtd_ganhadores)::int AS ganhadores
           FROM premiacao_faixa pf JOIN concurso c ON c.id = pf.concurso_id
           WHERE c.loteria_id = $1 AND pf.faixa = ANY($2::int[]) AND pf.qtd_ganhadores > 0
           GROUP BY c.id
         )
         SELECT
           (SELECT row_to_json(x) FROM (SELECT * FROM t ORDER BY total DESC, numero DESC LIMIT 1) x) AS maior_total,
           (SELECT row_to_json(x) FROM (SELECT * FROM t ORDER BY ganhadores DESC, numero DESC LIMIT 1) x) AS mais_ganhadores,
           (SELECT coalesce(sum(total), 0) FROM t) AS total_pago,
           (SELECT count(*)::int FROM t) AS concursos_com_ganhador`,
        [loteriaId, faixas]
      ),
      getAcumulos(loteriaId),
      dezenas
        ? pool.query(`SELECT dezena, frequencia FROM fn_frequencia($1, NULL) ORDER BY frequencia DESC, dezena`, [loteriaId])
        : Promise.resolve({ rows: [] as { dezena: number; frequencia: string }[] }),
      dezenas
        ? pool.query(`SELECT dezena, maior_atraso FROM fn_maior_atraso_historico($1) LIMIT 1`, [loteriaId])
        : Promise.resolve({ rows: [] as { dezena: number; maior_atraso: number }[] }),
    ]);

    const g = geral.rows[0];
    if (!g || g.total === 0) return null;

    const linhaTotal = (j: { numero: number; data_sorteio: string; total: string; ganhadores: number } | null): ConcursoTotal | null =>
      j ? { numero: j.numero, data: iso(j.data_sorteio), total: Number(j.total), ganhadores: j.ganhadores } : null;

    const p = porConcurso.rows[0];
    const f = freq.rows as { dezena: number; frequencia: string }[];

    return {
      totalConcursos: g.total,
      primeiraData: iso(g.primeira),
      ultimo: { numero: g.ultimo_numero, data: iso(g.ultima_data) },
      maioresPremios: top.rows.map((r) => ({
        numero: r.numero,
        data: iso(r.data_sorteio),
        valor: Number(r.valor_premio),
        ganhadores: r.qtd_ganhadores,
        sorteio: codigoLoteria === "duplasena" ? (r.faixa === 5 ? 2 : 1) : null,
      })),
      maiorTotalConcurso: linhaTotal(p?.maior_total ?? null),
      maisGanhadores: linhaTotal(p?.mais_ganhadores ?? null),
      totalPagoPrincipal: Number(p?.total_pago ?? 0),
      concursosComGanhador: p?.concursos_com_ganhador ?? 0,
      maiorSequencia: maiorSequenciaAcumulo(acumulos),
      maisSorteada: f.length ? { dezena: f[0].dezena, vezes: Number(f[0].frequencia) } : null,
      menosSorteada: f.length ? { dezena: f[f.length - 1].dezena, vezes: Number(f[f.length - 1].frequencia) } : null,
      maiorAtraso: atraso.rows[0] ? { dezena: atraso.rows[0].dezena, concursos: Number(atraso.rows[0].maior_atraso) } : null,
    };
  },
  ["recordes-loteria"],
  { tags: ["concursos"], revalidate: 86400 }
));

export interface RecordeGeral {
  codigo: string;
  numero: number;
  data: string;
  valor: number;
  ganhadores: number;
}

// Hub /recordes: o maior prêmio por aposta de cada loteria, numa consulta só
// (sem uma consulta por loteria).
export const getMaioresPremiosPorLoteria = cache(unstable_cache(
  async (): Promise<RecordeGeral[]> => {
    const { rows } = await pool.query(
      `SELECT DISTINCT ON (l.codigo) l.codigo, c.numero, c.data_sorteio, pf.valor_premio, pf.qtd_ganhadores
       FROM premiacao_faixa pf
       JOIN concurso c ON c.id = pf.concurso_id
       JOIN loteria l ON l.id = c.loteria_id
       WHERE pf.qtd_ganhadores > 0
         AND (pf.faixa = 1 OR (l.codigo = 'duplasena' AND pf.faixa = 5))
       ORDER BY l.codigo, pf.valor_premio DESC, c.numero DESC`
    );
    return rows
      .map((r) => ({
        codigo: r.codigo,
        numero: r.numero,
        data: iso(r.data_sorteio),
        valor: Number(r.valor_premio),
        ganhadores: r.qtd_ganhadores,
      }))
      .sort((a, b) => b.valor - a.valor);
  },
  ["recordes-gerais"],
  { tags: ["concursos"], revalidate: 86400 }
));
