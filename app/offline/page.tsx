import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import OfflineConteudo from "@/components/pwa/OfflineConteudo";

// Página que o service worker (public/sw.js) pré-carrega e mostra quando
// não há conexão nem cópia salva da página pedida. Estática de propósito.
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Sem conexão — LotoAnalítica",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <>
      <Masthead />
      <main className="container secao offline-pagina">
        <p className="eyebrow">Sem conexão</p>
        <h1 className="titulo-edicao">Você está offline.</h1>
        <p className="subtitulo-edicao">
          Esta página ainda não foi salva neste aparelho. Os resultados e ferramentas
          dependem do servidor para buscar os dados oficiais — assim que a conexão
          voltar, é só tentar de novo.
        </p>
        <OfflineConteudo />
      </main>
    </>
  );
}
