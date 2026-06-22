import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

const TITULO = "Múltiplos de 3: a mesma lógica dos primos, com outro filtro";
const DESCRICAO =
  "8 das 25 dezenas da Lotofácil são múltiplas de 3 — o suficiente pra calcular exatamente quantas saem por concurso, em média, sem precisar de histórico.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: `${SITE_URL}/dicas/multiplos-de-3` },
  openGraph: {
    title: TITULO,
    description: DESCRICAO,
    url: `${SITE_URL}/dicas/multiplos-de-3`,
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "article",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

export default function ArtigoMultiplosDe3Page() {
  return (
    <>
      <Masthead dicasAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow">Dicas e estratégias</p>
        <h1 className="titulo-edicao">{TITULO}</h1>
        <p className="subtitulo-edicao">
          Entre 1 e 25, os múltiplos de 3 são 3, 6, 9, 12, 15, 18, 21 e 24 — 8 números.
          É exatamente o mesmo tipo de conta já feita nos artigos sobre{" "}
          primos e Fibonacci: um grupo fixo de números dentro de um total fixo, e a
          combinatória faz o resto do trabalho.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          A distribuição
        </h2>
        <p>
          Sorteando 15 de 25 dezenas, onde 8 são múltiplas de 3 e 17 não são:
        </p>
        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Múltiplos de 3 no sorteio</th>
                <th className="num">Combinações possíveis</th>
                <th className="num">% do total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>5</td>
                <td className="num">1.089.088</td>
                <td className="num">33,32%</td>
              </tr>
              <tr>
                <td>4</td>
                <td className="num">866.320</td>
                <td className="num">26,50%</td>
              </tr>
              <tr>
                <td>6</td>
                <td className="num">680.680</td>
                <td className="num">20,82%</td>
              </tr>
              <tr>
                <td>3</td>
                <td className="num">346.528</td>
                <td className="num">10,60%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          A média esperada é <strong>4,8 múltiplos de 3 por concurso</strong> (15 × 8 ÷
          25). Repare no padrão entre os três filtros desse tipo já calculados neste
          site:
        </p>
        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Filtro</th>
                <th className="num">Quantos existem (1-25)</th>
                <th className="num">Média esperada por concurso</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Primos</td>
                <td className="num">9</td>
                <td className="num">5,4</td>
              </tr>
              <tr>
                <td>Múltiplos de 3</td>
                <td className="num">8</td>
                <td className="num">4,8</td>
              </tr>
              <tr>
                <td>Fibonacci</td>
                <td className="num">7</td>
                <td className="num">4,2</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          A média é sempre 15 × (quantos números do grupo existem) ÷ 25 — sobe ou desce
          de forma proporcional, sem precisar de nenhum dado histórico pra prever.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Pra que serve
        </h2>
        <p>
          A tabela de{" "}
          <Link href="/lotofacil/tabelas/multiplos-de-3">múltiplos de 3</Link>{" "}
          mostra a frequência histórica real desses 8 números. Como em todos os filtros
          parecidos, é informação descritiva sobre o passado — não uma forma de prever
          quantos múltiplos de 3 vão sair no próximo concurso.
        </p>

        <div className="aviso-legal" style={{ marginTop: "36px" }}>
          Este artigo é conteúdo educativo. Os números acima são combinatória exata, não
          uma previsão do próximo sorteio.
        </div>

        <p style={{ marginTop: "24px" }}>
          <Link href="/dicas" className="breadcrumb">
            ← Voltar para Dicas e estratégias
          </Link>
        </p>
      </main>
    </>
  );
}
