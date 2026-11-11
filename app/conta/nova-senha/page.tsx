export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Masthead from "@/components/Masthead";
import NovaSenhaForm from "@/components/auth/NovaSenhaForm";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Nova senha — LotoAnalítica",
  robots: { index: false, follow: false },
};

// Destino do link de "esqueci a senha": /auth/callback troca o código pela
// sessão e traz a pessoa para cá (ver forgotPassword em lib/auth-actions.ts).
// Até 10/11/2026 esta rota não existia e o link terminava em 404.
export default async function NovaSenhaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar?erro=link-invalido");

  return (
    <>
      <Masthead />
      <main className="auth-page">
        <div className="auth-card">
          <h1 className="auth-titulo">Crie uma nova senha</h1>
          <p className="auth-subtitulo">
            Você entrou pelo link enviado para {user.email}. Defina a nova senha para continuar.
          </p>
          <NovaSenhaForm />
        </div>
      </main>
    </>
  );
}
