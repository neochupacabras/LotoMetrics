import { validarApiKey, apiHeaders, apiErro } from "@/lib/api-auth";
import { getLoteriaPorCodigo, getConcursosPaginado } from "@/lib/queries";
import { isCodigoLoteriaValido } from "@/lib/format";

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
    return apiErro(400, "Loteria inválida. Use 'lotofacil' ou 'megasena'.");
  }

  const loteria = await getLoteriaPorCodigo(codigoLoteria);
  if (!loteria) return apiErro(404, "Loteria não encontrada.");

  const { concursos, total } = await getConcursosPaginado(loteria.id, pagina, limite);

  const dados = concursos.map(c => ({
    numero: c.numero,
    data: c.dataSorteio,
    dezenas: c.dezenas,
    acumulado: c.acumulado,
    valorArrecadado: c.valorArrecadado,
    valorAcumuladoProximo: c.valorAcumuladoProximo,
    valorEstimadoProximo: c.valorEstimadoProximo,
    dataProximoConcurso: c.dataProximoConcurso,
    premiacoes: c.premiacoes?.map(p => ({
      faixa: p.faixa,
      descricao: p.descricaoFaixa,
      ganhadores: p.qtdGanhadores,
      valorPremio: p.valorPremio,
    })),
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
