"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createAdminClient, createClient } from "@/lib/supabase/server";

// SEC-006 (auditoria 27/10/2026): rate limit por IP em cadastro e reset de
// senha — reaproveita o RPC consumir_rate_limit (migration 20261028000000),
// executado pelo service role. Fail-open: se o RPC falhar, deixa passar
// (melhor que travar gente legítima) e registra no console. Isto é defesa em
// profundidade sobre os limites embutidos do Supabase Auth; não os substitui.
async function dentroDoLimitePorIp(
  prefixo: string,
  max: number,
  janelaSegundos: number
): Promise<boolean> {
  try {
    const forwarded = (await headers()).get("x-forwarded-for") ?? "";
    const ip = forwarded.split(",")[0]?.trim() || "desconhecido";
    const ipHash = createHash("sha256").update(ip).digest("hex").slice(0, 32);
    const { data, error } = await createAdminClient().rpc("consumir_rate_limit", {
      p_chave: `${prefixo}:${ipHash}`,
      p_max: max,
      p_janela_segundos: janelaSegundos,
    });
    if (error) {
      console.error("rate limit indisponível:", error.message);
      return true;
    }
    return data !== false;
  } catch {
    return true;
  }
}

// SEC-005: mensagem única para cadastro, igual quer o e-mail seja novo ou já
// exista — impede enumeração de e-mails cadastrados pela resposta.
const MSG_CADASTRO =
  "Enviamos um e-mail com o próximo passo. Verifique sua caixa de entrada (e o spam).";

// SEC-004 (auditoria 27/10/2026): o `next` vem da query string e ia direto
// pro redirect() — `/entrar?next=https://site-malicioso` levava o usuário
// pra fora do domínio após o login (open redirect / phishing). Só aceitamos
// caminhos internos: precisa começar com "/" e não pode ser "//"/"/\" (que o
// navegador interpreta como URL protocol-relative pra outro host).
function caminhoInternoSeguro(next: unknown, fallback = "/conta"): string {
  if (typeof next !== "string" || !next.startsWith("/")) return fallback;
  if (next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}

// ── Cadastro ──────────────────────────────────────────────────────────────────
export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  if (!(await dentroDoLimitePorIp("signup:ip", 10, 3600))) {
    return { error: "Muitas tentativas. Aguarde alguns minutos." };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      // URL para onde o Supabase redireciona após confirmação do e-mail
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
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
