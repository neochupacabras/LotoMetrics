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
          É exatamente o mesmo tipo de conta já feita nos artigos sobre primos e
          Fibonacci: um grupo fixo de números dentro de um total fixo, e a combinatória
          faz o resto do trabalho sem precisar de nenhum dado histórico.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          O que são múltiplos de 3
        </h2>
        <p>
          Um múltiplo de 3 é qualquer número que pode ser dividido exatamente por 3
          sem deixar resto: 3, 6, 9, 12, 15, 18, 21, 24, 27... Entre 1 e 25, existem
          exatamente 8 deles. Isso é um fato fixo que não muda — independente de
          quantos concursos já aconteceram ou vão acontecer.
        </p>
        <p>
          A propriedade divisível-por-3 não tem nenhum significado especial num sorteio
          aleatório. É um critério de classificação matemática, não uma característica
          física das esferas. Uma esfera com o número 9 não tem nenhuma "afinidade"
          com a esfera 12 por ambas serem múltiplas de 3 — são objetos físicos
          independentes tratados de forma idêntica pelo mecanismo de sorteio.
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
              <tr>
                <td>7</td>
                <td className="num">137.280</td>
                <td className="num">4,20%</td>
              </tr>
              <tr>
                <td>2</td>
                <td className="num">68.640</td>
                <td className="num">2,10%</td>
              </tr>
              <tr>
                <td>8 (todos os múltiplos)</td>
                <td className="num">6.188</td>
                <td className="num">0,19%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          A média esperada é <strong>4,8 múltiplos de 3 por concurso</strong> (15 × 8 ÷
          25). Em mais de 80% dos sorteios, o resultado vai ter entre 4 e 6 múltiplos
          de 3. Sorteios com todos os 8 múltiplos de 3 são muito raros — apenas 0,19%
          das combinações possíveis — mas matematicamente viáveis.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          O padrão entre filtros semelhantes
        </h2>
        <p>
          Repare no padrão entre os três filtros desse tipo já calculados neste site —
          a média é sempre proporcional ao tamanho do subgrupo:
        </p>
        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Filtro</th>
                <th className="num">Quantos existem (1-25)</th>
                <th className="num">Média por sorteio (Lotofácil)</th>
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
          de forma proporcional ao tamanho do subgrupo, sem precisar de nenhum dado
          histórico. Isso deixa claro que a análise de "quantos múltiplos de 3 saem"
          não tem nenhuma vantagem preditiva sobre "quantos primos saem" ou "quantos
          Fibonacci saem" — são todos o mesmo tipo de conta com números diferentes.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          O histórico confirma a teoria
        </h2>
        <p>
          Nos mais de 3.700 concursos da Lotofácil, a média histórica de múltiplos de 3
          por sorteio fica consistentemente próxima de 4,8. A distribuição real entre
          faixas (quantos concursos tiveram 3 múltiplos, quantos tiveram 5, etc.)
          acompanha de perto as proporções calculadas pela combinatória.
        </p>
        <p>
          Se o histórico mostrasse um desvio sistemático — por exemplo, uma média
          histórica de 5,5 múltiplos de 3 quando o esperado é 4,8 — isso seria
          evidência de anomalia no sorteio. Essa discrepância não existe, o que é a
          confirmação esperada de um sorteio honesto.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          E na Mega-Sena?
        </h2>
        <p>
          Entre 1 e 60, os múltiplos de 3 são 20 no total (3, 6, 9... até 60). Com 6
          dezenas sorteadas, a média esperada é <strong>2,00</strong> (6 × 20 ÷ 60). A
          distribuição:
        </p>
        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Múltiplos de 3 — Mega-Sena</th>
                <th className="num">% do total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2</td>
                <td className="num">34,68%</td>
              </tr>
              <tr>
                <td>1</td>
                <td className="num">26,29%</td>
              </tr>
              <tr>
                <td>3</td>
                <td className="num">22,50%</td>
              </tr>
              <tr>
                <td>0</td>
                <td className="num">7,67%</td>
              </tr>
              <tr>
                <td>4</td>
                <td className="num">7,55%</td>
              </tr>
              <tr>
                <td>5 ou 6</td>
                <td className="num">1,31%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          A tabela comparativa completa dos três filtros em ambas as loterias:
        </p>
        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Filtro</th>
                <th className="num">Existem (1–25)</th>
                <th className="num">Média LF</th>
                <th className="num">Existem (1–60)</th>
                <th className="num">Média MS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Primos</td>
                <td className="num">9</td>
                <td className="num">5,4</td>
                <td className="num">17</td>
                <td className="num">1,70</td>
              </tr>
              <tr>
                <td>Múltiplos de 3</td>
                <td className="num">8</td>
                <td className="num">4,8</td>
                <td className="num">20</td>
                <td className="num">2,00</td>
              </tr>
              <tr>
                <td>Fibonacci</td>
                <td className="num">7</td>
                <td className="num">4,2</td>
                <td className="num">9</td>
                <td className="num">0,90</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          O padrão fica claro: a Lotofácil sorteia uma proporção muito maior das dezenas
          disponíveis (60%) do que a Mega-Sena (10%), então as médias por concurso são
          bem maiores na Lotofácil mesmo quando os grupos têm proporções parecidas nos
          dois intervalos. Na Mega-Sena, múltiplos de 3 são proporcionalmente mais
          frequentes (20/60 = 33%) do que na Lotofácil (8/25 = 32%) — mas como apenas
          6 dezenas saem por vez, a média absoluta por concurso é muito menor.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Pra que serve a tabela
        </h2>
        <p>
          A tabela de{" "}
          <Link href="/lotofacil/tabelas/multiplos-de-3">múltiplos de 3</Link>{" "}
          mostra a frequência histórica real desses 8 números e a distribuição de
          quantos apareceram em cada concurso. Como em todos os filtros semelhantes, é
          informação descritiva sobre o passado — útil para confirmar que o histórico
          real bate com o esperado pela combinatória, não para prever quantos múltiplos
          de 3 vão sair no próximo concurso.
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
