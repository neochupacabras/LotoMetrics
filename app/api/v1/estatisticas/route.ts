import { validarApiKey, apiHeaders, apiErro } from "@/lib/api-auth";
import { getLoteriaPorCodigo } from "@/lib/queries";
import { isCodigoLoteriaValido } from "@/lib/format";
import {
  getFrequencia, getAtraso, getCiclos,
  getParesImpares, getSoma, getSequencias,
  getPrimosDistribuicao, getFibonacciDistribuicao, getMultiplos3Distribuicao,
  getDuques, getTrincas,
} from "@/lib/estatisticas";

export const runtime = "nodejs";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: apiHeaders() });
}

// Endpoints disponíveis via ?tipo=X
const TIPOS_VALIDOS = [
  "frequencia", "atraso", "ciclos", "soma",
  "pares-impares", "sequencias", "primos",
  "fibonacci", "multiplos3", "duques", "trincas",
] as const;

type TipoEstatistica = typeof TIPOS_VALIDOS[number];

export async function GET(request: Request) {
  const validacao = await validarApiKey(request.headers.get("authorization"));
  if (!validacao.ok) return apiErro(validacao.status, validacao.erro);

  const { searchParams } = new URL(request.url);
  const codigoLoteria = searchParams.get("loteria") ?? "lotofacil";
  const tipo = (searchParams.get("tipo") ?? "frequencia") as TipoEstatistica;
  const ultimosN = searchParams.get("ultimos") ? parseInt(searchParams.get("ultimos")!) : undefined;

  if (!isCodigoLoteriaValido(codigoLoteria)) {
    return apiErro(400, "Loteria inválida. Valores aceitos: 'lotofacil', 'megasena', 'quina', 'lotomania', 'diadesorte', 'maismilionaria', 'timemania', 'duplasena', 'supersete'.");
  }

  if (!TIPOS_VALIDOS.includes(tipo)) {
    return apiErro(400, `Tipo inválido. Use um de: ${TIPOS_VALIDOS.join(", ")}.`);
  }

  const loteria = await getLoteriaPorCodigo(codigoLoteria);
  if (!loteria) return apiErro(404, "Loteria não encontrada.");

  let dados: unknown;

  switch (tipo) {
    case "frequencia":
      dados = await getFrequencia(loteria.id, ultimosN);
      break;
    case "atraso":
      dados = await getAtraso(loteria.id);
      break;
    case "ciclos":
      dados = await getCiclos(loteria.id);
      break;
    case "soma": {
      const { estatisticas, histograma } = await getSoma(loteria.id);
      dados = { estatisticas, histograma };
      break;
    }
    case "pares-impares":
      dados = await getParesImpares(loteria.id);
      break;
    case "sequencias": {
      const { distribuicao } = await getSequencias(loteria.id);
      dados = distribuicao;
      break;
    }
    case "primos":
      dados = await getPrimosDistribuicao(loteria.id);
      break;
    case "fibonacci":
      dados = await getFibonacciDistribuicao(loteria.id);
      break;
    case "multiplos3":
      dados = await getMultiplos3Distribuicao(loteria.id);
      break;
    case "duques":
      dados = await getDuques(loteria.id);
      break;
    case "trincas":
      dados = await getTrincas(loteria.id);
      break;
  }

  return new Response(
    JSON.stringify({
      loteria: codigoLoteria,
      tipo,
      ...(ultimosN ? { ultimosConcursos: ultimosN } : {}),
      dados,
      geradoEm: new Date().toISOString(),
    }),
    { headers: apiHeaders(validacao.info) }
  );
}
