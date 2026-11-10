"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
// SEC-006 (auditoria 27/10/2026): rate limit por IP em cadastro e reset de
// senha — helper compartilhado em lib/rate-limit.ts (fail-open).
import { dentroDoLimitePorIp } from "@/lib/rate-limit";
// SEC-004: só caminhos internos no `next` (ver lib/caminho-seguro.ts).
import { caminhoInternoSeguro } from "@/lib/caminho-seguro";

// SEC-005: mensagem única para cadastro, igual quer o e-mail seja novo ou já
// exista — impede enumeração de e-mails cadastrados pela resposta.
const MSG_CADASTRO =
  "Enviamos um e-mail com o próximo passo. Verifique sua caixa de entrada (e o spam).";

// ── Cadastro ──────────────────────────────────────────────────────────────────
export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  // Volta para onde a pessoa estava (ex.: o bolão que acabou de montar) depois
  // de confirmar o e-mail. O link de confirmação abre numa aba nova, então o
  // destino precisa viajar no próprio link.
  const next = caminhoInternoSeguro(formData.get("next"), "");

  if (!(await dentroDoLimitePorIp("signup:ip", 10, 3600))) {
    return { error: "Muitas tentativas. Aguarde alguns minutos." };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      // URL para onde o Supabase redireciona após confirmação do e-mail
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback${
        next ? `?next=${encodeURIComponent(next)}` : ""
      }`,
    },
  });

  if (error) {
    // SEC-005: "User already registered" responde com a MESMA mensagem do
    // caminho de sucesso — nunca confirma se o e-mail já tinha conta.
    if (error.message.includes("User already registered")) {
      return { success: MSG_CADASTRO };
    }
    return { error: traduzirErroAuth(error.message) };
  }

  return { success: MSG_CADASTRO };
}

// ── Login ─────────────────────────────────────────────────────────────────────
export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const next = caminhoInternoSeguro(formData.get("next"));

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: traduzirErroAuth(error.message) };
  }

  revalidatePath("/", "layout");
  redirect(next);
}

// ── Logout ────────────────────────────────────────────────────────────────────
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

// ── Recuperação de senha ──────────────────────────────────────────────────────
export async function forgotPassword(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  // SEC-006: 5 pedidos de reset por hora por IP (evita e-mail bombing).
  if (!(await dentroDoLimitePorIp("reset:ip", 5, 3600))) {
    return { error: "Muitas tentativas. Aguarde alguns minutos." };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/conta/nova-senha`,
  });

  if (error) {
    return { error: traduzirErroAuth(error.message) };
  }

  return { success: "Se esse e-mail estiver cadastrado, você receberá as instruções em breve." };
}

// ── Atualizar senha (após reset) ──────────────────────────────────────────────
export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: traduzirErroAuth(error.message) };
  }

  revalidatePath("/conta");
  redirect("/conta");
}

// ── Helper: traduzir mensagens de erro do Supabase ────────────────────────────
function traduzirErroAuth(msg: string): string {
  if (msg.includes("Invalid login credentials")) return "E-mail ou senha incorretos.";
  if (msg.includes("Email not confirmed"))       return "Confirme seu e-mail antes de entrar.";
  if (msg.includes("User already registered"))   return "Já existe uma conta com esse e-mail.";
  if (msg.includes("Password should be at least")) return "A senha precisa ter pelo menos 6 caracteres.";
  if (msg.includes("rate limit"))                return "Muitas tentativas. Aguarde alguns minutos.";
  return "Ocorreu um erro. Tente novamente.";
}
