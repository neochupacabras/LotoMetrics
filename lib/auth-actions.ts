"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
// SEC-006 (auditoria 27/10/2026): rate limit por IP em cadastro e reset de
// senha — helper compartilhado em lib/rate-limit.ts (fail-open).
import { dentroDoLimitePorIp } from "@/lib/rate-limit";
// SEC-004: só caminhos internos no `next` (ver lib/caminho-seguro.ts).
import { COOKIE_DESTINO_CADASTRO, caminhoInternoSeguro } from "@/lib/caminho-seguro";
import { cookies } from "next/headers";
// Com default: NEXT_PUBLIC_SITE_URL não existe na produção da Vercel, e o link
// de confirmação saía como "undefined/auth/callback" — o Supabase recusava e
// mandava para a Site URL (home) sem fazer o login (achado em 10/11/2026).
import { SITE_URL } from "@/lib/seo";

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
  // destino vai num cookie (compartilhado entre abas). NÃO pode ir como
  // ?next= no emailRedirectTo: a URL deixa de bater com a lista de Redirect
  // URLs do Supabase e ele manda a pessoa para a Site URL sem fazer o login
  // (aconteceu em produção em 10/11/2026).
  const next = caminhoInternoSeguro(formData.get("next"), "");
  if (next) {
    (await cookies()).set(COOKIE_DESTINO_CADASTRO, next, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 24 * 60 * 60,
    });
  }

  if (!(await dentroDoLimitePorIp("signup:ip", 10, 3600))) {
    return { error: "Muitas tentativas. Aguarde alguns minutos." };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      // URL para onde o Supabase redireciona após confirmação do e-mail
      emailRedirectTo: `${SITE_URL}/auth/callback`,
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

  // Destino em cookie, como no cadastro: com ?next= no redirectTo a URL
  // deixa de bater com a lista de Redirect URLs do Supabase (só
  // `${SITE_URL}/auth/callback`, exato) e ele manda a pessoa para a home sem
  // abrir a sessão. /auth/callback lê o cookie e leva a /conta/nova-senha.
  // Se o link for aberto em outro aparelho (sem o cookie), a pessoa cai em
  // /conta já logada; para trocar a senha, abre /conta/nova-senha.
  (await cookies()).set(COOKIE_DESTINO_CADASTRO, "/conta/nova-senha", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60,
  });

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE_URL}/auth/callback`,
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
