"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { gerarApiKey, hashApiKey, prefixoApiKey } from "@/lib/api-auth";
import { calcularIsPremium } from "@/lib/plano";
import { logError } from "@/lib/telemetry";

// SEC-002 (auditoria 27/10/2026): toda ESCRITA em api_keys passa pelo service
// role. O client autenticado perdeu INSERT/UPDATE/DELETE na tabela (ver
// migration 20261029000000) — antes a policy FOR ALL deixava o usuário gravar
// a própria chave pelo supabase-js e burlar o limite de chaves e a quota
// mensal. A sessão (createClient) é usada só para IDENTIFICAR o usuário; a
// autorização (premium, limite de chaves, dono) é toda server-side.

// ── Criar nova API key ────────────────────────────────────────────────────────
export async function criarApiKeyAction(
  label: string
): Promise<{ ok: boolean; key?: string; erro?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, erro: "Não autenticado." };

  const admin = createAdminClient();

  // Verificar se é premium
  const { data: profile } = await admin
    .from("profiles")
    .select("plan, plan_expires_at")
    .eq("id", user.id)
    .single();

  const isPremium = calcularIsPremium(profile);

  if (!isPremium) {
    return { ok: false, erro: "A API de dados é exclusiva para assinantes Premium." };
  }

  // Limitar a 3 chaves ativas por usuário
  const { count } = await admin
    .from("api_keys")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("ativo", true);

  if ((count ?? 0) >= 3) {
    return { ok: false, erro: "Limite de 3 chaves ativas atingido. Revogue uma antes de criar outra." };
  }

  const key = gerarApiKey();
  const { error } = await admin.from("api_keys").insert({
    user_id: user.id,
    key_hash: hashApiKey(key),
    key_prefix: prefixoApiKey(key),
    label: label.trim() || "Chave sem nome",
    limite_mes: 1000,
  });

  if (error) {
    console.error("[criarApiKeyAction] Supabase error:", error.message, error.code, error.details);
    after(() => logError({ source: "criar_api_key", message: error.message, userId: user.id }));
    return { ok: false, erro: "Erro ao criar a chave. Tente novamente." };
  }

  revalidatePath("/conta/api");
  // Retornar a chave UMA ÚNICA VEZ — nunca mais será exibida
  return { ok: true, key };
}

// ── Revogar API key ───────────────────────────────────────────────────────────
export async function revogarApiKeyAction(
  keyId: string
): Promise<{ ok: boolean; erro?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, erro: "Não autenticado." };

  // Escrita pelo service role; o .eq("user_id", …) com o id da sessão garante
  // que o usuário só revoga as próprias chaves (ver SEC-002).
  const { error } = await createAdminClient()
    .from("api_keys")
    .update({ ativo: false })
    .eq("id", keyId)
    .eq("user_id", user.id);

  if (error) {
    console.error("[revogarApiKeyAction] Supabase error:", error.message, error.code, error.details);
    after(() => logError({ source: "revogar_api_key", message: error.message, userId: user.id }));
    return { ok: false, erro: "Erro ao revogar a chave." };
  }

  revalidatePath("/conta/api");
  return { ok: true };
}
