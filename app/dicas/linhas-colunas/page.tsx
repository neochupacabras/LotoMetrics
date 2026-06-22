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
          a da moldura, porque todas as linhas e colunas têm o mesmo tamanho.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Cinco dezenas, sempre
        </h2>
        <p>
          A linha 1 do volante da Lotofácil é 1, 2, 3, 4, 5. A linha 2 é 6, 7, 8, 9, 10.
          E assim por diante até a linha 5 (21 a 25) — cada linha com exatamente 5
          dezenas. O mesmo vale pras colunas: a coluna 1 tem 1, 6, 11, 16, 21; a coluna
          2 tem 2, 7, 12, 17, 22; e assim por diante.
        </p>
        <p>
          Sorteando 15 de 25 dezenas, quantas de uma linha (ou coluna) específica de 5
          números saem, em média, no mesmo concurso?
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
                <td>0 de 5 (linha/coluna inteira ficou de fora)</td>
                <td className="num">15.504</td>
                <td className="num">0,47%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          A média é exatamente <strong>3 dezenas por linha ou coluna</strong> (15
          dezenas sorteadas ÷ 5 linhas, ou ÷ 5 colunas — a conta dá certinho porque
          cada linha tem exatamente 1/5 das dezenas totais). É também por isso que uma
          linha ou coluna inteira sair de uma vez (5 de 5) é raro — só 5,65% das vezes —
          mas não impossível: já aconteceu, e vai continuar acontecendo de tempos em
          tempos, exatamente na proporção que esse número prevê.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Pra que serve
        </h2>
        <p>
          A tabela de{" "}
          <Link href="/lotofacil/tabelas/linhas-colunas">linhas e colunas</Link> mostra
          o histórico real dessa distribuição. Funciona como mais uma lente pra olhar
          os mesmos dados de outro ângulo geométrico — não como uma forma de prever
          onde as próximas dezenas vão cair na grade.
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
