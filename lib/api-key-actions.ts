"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { gerarApiKey, hashApiKey, prefixoApiKey } from "@/lib/api-auth";

// ── Criar nova API key ────────────────────────────────────────────────────────
export async function criarApiKeyAction(
  label: string
): Promise<{ ok: boolean; key?: string; erro?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, erro: "Não autenticado." };

  // Verificar se é premium
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, plan_expires_at")
    .eq("id", user.id)
    .single();

  const isPremium =
    profile?.plan === "premium" &&
    (!profile.plan_expires_at || new Date(profile.plan_expires_at) > new Date());

  if (!isPremium) {
    return { ok: false, erro: "A API de dados é exclusiva para assinantes Premium." };
  }

  // Limitar a 3 chaves ativas por usuário
  const { count } = await supabase
    .from("api_keys")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("ativo", true);

  if ((count ?? 0) >= 3) {
    return { ok: false, erro: "Limite de 3 chaves ativas atingido. Revogue uma antes de criar outra." };
  }

  const key = gerarApiKey();
  const { error } = await supabase.from("api_keys").insert({
    user_id: user.id,
    key_hash: hashApiKey(key),
    key_prefix: prefixoApiKey(key),
    label: label.trim() || "Chave sem nome",
    limite_mes: 1000,
  });

  if (error) return { ok: false, erro: "Erro ao criar a chave. Tente novamente." };

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

  const { error } = await supabase
    .from("api_keys")
    .update({ ativo: false })
    .eq("id", keyId)
    .eq("user_id", user.id);

  if (error) return { ok: false, erro: "Erro ao revogar a chave." };

  revalidatePath("/conta/api");
  return { ok: true };
}
