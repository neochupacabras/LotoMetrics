import type { Metadata } from "next";
import Link from "next/link";
import Masthead from "@/components/Masthead";
import AuthForm from "@/components/auth/AuthForm";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { caminhoInternoSeguro } from "@/lib/caminho-seguro";

export const metadata: Metadata = {
  title: "Entrar — LotoAnalítica",
  robots: { index: false, follow: false },
};

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; erro?: string }>;
}) {
  const { next, erro } = await searchParams;

  // Vindo do link de confirmação aberto duas vezes: a primeira requisição
  // pode ter aberto a sessão depois que a segunda já saiu. Se a pessoa já
  // está logada, segue para o destino (ex.: o bolão) em vez de pedir senha.
  if (erro === "confirmado") {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect(caminhoInternoSeguro(next));
  }

  return (
    <>
      <Masthead />
      <main className="auth-page">
        <div className="auth-card">
          <h1 className="auth-titulo">Entrar</h1>
          <p className="auth-subtitulo">
            Acesse sua conta para ver seus jogos salvos e recursos premium.
          </p>

          {erro === "link-invalido" && (
            <p className="auth-erro-global">
              O link expirou ou já foi usado. Tente entrar normalmente.
            </p>
          )}
          {erro === "confirmado" && (
            // O link de confirmação já validou o e-mail no Supabase, mas a
            // sessão não pôde ser aberta aqui (link aberto duas vezes ou em
            // outro navegador). A conta está ativa: basta entrar.
            <p className="auth-mensagem auth-mensagem--ok">
              E-mail confirmado! Entre com seu e-mail e senha para continuar
              {next?.includes("bolao") ? " — seu bolão está guardado" : ""}.
            </p>
          )}

          <AuthForm modo="entrar" next={next} />

          <div className="auth-links">
            <Link href="/esqueci-senha" className="auth-link-secundario">
              Esqueci minha senha
            </Link>
            <span className="auth-sep">·</span>
            <Link href={`/cadastrar${next ? `?next=${next}` : ""}`} className="auth-link-secundario">
              Criar conta
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
