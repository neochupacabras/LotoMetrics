import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { COOKIE_DESTINO_CADASTRO, caminhoInternoSeguro } from "@/lib/caminho-seguro";

// O Supabase redireciona para /auth/callback?code=XXX após confirmação
// de e-mail, login com magic link, etc.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Destino: ?next= (reset de senha) ou o cookie gravado no cadastro (volta
  // para o bolão montado antes de criar a conta). Validado: sem isso,
  // `next=@site-malicioso.com` virava `https://lotoanalitica.com.br@site-malicioso.com`.
  const cookieStore = await cookies();
  const destinoCadastro = cookieStore.get(COOKIE_DESTINO_CADASTRO)?.value;
  const next = caminhoInternoSeguro(searchParams.get("next") ?? destinoCadastro);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const resposta = NextResponse.redirect(`${origin}${next}`);
      if (destinoCadastro) resposta.cookies.delete(COOKIE_DESTINO_CADASTRO);
      return resposta;
    }
  }

  // Algo deu errado — redireciona para login com mensagem
  return NextResponse.redirect(`${origin}/entrar?erro=link-invalido`);
}
