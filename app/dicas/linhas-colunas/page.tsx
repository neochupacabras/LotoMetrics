import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

const TITULO = "Linhas e colunas: a mesma grade, sob outro corte";
const DESCRICAO =
  "Cada linha ou coluna do volante da Lotofácil tem só 5 dezenas — a distribuição de quantas saem por sorteio segue exatamente o esperado pela combinatória.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: `${SITE_URL}/dicas/linhas-colunas` },
  openGraph: {
    title: TITULO,
    description: DESCRICAO,
    url: `${SITE_URL}/dicas/linhas-colunas`,
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "article",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

export default function ArtigoLinhasColunasPage() {
  return (
    <>
      <Masthead dicasAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow">Dicas e estratégias</p>
        <h1 className="titulo-edicao">{TITULO}</h1>
        <p className="subtitulo-edicao">
          Já vimos a grade do volante dividida em moldura e centro. Outro jeito de
          cortar a mesma grade 5×5 é olhar linha por linha, ou coluna por coluna — cada
          uma com exatamente 5 dezenas. A matemática por trás é mais simples ainda que
          a da moldura, porque todas as linhas e colunas têm o mesmo tamanho, e isso
          leva a resultados muito uniformes.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          A estrutura do volante da Lotofácil
        </h2>
        <p>
          O volante da Lotofácil organiza as 25 dezenas numa grade de 5 linhas por 5
          colunas, da esquerda para a direita e de cima para baixo:
        </p>
        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Linha</th>
                <th>Dezenas</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Linha 1</td><td>01, 02, 03, 04, 05</td></tr>
              <tr><td>Linha 2</td><td>06, 07, 08, 09, 10</td></tr>
              <tr><td>Linha 3</td><td>11, 12, 13, 14, 15</td></tr>
              <tr><td>Linha 4</td><td>16, 17, 18, 19, 20</td></tr>
              <tr><td>Linha 5</td><td>21, 22, 23, 24, 25</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          As colunas seguem o mesmo padrão vertical: a coluna 1 tem 01, 06, 11, 16, 21;
          a coluna 2 tem 02, 07, 12, 17, 22; e assim por diante até a coluna 5 com
          05, 10, 15, 20, 25.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Cinco dezenas, sempre
        </h2>
        <p>
          Sorteando 15 de 25 dezenas, quantas de uma linha (ou coluna) específica de 5
          números saem, em média, no mesmo concurso? A conta usa a mesma fórmula
          combinatória das outras análises de subgrupo:
        </p>
        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Dezenas da linha/coluna no sorteio</th>
                <th className="num">Combinações possíveis</th>
                <th className="num">% do total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>3 de 5</td>
                <td className="num">1.259.700</td>
                <td className="num">38,54%</td>
              </tr>
              <tr>
                <td>4 de 5</td>
                <td className="num">839.800</td>
                <td className="num">25,69%</td>
              </tr>
              <tr>
                <td>2 de 5</td>
                <td className="num">775.200</td>
                <td className="num">23,72%</td>
              </tr>
              <tr>
                <td>5 de 5 (linha/coluna inteira saiu)</td>
                <td className="num">184.756</td>
                <td className="num">5,65%</td>
              </tr>
              <tr>
                <td>1 de 5</td>
                <td className="num">193.800</td>
                <td className="num">5,93%</td>
              </tr>
              <tr>
                <td>0 de 5 (linha/coluna inteira ficou de fora)</td>
                <td className="num">15.504</td>
                <td className="num">0,47%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          A média é exatamente <strong>3 dezenas por linha ou coluna</strong> (15
          dezenas sorteadas ÷ 5 linhas = 3, ou ÷ 5 colunas = 3 — a conta dá certinho
          porque cada linha tem exatamente 1/5 das dezenas totais, e 15/25 = 3/5 do
          total de cada linha).
        </p>
        <p>
          É também por isso que uma linha ou coluna inteira sair de uma vez (5 de 5)
          é raro — apenas 5,65% das vezes — mas não impossível: já aconteceu, e vai
          continuar acontecendo de tempos em tempos, exatamente na proporção que esse
          número prevê.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Por que todas as linhas têm a mesma distribuição
        </h2>
        <p>
          Como todas as linhas e colunas do volante têm exatamente 5 dezenas cada —
          diferente da análise de{" "}
          <Link href="/dicas/moldura-centro">moldura e centro</Link>, onde a moldura
          (16) e o centro (9) têm tamanhos diferentes — a distribuição esperada é
          idêntica para qualquer linha e qualquer coluna.
        </p>
        <p>
          Isso significa que não há, matematicamente, nenhuma linha "favorecida" ou
          "desfavorecida" no volante. A linha 1 (01 a 05) tem exatamente a mesma
          distribuição esperada que a linha 3 (11 a 15) ou qualquer outra. O mesmo
          vale para as colunas.
        </p>
        <p>
          Se o histórico mostrar que a linha 2 teve mais sorteios com 4 ou 5 dezenas
          do que a linha 4 no último ano, isso é variação estatística aleatória —
          não evidência de favorecimento. Com mais de 3.700 concursos, as médias por
          linha ficam todas muito próximas de 3, confirmando a teoria.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Uma linha completa saindo: a sensação de "pattern"
        </h2>
        <p>
          Um dos resultados mais visualmente impressionantes é quando uma linha ou
          coluna inteira sai no mesmo sorteio — por exemplo, 06, 07, 08, 09, 10 todos
          aparecendo juntos. Isso parece improvável demais para ser coincidência.
        </p>
        <p>
          Mas os números mostram que isso acontece em 5,65% dos sorteios — ou seja,
          em cerca de 1 a cada 18 concursos, em média. Com 5 linhas independentes,
          a chance de pelo menos uma linha completa aparecer em qualquer sorteio é
          consideravelmente maior ainda. São eventos comuns, não extraordinários —
          o que é extraordinário é a intensidade da impressão que causam visualmente.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          E na Mega-Sena?
        </h2>
        <p>
          O volante da Mega-Sena é uma grade de 10 linhas por 6 colunas — cada linha
          tem 6 dezenas (a linha 1 é 01 a 06, a linha 2 é 07 a 12...) e cada coluna
          tem 10 dezenas (a coluna 1 é 01, 07, 13, 19... até 55). Com 6 dezenas
          sorteadas de 60, as médias esperadas são bem diferentes da Lotofácil:
        </p>
        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Comparativo</th>
                <th className="num">Lotofácil</th>
                <th className="num">Mega-Sena (linhas)</th>
                <th className="num">Mega-Sena (colunas)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Dezenas por linha/coluna</td>
                <td className="num">5</td>
                <td className="num">6</td>
                <td className="num">10</td>
              </tr>
              <tr>
                <td>Média por sorteio</td>
                <td className="num">3,0</td>
                <td className="num">0,6</td>
                <td className="num">1,0</td>
              </tr>
              <tr>
                <td>% com nenhuma dezena</td>
                <td className="num">0,47%</td>
                <td className="num">51,6%</td>
                <td className="num">11,7%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Na Mega-Sena, a média de 0,6 por linha significa que, em cada sorteio, mais
          da metade das 10 linhas não terá nenhuma das 6 dezenas sorteadas — o que é
          esperado, já que só 10% das dezenas saem por vez. O resultado mais comum por
          linha é 0 (51,6% das vezes) ou 1 dezena (37,9%). Uma linha inteira (6
          dezenas) saindo no mesmo concurso aconteceria em menos de 0,001% dos
          sorteios — na prática, nunca vista em todo o histórico da Mega-Sena.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Pra que serve
        </h2>
        <p>
          A tabela de{" "}
          <Link href="/lotofacil/tabelas/linhas-colunas">linhas e colunas</Link> mostra
          o histórico real dessa distribuição — uma forma geométrica de visualizar os
          dados, diferente das análises numéricas de primos, múltiplos e Fibonacci.
          Funciona como mais uma lente para olhar os mesmos dados de outro ângulo, não
          como uma forma de prever onde as próximas dezenas vão cair na grade.
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
