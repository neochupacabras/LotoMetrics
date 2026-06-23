import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// O Supabase redireciona para /auth/callback?code=XXX após confirmação
// de e-mail, login com magic link, etc.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/conta";

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
