"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Nome de exibição: o único campo de profiles que a role authenticated pode
// alterar (grant update (display_name) — migration
// 20260914000000_restrict_profiles_update.sql). A RLS garante que cada um só
// altera a própria linha; o .eq("id") é a mesma regra, explícita.
//
// Conjunto de caracteres restrito de propósito: o nome entra no HTML dos
// e-mails (lib/email-templates.ts interpola sem escapar), então nada de
// < > & " — só letras (com acento), números, espaço, ponto, hífen e apóstrofo.
const NOME_VALIDO = /^[\p{L}\p{M}\p{N} .'’-]{1,40}$/u;

export async function atualizarNomeAction(
  nomeBruto: string
): Promise<{ ok: true; nome: string } | { ok: false; erro: string }> {
  const nome = String(nomeBruto ?? "").trim().replace(/\s+/g, " ");
  if (!nome) return { ok: false, erro: "Escreva como quer ser chamado." };
  if (!NOME_VALIDO.test(nome)) {
    return { ok: false, erro: "Use até 40 caracteres: letras, números, espaço, ponto, hífen ou apóstrofo." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, erro: "Sua sessão expirou. Entre de novo." };

  const { error } = await supabase.from("profiles").update({ display_name: nome }).eq("id", user.id);
  if (error) return { ok: false, erro: "Não foi possível salvar agora. Tente de novo em instantes." };

  // O nome aparece na moldura (lombada/folha) de todas as páginas de /conta.
  revalidatePath("/conta", "layout");
  return { ok: true, nome };
}

// Religa os e-mails de alerta (acúmulo e resultado dos jogos) depois de um
// descadastro pelo link do e-mail. Coluna liberada para a role
// authenticated em 20260915000000_notificacoes.sql (GRANT UPDATE
// (receber_emails)); a RLS limita à própria linha.
export async function religarEmailsAction(): Promise<{ ok: true } | { ok: false; erro: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, erro: "Sua sessão expirou. Entre de novo." };

  const { error } = await supabase.from("profiles").update({ receber_emails: true }).eq("id", user.id);
  if (error) return { ok: false, erro: "Não foi possível religar agora. Tente de novo em instantes." };

  revalidatePath("/conta/alertas");
  return { ok: true };
}
