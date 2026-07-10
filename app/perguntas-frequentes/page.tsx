import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { FAQ } from "@/lib/faq";

const TITULO = "Perguntas frequentes sobre loterias — LotoAnalítica";
const DESCRICAO =
  "Idade mínima para apostar, prazo para resgatar prêmio, imposto de renda, como funciona o bolão e mais dúvidas comuns sobre as loterias da Caixa, respondidas direto ao ponto.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: `${SITE_URL}/perguntas-frequentes` },
  openGraph: {
    title: TITULO,
    description: DESCRICAO,
    url: `${SITE_URL}/perguntas-frequentes`,
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "website",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

function idCategoria(categoria: string) {
  return categoria
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-");
}

export default function FAQPage() {
  return (
    <>
      <Masthead />
      <main className="container secao" style={{ maxWidth: 780 }}>
        <p className="eyebrow">Referência</p>
        <h1 className="titulo-edicao">Perguntas frequentes</h1>
        <p className="subtitulo-edicao">
          Dúvidas comuns sobre como apostar, resgatar prêmios, imposto de renda,
          bolões e sobre as regras das loterias da Caixa — direto ao ponto, sem
          enrolação.
        </p>

        <nav className="faq-indice" aria-label="Categorias">
          {FAQ.map((c) => (
            <a key={c.categoria} href={`#${idCategoria(c.categoria)}`} className="faq-indice__item">
              {c.categoria}
            </a>
          ))}
        </nav>

        {FAQ.map((c) => (
          <section key={c.categoria} id={idCategoria(c.categoria)} className="faq-secao">
            <h2 className="faq-secao__titulo">{c.categoria}</h2>
            {c.perguntas.map((p, i) => (
              <details key={i} className="faq-item">
                <summary className="faq-item__pergunta">{p.pergunta}</summary>
                <div className="faq-item__resposta">
                  <p>{p.resposta}</p>
                  {p.saibaMais && (
                    <p style={{ marginTop: 8 }}>
                      <Link href={p.saibaMais.href} className="breadcrumb">
                        {p.saibaMais.label} →
                      </Link>
                    </p>
                  )}
                </div>
              </details>
            ))}
          </section>
        ))}

        <div className="bloco" style={{ marginTop: 40 }}>
          <p className="bloco__titulo" style={{ marginBottom: 12 }}>
            Não encontrou sua dúvida aqui?
          </p>
          <p>
            Dá uma olhada no <Link href="/glossario" className="breadcrumb">Glossário</Link>{" "}
            para termos específicos, ou entre em contato pela página{" "}
            <Link href="/contato" className="breadcrumb">Fale conosco</Link>.
          </p>
        </div>
      </main>
    </>
  );
}
