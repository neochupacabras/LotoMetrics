import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { caminhoInternoSeguro } from "@/lib/caminho-seguro";

// O Supabase redireciona para /auth/callback?code=XXX após confirmação
// de e-mail, login com magic link, etc.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Validado: sem isso, `next=@site-malicioso.com` virava
  // `https://lotoanalitica.com.br@site-malicioso.com` (open redirect).
  const next = caminhoInternoSeguro(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Algo deu errado — redireciona para login com mensagem
  return NextResponse.redirect(`${origin}/entrar?erro=link-invalido`);
}
