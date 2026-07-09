import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { ARTIGOS_MATEMATICA } from "@/lib/matematica";

export const metadata: Metadata = {
  title: "Matemática sem mistério — LotoAnalítica",
  description:
    "Combinatória, probabilidade, desvio padrão, valor esperado e mais — explicados com linguagem simples, exemplos do cotidiano e ilustrações interativas. Sem fórmulas intimidadoras.",
  alternates: { canonical: `${SITE_URL}/matematica` },
  openGraph: {
    title: "Matemática sem mistério — LotoAnalítica",
    description:
      "Os conceitos matemáticos por trás da loteria, explicados de forma simples com exemplos do cotidiano.",
    url: `${SITE_URL}/matematica`,
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "website",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

const COR_VAR: Record<string, string> = {
  pine:  "var(--pine)",
  ochre: "var(--ochre)",
  rust:  "var(--rust)",
};

const NIVEL_LABEL: Record<string, string> = {
  "básico": "Básico",
  "intermediário": "Intermediário",
};

export default function MatematicaPage() {
  return (
    <>
      <Masthead matematicaAtiva />
      <main className="container secao" style={{ maxWidth: 880 }}>
        <p className="eyebrow">Educação</p>
        <h1 className="titulo-edicao">Matemática sem mistério</h1>
        <p className="subtitulo-edicao" style={{ maxWidth: 640 }}>
          Os conceitos matemáticos que aparecem em probabilidade, estatística e
          cotidiano — explicados com linguagem simples, exemplos reais e
          ilustrações interativas. Sem fórmulas intimidadoras. Sem decoreba.
        </p>

        {/* Chamada central */}
        <div className="mat-chamada">
          <div className="mat-chamada__texto">
            <p className="mat-chamada__destaque">
              Você usa matemática todo dia sem saber.
            </p>
            <p>
              Quando compara preços no mercado, entende que a previsão do tempo
              diz "70% de chuva", ou percebe que um desconto de 50% sobre um
              produto com 100% de aumento não te devolve ao preço original —
              você está fazendo matemática. Aqui a gente só explica de onde
              vem esse raciocínio.
            </p>
          </div>
          <div className="mat-chamada__numeros" aria-hidden>
            <span style={{ color: "var(--pine)", fontSize: "2.5rem", fontFamily: "var(--font-mono)", fontWeight: 700 }}>3!</span>
            <span style={{ color: "var(--ochre)", fontSize: "1.8rem", fontFamily: "var(--font-mono)" }}>= 6</span>
            <span style={{ color: "var(--rust)", fontSize: "2rem", fontFamily: "var(--font-display)" }}>P(A)</span>
            <span style={{ color: "var(--pine)", fontSize: "1.5rem", fontFamily: "var(--font-mono)" }}>σ</span>
            <span style={{ color: "var(--ochre)", fontSize: "2.2rem", fontFamily: "var(--font-mono)", fontWeight: 700 }}>C(n,k)</span>
          </div>
        </div>

        {/* Grade de cards */}
        <div className="mat-grade">
          {ARTIGOS_MATEMATICA.map((a) => (
            <Link key={a.slug} href={`/matematica/${a.slug}`} className="mat-card">
              <div className="mat-card__topo" style={{ background: COR_VAR[a.cor] }}>
                <span className="mat-card__emoji">{a.emoji}</span>
                <span className="mat-card__nivel">{NIVEL_LABEL[a.nivel]}</span>
              </div>
              <div className="mat-card__corpo">
                <p className="mat-card__conceito">{a.conceito}</p>
                <h2 className="mat-card__titulo">{a.titulo}</h2>
                <p className="mat-card__subtitulo">{a.subtitulo}</p>
                <div className="mat-card__rodape">
                  <span className="mat-card__tempo">⏱ {a.tempoLeitura} min</span>
                  <span className="mat-card__cta">Ler →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Conexão com a loteria */}
        <div className="bloco" style={{ marginTop: 56 }}>
          <p className="bloco__titulo" style={{ marginBottom: 12 }}>
            Por que matemática num site de loteria?
          </p>
          <p>
            A loteria é um laboratório perfeito para conceitos matemáticos: ela tem
            regras simples, números concretos e resultados verificáveis. Quando
            explicamos que um número "atrasado" na Lotofácil não tem mais chance
            de sair, estamos falando de independência de eventos — um conceito
            central em probabilidade. Quando mostramos que a soma das dezenas segue
            uma distribuição em forma de sino, estamos falando de distribuição normal.
          </p>
          <p>
            Os artigos desta seção usam a loteria como um dos exemplos de aplicação,
            mas os conceitos vão muito além — aparecem em finanças, medicina,
            engenharia e no cotidiano de qualquer pessoa.
          </p>
        </div>
      </main>
    </>
  );
}
