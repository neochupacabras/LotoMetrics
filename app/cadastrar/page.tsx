import type { Metadata } from "next";
import Link from "next/link";
import Masthead from "@/components/Masthead";
import AuthForm from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Criar conta — LotoAnalítica",
  robots: { index: false, follow: false },
};

export default async function CadastrarPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <>
      <Masthead />
      <main className="auth-page">
        <div className="auth-card">
          <h1 className="auth-titulo">Criar conta</h1>
          <p className="auth-subtitulo">
            Gratuito. Salve seus jogos e receba alertas de acúmulo.
          </p>

          <AuthForm modo="cadastrar" next={next} />

          <div className="auth-links">
            <Link href={`/entrar${next ? `?next=${next}` : ""}`} className="auth-link-secundario">
              Já tenho uma conta
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
