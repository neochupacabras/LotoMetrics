import { IDS_CATEGORIAS, CATEGORIAS_PESSOAIS, type CategoriaPush } from "@/lib/push/categorias";
import { isCodigoLoteriaValido } from "@/lib/format";

// Validação pura (sem I/O) do que chega em /api/push/* — testada em
// lib/push/validacao.test.ts.
//
// O endpoint de uma inscrição é uma URL para a qual o NOSSO servidor faz
// POST ao enviar uma notificação. Aceitar qualquer URL abriria SSRF (um
// atacante cadastraria http://169.254.169.254/... ou um host interno), então
// só passam HTTPS dos serviços de push dos navegadores conhecidos.
const HOSTS_PUSH_PERMITIDOS: readonly (string | RegExp)[] = [
  "fcm.googleapis.com", // Chrome, Edge (Android), Samsung Internet, Opera
  "android.googleapis.com", // inscrições antigas do Chrome
  "updates.push.services.mozilla.com", // Firefox
  "push.services.mozilla.com",
  /^[a-z0-9-]+\.push\.apple\.com$/, // Safari (macOS e iOS 16.4+)
  /^[a-z0-9-]+\.notify\.windows\.com$/, // Edge (Windows / WNS)
];

const BASE64URL = /^[A-Za-z0-9_-]+=*$/;

export interface InscricaoValidada {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export function endpointPermitido(endpoint: unknown): endpoint is string {
  if (typeof endpoint !== "string" || endpoint.length > 1024) return false;
  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    return false;
  }
  if (url.protocol !== "https:" || url.username || url.password || url.port) return false;
  const host = url.hostname.toLowerCase();
  return HOSTS_PUSH_PERMITIDOS.some((h) => (typeof h === "string" ? h === host : h.test(host)));
}

export function validarInscricao(entrada: unknown): InscricaoValidada | null {
  if (!entrada || typeof entrada !== "object") return null;
  const { endpoint, keys } = entrada as { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };
  if (!endpointPermitido(endpoint)) return null;
  const p256dh = keys?.p256dh;
  const auth = keys?.auth;
  // p256dh: ponto P-256 não comprimido (65 bytes ≈ 87 chars); auth: 16 bytes ≈ 22 chars.
  if (typeof p256dh !== "string" || p256dh.length < 80 || p256dh.length > 100 || !BASE64URL.test(p256dh)) return null;
  if (typeof auth !== "string" || auth.length < 16 || auth.length > 32 || !BASE64URL.test(auth)) return null;
  return { endpoint, p256dh, auth };
}

// Filtra categorias desconhecidas e, sem login, as pessoais.
export function normalizarCategorias(entrada: unknown, logado: boolean): CategoriaPush[] {
  if (!Array.isArray(entrada)) return [];
  const saida = new Set<CategoriaPush>();
  for (const c of entrada) {
    if (typeof c !== "string" || !IDS_CATEGORIAS.has(c)) continue;
    if (!logado && CATEGORIAS_PESSOAIS.has(c)) continue;
    saida.add(c as CategoriaPush);
  }
  return [...saida];
}

// Lista vazia = todas as loterias.
export function normalizarLoterias(entrada: unknown): string[] {
  if (!Array.isArray(entrada)) return [];
  const saida = new Set<string>();
  for (const l of entrada) {
    if (typeof l === "string" && isCodigoLoteriaValido(l)) saida.add(l);
  }
  return [...saida];
}

// Só caminhos do próprio site viram destino de clique na notificação.
export function caminhoInterno(url: unknown): string {
  if (typeof url !== "string" || !url.startsWith("/") || url.startsWith("//") || url.includes("\\")) return "/";
  return url.slice(0, 300);
}
