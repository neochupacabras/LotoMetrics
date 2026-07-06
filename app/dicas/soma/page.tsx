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
          trás da distribuição par/ímpar: não é o sorteio que "prefere" somas médias,
          é que existem matematicamente muito mais combinações com soma no meio do que
          nas extremidades.
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
          da combinação, a soma se mantém perto do centro. É o mesmo princípio de somar
          vários dados: tirar 6 em dois dados de uma vez só acontece de um jeito (dois
          números 3), mas tirar 7 acontece de seis jeitos diferentes (1+6, 2+5, 3+4,
          4+3, 5+2, 6+1) — por isso 7 é o resultado mais comum em dois dados, não
          porque os dados "prefiram" 7.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Os números reais da Lotofácil
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
          A curva de sino na prática: histórico real
        </h2>
        <p>
          Nos mais de 3.700 concursos da Lotofácil, a distribuição de somas dos
          resultados reais segue exatamente a curva prevista pela combinatória — não
          por coincidência, mas porque o sorteio é honesto e a combinatória descreve
          exatamente a distribuição esperada de eventos aleatórios nesse sistema.
        </p>
        <p>
          A soma mais baixa já sorteada na história da Lotofácil fica em torno de 155,
          e a mais alta em torno de 235 — ambas muito distantes dos extremos teóricos
          de 120 e 270. Isso não é surpresa: esses extremos teóricos são combinações
          com probabilidade de 1 em 3.268.760, o equivalente a ganhar na faixa mais
          alta do prêmio. Eventualmente podem aparecer, mas não em 3.700 concursos.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Mega-Sena: outra escala, mesma lógica
        </h2>
        <p>
          Na Mega-Sena, 6 dezenas são sorteadas de um universo de 60 (números de 1 a
          60). A soma mínima possível é 21 (1+2+3+4+5+6) e a máxima é 345
          (55+56+57+58+59+60). A soma média esperada é 183,5 — e, da mesma forma que
          na Lotofácil, a distribuição de somas forma uma curva em sino centrada nesse
          valor.
        </p>
        <p>
          A faixa de soma mais frequente na Mega-Sena fica entre 152 e 215,
          concentrando aproximadamente 80% de todas as 50.063.860 combinações possíveis.
          Somas abaixo de 100 ou acima de 270 são extremamente raras — cada uma delas
          representa menos de 0,1% das combinações existentes.
        </p>

        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Faixa de soma — Mega-Sena</th>
                <th className="num">% aproximada de combinações</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>163–204 (raio de 21 ao redor da média)</td>
                <td className="num">≈ 50%</td>
              </tr>
              <tr>
                <td>152–215</td>
                <td className="num">≈ 80%</td>
              </tr>
              <tr>
                <td>Abaixo de 100 ou acima de 270</td>
                <td className="num">&lt; 0,1%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Filtrar por soma "típica" vale a pena?
        </h2>
        <p>
          Matematicamente, nada muda na sua probabilidade de ganhar — vale repetir:
          toda combinação específica tem exatamente a mesma probabilidade, esteja ela
          com soma 195 ou soma 120. O que os números acima mostram é só que, entre
          todas as combinações que existem, poucas têm soma extrema.
        </p>
        <p>
          Um jogo com soma muito baixa ou muito alta não é azarado nem sortudo — é
          só raro <em>de existir</em> no sentido de que há poucas combinações daquele
          tipo no universo total. Há quem argumente que jogar com soma na faixa típica
          reduz o risco de dividir o prêmio com outros apostadores, já que a maioria
          das pessoas intuitivamente monta jogos com dezenas "bem distribuídas" — o que
          tende a produzir somas perto da média. Esse argumento é plausível, mas não há
          como quantificá-lo com precisão.
        </p>
        <p>
          Se você gosta de montar jogos com uma soma dentro da faixa histórica por
          preferência pessoal, o{" "}
          <Link href="/lotofacil/gerador">gerador de jogos</Link> deste site tem um
          filtro para isso no modo avançado. É uma escolha estética, não uma estratégia
          que aumenta a probabilidade de acertar.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          A relação com par/ímpar e outras análises
        </h2>
        <p>
          A análise de soma e a de{" "}
          <Link href="/dicas/par-impar">distribuição par/ímpar</Link> são primas
          próximas — ambas descrevem quantas combinações existem de cada "tipo", e
          ambas chegam à mesma conclusão: os tipos extremos são raros de existir, então
          raramente aparecem nos sorteios. Da mesma forma, a análise de{" "}
          <Link href="/dicas/sequencias">sequências consecutivas</Link> segue a mesma
          lógica: o número de combinações com cada padrão de sequência varia
          enormemente, e isso explica o que aparece ou não aparece nos resultados
          históricos.
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
