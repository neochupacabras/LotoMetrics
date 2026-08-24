import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import AnalisesFiltro from "@/components/AnalisesFiltro";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { getAnalisesRecentes } from "@/lib/analises";

export const metadata: Metadata = {
  title: "Análises e novidades — LotoAnalítica",
  description:
    "Análises de concursos recentes, comparativos históricos e conteúdo educativo sobre Lotofácil e Mega-Sena. Atualizado regularmente após cada sorteio.",
  alternates: { canonical: `${SITE_URL}/analises` },
  openGraph: {
    title: "Análises e novidades — LotoAnalítica",
    description:
      "Análises de concursos recentes, comparativos históricos e conteúdo educativo sobre Lotofácil e Mega-Sena.",
    url: `${SITE_URL}/analises`,
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "website",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

export default function AnalisesPage() {
  const analises = getAnalisesRecentes();

  return (
    <>
      <Masthead analisesAtiva />
      <main className="container secao" style={{ maxWidth: 900 }}>
        <p className="eyebrow">Conteúdo</p>
        <h1 className="titulo-edicao">Análises e novidades</h1>
        <p className="subtitulo-edicao">
          Análises de dados históricos, comparativos entre loterias e explicações
          sobre os resultados mais recentes. Publicado após cada sorteio e
          atualizado regularmente.
        </p>

        <AnalisesFiltro analises={analises} />

        <div className="bloco" style={{ marginTop: 48 }}>
          <p>
            Para aprofundar qualquer um dos temas acima, a seção{" "}
            <Link href="/dicas">Dicas e estratégias</Link> traz os artigos completos
            com a matemática por trás de cada análise — frequência, atraso, probabilidades,
            retorno ao apostador e mais.
          </p>
        </div>
      </main>
    </>
  );
}
