import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

const TITULO = "Sequências: por que números seguidos são mais comuns do que parecem";
const DESCRICAO =
  "87% dos sorteios da Lotofácil têm pelo menos 4 dezenas seguidas. Contraintuitivo, mas é a combinatória, calculada com exatidão sobre as 3.268.760 combinações possíveis.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: `${SITE_URL}/dicas/sequencias` },
  openGraph: {
    title: TITULO,
    description: DESCRICAO,
    url: `${SITE_URL}/dicas/sequencias`,
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "article",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

export default function ArtigoSequenciasPage() {
  return (
    <>
      <Masthead dicasAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow">Dicas e estratégias</p>
        <h1 className="titulo-edicao">{TITULO}</h1>
        <p className="subtitulo-edicao">
          Quase todo mundo que monta um jogo "no olho" evita números seguidos — 11, 12,
          13 parece artificial demais pra ser um resultado real. A intuição está
          enganada: sequências de números consecutivos não são raras, são a regra.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          O número exato
        </h2>
        <p>
          Contando, uma por uma, todas as 3.268.760 combinações possíveis de 15 dezenas
          entre 1 e 25, e medindo qual é a maior sequência de números consecutivos
          dentro de cada uma:
        </p>
        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Maior sequência consecutiva</th>
                <th className="num">Combinações</th>
                <th className="num">% do total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>4 dezenas seguidas (ex.: 11,12,13,14)</td>
                <td className="num">990.110</td>
                <td className="num">30,29%</td>
              </tr>
              <tr>
                <td>5 dezenas seguidas</td>
                <td className="num">866.888</td>
                <td className="num">26,52%</td>
              </tr>
              <tr>
                <td>6 dezenas seguidas</td>
                <td className="num">519.695</td>
                <td className="num">15,90%</td>
              </tr>
              <tr>
                <td>3 dezenas seguidas (no máximo)</td>
                <td className="num">402.292</td>
                <td className="num">12,31%</td>
              </tr>
              <tr>
                <td>7 dezenas seguidas</td>
                <td className="num">266.805</td>
                <td className="num">8,16%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Somando tudo: <strong>87,4% de todas as combinações possíveis têm pelo menos
          4 dezenas seguidas em algum trecho</strong>. A maior sequência esperada, em
          média, é de exatamente 5 dezenas consecutivas. Combinações sem nenhuma
          sequência de 3 ou mais números seguidos — o tipo de jogo que parece mais
          "espalhado" e por isso mais "provável" pra intuição — são, na verdade, apenas
          0,3% de tudo que existe.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Por que a intuição erra tanto aqui
        </h2>
        <p>
          O motivo é parecido com o da{" "}
          <Link href="/dicas/par-impar">distribuição par/ímpar</Link>: existem muito
          mais formas de montar uma combinação com alguma sequência embutida do que
          formas de evitar qualquer sequência. Com 15 dezenas espalhadas dentro de um
          intervalo de só 25 números, é matematicamente difícil <em>não</em> ter pelo
          menos 4 delas grudadas em algum trecho — sobra pouco espaço pra "espaçar"
          tudo de forma uniforme.
        </p>
        <p>
          O cérebro humano associa aleatoriedade a "espalhado" e padrão a "agrupado" —
          mas, matematicamente, é o contrário do que a maioria espera: o resultado
          tipicamente aleatório tem agrupamentos, e o resultado sem nenhum agrupamento
          é que seria estatisticamente incomum.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Pra que serve
        </h2>
        <p>
          A tabela de{" "}
          <Link href="/lotofacil/tabelas/sequencias">sequências</Link> deste site
          mostra o histórico real de sequências por concurso, e também quais dezenas
          mais se repetem de um sorteio pro seguinte. Serve pra entender o padrão
          típico do jogo — não pra prever a próxima sequência, já que cada concurso
          continua sendo um sorteio independente dos anteriores.
        </p>
        <p>
          Na prática, isso quer dizer: se você está montando um jogo manualmente e
          evita números seguidos "porque parece mais aleatório", está, sem perceber,
          escolhendo entre o grupo minoritário (12,6%) das combinações possíveis — sem
          nenhum ganho real de probabilidade por isso, já que toda combinação
          específica continua tendo exatamente a mesma chance.
        </p>

        <div className="aviso-legal" style={{ marginTop: "36px" }}>
          Este artigo é conteúdo educativo. Os números acima são combinatória exata
          (contagem completa das 3.268.760 combinações possíveis), não uma previsão do
          próximo sorteio.
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
