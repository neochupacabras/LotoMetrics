import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

const TITULO = "Frequência: por que números \"quentes\" e \"frios\" são o mesmo número";
const DESCRICAO =
  "A variação natural entre as dezenas mais e menos sorteadas é exatamente o que a estatística prevê pra um sorteio honesto — não evidência de viés.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: `${SITE_URL}/dicas/frequencia` },
  openGraph: {
    title: TITULO,
    description: DESCRICAO,
    url: `${SITE_URL}/dicas/frequencia`,
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "article",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

export default function ArtigoFrequenciaPage() {
  return (
    <>
      <Masthead dicasAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow">Dicas e estratégias</p>
        <h1 className="titulo-edicao">{TITULO}</h1>
        <p className="subtitulo-edicao">
          A tabela de frequência mostra quantas vezes cada dezena já saiu no histórico
          inteiro. É tentador olhar pra ela e separar mentalmente as dezenas em
          "quentes" (saem muito) e "frias" (saem pouco) — mas a diferença entre elas é
          exatamente o tamanho que a estatística pura já prevê, sem nenhum viés
          envolvido. O princípio é o mesmo na Lotofácil e na Mega-Sena; só os números
          mudam.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          O que esperar de um sorteio honesto
        </h2>
        <p>
          Numa Lotofácil, cada concurso sorteia 15 das 25 dezenas — ou seja, qualquer
          dezena específica tem 60% de chance de sair em cada concurso. Depois de 3.713
          concursos, o número esperado de vezes que ela apareceu é 3.713 × 0,6 ≈
          2.228. Até aqui, nenhuma surpresa.
        </p>
        <p>
          A parte importante é: mesmo num sistema perfeitamente honesto, esse número não
          vai bater exatamente igual pra todas as 25 dezenas. A estatística tem uma
          fórmula pra calcular o quanto de variação é normal — o desvio padrão — e, nesse
          caso, ele fica em torno de 30 concursos pra cima ou pra baixo. Ou seja: ver uma
          dezena com 2.198 aparições e outra com 2.258 não é evidência de nada estranho
          — é exatamente a variação que a teoria da probabilidade prevê que vai
          acontecer, sempre, mesmo com um sorteio perfeito.
        </p>

        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Cenário</th>
                <th className="num">Freq. média esperada</th>
                <th className="num">Variação normal (±1 desvio padrão)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Lotofácil, após 1.000 concursos</td>
                <td className="num">600</td>
                <td className="num">585 a 615</td>
              </tr>
              <tr>
                <td>Lotofácil, após 3.713 concursos</td>
                <td className="num">2.228</td>
                <td className="num">2.198 a 2.258</td>
              </tr>
              <tr>
                <td>Mega-Sena, após 1.000 concursos</td>
                <td className="num">100</td>
                <td className="num">91 a 109</td>
              </tr>
              <tr>
                <td>Mega-Sena, após 3.000 concursos</td>
                <td className="num">300</td>
                <td className="num">284 a 316</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          "Quente" e "frio" são rótulos, não causas
        </h2>
        <p>
          Quando alguém chama uma dezena de "quente" por ter saído mais que a média, a
          implicação costuma ser de que ela tem alguma propriedade especial — sorte,
          tendência, alguma coisa que vai continuar fazendo ela sair mais. Não tem.
          Cada concurso é independente do anterior; o sorteio não sabe, e não se importa,
          quantas vezes uma dezena já saiu antes. A frequência observada é só o
          resultado acumulado de uma sequência de eventos aleatórios — onde ALGUMA
          dezena, inevitavelmente, vai estar um pouco acima da média, e outra um pouco
          abaixo, sem que isso signifique nada sobre o próximo sorteio.
        </p>
        <p>
          Pense assim: se você jogasse uma moeda honesta 1.000 vezes, não esperaria
          exatamente 500 caras e 500 coroas — esperaria algo perto disso, com uma
          variação normal de uns 16 pra mais ou pra menos. Se desse 512 caras, ninguém
          diria que a moeda está "viciada pra cara". É o mesmo princípio, só que com 25
          (ou 60) lados em vez de 2.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Pra que serve, então
        </h2>
        <p>
          A tabela de <Link href="/lotofacil/tabelas/frequencia">frequência</Link> é um
          retrato fiel do que já aconteceu — útil pra curiosidade histórica, pra
          conferir um jogo específico, ou só pra ver os números de verdade em vez de
          uma impressão vaga. O que ela não é: um indicador de quais dezenas vão sair
          mais no futuro. Isso nenhuma tabela consegue prever, porque essa informação
          simplesmente não existe antes do sorteio acontecer. O mesmo vale integralmente
          pra tabela de{" "}
          <Link href="/megasena/tabelas/frequencia">frequência da Mega-Sena</Link>.
        </p>

        <div className="aviso-legal" style={{ marginTop: "36px" }}>
          Este artigo é conteúdo educativo. A variação de frequência entre dezenas é
          esperada estatisticamente em qualquer sorteio honesto — não evidência de
          viés, nem informação que prevê sorteios futuros.
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
