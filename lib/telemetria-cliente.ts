// Helpers client-only compartilhados por components/TelemetriaBeacon.tsx e
// components/VisitaLandingBeacon.tsx — nunca importar isto num Server
// Component (usa document/navigator/crypto do navegador).

const COOKIE_ANONYMOUS_ID = "la_aid";
const UM_ANO_SEGUNDOS = 60 * 60 * 24 * 365;

export function lerCookie(nome: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${nome}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function escreverCookie(nome: string, valor: string, maxAgeSegundos = UM_ANO_SEGUNDOS): void {
  document.cookie = `${nome}=${valor}; max-age=${maxAgeSegundos}; path=/; SameSite=Lax`;
}

// Cookie de primeira parte que liga visita anônima, cadastro e compra
// (product_events.anonymous_id) — gerado uma vez, dura 1 ano.
export function obterOuCriarAnonymousId(): string {
  const existente = lerCookie(COOKIE_ANONYMOUS_ID);
  if (existente) return existente;
  const id = crypto.randomUUID();
  escreverCookie(COOKIE_ANONYMOUS_ID, id);
  return id;
}

export function enviarBeacon(payload: Record<string, unknown>): void {
  if (typeof navigator === "undefined" || !navigator.sendBeacon) return;
  const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
  navigator.sendBeacon("/api/eventos", blob);
}
