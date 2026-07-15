import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import Legenda from "@/components/Legenda";
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

const BADGE: Record<string, string> = {
  lotofacil:      "Lotofácil",
  megasena:       "Mega-Sena",
  quina:          "Quina",
  lotomania:      "Lotomania",
  diadesorte:     "Dia de Sorte",
  maismilionaria: "+Milionária",
  timemania:      "Timemania",
  duplasena:      "Dupla Sena",
  supersete:      "Super Sete",
  ambas:          "Comparativo",
  educativo:      "Educativo",
};

function formatarData(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function AnalisesPage() {
  const analises = getAnalisesRecentes();

  return (
    <>
      <Masthead analisesAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow">Conteúdo</p>
        <h1 className="titulo-edicao">Análises e novidades</h1>
        <p className="subtitulo-edicao">
          Análises de dados históricos, comparativos entre loterias e explicações
          sobre os resultados mais recentes. Publicado após cada sorteio e
          atualizado regularmente.
        </p>

        <Legenda
          itens={[
            { cor: "pine", texto: "Uma loteria específica" },
            { cor: "ochre", texto: "Comparativo entre loterias" },
            { cor: "rust", texto: "Conteúdo educativo" },
          ]}
        />

        <div className="analises-lista" style={{ marginTop: 36 }}>
          {analises.map((a) => (
            <Link
              key={a.slug}
              href={`/analises/${a.slug}`}
              className="analise-card"
            >
              <div className="analise-card__meta">
                <span className={`analise-card__badge analise-card__badge--${a.categoria}`}>
                  {BADGE[a.categoria]}
                </span>
                <span className="analise-card__data">{formatarData(a.data)}</span>
                <span className="analise-card__tempo">{a.tempoLeitura} min de leitura</span>
              </div>
              <h2 className="analise-card__titulo">{a.titulo}</h2>
              <p className="analise-card__resumo">{a.resumo}</p>
            </Link>
          ))}
        </div>

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
