import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

const TITULO = "Soma das dezenas: o efeito sino que ninguém escolhe";
const DESCRICAO =
  "Por que somas próximas de 195 (Lotofácil) ou 183 (Mega-Sena) são as mais comuns entre todas as combinações possíveis — e por que isso não é sorte, é contagem.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: `${SITE_URL}/dicas/soma` },
  openGraph: {
    title: TITULO,
    description: DESCRICAO,
    url: `${SITE_URL}/dicas/soma`,
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "article",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

export default function ArtigoSomaPage() {
  return (
    <>
      <Masthead dicasAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow">Dicas e estratégias</p>
        <h1 className="titulo-edicao">{TITULO}</h1>
        <p className="subtitulo-edicao">
          Some as 15 dezenas sorteadas em qualquer concurso da Lotofácil e o resultado
          vai quase sempre cair num intervalo parecido — nem muito baixo, nem muito
          alto. Isso tem uma explicação completamente mecânica, e é a mesma ideia por
          trás da distribuição par/ímpar.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Os extremos são raros porque só existe um jeito de chegar neles
        </h2>
        <p>
          Na Lotofácil, a menor soma possível é 120 (as dezenas 1 a 15 somadas) e a
          maior é 270 (as dezenas 11 a 25 somadas). Só que existe exatamente{" "}
          <strong>uma única combinação</strong> que soma 120, e exatamente uma única
          que soma 270 — são as únicas formas matemáticas de chegar nesses valores
          extremos.
        </p>
        <p>
          Já uma soma no meio do caminho, como 195, pode ser formada de milhares de
          jeitos diferentes — trocando uma dezena alta por uma baixa em qualquer lugar
          da combinação, a soma se mantém perto do meio. É o mesmo princípio de somar
          vários dados: tirar 6 em dois dados de uma vez só acontece de um jeito (dois
          números 3), mas tirar 7 acontece de seis jeitos diferentes (1+6, 2+5, 3+4,
          4+3, 5+2, 6+1) — por isso 7 é o resultado mais comum em dois dados, não
          porque os dados "prefiram" 7.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Os números reais
        </h2>
        <p>
          A soma média esperada de uma combinação da Lotofácil é exatamente 195 (a
          média das 25 dezenas, vezes 15). Contando quantas das 3.268.760 combinações
          possíveis caem em cada soma:
        </p>

        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Soma</th>
                <th className="num">Combinações</th>
                <th className="num">% do total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>195 (a média exata)</td>
                <td className="num">70.922</td>
                <td className="num">2,17%</td>
              </tr>
              <tr>
                <td>194 ou 196</td>
                <td className="num">70.842 cada</td>
                <td className="num">2,17% cada</td>
              </tr>
              <tr>
                <td>Faixa 183–207 (raio de 12 ao redor da média)</td>
                <td className="num">≈ 1.650.000</td>
                <td className="num">≈ 50%</td>
              </tr>
              <tr>
                <td>Faixa 180–209</td>
                <td className="num">1.919.852</td>
                <td className="num">58,73%</td>
              </tr>
              <tr>
                <td>120 (mínimo possível)</td>
                <td className="num">1</td>
                <td className="num">0,00003%</td>
              </tr>
              <tr>
                <td>270 (máximo possível)</td>
                <td className="num">1</td>
                <td className="num">0,00003%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          Quase 6 em cada 10 combinações possíveis da Lotofácil somam entre 180 e 209 —
          é por isso que o{" "}
          <Link href="/lotofacil/gerador">gerador de jogos</Link> deste site usa
          exatamente essa faixa como referência no filtro opcional de soma, no modo
          avançado. Na Mega-Sena, o efeito é o mesmo, só que centrado em 183 (a soma
          média de 6 dezenas entre 1 e 60).
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          O que isso muda na prática
        </h2>
        <p>
          De novo, nada na probabilidade — toda combinação específica, com soma 195 ou
          soma 120, tem exatamente a mesma chance de ser sorteada: 1 em 3.268.760. O que
          os números acima mostram é só que, entre todas as combinações que existem,
          poucas têm soma extrema. Um jogo com soma muito baixa ou muito alta não é
          azarado nem sortudo — é só raro <em>de existir</em>, no sentido de que há
          poucas combinações daquele tipo no universo total.
        </p>
        <p>
          Vale o mesmo aviso de sempre: filtrar por soma "típica" não aumenta sua chance
          de ganhar. Só evita, se você quiser, escolher por engano uma combinação que
          está entre as poucas estatisticamente incomuns — o que não é nem bom nem ruim
          matematicamente, só uma escolha estética.
        </p>

        <div className="aviso-legal" style={{ marginTop: "36px" }}>
          Este artigo é conteúdo educativo. Os números acima são combinatória pura
          (quantas combinações existem de cada soma), não uma previsão de comportamento
          futuro do sorteio.
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
