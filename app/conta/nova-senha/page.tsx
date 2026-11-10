export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CabecalhoPagina } from "@/components/membros/MembrosShell";
import FormSenha from "@/components/membros/FormSenha";
import { getContaContexto } from "@/lib/conta/contexto";

export const metadata: Metadata = {
  title: "Nova senha — LotoAnalítica",
  robots: { index: false, follow: false },
};

// Destino do link de "esqueci a senha": /auth/callback troca o código pela
// sessão e traz a pessoa para cá (ver forgotPassword em lib/auth-actions.ts).
// Até 10/11/2026 esta rota não existia e o link terminava em 404.
export default async function NovaSenhaPage() {
  const contexto = await getContaContexto();
  if (!contexto) redirect("/entrar?erro=link-invalido");

  return (
    <>
      <CabecalhoPagina
        titulo="Crie uma nova senha"
        descricao={`Você entrou pelo link enviado para ${contexto.email}. Defina a nova senha para continuar.`}
      />
      <div className="m-painel m-painel--estreito">
        <FormSenha />
      </div>
    </>
  );
}
