import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { VisualizadorDP } from "./ConteudoClient";

export const metadata: Metadata = {
  title: "Desvio Padrão — Matemática sem mistério | LotoAnalítica",
  description: "O número que mede o quanto as coisas fogem do padrão. Entenda variância e desvio padrão com exemplos de altura, temperatura e frequências de loteria.",
  alternates: { canonical: `${SITE_URL}/matematica/desvio-padrao` },
  openGraph: { title: "Desvio Padrão", description: "Como medir a dispersão dos dados em torno da média.", url: `${SITE_URL}/matematica/desvio-padrao`, siteName: SITE_NAME, locale: "pt_BR", type: "article", images: [`${SITE_URL}/opengraph-image`] },
};

export default function ArtigoDesvioPadraoPage() {
  return (
    <>
      <Masthead matematicaAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow"><Link href="/matematica" className="breadcrumb">← Matemática sem mistério</Link></p>
        <div className="mat-artigo-header mat-artigo-header--pine">
          <span className="mat-artigo-emoji">📉</span>
          <div>
            <p className="mat-artigo-conceito">Variância e desvio padrão (em inglês: <em>variance and standard deviation</em>)</p>
            <h1 className="titulo-edicao">Desvio Padrão</h1>
          </div>
        </div>
        <p className="subtitulo-edicao">
          O número que mede o quanto as coisas fogem do padrão — e por que dois
          times com a mesma média de gols podem jogar de formas completamente
          diferentes, com resultados completamente diferentes.
        </p>

        <VisualizadorDP />

        <h2 className="mat-h2">A limitação da média</h2>
        <p>
          A <Link href="/matematica/media-moda-mediana" className="breadcrumb">média</Link>{" "}
          diz onde está o centro dos dados. Mas ela não diz nada sobre o quão
          espalhados estão os dados em torno desse centro. Dois conjuntos
          completamente diferentes podem ter a mesma média:
        </p>
        <p>
          Conjunto A: {"{"}170, 170, 170, 170, 170{"}"} — média = 170 cm<br />
          Conjunto B: {"{"}150, 160, 170, 180, 190{"}"} — média = 170 cm
        </p>
        <p>
          As alturas do conjunto A são idênticas. As do conjunto B variam 40 cm
          entre o menor e o maior. A média não distingue os dois. O desvio
          padrão sim.
        </p>

        <h2 className="mat-h2">O que é desvio padrão?</h2>
        <p>
          O desvio padrão (representado pela letra grega σ — sigma, para
          populações completas, ou s para amostras) mede o quanto os valores
          se afastam, em média, da média do conjunto. Um σ pequeno significa
          que os valores ficam concentrados próximos à média. Um σ grande
          significa que ficam espalhados.
        </p>
        <div className="mat-formula">
          <div className="mat-formula__linha">σ = √[ Σ(xᵢ − μ)² ÷ n ]</div>
          <div className="mat-formula__exemplo">
            Onde μ é a média, xᵢ são os valores e n é o total de elementos.{"\n"}
            Passo a passo: 1) calcule a média 2) subtraia a média de cada valor{"\n"}
            3) eleve ao quadrado cada diferença 4) tire a média dessas diferenças{"\n"}
            5) extraia a raiz quadrada
          </div>
        </div>
        <p>
          Por que elevar ao quadrado? Para que desvios negativos e positivos
          não se cancelem. Um valor 5 abaixo da média e outro 5 acima têm
          o mesmo desvio absoluto — o quadrado garante isso. A raiz quadrada
          no final devolve a unidade original (cm, R$, graus etc.).
        </p>

        <h2 className="mat-h2">Dois times, mesma média, jogo diferente</h2>
        <p>
          Time A: marca sempre exatamente 2 gols por jogo. σ = 0. Previsível,
          constante, nunca surpresa.
        </p>
        <p>
          Time B: marca 0, 4, 0, 4, 0, 4 — alternando. Média = 2. σ = 2.
          Imprevisível, ou ganha fácil ou perde fácil.
        </p>
        <p>
          Qual time você prefere? Depende da situação. Se você precisa de uma
          vitória para avançar, prefere o Time B — há chance de marcar 4.
          Se precisa de um empate, prefere o Time A — mais previsível.
          O desvio padrão captura essa diferença que a média esconde.
        </p>

        <div className="mat-box mat-box--pine">
          <p className="mat-box__titulo">🔔 A regra 68-95-99,7</p>
          <p>
            Para dados com{" "}
            <Link href="/matematica/distribuicao-normal" className="breadcrumb">
              distribuição normal
            </Link>{" "}
            (aquela curva em forma de sino), existe uma regra prática muito
            útil sobre desvios padrões:
          </p>
          <p style={{ marginTop: 8 }}>• <strong>1σ</strong>: aproximadamente 68,3% dos dados ficam dentro de 1 desvio padrão da média</p>
          <p>• <strong>2σ</strong>: aproximadamente 95,4% dos dados ficam dentro de 2 desvios padrões</p>
          <p>• <strong>3σ</strong>: aproximadamente 99,7% dos dados ficam dentro de 3 desvios padrões</p>
          <p style={{ marginTop: 8 }}>
            Altura de brasileiros: média ≈ 170 cm, σ ≈ 10 cm.
            Isso significa que 95% dos brasileiros têm entre 150 e 190 cm,
            e quase todos (99,7%) entre 140 e 200 cm. Alguém com 210 cm
            está a mais de 4σ — extremamente raro.
          </p>
        </div>

        <h2 className="mat-h2">Desvio padrão em finanças e investimentos</h2>
        <p>
          Em finanças, o desvio padrão dos retornos de um ativo é a definição
          matemática de <strong>risco</strong> (em inglês: <em>volatility</em>).
          Um ativo com retorno médio de 10% ao ano e σ = 2% é conservador:
          quase sempre vai render entre 6% e 14%. Um com σ = 15% pode render
          entre −5% e +25% — muito mais arriscado, mesmo com a mesma média.
        </p>
        <p>
          A fórmula de precificação de opções de Black-Scholes (em inglês:{" "}
          <em>Black-Scholes model</em>) usa o desvio padrão dos retornos
          como um de seus parâmetros centrais. É um dos casos mais famosos
          de matemática pura sendo aplicada diretamente em mercados financeiros.
        </p>

        <h2 className="mat-h2">Desvio padrão e frequências de loteria</h2>
        <p>
          Nas tabelas de frequência da Lotofácil, após 3.700 concursos,
          o desvio padrão das frequências das dezenas é pequeno em relação
          à média. Isso é esperado — a LGN garante convergência. Mas ele
          não é zero: sempre há variação aleatória residual.
        </p>
        <p>
          Se o desvio padrão das frequências fosse muito próximo de zero
          (todas as dezenas com exatamente a mesma frequência), isso seria
          suspeito — sorteios verdadeiramente aleatórios têm variação natural.
          Um σ pequeno, mas presente, é evidência de aleatoriedade saudável.
        </p>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 4 pontos</p>
          <ol className="mat-resumo__lista">
            <li>σ = raiz quadrada da média dos quadrados dos desvios. Mede dispersão em torno da média.</li>
            <li>σ pequeno = dados concentrados. σ grande = dados espalhados. A média sozinha não distingue os dois.</li>
            <li>Regra 68-95-99,7: para distribuição normal, quase todos os dados estão a menos de 3σ da média.</li>
            <li>Em finanças, σ dos retornos = volatilidade = risco. Base de todo o mercado de opções.</li>
          </ol>
        </div>
        <p style={{ marginTop: 24 }}><Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link></p>
      </main>
    </>
  );
}
