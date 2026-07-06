import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

const TITULO = "Números primos: quantos saem por concurso, em média";
const DESCRICAO =
  "Com 9 primos disponíveis entre 1 e 25, a média esperada por sorteio é 5,4 — um número fixo que não muda com o histórico, calculado por combinatória.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: `${SITE_URL}/dicas/primos` },
  openGraph: {
    title: TITULO,
    description: DESCRICAO,
    url: `${SITE_URL}/dicas/primos`,
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "article",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

export default function ArtigoPrimosPage() {
  return (
    <>
      <Masthead dicasAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow">Dicas e estratégias</p>
        <h1 className="titulo-edicao">{TITULO}</h1>
        <p className="subtitulo-edicao">
          Entre 1 e 25, exatamente 9 números são primos (divisíveis só por 1 e por eles
          mesmos): 2, 3, 5, 7, 11, 13, 17, 19 e 23. Esse número sozinho já determina
          tudo o que dá pra saber sobre primos na Lotofácil, sem precisar de nenhum
          dado histórico.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          O que são números primos
        </h2>
        <p>
          Um número primo é aquele divisível apenas por 1 e por ele mesmo — ou seja,
          não tem nenhum divisor "no meio". Os primeiros primos são 2, 3, 5, 7, 11, 13,
          17, 19, 23, 29... Eles foram estudados desde a Grécia antiga e têm propriedades
          matemáticas fascinantes em áreas como criptografia e teoria dos números.
        </p>
        <p>
          No contexto de um sorteio de loteria, porém, a única coisa que importa é
          quantos deles existem dentro do intervalo disponível — e essa contagem
          determina completamente o comportamento esperado, sem nenhum dado histórico
          necessário.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          A conta
        </h2>
        <p>
          Sorteando 15 dezenas entre 25, onde 9 são primas e 16 não são, dá pra
          calcular exatamente quantos primos esperar em cada concurso — é o mesmo tipo
          de conta usada pra calcular cartas de um naipe específico numa mão de baralho.
          A fórmula usa a distribuição hipergeométrica, que calcula probabilidades em
          sorteios sem reposição.
        </p>
        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Primos no sorteio</th>
                <th className="num">Combinações possíveis</th>
                <th className="num">% do total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>5 primos</td>
                <td className="num">1.009.008</td>
                <td className="num">30,87%</td>
              </tr>
              <tr>
                <td>6 primos</td>
                <td className="num">960.960</td>
                <td className="num">29,40%</td>
              </tr>
              <tr>
                <td>4 primos</td>
                <td className="num">550.368</td>
                <td className="num">16,84%</td>
              </tr>
              <tr>
                <td>7 primos</td>
                <td className="num">463.320</td>
                <td className="num">14,17%</td>
              </tr>
              <tr>
                <td>3 primos</td>
                <td className="num">75.240</td>
                <td className="num">2,30%</td>
              </tr>
              <tr>
                <td>8 primos</td>
                <td className="num">84.942</td>
                <td className="num">2,60%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          A média exata é <strong>5,4 primos por concurso</strong> (15 dezenas
          sorteadas × 9 primos disponíveis ÷ 25 dezenas no total). Mais de 60% dos
          sorteios possíveis caem entre 5 e 6 primos — é uma faixa estreita porque o
          número de primos disponíveis (9) já limita bastante a variação possível.
          Sorteios com menos de 3 ou mais de 8 primos são matematicamente possíveis,
          mas extremamente raros.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          A lógica do cálculo — e por que ela não usa o histórico
        </h2>
        <p>
          O número 5,4 é calculado da mesma forma que você calcularia quantas bolas
          vermelhas esperar numa urna com 9 vermelhas e 16 azuis, tirando 15 bolas de
          uma vez. É combinatória pura — não depende de nenhum resultado anterior.
        </p>
        <p>
          Isso significa que a média de 5,4 primos por sorteio era verdadeira no
          primeiro concurso da Lotofácil, é verdadeira hoje, e vai continuar sendo
          verdadeira no próximo concurso — independente do que aconteceu nos últimos
          100 concursos. Se o histórico real mostrar uma média ligeiramente diferente
          de 5,4, isso é só a variação estatística natural (o mesmo princípio explicado
          no artigo sobre{" "}
          <Link href="/dicas/frequencia">frequência</Link>), não um padrão a ser
          explorado.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          O histórico real confirma a teoria
        </h2>
        <p>
          Nos mais de 3.700 concursos da Lotofácil, a média histórica de primos por
          sorteio fica consistentemente próxima de 5,4. A distribuição real por faixa
          (quantos concursos tiveram 4 primos, quantos tiveram 5, etc.) acompanha
          de perto as proporções calculadas pela combinatória na tabela acima.
        </p>
        <p>
          Isso é uma confirmação de que o sorteio é honesto — e que não há nenhum
          padrão especial nos dados que contradiga o esperado matematicamente. Um
          sorteio viciado para "favorecer" ou "prejudicar" primos apareceria como uma
          discrepância estatisticamente significativa entre os percentuais reais e os
          esperados. Essa discrepância não existe.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Primos e outros subgrupos: a mesma lógica
        </h2>
        <p>
          A análise de primos é um caso particular de uma análise mais geral:
          "dado um subgrupo de N dezenas dentro de um universo de 25, quantas delas
          saem em média por concurso?" A resposta é sempre 15 × N ÷ 25.
        </p>
        <p>
          Por isso, analisar primos, números de{" "}
          <Link href="/dicas/fibonacci">Fibonacci</Link>,{" "}
          <Link href="/dicas/multiplos-de-3">múltiplos de 3</Link>, dezenas da moldura
          ou qualquer outro subgrupo escolhido por qualquer critério produz sempre o
          mesmo tipo de resultado: uma distribuição centrada em 15 × N ÷ 25, com
          variação menor conforme N se aproxima de 0 ou 25. Nenhum subgrupo é mais
          "especial" que outro nesse sentido.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          E na Mega-Sena?
        </h2>
        <p>
          Entre 1 e 60 existem 17 primos: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37,
          41, 43, 47, 53 e 59. Com 6 dezenas sorteadas de 60, a média esperada de primos
          por concurso é <strong>1,70</strong> (6 × 17 ÷ 60). A distribuição mais
          provável:
        </p>
        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Primos no sorteio — Mega-Sena</th>
                <th className="num">% do total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2 primos</td>
                <td className="num">33,52%</td>
              </tr>
              <tr>
                <td>1 primo</td>
                <td className="num">32,69%</td>
              </tr>
              <tr>
                <td>3 primos</td>
                <td className="num">16,76%</td>
              </tr>
              <tr>
                <td>0 primos</td>
                <td className="num">12,18%</td>
              </tr>
              <tr>
                <td>4 primos</td>
                <td className="num">4,29%</td>
              </tr>
              <tr>
                <td>5 ou 6 primos</td>
                <td className="num">0,56%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          A diferença mais notável em relação à Lotofácil: na Mega-Sena, 12% dos
          sorteios possíveis não têm nenhum primo — na Lotofácil, sorteios com 0 ou 1
          primo são matematicamente possíveis mas extremamente raros. Isso reflete
          diretamente a proporção: 9 primos em 25 (36%) na Lotofácil contra 17 em 60
          (28%) na Mega-Sena — proporcionalmente menos, e com muito menos dezenas
          sendo sorteadas por vez.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Pra que serve a tabela
        </h2>
        <p>
          A tabela de{" "}
          <Link href="/lotofacil/tabelas/primos">números primos</Link> mostra a
          frequência histórica real de cada primo individual e a distribuição histórica
          de quantos primos apareceram em cada concurso. É útil para verificar que o
          comportamento histórico corresponde ao esperado pela combinatória, e para
          curiosidade sobre o desempenho de cada dezena prima especificamente. Ela não
          indica quantos primos vão sair no próximo concurso — a resposta para isso
          continua sendo "em torno de 5,4, com variação normal", e esse número vem da
          combinatória, não do histórico.
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
