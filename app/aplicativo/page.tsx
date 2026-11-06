import type { Metadata } from "next";
import Link from "next/link";
import Masthead from "@/components/Masthead";
import AplicativoStatus from "@/components/pwa/AplicativoStatus";

export const metadata: Metadata = {
  title: "Aplicativo LotoAnalítica — instale no celular",
  description:
    "Instale o LotoAnalítica na tela inicial do Android ou do iPhone: abre em tela cheia, recebe notificações de resultado e funciona mesmo com conexão instável.",
  alternates: { canonical: "/aplicativo" },
};

export default function AplicativoPage() {
  return (
    <>
      <Masthead />
      <main className="container secao pagina-app">
        <p className="eyebrow">Aplicativo</p>
        <h1 className="titulo-edicao">LotoAnalítica no seu celular</h1>
        <p className="subtitulo-edicao">
          Sem loja de aplicativos e sem ocupar espaço: o site vira um app na sua tela inicial,
          abre em tela cheia e avisa quando sair o resultado.
        </p>

        <AplicativoStatus />

        <section className="pagina-app__recursos" aria-labelledby="recursos-titulo">
          <h2 id="recursos-titulo" className="pagina-app__subtitulo">O que muda com o app instalado</h2>
          <ul className="notif-beneficios">
            <li>Abre direto pelo ícone, sem a barra do navegador.</li>
            <li>
              Notificações de resultado, acúmulo e dos seus jogos —{" "}
              <Link href="/notificacoes">escolha o que receber</Link>.
            </li>
            <li>As páginas que você já abriu continuam disponíveis sem conexão.</li>
            <li>Atualiza sozinho: não existe versão velha para baixar.</li>
          </ul>
          <p className="bloco__nota">
            No iPhone/iPad, notificações exigem iOS 16.4 ou mais recente e o app instalado pela
            opção “Adicionar à Tela de Início” do Safari.
          </p>
        </section>
      </main>
    </>
  );
}
