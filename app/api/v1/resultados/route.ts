import { validarApiKey, apiHeaders, apiErro } from "@/lib/api-auth";
import { getLoteriaPorCodigo } from "@/lib/queries";
import { isCodigoLoteriaValido } from "@/lib/format";
import pool from "@/lib/db";

export const runtime = "nodejs";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: apiHeaders() });
}

export async function GET(request: Request) {
  const validacao = await validarApiKey(request.headers.get("authorization"));
  if (!validacao.ok) return apiErro(validacao.status, validacao.erro);

  const { searchParams } = new URL(request.url);
  const codigoLoteria = searchParams.get("loteria") ?? "lotofacil";
  const pagina = Math.max(1, parseInt(searchParams.get("pagina") ?? "1"));
  const limite = Math.min(100, Math.max(1, parseInt(searchParams.get("limite") ?? "20")));

  if (!isCodigoLoteriaValido(codigoLoteria)) {
    return apiErro(400, "Loteria inválida. Valores aceitos: 'lotofacil', 'megasena', 'quina', 'lotomania', 'diadesorte', 'maismilionaria', 'timemania', 'duplasena', 'supersete'.");
  }

  const loteria = await getLoteriaPorCodigo(codigoLoteria);
  if (!loteria) return apiErro(404, "Loteria não encontrada.");

  const offset = (pagina - 1) * limite;

  const [{ rows }, { rows: countRows }] = await Promise.all([
    pool.query(
      `SELECT
         c.numero, c.data_sorteio, c.dezenas, c.acumulado,
         c.valor_arrecadado, c.valor_acumulado_proximo,
         c.valor_estimado_proximo, c.data_proximo_concurso,
         COALESCE(
           json_agg(
             json_build_object(
               'faixa', pf.faixa,
               'descricao', pf.descricao_faixa,
               'ganhadores', pf.qtd_ganhadores,
               'valorPremio', pf.valor_premio
             ) ORDER BY pf.faixa
           ) FILTER (WHERE pf.id IS NOT NULL),
           '[]'
         ) AS premiacoes
       FROM concurso c
       LEFT JOIN premiacao_faixa pf ON pf.concurso_id = c.id
       WHERE c.loteria_id = $1
       GROUP BY c.id
       ORDER BY c.numero DESC
       LIMIT $2 OFFSET $3`,
      [loteria.id, limite, offset]
    ),
    pool.query(`SELECT COUNT(*) FROM concurso WHERE loteria_id = $1`, [loteria.id]),
  ]);

  const total = Number(countRows[0].count);

  const dados = rows.map((r: any) => ({
    numero: r.numero,
    data: r.data_sorteio instanceof Date
      ? r.data_sorteio.toISOString().slice(0, 10)
      : String(r.data_sorteio).slice(0, 10),
    dezenas: r.dezenas,
    acumulado: r.acumulado,
    valorArrecadado: r.valor_arrecadado ? Number(r.valor_arrecadado) : null,
    valorAcumuladoProximo: r.valor_acumulado_proximo ? Number(r.valor_acumulado_proximo) : null,
    valorEstimadoProximo: r.valor_estimado_proximo ? Number(r.valor_estimado_proximo) : null,
    dataProximoConcurso: r.data_proximo_concurso
      ? String(r.data_proximo_concurso).slice(0, 10)
      : null,
    premiacoes: r.premiacoes,
  }));

  return new Response(
    JSON.stringify({
      loteria: codigoLoteria,
      pagina,
      limite,
      total,
      totalPaginas: Math.ceil(total / limite),
      resultados: dados,
    }),
    { headers: apiHeaders(validacao.info) }
  );
}
