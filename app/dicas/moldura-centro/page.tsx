import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

const TITULO = "Moldura e centro: o volante também é uma grade de números";
const DESCRICAO =
  "Olhar o volante como uma grade 5×5 (Lotofácil) revela outra distribuição combinatória — com a borda quase sempre dominando o centro, por pura geometria.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: `${SITE_URL}/dicas/moldura-centro` },
  openGraph: {
    title: TITULO,
    description: DESCRICAO,
    url: `${SITE_URL}/dicas/moldura-centro`,
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "article",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

export default function ArtigoMolduraCentroPage() {
  return (
    <>
      <Masthead dicasAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow">Dicas e estratégias</p>
        <h1 className="titulo-edicao">{TITULO}</h1>
        <p className="subtitulo-edicao">
          O volante da Lotofácil organiza as 25 dezenas numa grade de 5 linhas por 5
          colunas. Separar essa grade em "moldura" (a borda) e "centro" (o miolo) é só
          uma forma geométrica de olhar pros números — mas, como qualquer divisão
          desigual, ela já nasce com uma distribuição esperada diferente, sem nenhum
          comportamento especial da loteria envolvido.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          A geometria do volante da Lotofácil
        </h2>
        <p>
          Numa grade 5×5, a "moldura" são todas as posições da primeira e última linha,
          mais a primeira e última coluna de cada linha do meio. Isso dá 16 posições.
          O "centro" é o quadrado interno 3×3, com 9 posições: as dezenas 07, 08, 09,
          12, 13, 14, 17, 18 e 19.
        </p>
        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Região</th>
                <th>Dezenas</th>
                <th className="num">Quantidade</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Moldura (borda)</td>
                <td>01–06, 10–11, 15–16, 20–21, 25 e mais</td>
                <td className="num">16</td>
              </tr>
              <tr>
                <td>Centro (3×3 interno)</td>
                <td>07, 08, 09, 12, 13, 14, 17, 18, 19</td>
                <td className="num">9</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Como a moldura já começa com quase o dobro de posições do centro (16 contra
          9), é esperado que, em qualquer sorteio, mais dezenas saiam da moldura do que
          do centro — não porque a moldura seja "favorecida", mas porque ela
          simplesmente tem mais números disponíveis para sair.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          A distribuição esperada
        </h2>
        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Moldura / Centro no sorteio</th>
                <th className="num">Combinações possíveis</th>
                <th className="num">% do total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>10 moldura / 5 centro</td>
                <td className="num">1.009.008</td>
                <td className="num">30,87%</td>
              </tr>
              <tr>
                <td>9 moldura / 6 centro</td>
                <td className="num">960.960</td>
                <td className="num">29,40%</td>
              </tr>
              <tr>
                <td>11 moldura / 4 centro</td>
                <td className="num">550.368</td>
                <td className="num">16,84%</td>
              </tr>
              <tr>
                <td>8 moldura / 7 centro</td>
                <td className="num">463.320</td>
                <td className="num">14,17%</td>
              </tr>
              <tr>
                <td>12 moldura / 3 centro</td>
                <td className="num">101.640</td>
                <td className="num">3,11%</td>
              </tr>
              <tr>
                <td>7 moldura / 8 centro (maioria no centro)</td>
                <td className="num">84.942</td>
                <td className="num">2,60%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          A média esperada é <strong>9,6 dezenas da moldura</strong> e{" "}
          <strong>5,4 do centro</strong> por concurso (15 × 16 ÷ 25 = 9,6 e
          15 × 9 ÷ 25 = 5,4). Em mais de 75% dos sorteios, a moldura terá entre 9 e
          11 dezenas — variação pequena ao redor da média.
        </p>
        <p>
          Não é coincidência o 5,4 aparecer de novo — é a mesma conta de "quantos
          números de um grupo de N saem, em média, dado que esse grupo tem N elementos
          dentro de 25" que já apareceu no artigo sobre{" "}
          <Link href="/dicas/primos">primos</Link> (que também tem 9 números). Centro e
          primos têm o mesmo tamanho de grupo (9), por isso a mesma média.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          O histórico real versus o esperado
        </h2>
        <p>
          Nos mais de 3.700 concursos da Lotofácil, a média histórica de dezenas da
          moldura por sorteio fica consistentemente próxima de 9,6 — com variação
          normal para mais ou menos, exatamente como a combinatória prevê. Se em um
          dado período a moldura estiver aparecendo com média de 10,2, isso é variação
          estatística aleatória — não um "ciclo de moldura" que vai continuar ou se
          reverter.
        </p>
        <p>
          Vale o mesmo aviso de sempre: a moldura não "sabe" que é a moldura, e o
          centro não "sabe" que é o centro. São agrupamentos geométricos criados por
          como humanos organizam o volante — o sorteio trata todas as 25 dezenas de
          forma idêntica.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          A intuição de que o centro é "especial"
        </h2>
        <p>
          Uma crença comum é que as dezenas do centro do volante (particularmente o 13,
          a dezena central da grade 5×5) têm alguma propriedade especial — seja porque
          "estão no coração do volante", seja porque aparecem com frequência em certas
          posições. Isso é o viés de disponibilidade em ação: é mais fácil notar e
          lembrar quando o número do centro saiu do que quando não saiu.
        </p>
        <p>
          A combinatória não deixa espaço para isso: o 13 tem exatamente a mesma
          probabilidade individual de qualquer outra dezena — 60% de sair em cada
          concurso da Lotofácil. Sua posição central na grade é irrelevante para o
          sorteio.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          E na Mega-Sena? A proporção se inverte
        </h2>
        <p>
          Na Mega-Sena, o volante organiza as 60 dezenas numa grade de 10 linhas por 6
          colunas. Aplicando a mesma definição de moldura (primeira e última linha,
          primeira e última coluna), o resultado é{" "}
          <strong>28 dezenas na moldura e 32 no centro</strong> — o centro é maior que
          a borda, ao contrário da Lotofácil.
        </p>
        <p>
          Isso acontece porque a grade 10×6 é muito mais "comprida" que a 5×5: as
          bordas representam proporcionalmente menos posições (28 de 60 = 47%) do que
          na grade quadrada da Lotofácil (16 de 25 = 64%). A distribuição esperada por
          concurso:
        </p>
        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Moldura / Centro — Mega-Sena</th>
                <th className="num">% do total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>3 moldura / 3 centro</td>
                <td className="num">32,46%</td>
              </tr>
              <tr>
                <td>2 moldura / 4 centro</td>
                <td className="num">27,15%</td>
              </tr>
              <tr>
                <td>4 moldura / 2 centro</td>
                <td className="num">20,29%</td>
              </tr>
              <tr>
                <td>1 moldura / 5 centro</td>
                <td className="num">11,26%</td>
              </tr>
              <tr>
                <td>5 moldura / 1 centro</td>
                <td className="num">6,84%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          A média esperada é <strong>2,8 dezenas da moldura e 3,2 do centro</strong> —
          invertida em relação à Lotofácil, onde a moldura domina (9,6 contra 5,4). É
          um bom exemplo de como a mesma análise pode produzir resultados opostos
          dependendo da geometria do volante — e de como qualquer "estratégia" baseada
          em moldura vs. centro precisaria ser completamente diferente para cada loteria,
          sem que isso mude nada na natureza aleatória do sorteio.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Pra que serve
        </h2>
        <p>
          A tabela de{" "}
          <Link href="/lotofacil/tabelas/moldura-centro">moldura e centro</Link>{" "}
          mostra o histórico real dessa distribuição. É uma forma a mais de visualizar
          os dados de outro ângulo geométrico, complementar à análise de{" "}
          <Link href="/dicas/linhas-colunas">linhas e colunas</Link>. O que ela não
          mostra, porque não existe, é uma razão para que a moldura ou o centro
          continue com mais ou menos dezenas no próximo sorteio do que a média sugere.
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
