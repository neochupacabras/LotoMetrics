// SEC-004 (auditoria 27/10/2026): `next` vem da query string e ia direto
// pro redirect — `/entrar?next=https://site-malicioso` levava o usuário pra
// fora do domínio após o login (open redirect / phishing). Só aceitamos
// caminhos internos: precisa começar com "/" e não pode ser "//"/"/\" (que o
// navegador interpreta como URL protocol-relative pra outro host).
// Compartilhado pelo login/cadastro (lib/auth-actions.ts) e pelo
// /auth/callback, que recebe o `next` de volta no link de confirmação.
export function caminhoInternoSeguro(next: unknown, fallback = "/conta"): string {
  if (typeof next !== "string" || !next.startsWith("/")) return fallback;
  if (next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}

// Destino depois de confirmar o e-mail do cadastro (gravado por signUp,
// lido e apagado por /auth/callback).
export const COOKIE_DESTINO_CADASTRO = "la_pos_cadastro";
