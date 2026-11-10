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

  function irPara(caminho: string) {
    const resposta = NextResponse.redirect(`${origin}${caminho}`);
    if (destinoCadastro) resposta.cookies.delete(COOKIE_DESTINO_CADASTRO);
    return resposta;
  }

  const supabase = await createClient();
  let motivo: string | null = searchParams.get("error_code") ?? searchParams.get("error");

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return irPara(next);
    motivo = error.message;
  }

  // O mesmo link costuma chegar aqui DUAS vezes em menos de 1 s (visto nos
  // logs da Vercel em 10/11/2026: o navegador/app de e-mail abre o link de
  // novo). A primeira requisição troca o código e grava a sessão; a segunda
  // falha com "código já usado". Se a sessão já existe, segue normalmente.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) return irPara(next);

  console.error("auth/callback: não foi possível abrir a sessão", { motivo, temCodigo: !!code });

  // Sem sessão: o e-mail em geral já foi confirmado pelo Supabase antes de
  // chegar aqui (link aberto em outro navegador, por exemplo). Manda entrar
  // com e-mail e senha, guardando o destino para voltar ao bolão depois.
  const destino = destinoCadastro || searchParams.get("next") ? `&next=${encodeURIComponent(next)}` : "";
  return NextResponse.redirect(`${origin}/entrar?erro=${code ? "confirmado" : "link-invalido"}${destino}`);
}
