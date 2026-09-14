"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Teto de gasto mensal (recurso de jogo responsável, adiantado da Fase 3
// em 28/09/2026) — grava direto com o client da sessão porque
// teto_gasto_mensal é a única coluna com GRANT UPDATE liberado pra
// authenticated além de display_name/receber_emails (ver migration
// 20260928000000_teto_gasto_mensal.sql). Nunca bloqueia gasto real: é só
// uma referência que o próprio usuário define pra comparar contra o
// gasto simulado dos jogos salvos.
export async function salvarTetoGastoAction(
  valor: number | null
): Promise<{ ok: boolean; erro?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, erro: "Não autenticado." };

  if (valor !== null && (Number.isNaN(valor) || valor < 0)) {
    return { ok: false, erro: "Digite um valor válido." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ teto_gasto_mensal: valor })
    .eq("id", user.id);

  if (error) {
    console.error("salvarTetoGastoAction:", error.message);
    return { ok: false, erro: "Não foi possível salvar. Tente novamente." };
  }

  revalidatePath("/conta/carteira");
  return { ok: true };
}
