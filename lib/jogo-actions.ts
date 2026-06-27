"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// ── Salvar jogo ───────────────────────────────────────────────────────────────
export async function salvarJogoAction(
  codigoLoteria: string,
  dezenas: number[],
  label?: string
): Promise<{ ok: boolean; erro?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, erro: "Faça login para salvar jogos." };

  const { error } = await supabase.from("user_games").insert({
    user_id: user.id,
    loteria: codigoLoteria,
    dezenas,
    label: label?.trim() || null,
  });

  if (error) {
    console.error("salvarJogoAction:", error.message);
    return { ok: false, erro: "Não foi possível salvar o jogo. Tente novamente." };
  }

  revalidatePath("/conta");
  revalidatePath("/conta/jogos");
  return { ok: true };
}

// ── Remover jogo ──────────────────────────────────────────────────────────────
export async function removerJogoAction(
  jogoId: string
): Promise<{ ok: boolean; erro?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, erro: "Não autenticado." };

  const { error } = await supabase
    .from("user_games")
    .delete()
    .eq("id", jogoId)
    .eq("user_id", user.id); // garante que o usuário só remove seus próprios jogos

  if (error) return { ok: false, erro: "Não foi possível remover o jogo." };

  revalidatePath("/conta");
  revalidatePath("/conta/jogos");
  return { ok: true };
}

// ── Atualizar label ───────────────────────────────────────────────────────────
export async function atualizarLabelAction(
  jogoId: string,
  label: string
): Promise<{ ok: boolean; erro?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, erro: "Não autenticado." };

  const { error } = await supabase
    .from("user_games")
    .update({ label: label.trim() || null })
    .eq("id", jogoId)
    .eq("user_id", user.id);

  if (error) return { ok: false, erro: "Não foi possível atualizar." };

  revalidatePath("/conta/jogos");
  return { ok: true };
}

// ── Ativar/desativar jogo ─────────────────────────────────────────────────────
export async function toggleAtivoAction(
  jogoId: string,
  ativo: boolean
): Promise<{ ok: boolean; erro?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, erro: "Não autenticado." };

  const { error } = await supabase
    .from("user_games")
    .update({ ativo })
    .eq("id", jogoId)
    .eq("user_id", user.id);

  if (error) return { ok: false, erro: "Não foi possível atualizar." };

  revalidatePath("/conta/jogos");
  return { ok: true };
}

// ── Salvar preferências de alerta ─────────────────────────────────────────────
export async function salvarAlertaAction(formData: FormData): Promise<{ ok: boolean; erro?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, erro: "Não autenticado." };

  const loteria = formData.get("loteria") as string;
  const thresholdStr = formData.get("threshold") as string;
  const sorteiosStr = formData.get("sorteios") as string;

  const threshold = thresholdStr ? parseFloat(thresholdStr.replace(/\./g, "").replace(",", ".")) : null;
  const sorteios = sorteiosStr ? parseInt(sorteiosStr) : null;

  // Upsert — uma preferência por loteria por usuário
  const { error } = await supabase.from("alert_preferences").upsert(
    {
      user_id: user.id,
      loteria,
      threshold_brl: threshold,
      sorteios_sem_ganhador: sorteios,
      ativo: true,
    },
    { onConflict: "user_id,loteria" }
  );

  if (error) {
    // Se a constraint não existe, insere normalmente
    const { error: insertError } = await supabase.from("alert_preferences").insert({
      user_id: user.id,
      loteria,
      threshold_brl: threshold,
      sorteios_sem_ganhador: sorteios,
      ativo: true,
    });
    if (insertError) return { ok: false, erro: "Não foi possível salvar o alerta." };
  }

  revalidatePath("/conta");
  return { ok: true };
}

// ── Desativar alerta ──────────────────────────────────────────────────────────
export async function desativarAlertaAction(
  loteria: string
): Promise<{ ok: boolean; erro?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, erro: "Não autenticado." };

  const { error } = await supabase
    .from("alert_preferences")
    .update({ ativo: false })
    .eq("user_id", user.id)
    .eq("loteria", loteria);

  if (error) return { ok: false, erro: "Não foi possível desativar o alerta." };

  revalidatePath("/conta");
  return { ok: true };
}
