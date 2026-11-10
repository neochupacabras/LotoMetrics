import { SITE_URL } from "./seo";
import { getCategoriasParaLoteria } from "./categorias";
import { isCodigoLoteriaValido } from "./format";

// IndexNow (https://www.indexnow.org): avisa Bing, Yandex, Seznam, Naver e
// os outros buscadores do protocolo que uma URL mudou, em vez de esperar o
// próximo rastreamento. O Google não participa; para ele continua valendo
// o sitemap.
//
// A chave não é segredo: o protocolo exige que ela fique pública em
// /{chave}.txt (public/9ce4521255dc322bfb92345a1d901e7e.txt) para o buscador
// confirmar que o envio veio do dono do domínio.
export const INDEXNOW_KEY = "9ce4521255dc322bfb92345a1d901e7e";
const ENDPOINT = "https://api.indexnow.org/indexnow";
// Limite do protocolo por requisição.
const MAX_URLS = 10_000;
const TIMEOUT_MS = 8_000;

export interface ConcursoNovo {
  loteria: string;
  numero: number;
}

/**
 * URLs que mudam quando entra concurso novo: a página de cada concurso, a
 * lista de resultados e as tabelas da loteria afetada, mais a home (que
 * mostra o último resultado de todas). Ignora loteria desconhecida e número
 * inválido, porque o corpo vem de fora (importador).
 */
export function urlsParaConcursos(concursos: ConcursoNovo[], base: string = SITE_URL): string[] {
  const urls = new Set<string>();
  for (const { loteria, numero } of concursos) {
    if (!isCodigoLoteriaValido(loteria)) continue;
    if (!Number.isInteger(numero) || numero <= 0) continue;
    urls.add(`${base}/${loteria}/resultados/${numero}`);
    urls.add(`${base}/${loteria}/resultados`);
    urls.add(`${base}/${loteria}/tabelas`);
    for (const categoria of getCategoriasParaLoteria(loteria)) {
      urls.add(`${base}/${loteria}/tabelas/${categoria.slug}`);
    }
  }
  if (urls.size > 0) urls.add(base);
  return [...urls];
}

export type ResultadoIndexNow =
  | { enviado: true; status: number; total: number }
  | { enviado: false; motivo: string; status?: number; total: number };

/**
 * Envia as URLs para api.indexnow.org. Nunca lança: devolve o resultado para
 * quem chamou registrar. Só envia em produção (VERCEL_ENV=production), para
 * teste local e preview não anunciarem URLs.
 */
export async function enviarIndexNow(urls: string[]): Promise<ResultadoIndexNow> {
  const total = urls.length;
  if (total === 0) return { enviado: false, motivo: "sem URLs", total };
  if (process.env.VERCEL_ENV !== "production") {
    return { enviado: false, motivo: "fora de produção", total };
  }

  const host = new URL(SITE_URL).host;
  try {
    const resposta = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: urls.slice(0, MAX_URLS),
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    // 200 = aceito; 202 = recebido, chave ainda em validação.
    if (resposta.status === 200 || resposta.status === 202) {
      return { enviado: true, status: resposta.status, total };
    }
    const texto = (await resposta.text().catch(() => "")).slice(0, 200);
    return { enviado: false, motivo: `HTTP ${resposta.status} ${texto}`.trim(), status: resposta.status, total };
  } catch (err) {
    return { enviado: false, motivo: (err as Error).message, total };
  }
}
