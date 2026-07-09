import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

const TITULO = "+Milionária: dezenas, trevos e como as faixas se combinam";
const DESCRICAO =
  "A +Milionária tem 6 dezenas de 1 a 50 mais 2 trevos de 1 a 6. As 10 faixas de premiação cruzam acertos de dezenas com acertos de trevos — entenda a matemática.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: `${SITE_URL}/dicas/mais-milionaria` },
  openGraph: {
    title: TITULO, description: DESCRICAO,
    url: `${SITE_URL}/dicas/mais-milionaria`,
    siteName: SITE_NAME, locale: "pt_BR", type: "article",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

export default function ArtigoMaisMilionariaPage() {
  return (
    <>
      <Masthead dicasAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow">Dicas e estratégias</p>
        <h1 className="titulo-edicao">{TITULO}</h1>
        <p className="subtitulo-edicao">
          Lançada em maio de 2022, a +Milionária é a loteria federal mais nova do
          Brasil e a única que combina dois tipos de elemento: dezenas e trevos. Essa
          estrutura cria 10 faixas de premiação que dependem de acertos em ambos os
          componentes simultaneamente.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>Como funciona</h2>
        <p>
          O apostador escolhe 6 números de 1 a 50 (as dezenas) e 2 trevos de 1 a 6.
          A Caixa sorteia 6 dezenas e 2 trevos. Os prêmios dependem da combinação de
          acertos nas dezenas <em>e</em> nos trevos.
        </p>
        <p>
          Os sorteios acontecem terça, quinta e sábado. O preço da aposta simples
          é R$6,00.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>As 10 faixas de premiação</h2>
        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Faixa</th>
                <th className="num">Dezenas acertadas</th>
                <th className="num">Trevos acertados</th>
                <th className="num">Probabilidade</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>1ª</td><td className="num">6</td><td className="num">2</td><td className="num">1 em 238.360.656</td></tr>
              <tr><td>2ª</td><td className="num">6</td><td className="num">0 ou 1</td><td className="num">1 em 14.897.541</td></tr>
              <tr><td>3ª</td><td className="num">5</td><td className="num">2</td><td className="num">1 em 2.120.537</td></tr>
              <tr><td>4ª</td><td className="num">5</td><td className="num">0 ou 1</td><td className="num">1 em 132.534</td></tr>
              <tr><td>5ª</td><td className="num">4</td><td className="num">2</td><td className="num">1 em 59.348</td></tr>
              <tr><td>6ª</td><td className="num">4</td><td className="num">0 ou 1</td><td className="num">1 em 3.709</td></tr>
              <tr><td>7ª</td><td className="num">3</td><td className="num">2</td><td className="num">1 em 5.765</td></tr>
              <tr><td>8ª</td><td className="num">3</td><td className="num">1</td><td className="num">1 em 641</td></tr>
              <tr><td>9ª</td><td className="num">2</td><td className="num">2</td><td className="num">1 em 1.744</td></tr>
              <tr><td>10ª</td><td className="num">2</td><td className="num">1</td><td className="num">1 em 194</td></tr>
            </tbody>
          </table>
        </div>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>A matemática dos trevos</h2>
        <p>
          Os trevos funcionam de forma independente das dezenas. Com 6 trevos disponíveis
          e 2 sorteados, as probabilidades de acerto são:
        </p>
        <ul>
          <li>Acertar 2 trevos (os dois corretos): C(2,2)×C(4,0) ÷ C(6,2) = 1 em 15</li>
          <li>Acertar 1 trevo: C(2,1)×C(4,1) ÷ C(6,2) = 8 em 15</li>
          <li>Acertar 0 trevos: C(2,0)×C(4,2) ÷ C(6,2) = 6 em 15</li>
        </ul>
        <p>
          Isso significa que acertar os 2 trevos certos acontece em apenas 1 de cada
          15 apostas — probabilidade de 6,7%. Acertar pelo menos 1 trevo acontece em
          60% das apostas. Os trevos são o componente com maior impacto nas faixas
          intermediárias.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>Por que a faixa principal é tão rara</h2>
        <p>
          A faixa 1 da +Milionária (6 dezenas + 2 trevos) tem probabilidade de 1 em
          238 milhões — muito mais rara que a Mega-Sena (1 em 50 milhões). Isso porque
          a probabilidade combina as duas componentes independentes:
        </p>
        <p>
          P(faixa 1) = P(6 dezenas) × P(2 trevos) = (1/15.890.700) × (1/15) ≈ 1 em 238 milhões
        </p>
        <p>
          A compensação está no prêmio, que por isso tende a ser maior, e nas faixas
          intermediárias que são mais acessíveis do que as de loterias com só dezenas.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>O conferidor com trevos</h2>
        <p>
          O <Link href="/maismilionaria/conferidor">conferidor da +Milionária</Link> neste
          site inclui um seletor de trevos — além das 6 dezenas, você escolhe os 2
          trevos do seu jogo para que o conferidor calcule corretamente em qual faixa
          cada concurso histórico teria sido premiado.
        </p>

        <div className="aviso-legal" style={{ marginTop: "36px" }}>
          Probabilidades calculadas para aposta simples de 6 dezenas + 2 trevos.
        </div>
        <p style={{ marginTop: "24px" }}>
          <Link href="/dicas" className="breadcrumb">← Voltar para Dicas e estratégias</Link>
        </p>
      </main>
    </>
  );
}
