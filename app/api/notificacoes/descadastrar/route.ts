import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { validarTokenDescadastro } from "@/lib/notificacoes/unsubscribe";

export const runtime = "nodejs";

// Link de descadastro no rodapé de todo e-mail transacional (tarefa 1.1 do
// plano de implementação). Sem exigir login — padrão de e-mail
// transacional — mas só funciona com o token HMAC correto pra esse userId
// específico, então ninguém consegue desativar o e-mail de outra pessoa
// só sabendo o ID dela.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("u");
  const token = url.searchParams.get("t");
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lotoanalitica.com.br";

  if (!userId || !token || !validarTokenDescadastro(userId, token)) {
    return NextResponse.redirect(`${baseUrl}/notificacoes/descadastrar?status=invalido`);
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ receber_emails: false })
    .eq("id", userId);

  return NextResponse.redirect(
    `${baseUrl}/notificacoes/descadastrar?status=${error ? "erro" : "ok"}`
  );
}
