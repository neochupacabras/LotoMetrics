import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { CurvaGaussiana } from "./ConteudoClient";

export const metadata: Metadata = {
  title: "Distribuição Normal — Matemática sem mistério | LotoAnalítica",
  description: "A curva em forma de sino que governa altura, QI, erros industriais e somas de loteria. Entenda distribuição normal e o Teorema Central do Limite com visualização interativa.",
  alternates: { canonical: `${SITE_URL}/matematica/distribuicao-normal` },
  openGraph: { title: "Distribuição Normal", description: "A curva gaussiana explicada com exemplos reais e visualização interativa.", url: `${SITE_URL}/matematica/distribuicao-normal`, siteName: SITE_NAME, locale: "pt_BR", type: "article", images: [`${SITE_URL}/opengraph-image`] },
};

export default function ArtigoDistribuicaoNormalPage() {
  return (
    <>
      <Masthead matematicaAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow"><Link href="/matematica" className="breadcrumb">← Matemática sem mistério</Link></p>
        <div className="mat-artigo-header mat-artigo-header--pine">
          <span className="mat-artigo-emoji">🔔</span>
          <div>
            <p className="mat-artigo-conceito">Distribuição gaussiana (em inglês: <em>normal distribution / Gaussian distribution</em>)</p>
            <h1 className="titulo-edicao">Distribuição Normal</h1>
          </div>
        </div>
        <p className="subtitulo-edicao">
          A curva em forma de sino que governa altura humana, QI, erros de medição,
          notas de prova e até as somas das dezenas sorteadas na Lotofácil.
          Entender essa curva é entender uma grande parte do mundo ao redor.
        </p>

        <CurvaGaussiana />

        <h2 className="mat-h2">Por que a natureza ama essa curva?</h2>
        <p>
          A distribuição normal (também chamada de distribuição gaussiana, em
          homenagem ao matemático alemão Carl Friedrich Gauss, que a estudou
          extensamente no século XIX) aparece sempre que um resultado é
          determinado pela soma de muitas influências pequenas e independentes.
        </p>
        <p>
          A altura humana depende de centenas de genes diferentes, da nutrição,
          de hormônios, de sono, de doenças na infância. Cada fator contribui
          com um pequeno empurrão para cima ou para baixo em relação à média.
          O resultado? Uma curva em sino, com a maioria das pessoas próximas
          da média e poucas nos extremos — exatamente a distribuição normal.
        </p>
        <p>
          O mesmo padrão aparece em notas de vestibular (muitos alunos médios,
          poucos muito abaixo ou muito acima), em erros de medição de
          instrumentos industriais, em retornos diários de ações, e em
          dezenas de outros fenômenos.
        </p>

        <div className="mat-box mat-box--pine">
          <p className="mat-box__titulo">📐 A fórmula da curva normal</p>
          <p>
            A função de densidade de probabilidade da distribuição normal é:
          </p>
          <p style={{ fontFamily: "var(--font-mono)", marginTop: 8, fontSize: "0.9rem" }}>
            f(x) = (1 ÷ σ√(2π)) × e^(−(x−μ)² ÷ 2σ²)
          </p>
          <p style={{ marginTop: 8 }}>
            Onde μ (mi) é a média e σ (sigma) é o{" "}
            <Link href="/matematica/desvio-padrao" className="breadcrumb">desvio padrão</Link>.
            Parece complexa, mas a ideia é simples: o pico da curva fica na
            média, e a largura da curva é controlada pelo desvio padrão.
            Um σ pequeno = curva estreita e alta. Um σ grande = curva larga e baixa.
          </p>
        </div>

        <h2 className="mat-h2">O Teorema Central do Limite — o motivo matemático</h2>
        <p>
          O motivo pelo qual a distribuição normal aparece em tantos lugares
          não é coincidência — é o <strong>Teorema Central do Limite</strong>{" "}
          (em inglês: <em>Central Limit Theorem</em>, ou CLT), considerado um
          dos resultados mais importantes de toda a estatística.
        </p>
        <p>
          O teorema diz: a soma (ou média) de muitas variáveis aleatórias
          independentes, com <em>qualquer</em> distribuição individual, converge
          para uma distribuição normal conforme o número de variáveis aumenta.
        </p>
        <p>
          Isso é extraordinário. Não importa se cada variável tem distribuição
          uniforme, binomial, exponencial ou qualquer outra — a soma de muitas
          delas vai parecer normal. Por isso a natureza "ama" a distribuição
          normal: ela é o resultado inevitável de muitos efeitos somados.
        </p>

        <h2 className="mat-h2">A regra 68-95-99,7 na prática</h2>
        <p>
          Para qualquer distribuição normal com média μ e desvio padrão σ,
          a seguinte regra se aplica com precisão:
        </p>
        <div className="mat-box mat-box--ochre">
          <p className="mat-box__titulo">📊 Interpretando os intervalos</p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", fontFamily: "var(--font-mono)" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--line)" }}>
                  <th style={{ textAlign: "left", padding: "6px 8px", color: "var(--ochre)" }}>Intervalo</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", color: "var(--ochre)" }}>% dos dados</th>
                  <th style={{ textAlign: "left", padding: "6px 8px", color: "var(--ochre)" }}>Exemplo (altura, μ=170, σ=10)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["μ ± 1σ", "68,3%", "160 a 180 cm"],
                  ["μ ± 2σ", "95,4%", "150 a 190 cm"],
                  ["μ ± 3σ", "99,7%", "140 a 200 cm"],
                  ["μ ± 4σ", "99,994%", "130 a 210 cm (extremamente raro)"],
                ].map(([int, pct, ex]) => (
                  <tr key={int} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "6px 8px" }}>{int}</td>
                    <td style={{ textAlign: "right", padding: "6px 8px", color: "var(--pine)", fontWeight: 700 }}>{pct}</td>
                    <td style={{ padding: "6px 8px" }}>{ex}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p>
          Na indústria, "6 sigma" (6σ) é um nível de qualidade extremamente
          rigoroso — significa apenas 3,4 defeitos por milhão de itens produzidos.
          O programa de qualidade "Seis Sigma" (em inglês: <em>Six Sigma</em>),
          popularizado pela Motorola nos anos 1980, deriva diretamente dessa
          propriedade da distribuição normal.
        </p>

        <h2 className="mat-h2">Distribuição normal na loteria</h2>
        <p>
          A soma das 15 dezenas sorteadas na Lotofácil é a soma de 15 variáveis
          aleatórias (cada dezena tem valor de 1 a 25). Pelo Teorema Central
          do Limite, essa soma segue aproximadamente uma distribuição normal.
        </p>
        <p>
          Média esperada: 15 × (1+25)/2 = 15 × 13 = 195. Na prática, a média
          observada nos 3.700+ concursos é muito próxima de 195. O histograma
          de somas na{" "}
          <Link href="/lotofacil/tabelas/soma" className="breadcrumb">
            tabela de soma da Lotofácil
          </Link>{" "}
          mostra exatamente essa curva em sino.
        </p>
        <p>
          Isso tem uma implicação prática: somas muito extremas (abaixo de 150
          ou acima de 240) são raras não por superstição, mas por matemática.
          Um jogo com soma de 120 ou 270 está a mais de 3σ da média —
          probabilidade menor que 0,3%.
        </p>

        <h2 className="mat-h2">Quando a distribuição normal falha</h2>
        <p>
          A distribuição normal é poderosa, mas não universal. Ela falha em
          contextos onde eventos extremos são muito mais comuns do que ela
          prevê — o que os estatísticos chamam de{" "}
          <strong>caudas pesadas</strong> (em inglês: <em>fat tails</em>).
        </p>
        <p>
          Retornos de ações têm distribuição com caudas mais pesadas que a
          normal: crises e altas abruptas acontecem com frequência muito maior
          do que uma distribuição normal preveria. A crise financeira de 2008
          foi um evento que modelos baseados em distribuição normal consideravam
          praticamente impossível — mas aconteceu.
        </p>
        <p>
          Nassim Nicholas Taleb, em seu livro "A Lógica do Cisne Negro" (em
          inglês: <em>The Black Swan</em>), critica exatamente esse uso inadequado
          da distribuição normal em contextos onde ela não se aplica.
        </p>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 4 pontos</p>
          <ol className="mat-resumo__lista">
            <li>Distribuição normal aparece quando muitos fatores independentes se somam — é o resultado do CLT.</li>
            <li>Controlada por dois parâmetros: μ (centro da curva) e σ (largura da curva).</li>
            <li>Regra 68-95-99,7: quase todos os dados ficam a menos de 3σ da média.</li>
            <li>Não se aplica a fenômenos com caudas pesadas — crises financeiras, terremotos, pandemias.</li>
          </ol>
        </div>
        <p style={{ marginTop: 24 }}><Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link></p>
      </main>
    </>
  );
}
