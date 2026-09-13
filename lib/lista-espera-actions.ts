"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { logToolEvent } from "@/lib/telemetry";

// Tarefa 2.2 do plano de implementação — captura de e-mail sem login pra
// medir interesse real em organizar um bolão antes de construir o produto
// inteiro (ver auditoria de 13/09/2026). Sempre via service role: a
// tabela lista_espera não tem nenhuma política de RLS pro client.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function entrarNaListaEsperaAction(
  email: string,
  origem: string,
  loteria: string | null = null
): Promise<{ ok: boolean; erro?: string }> {
  const emailNormalizado = email.trim().toLowerCase();

  if (!EMAIL_REGEX.test(emailNormalizado)) {
    return { ok: false, erro: "Digite um e-mail válido." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("lista_espera")
    .upsert(
      { email: emailNormalizado, origem, loteria },
      { onConflict: "email,origem", ignoreDuplicates: true }
    );

  if (error) {
    console.error("entrarNaListaEsperaAction:", error.message);
    return { ok: false, erro: "Não foi possível salvar seu e-mail. Tente novamente." };
  }

  await logToolEvent({ eventName: "waitlist_joined", tool: origem, lottery: loteria });

  return { ok: true };
}
