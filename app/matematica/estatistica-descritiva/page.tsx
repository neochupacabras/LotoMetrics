import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { BoxplotInterativo } from "./ConteudoClient";

export const metadata: Metadata = {
  title: "Estatística Descritiva — Matemática sem mistério | LotoAnalítica",
  description: "Como resumir qualquer conjunto de dados em 5 números com quartis e boxplot — e o que esses números revelam que a média esconde.",
  alternates: { canonical: `${SITE_URL}/matematica/estatistica-descritiva` },
  openGraph: { title: "Estatística Descritiva", description: "Quartis, boxplot e o resumo de cinco números que toda análise precisa.", url: `${SITE_URL}/matematica/estatistica-descritiva`, siteName: SITE_NAME, locale: "pt_BR", type: "article", images: [`${SITE_URL}/opengraph-image`] },
};

export default function ArtigoEstatisticaDescritivaPage() {
  return (
    <>
      <Masthead matematicaAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow"><Link href="/matematica" className="breadcrumb">← Matemática sem mistério</Link></p>
        <div className="mat-artigo-header mat-artigo-header--pine">
          <span className="mat-artigo-emoji">📦</span>
          <div>
            <p className="mat-artigo-conceito">Quartis, boxplot e cinco números</p>
            <h1 className="titulo-edicao">Estatística Descritiva</h1>
          </div>
        </div>
        <p className="subtitulo-edicao">
          Como resumir qualquer conjunto de dados em 5 números — e o que esses
          5 números revelam que a média esconde.
        </p>

        <BoxplotInterativo />

        <h2 className="mat-h2">O resumo de cinco números</h2>
        <p>
          Para descrever um conjunto de dados, cinco números capturam quase tudo
          que importa: mínimo, 1º quartil (Q1), mediana, 3º quartil (Q3) e máximo.
        </p>
        <div className="mat-box mat-box--pine">
          <p className="mat-box__titulo">📐 O que cada número significa</p>
          <p><strong>Mínimo:</strong> menor valor (excluindo outliers).</p>
          <p><strong>Q1 (25%):</strong> 25% dos dados estão abaixo desse valor.</p>
          <p><strong>Mediana (50%):</strong> metade dos dados abaixo, metade acima.</p>
          <p><strong>Q3 (75%):</strong> 75% dos dados estão abaixo desse valor.</p>
          <p><strong>Máximo:</strong> maior valor (excluindo outliers).</p>
          <p style={{ marginTop: 8 }}><strong>IQR = Q3 − Q1:</strong> intervalo interquartil — onde está o "miolo" dos dados (50% centrais).</p>
        </div>

        <h2 className="mat-h2">O boxplot — visualizando tudo de uma vez</h2>
        <p>
          O boxplot (ou diagrama de caixa) representa esses cinco números graficamente.
          A caixa vai de Q1 a Q3 (IQR), uma linha dentro marca a mediana,
          os "bigodes" se estendem até o mínimo e máximo, e pontos fora dos bigodes
          são outliers (valores muito distantes do restante).
        </p>
        <p>
          Experimente o simulador acima com "Salários": a média (linha vermelha
          tracejada) está muito à direita da mediana (linha verde sólida) por
          causa do outlier de R$150.000. O boxplot revela isso instantaneamente.
        </p>

        <h2 className="mat-h2">Outliers e o que fazer com eles</h2>
        <p>
          Um outlier é um valor muito distante do restante — definido como qualquer
          ponto abaixo de Q1 − 1,5×IQR ou acima de Q3 + 1,5×IQR. Podem ser erros
          de medição (digite R$15.000 quando quis R$1.500) ou valores legítimos mas
          extremos (o CEO no conjunto de salários).
        </p>
        <p>
          A questão é sempre: o outlier é um erro ou um dado real importante?
          Remover cegamente dados extremos pode esconder informação crucial.
        </p>

        <h2 className="mat-h2">Aplicação às frequências de loteria</h2>
        <p>
          O histograma de frequências das dezenas da Lotofácil pode ser analisado
          com estatística descritiva. Com 3.700+ concursos, o Q1 e Q3 das frequências
          deveriam estar próximos da mediana — e a diferença entre a dezena mais e
          menos frequente deveria ser pequena em relação ao total. Quando não é,
          vale investigar se é variação normal ou algo sistemático.
        </p>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 3 pontos</p>
          <ol className="mat-resumo__lista">
            <li>Cinco números: mín, Q1, mediana, Q3, máx — descrevem a distribuição sem depender da média.</li>
            <li>Boxplot visualiza esses cinco números e expõe outliers graficamente.</li>
            <li>IQR = Q3 − Q1 mede a dispersão do "miolo" dos dados, robusto a outliers.</li>
          </ol>
        </div>

        <p style={{ marginTop: 24 }}><Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link></p>
      </main>
    </>
  );
}
