import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { SimuladorMonteCarlo } from "./ConteudoClient";

export const metadata: Metadata = {
  title: "Simulação de Monte Carlo — Matemática sem mistério | LotoAnalítica",
  description: "Como estimar um número que você não consegue calcular exatamente, só repetindo um experimento aleatório muitas vezes — a técnica por trás da previsão do tempo e do cálculo de risco de seguros.",
  alternates: { canonical: `${SITE_URL}/matematica/simulacao-monte-carlo` },
  openGraph: { title: "Simulação de Monte Carlo", description: "Como estimar um número difícil de calcular, só jogando dados muitas vezes.", url: `${SITE_URL}/matematica/simulacao-monte-carlo`, siteName: SITE_NAME, locale: "pt_BR", type: "article", images: [`${SITE_URL}/opengraph-image`] },
};

export default function ArtigoMonteCarloPage() {
  return (
    <>
      <Masthead matematicaAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow"><Link href="/matematica" className="breadcrumb">← Matemática sem mistério</Link></p>
        <div className="mat-artigo-header mat-artigo-header--pine">
          <span className="mat-artigo-emoji">🎲</span>
          <div>
            <p className="mat-artigo-conceito">Métodos de Monte Carlo (em inglês: <em>Monte Carlo simulation</em>)</p>
            <h1 className="titulo-edicao">Simulação de Monte Carlo</h1>
          </div>
        </div>
        <p className="subtitulo-edicao">Como estimar um número que você não consegue calcular exatamente — só repetindo um experimento aleatório muitas e muitas vezes.</p>

        <SimuladorMonteCarlo />

        <h2 className="mat-h2">A ideia central: usar acaso para estimar certeza</h2>
        <p>Parece paradoxal: usar números aleatórios para chegar perto de uma resposta exata. Mas é exatamente isso que o simulador acima faz para estimar o valor de π. A lógica: um quarto de círculo de raio 1 tem área π/4; o quadrado que o contém tem área 1. Se você jogar pontos aleatórios dentro do quadrado, a <strong>proporção</strong> que cai dentro do quarto de círculo se aproxima de π/4 conforme o número de pontos cresce — uma consequência direta da <Link href="/matematica/lei-dos-grandes-numeros" className="breadcrumb">Lei dos Grandes Números</Link>.</p>
        <p>Multiplicando essa proporção por 4, você obtém uma estimativa de π — sem nunca ter calculado π diretamente, só contando pontos. Experimente clicar em "+1.000 pontos" várias vezes no simulador e observe a estimativa ficar cada vez mais próxima de 3,14159...</p>

        <h2 className="mat-h2">Por que isso é útil além de estimar π</h2>
        <p>O método de Monte Carlo — batizado em homenagem ao cassino de Monte Carlo, por causa do papel do acaso — foi formalizado nos anos 1940 por cientistas do Projeto Manhattan, que precisavam estimar como nêutrons se comportariam em reações nucleares: um problema matematicamente complexo demais para resolver com fórmulas exatas, mas perfeitamente possível de <strong>simular</strong> repetidamente e observar o padrão médio dos resultados.</p>
        <p>Essa é a virada de chave: quando um problema é difícil (ou impossível) de calcular exatamente com uma fórmula fechada, mas fácil de <strong>simular uma vez</strong>, repetir essa simulação milhares ou milhões de vezes e tirar a média costuma dar uma estimativa excelente — com a vantagem de que o erro da estimativa é conhecido e diminui de forma previsível conforme mais simulações são rodadas.</p>

        <h2 className="mat-h2">Onde isso aparece no mundo real</h2>
        <p><strong>Previsão do tempo:</strong> quando um meteorologista diz "70% de chance de chuva amanhã", esse número frequentemente vem de rodar o mesmo modelo climático centenas de vezes, cada vez com pequenas variações nas condições iniciais — e contando em quantas dessas simulações choveu na região.</p>
        <p><strong>Seguros e finanças:</strong> seguradoras simulam milhares de cenários possíveis (terremotos, acidentes, sinistros) para estimar quanto dinheiro precisam reservar para cobrir prêmios com segurança, sem depender de uma fórmula exata que capture toda a complexidade do mundo real.</p>
        <p><strong>Física de partículas:</strong> simulações de Monte Carlo modelam o comportamento de bilhões de partículas em aceleradores como o LHC, onde calcular cada colisão exatamente seria inviável, mas simular estatisticamente muitas colisões revela os padrões esperados.</p>
        <p><strong>Inteligência artificial em jogos:</strong> o algoritmo que times de IA usam para jogar Go e xadrez em nível sobre-humano (busca em árvore de Monte Carlo) simula milhares de partidas aleatórias a partir de cada posição para decidir qual jogada tem a maior taxa de vitória.</p>

        <h2 className="mat-h2">A precisão que você paga com mais simulações</h2>
        <p>Uma propriedade importante dos métodos de Monte Carlo: o erro da estimativa diminui proporcionalmente à raiz quadrada do número de simulações. Isso significa que, para reduzir o erro pela metade, você precisa de <strong>4 vezes mais</strong> simulações — não o dobro. É por isso que simulações de Monte Carlo em problemas complexos (como modelos climáticos) podem exigir supercomputadores rodando por dias: a precisão desejada dita diretamente o custo computacional.</p>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 4 pontos</p>
          <ol className="mat-resumo__lista">
            <li>Monte Carlo estima valores difíceis de calcular exatamente repetindo um experimento aleatório muitas vezes e observando a média.</li>
            <li>Funciona graças à Lei dos Grandes Números: mais repetições, estimativa mais precisa.</li>
            <li>Usado para prever o tempo, calcular risco de seguros, simular física de partículas e jogar Go/xadrez com IA.</li>
            <li>O erro cai com a raiz quadrada do número de simulações — dobrar a precisão custa 4x mais simulações.</li>
          </ol>
        </div>
        <p style={{ marginTop: 24 }}><Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link></p>
      </main>
    </>
  );
}
