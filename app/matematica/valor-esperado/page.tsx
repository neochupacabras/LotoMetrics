import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { CalculadoraVE } from "./ConteudoClient";

export const metadata: Metadata = {
  title: "Valor Esperado — Matemática sem mistério | LotoAnalítica",
  description: "A conta que toda empresa de seguro faz — e que revela por que loteria tem valor esperado negativo. Entenda esperança matemática com exemplos práticos e calculadora interativa.",
  alternates: { canonical: `${SITE_URL}/matematica/valor-esperado` },
  openGraph: { title: "Valor Esperado", description: "Esperança matemática: a média ponderada de todos os resultados possíveis.", url: `${SITE_URL}/matematica/valor-esperado`, siteName: SITE_NAME, locale: "pt_BR", type: "article", images: [`${SITE_URL}/opengraph-image`] },
};

export default function ArtigoValorEsperadoPage() {
  return (
    <>
      <Masthead matematicaAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow"><Link href="/matematica" className="breadcrumb">← Matemática sem mistério</Link></p>
        <div className="mat-artigo-header mat-artigo-header--ochre">
          <span className="mat-artigo-emoji">⚖️</span>
          <div>
            <p className="mat-artigo-conceito">Esperança matemática (em inglês: <em>expected value</em>)</p>
            <h1 className="titulo-edicao">Valor Esperado</h1>
          </div>
        </div>
        <p className="subtitulo-edicao">
          A conta que toda empresa de seguro faz e que revela, com precisão
          matemática, quanto você perde em média a cada aposta na loteria —
          e por que isso não impede ninguém de jogar.
        </p>

        <CalculadoraVE />

        <h2 className="mat-h2">O que é valor esperado?</h2>
        <p>
          O valor esperado (também chamado de esperança matemática, em inglês:{" "}
          <em>expected value</em> ou <em>expectation</em>) é a{" "}
          <strong>média ponderada de todos os resultados possíveis</strong>{" "}
          de uma aposta ou experimento aleatório, onde cada resultado é pesado
          pela sua probabilidade de ocorrer.
        </p>
        <p>
          Pense assim: se você pudesse repetir a mesma aposta infinitas vezes,
          o valor esperado é o quanto você ganharia (ou perderia) por tentativa,
          em média.
        </p>
        <div className="mat-formula">
          <div className="mat-formula__linha">VE = Σ [ P(resultado) × valor(resultado) ]</div>
          <div className="mat-formula__exemplo">
            Dado honesto, ganhe R$6 no 1 e R$0 nos outros:{"\n"}
            VE = (1/6 × R$6) + (5/6 × R$0) = R$1,00 por rodada{"\n"}
            Se a aposta custa R$1, VE líquido = R$1 − R$1 = R$0 (jogo justo)
          </div>
        </div>

        <h2 className="mat-h2">Por que o seguro tem VE negativo — e mesmo assim você deve ter</h2>
        <p>
          Um seguro de carro tem valor esperado <em>negativo para você</em>
          por design: se não fosse assim, a seguradora quebraria. Você paga
          R$2.000 por ano de prêmio; a probabilidade de acionar o seguro é,
          digamos, 8%; o valor médio de um sinistro é R$12.000.
        </p>
        <div className="mat-formula">
          <div className="mat-formula__linha">VE (seguro, para você) = 0,08 × R$12.000 − R$2.000 = R$960 − R$2.000 = −R$1.040</div>
          <div className="mat-formula__exemplo">Você perde R$1.040 em média por ano. Mas ainda deve ter seguro.</div>
        </div>
        <p>
          Por quê? Porque o valor esperado ignora algo crucial: o{" "}
          <strong>impacto desigual dos resultados</strong>. Perder R$2.000
          por ano é suportável. Perder R$12.000 de uma vez, sem seguro,
          pode ser devastador. A matemática diz que o seguro é um "mau
          negócio" em termos de VE — mas a lógica diz que proteger você
          de resultados catastróficos tem valor que vai além da matemática.
        </p>
        <p>
          Isso é o que os economistas chamam de <strong>utilidade marginal
          decrescente</strong> (em inglês: <em>diminishing marginal utility</em>):
          R$2.000 a menos quando você tem R$50.000 é menos doloroso do que
          R$12.000 a menos quando você tem R$20.000.
        </p>

        <h2 className="mat-h2">O VE da loteria</h2>
        <p>
          A Caixa Econômica Federal retém uma parcela da arrecadação para
          despesas operacionais, impostos e fundo de reserva. O que sobra é
          distribuído em prêmios. Para a Mega-Sena, o retorno ao apostador
          é aproximadamente 45% da arrecadação.
        </p>
        <p>
          Isso significa que o VE de cada R$1 apostado é, em média, R$0,45.
          Ou seja, VE = −R$0,55 por real. Se você aposta R$6 na Mega-Sena,
          perde em média R$3,30 por aposta no longo prazo.
        </p>

        <div className="mat-box mat-box--ochre">
          <p className="mat-box__titulo">💡 Quando o VE da loteria fica positivo</p>
          <p>
            Em acúmulos muito grandes, o prêmio pode crescer tanto que o VE
            se torna positivo — matematicamente, vale a pena jogar. Isso
            aconteceu em algumas Mega-Senas com prêmios acima de R$300 milhões.
          </p>
          <p style={{ marginTop: 8 }}>
            Use a calculadora acima e teste: com prêmio de R$500M e
            probabilidade de 1 em 50 milhões, o VE fica positivo.
            Mas há dois problemas práticos:
          </p>
          <p style={{ marginTop: 8 }}>
            1. <strong>Divisão do prêmio:</strong> quando o VE é positivo,
            muita gente joga — e o prêmio é dividido entre os ganhadores,
            reduzindo o valor real por bilhete.
          </p>
          <p style={{ marginTop: 8 }}>
            2. <strong>Imposto de renda:</strong> prêmios de loteria têm
            alíquota de 30% de imposto. O VE real é 30% menor do que o calculado.
          </p>
        </div>

        <h2 className="mat-h2">VE positivo não garante lucro em um evento único</h2>
        <p>
          Uma roleta russa com 5 câmaras vazias e 1 bala tem VE positivo se
          você receber R$1 milhão ao sobreviver. Matematicamente, "vale a pena"
          (em termos de VE). Ninguém racional jogaria.
        </p>
        <p>
          O VE é uma ferramenta para o <em>longo prazo com repetições</em>.
          Num evento único de alto impacto, outras considerações dominam.
          Isso é o que distingue decisões financeiras inteligentes de apostas
          imprudentes — mesmo que o VE seja o mesmo.
        </p>

        <h2 className="mat-h2">VE em decisões do cotidiano</h2>
        <p>
          <strong>Comprar ou alugar um imóvel:</strong> financiar um apartamento
          de R$500.000 por 30 anos pode custar R$1,2 milhão no total (juros
          incluídos). Alugar e investir a diferença pode, dependendo da taxa
          de retorno, superar o VE de comprar. A análise de VE é central nessa
          decisão — e nem sempre favorecer comprar.
        </p>
        <p>
          <strong>Aceitar ou recusar uma proposta de emprego:</strong> uma vaga
          com salário maior mas empresa instável tem VE que incorpora a
          probabilidade de demissão nos primeiros meses. Calcular o VE ajuda
          a tomar decisões racionais em cenários incertos.
        </p>
        <p>
          <strong>Estoque em comércio:</strong> um supermercado com produto
          perecível decide quanto pedir. Pedir pouco: perde vendas (custo de
          oportunidade). Pedir demais: desperdiça produto (custo real). A
          quantidade ótima é aquela que maximiza o VE do lucro — calculada
          pela distribuição histórica de demanda.
        </p>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 4 pontos</p>
          <ol className="mat-resumo__lista">
            <li>VE = soma de (probabilidade × resultado) para todos os resultados possíveis.</li>
            <li>VE negativo não significa "não faça" — depende do impacto de cada resultado e da sua situação.</li>
            <li>Loteria tem VE sistematicamente negativo (~−55% por real apostado) por design.</li>
            <li>VE é uma ferramenta de longo prazo; em eventos únicos de alto impacto, outros fatores dominam.</li>
          </ol>
        </div>
        <p style={{ marginTop: 24 }}><Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link></p>
      </main>
    </>
  );
}
