import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

const TITULO = "Números de Fibonacci: a sequência mais famosa da matemática, na loteria";
const DESCRICAO =
  "Só 7 das 25 dezenas da Lotofácil pertencem à sequência de Fibonacci — isso já basta pra explicar toda a estatística sozinho, sem nenhum mistério.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: `${SITE_URL}/dicas/fibonacci` },
  openGraph: {
    title: TITULO,
    description: DESCRICAO,
    url: `${SITE_URL}/dicas/fibonacci`,
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "article",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

export default function ArtigoFibonacciPage() {
  return (
    <>
      <Masthead dicasAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow">Dicas e estratégias</p>
        <h1 className="titulo-edicao">{TITULO}</h1>
        <p className="subtitulo-edicao">
          A sequência de Fibonacci (cada número é a soma dos dois anteriores: 1, 1, 2,
          3, 5, 8, 13, 21, 34...) carrega uma fama quase mística — aparece em conchas,
          em flores, em proporções consideradas esteticamente perfeitas. Na loteria,
          ela é só mais um filtro de 7 números, sem nada de especial matematicamente
          falando.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Os números, sem misticismo
        </h2>
        <p>
          Entre 1 e 25, os valores da sequência de Fibonacci são: 1, 2, 3, 5, 8, 13 e
          21 — 7 números ao todo (34 já passa de 25, então para por aí). Sorteando 15
          de 25 dezenas, onde 7 são "Fibonacci" e 18 não são, a distribuição esperada
          é:
        </p>
        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Números de Fibonacci no sorteio</th>
                <th className="num">Combinações possíveis</th>
                <th className="num">% do total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>4</td>
                <td className="num">1.113.840</td>
                <td className="num">34,08%</td>
              </tr>
              <tr>
                <td>5</td>
                <td className="num">918.918</td>
                <td className="num">28,11%</td>
              </tr>
              <tr>
                <td>3</td>
                <td className="num">649.740</td>
                <td className="num">19,88%</td>
              </tr>
              <tr>
                <td>6</td>
                <td className="num">340.340</td>
                <td className="num">10,41%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          A média esperada é <strong>4,2 números de Fibonacci por concurso</strong> (15
          × 7 ÷ 25). É um cálculo idêntico ao que se faz pra{" "}
          <Link href="/dicas/primos">números primos</Link> ou{" "}
          <Link href="/dicas/multiplos-de-3">múltiplos de 3</Link> — só muda quantos
          números do grupo existem dentro do intervalo de 1 a 25.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Por que a fama da sequência não significa nada aqui
        </h2>
        <p>
          A sequência de Fibonacci tem propriedades matemáticas genuinamente
          interessantes em outras áreas — crescimento populacional, espirais na
          natureza, proporção áurea. Mas dentro de um sorteio de loteria, ela não tem
          nenhum papel especial: é só um subconjunto de 7 números entre 25, igual
          qualquer outro grupo de 7 números escolhido por qualquer outro critério (por
          exemplo, "os 7 primeiros números que vêm à cabeça"). O sorteio não reconhece
          a sequência, não a trata de forma diferente, e não tem como "favorecer" um
          padrão matemático que só existe na cabeça de quem está olhando.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Pra que serve
        </h2>
        <p>
          A tabela de{" "}
          <Link href="/lotofacil/tabelas/fibonacci">números de Fibonacci</Link> mostra
          a frequência histórica real desses 7 números — curiosidade estatística válida,
          sem nenhuma capacidade preditiva sobre o próximo sorteio.
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
