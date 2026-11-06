import type { Metadata } from "next";
import Link from "next/link";
import Masthead from "@/components/Masthead";
import NotificacoesPreferencias from "@/components/pwa/NotificacoesPreferencias";

export const metadata: Metadata = {
  title: "Notificações — LotoAnalítica",
  description: "Receba no celular o resultado das loterias assim que sair, avisos de acúmulo e a conferência dos seus jogos.",
  robots: { index: false, follow: true },
};

export default function NotificacoesPage() {
  return (
    <>
      <Masthead />
      <main className="container secao pagina-app">
        <p className="eyebrow">Configurações</p>
        <h1 className="titulo-edicao">Notificações</h1>
        <p className="subtitulo-edicao">
          Escolha o que você quer receber neste aparelho. As preferências valem por
          aparelho/navegador — ative em cada um onde quiser receber.
        </p>
        <NotificacoesPreferencias />
        <p className="bloco__nota pagina-app__nota">
          Prefere e-mail? Os alertas por e-mail ficam em{" "}
          <Link href="/conta">Minha conta</Link>. Para instalar o LotoAnalítica na tela
          inicial, veja <Link href="/aplicativo">Aplicativo</Link>.
        </p>
      </main>
    </>
  );
}
