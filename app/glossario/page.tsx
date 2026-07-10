import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { getGlossarioAgrupado } from "@/lib/glossario";

const TITULO = "Glossário — termos de loteria e estatística explicados";
const DESCRICAO =
  "Acumulado, atraso, fechamento, valor esperado, viés de sobrevivência e mais de 30 outros termos de loteria e estatística, explicados em poucas linhas.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: `${SITE_URL}/glossario` },
  openGraph: {
    title: TITULO,
    description: DESCRICAO,
    url: `${SITE_URL}/glossario`,
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "website",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

export default function GlossarioPage() {
  const grupos = getGlossarioAgrupado();

  return (
    <>
      <Masthead glossarioAtivo />
      <main className="container secao" style={{ maxWidth: 780 }}>
        <p className="eyebrow">Referência</p>
        <h1 className="titulo-edicao">Glossário</h1>
        <p className="subtitulo-edicao">
          Termos de loteria e de estatística que aparecem espalhados pelas
          tabelas, ferramentas e artigos do site — explicados em um parágrafo
          cada, com link para o artigo completo quando existir um.
        </p>

        {/* Índice A-Z */}
        <nav className="glossario-indice" aria-label="Índice alfabético">
          {grupos.map((g) => (
            <a key={g.letra} href={`#letra-${g.letra}`} className="glossario-indice__letra">
              {g.letra}
            </a>
          ))}
        </nav>

        {grupos.map((g) => (
          <section key={g.letra} id={`letra-${g.letra}`} className="glossario-secao">
            <h2 className="glossario-secao__titulo">{g.letra}</h2>
            <dl className="glossario-lista">
              {g.termos.map((t) => (
                <div key={t.slug} id={t.slug} className="glossario-item">
                  <dt className="glossario-item__termo">{t.termo}</dt>
                  <dd className="glossario-item__definicao">
                    {t.definicao}
                    {t.saibaMais && (
                      <>
                        {" "}
                        <Link href={t.saibaMais.href} className="breadcrumb">
                          {t.saibaMais.label} →
                        </Link>
                      </>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}

        <div className="bloco" style={{ marginTop: 40 }}>
          <p className="bloco__titulo" style={{ marginBottom: 12 }}>
            Não achou o termo que procurava?
          </p>
          <p>
            Este glossário cobre os termos mais comuns do site. Para explicações
            mais completas, com exemplos e simuladores interativos, veja os
            artigos de <Link href="/dicas" className="breadcrumb">Dicas e estratégias</Link> e{" "}
            <Link href="/matematica" className="breadcrumb">Matemática sem mistério</Link>.
          </p>
        </div>
      </main>
    </>
  );
}
