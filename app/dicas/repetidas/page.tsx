import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

const TITULO = "Repetidas: quantas dezenas se repetem de um concurso pro outro";
const DESCRICAO =
  "Na Lotofácil, a média é 9 dezenas repetidas do concurso anterior. Na Mega-Sena, mais da metade dos sorteios não repete nenhuma. O motivo é o mesmo.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: `${SITE_URL}/dicas/repetidas` },
  openGraph: {
    title: TITULO,
    description: DESCRICAO,
    url: `${SITE_URL}/dicas/repetidas`,
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "article",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

export default function ArtigoRepetidasPage() {
  return (
    <>
      <Masthead dicasAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow">Dicas e estratégias</p>
        <h1 className="titulo-edicao">{TITULO}</h1>
        <p className="subtitulo-edicao">
          Compare os resultados de dois concursos seguidos e o número de dezenas em
          comum é bem diferente dependendo da loteria — na Lotofácil, bastante; na
          Mega-Sena, quase nenhuma. O cálculo é o mesmo nos dois casos; o que muda é
          a proporção de dezenas sorteadas por vez.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Lotofácil: repetir muito é esperado
        </h2>
        <p>
          A Lotofácil sorteia 15 das 25 dezenas a cada concurso — 60% do total. Isso,
          sozinho, já garante sobreposição grande entre concursos seguidos. Tratando o
          concurso anterior como um conjunto fixo de 15 "marcadas" e o concurso atual
          como um novo sorteio independente de 15 dentro das mesmas 25, a distribuição
          da sobreposição é calculada pela mesma fórmula hipergeométrica usada em todas
          as análises de subgrupo deste site:
        </p>
        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Repetidas do concurso anterior — Lotofácil</th>
                <th className="num">Combinações</th>
                <th className="num">% do total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>9 dezenas repetidas</td>
                <td className="num">1.051.050</td>
                <td className="num">32,15%</td>
              </tr>
              <tr>
                <td>10 dezenas repetidas</td>
                <td className="num">756.756</td>
                <td className="num">23,15%</td>
              </tr>
              <tr>
                <td>8 dezenas repetidas</td>
                <td className="num">772.200</td>
                <td className="num">23,62%</td>
              </tr>
              <tr>
                <td>11 dezenas repetidas</td>
                <td className="num">286.650</td>
                <td className="num">8,77%</td>
              </tr>
              <tr>
                <td>7 dezenas repetidas</td>
                <td className="num">289.575</td>
                <td className="num">8,86%</td>
              </tr>
              <tr>
                <td>12 dezenas repetidas</td>
                <td className="num">45.045</td>
                <td className="num">1,38%</td>
              </tr>
              <tr>
                <td>6 dezenas repetidas</td>
                <td className="num">57.750</td>
                <td className="num">1,77%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          A média esperada é <strong>9 dezenas repetidas</strong> de um concurso pro
          próximo — exatamente 60% das 15 dezenas, a mesma proporção que sai por
          concurso. Em quase 80% dos sorteios, o resultado vai ter entre 8 e 10 dezenas
          em comum com o concurso anterior. Sorteios com menos de 6 ou mais de 12
          repetições são matematicamente possíveis mas raros.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          O que isso significa na prática
        </h2>
        <p>
          Uma crença comum é que "repetir o mesmo jogo do concurso anterior aumenta as
          chances", baseada na observação de que 9 dezenas em média se repetem. Mas
          essa observação se aplica a <em>qualquer</em> jogo de 15 dezenas, não apenas
          ao jogo do concurso anterior. Se você jogar qualquer combinação aleatória de
          15 dezenas, em média 9 delas também terão saído no concurso anterior — porque
          essa é a sobreposição esperada entre qualquer dois conjuntos de 15 dezenas
          dentro de um universo de 25.
        </p>
        <p>
          Repetir o jogo anterior não é uma estratégia — é apenas uma forma de escolher
          uma combinação específica, com a mesma probabilidade de qualquer outra
          combinação de 15 dezenas: 1 em 3.268.760.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Mega-Sena: repetir é a exceção
        </h2>
        <p>
          A Mega-Sena sorteia 6 das 60 dezenas — apenas 10% do total. Com uma
          proporção tão pequena, a sobreposição entre concursos seguidos é bem menor.
          A distribuição esperada:
        </p>
        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Repetidas do concurso anterior — Mega-Sena</th>
                <th className="num">% do total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>0 repetidas</td>
                <td className="num">51,59%</td>
              </tr>
              <tr>
                <td>1 repetida</td>
                <td className="num">37,90%</td>
              </tr>
              <tr>
                <td>2 repetidas</td>
                <td className="num">9,48%</td>
              </tr>
              <tr>
                <td>3 ou mais repetidas</td>
                <td className="num">1,03%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          <strong>Em mais da metade dos sorteios possíveis da Mega-Sena (51,6%),
          nenhuma dezena se repete do concurso anterior.</strong> A média esperada é
          só 0,6 repetidas por concurso — em contraste com as 9 da Lotofácil.
        </p>
        <p>
          Isso significa que ver um resultado da Mega-Sena sem nenhuma dezena do
          sorteio anterior não é "incomum" nem "suspeito" — é o resultado mais
          provável. Da mesma forma, ver 2 ou 3 repetidas também não é "padrão" ou
          "tendência" — é uma variação aleatória completamente esperada.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          O mesmo mecanismo, dois resultados opostos
        </h2>
        <p>
          A fórmula é simples: a média de repetidas entre dois concursos é sempre igual
          a (dezenas sorteadas)² ÷ (total de dezenas disponíveis). Na Lotofácil: 15² ÷
          25 = 9. Na Mega-Sena: 6² ÷ 60 = 0,6. Não tem história acumulada envolvida —
          é uma propriedade fixa da loteria, calculável antes de qualquer sorteio
          acontecer.
        </p>
        <p>
          Essa fórmula é a mesma que determina a média de qualquer subgrupo de análise:
          como na Lotofácil o subgrupo "dezenas do concurso anterior" tem sempre 15
          elementos, a média de repetidas é 15 × 15 ÷ 25 = 9. Trocar "dezenas do
          concurso anterior" por "números primos" (9 elementos) daria 15 × 9 ÷ 25 = 5,4
          — exatamente o que aparece no artigo sobre{" "}
          <Link href="/dicas/primos">primos</Link>. É sempre a mesma conta.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Repetidas e estratégias de jogo
        </h2>
        <p>
          Alguns apostadores preferem incluir dezenas que saíram no concurso anterior
          ("seguir as quentes"); outros preferem evitá-las ("as que saíram já cumpriram
          sua vez"). Ambas as estratégias são baseadas em premissas falsas — o sorteio
          não tem memória do concurso anterior. A única diferença real é qual fração do
          espaço de combinações você está explorando com cada abordagem.
        </p>
        <p>
          A análise de repetidas é mais útil como ferramenta de verificação de
          resultados históricos: se o histórico real mostrar uma média muito diferente
          de 9 (na Lotofácil) ou 0,6 (na Mega-Sena), isso seria evidência de algum
          problema com o sorteio. Na prática, o histórico real confirma os valores
          teóricos — o que é, justamente, a confirmação de que o sorteio é honesto.
        </p>
        <p>
          Você pode conferir a distribuição histórica de repetidas nas tabelas de{" "}
          <Link href="/lotofacil/tabelas/repetidas">repetidas da Lotofácil</Link> e de{" "}
          <Link href="/megasena/tabelas/repetidas">repetidas da Mega-Sena</Link>.
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
