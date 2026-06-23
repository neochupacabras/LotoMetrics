import type { Metadata } from "next";
import Link from "next/link";
import Masthead from "@/components/Masthead";
import AuthForm from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Recuperar senha — LotoAnalítica",
  robots: { index: false, follow: false },
};

export default function EsqueciSenhaPage() {
  return (
    <>
      <Masthead />
      <main className="auth-page">
        <div className="auth-card">
          <h1 className="auth-titulo">Recuperar senha</h1>
          <p className="auth-subtitulo">
            Informe seu e-mail e enviaremos as instruções para redefinir sua senha.
          </p>

          <AuthForm modo="esqueci-senha" />

          <div className="auth-links">
            <Link href="/entrar" className="auth-link-secundario">
              Voltar para o login
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
