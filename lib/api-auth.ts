import { createHash, randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/server";

// ── Gerar nova API key ────────────────────────────────────────────────────────
// Formato: la_[32 bytes hex] — "la" de LotoAnalítica
export function gerarApiKey(): string {
  return `la_${randomBytes(32).toString("hex")}`;
}

// Hash SHA-256 da chave para armazenar no banco (nunca guardar a chave em plain text)
export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

// Prefixo visível para identificação (ex: "la_1a2b3c4d")
export function prefixoApiKey(key: string): string {
  return key.slice(0, 12);
}

// ── Resultado da validação ────────────────────────────────────────────────────
export interface ApiKeyInfo {
  userId: string;
  keyId: string;
  limitesMes: number;
  requestsMes: number;
}

export type ValidacaoResult =
  | { ok: true; info: ApiKeyInfo }
  | { ok: false; status: 401 | 429 | 403; erro: string };

// ── Validar chave e aplicar rate limiting ─────────────────────────────────────
export async function validarApiKey(
  authHeader: string | null
): Promise<ValidacaoResult> {
  if (!authHeader?.startsWith("Bearer ")) {
    return { ok: false, status: 401, erro: "Authorization header ausente. Use: Authorization: Bearer la_suachave" };
  }

  const key = authHeader.slice(7).trim();
  if (!key.startsWith("la_")) {
    return { ok: false, status: 401, erro: "Chave inválida. Chaves válidas começam com 'la_'." };
  }

  const supabase = createAdminClient();
  const keyHash = hashApiKey(key);
  const mesAtual = new Date().toISOString().slice(0, 7); // "YYYY-MM"

  // Buscar a chave no banco
  const { data: apiKey } = await supabase
    .from("api_keys")
    .select("id, user_id, ativo, requests_mes, limite_mes, mes_referencia")
    .eq("key_hash", keyHash)
    .single();

  if (!apiKey) {
    return { ok: false, status: 401, erro: "Chave de API não encontrada ou inválida." };
  }

  if (!apiKey.ativo) {
    return { ok: false, status: 401, erro: "Esta chave de API foi revogada." };
  }

  // Verificar se o usuário ainda é premium
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, plan_expires_at")
    .eq("id", apiKey.user_id)
    .single();

  const isPremium =
    profile?.plan === "premium" &&
    (!profile.plan_expires_at || new Date(profile.plan_expires_at) > new Date());

  if (!isPremium) {
    return { ok: false, status: 403, erro: "A conta associada a esta chave não possui assinatura Premium ativa." };
  }

  // Reset mensal do contador se mudou o mês
  let requestsMes = apiKey.requests_mes;
  if (apiKey.mes_referencia !== mesAtual) {
    requestsMes = 0;
    await supabase
      .from("api_keys")
      .update({ requests_mes: 0, mes_referencia: mesAtual })
      .eq("id", apiKey.id);
  }

  // Verificar rate limit
  if (requestsMes >= apiKey.limite_mes) {
    return {
      ok: false,
      status: 429,
      erro: `Limite mensal de ${apiKey.limite_mes} requisições atingido. Renova em ${new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString("pt-BR")}.`,
    };
  }

  // Incrementar contador e atualizar last_used_at
  await supabase
    .from("api_keys")
    .update({
      requests_mes: requestsMes + 1,
      last_used_at: new Date().toISOString(),
      mes_referencia: mesAtual,
    })
    .eq("id", apiKey.id);

  return {
    ok: true,
    info: {
      userId: apiKey.user_id,
      keyId: apiKey.id,
      limitesMes: apiKey.limite_mes,
      requestsMes: requestsMes + 1,
    },
  };
}

// ── Headers padrão de resposta ────────────────────────────────────────────────
export function apiHeaders(info?: ApiKeyInfo): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
  };
  if (info) {
    headers["X-RateLimit-Limit"]     = String(info.limitesMes);
    headers["X-RateLimit-Remaining"] = String(Math.max(0, info.limitesMes - info.requestsMes));
  }
  return headers;
}

// ── Resposta de erro padronizada ──────────────────────────────────────────────
export function apiErro(
  status: number,
  erro: string,
  detalhe?: string
): Response {
  return new Response(
    JSON.stringify({ erro, detalhe, docs: "https://lotoanalitica.com.br/api/v1/docs" }),
    { status, headers: apiHeaders() }
  );
}
