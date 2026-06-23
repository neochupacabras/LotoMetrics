"use server";

import { createClient } from "@/lib/supabase/server";

export async function salvarJogoAction(
  codigoLoteria: string,
  dezenas: number[],
  label?: string
): Promise<{ ok: boolean; erro?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, erro: "Faça login para salvar jogos." };
  }

  const { error } = await supabase.from("user_games").insert({
    user_id: user.id,
    loteria: codigoLoteria,
    dezenas,
    label: label ?? null,
  });

  if (error) {
    console.error("salvarJogoAction error:", error.message);
    return { ok: false, erro: "Não foi possível salvar o jogo. Tente novamente." };
  }

  return { ok: true };
}
