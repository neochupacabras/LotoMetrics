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
          A conta
        </h2>
        <p>
          Sorteando 15 dezenas entre 25, onde 9 são primos e 16 não são, dá pra
          calcular exatamente quantos primos esperar em cada concurso — é o mesmo tipo
          de conta usada pra calcular cartas de um naipe específico numa mão de baralho.
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
            </tbody>
          </table>
        </div>
        <p>
          A média exata é <strong>5,4 primos por concurso</strong> (15 dezenas
          sorteadas × 9 primos disponíveis ÷ 25 dezenas no total). Mais de 60% dos
          sorteios possíveis caem entre 5 e 6 primos — é uma faixa estreita porque o
          número de primos disponíveis (9) já limita bastante a variação possível.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          O que isso não significa
        </h2>
        <p>
          Esse cálculo não usa nenhum dado dos concursos já sorteados — é pura
          combinatória, válida pro próximo concurso exatamente como seria válida pro
          primeiro concurso que já existiu. Se o histórico real mostrar uma média
          ligeiramente diferente de 5,4, isso é só a variação estatística natural (o
          mesmo princípio explicado no artigo sobre{" "}
          <Link href="/dicas/frequencia">frequência</Link>), não um padrão a ser
          explorado.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Pra que serve
        </h2>
        <p>
          A tabela de{" "}
          <Link href="/lotofacil/tabelas/primos">números primos</Link> mostra a
          frequência histórica real de cada primo individual — útil pra curiosidade,
          não pra prever quantos primos vão sair no próximo concurso (a resposta
          continua sendo "em torno de 5,4, com variação normal", de novo um cálculo,
          não uma previsão baseada no passado).
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
