import type { Metadata } from "next";
import Link from "next/link";
import Masthead from "@/components/Masthead";

// Destino depois de excluir a conta (lib/conta-actions.ts). Fica fora de
// /conta porque o proxy manda quem não tem sessão para /entrar.
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Conta excluída — LotoAnalítica",
  robots: { index: false, follow: false },
};

export default function ContaExcluidaPage() {
  return (
    <>
      <Masthead />
      <main className="container secao">
        <p className="eyebrow">Conta excluída</p>
        <h1 className="titulo-edicao">Sua conta foi excluída.</h1>
        <p className="subtitulo-edicao">
          Apagamos seus dados, jogos salvos, bolões e alertas. Os resultados e as ferramentas
          gratuitas continuam abertos — e você pode criar uma conta nova quando quiser.
        </p>
        <p>
          <Link href="/" className="botao-gerar">
            Voltar para o início
          </Link>
        </p>
      </main>
    </>
  );
}
