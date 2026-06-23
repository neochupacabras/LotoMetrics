import type { Metadata } from "next";
import Link from "next/link";
import Masthead from "@/components/Masthead";
import AuthForm from "@/components/auth/AuthForm";

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
