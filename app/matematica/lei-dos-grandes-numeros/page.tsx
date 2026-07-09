import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { SimuladorLGN } from "./ConteudoClient";

export const metadata: Metadata = {
  title: "Lei dos Grandes Números — Matemática sem mistério | LotoAnalítica",
  description: "Por que o McDonald's sabe quantos hambúrgueres vender amanhã mas você não sabe o que vai almoçar. A Lei dos Grandes Números explicada com exemplos reais e simulador interativo.",
  alternates: { canonical: `${SITE_URL}/matematica/lei-dos-grandes-numeros` },
  openGraph: { title: "Lei dos Grandes Números", description: "Como médias convergem com o aumento das amostras — e por que isso importa.", url: `${SITE_URL}/matematica/lei-dos-grandes-numeros`, siteName: SITE_NAME, locale: "pt_BR", type: "article", images: [`${SITE_URL}/opengraph-image`] },
};

export default function ArtigoLGNPage() {
  return (
    <>
      <Masthead matematicaAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow"><Link href="/matematica" className="breadcrumb">← Matemática sem mistério</Link></p>
        <div className="mat-artigo-header mat-artigo-header--pine">
          <span className="mat-artigo-emoji">📊</span>
          <div>
            <p className="mat-artigo-conceito">Convergência e grandes amostras (em inglês: <em>Law of Large Numbers</em>)</p>
            <h1 className="titulo-edicao">Lei dos Grandes Números</h1>
          </div>
        </div>
        <p className="subtitulo-edicao">
          Por que o McDonald's sabe exatamente quantos hambúrgueres vai vender
          amanhã num restaurante específico — mas você não sabe o que vai querer
          almoçar. A diferença está em quantas repetições cada um tem.
        </p>

        <SimuladorLGN />

        <h2 className="mat-h2">O que diz a lei</h2>
        <p>
          A Lei dos Grandes Números (abreviada como LGN) diz que, conforme
          o número de tentativas de um experimento aleatório aumenta, a{" "}
          <strong>frequência relativa</strong> observada se aproxima cada vez
          mais da <strong>probabilidade teórica</strong> do evento.
        </p>
        <p>
          Em outras palavras: no curto prazo, a aleatoriedade domina e tudo
          parece caótico. No longo prazo, a média se estabiliza em torno do
          valor esperado com uma precisão que aumenta com o número de repetições.
        </p>
        <div className="mat-box mat-box--pine">
          <p className="mat-box__titulo">📐 A lei em linguagem matemática</p>
          <p>
            Se X₁, X₂, X₃, ... são variáveis aleatórias independentes e
            identicamente distribuídas com média μ (mi), então a média amostral:
          </p>
          <p style={{ fontFamily: "var(--font-mono)", marginTop: 8, fontSize: "0.95rem" }}>
            X̄ₙ = (X₁ + X₂ + ... + Xₙ) / n
          </p>
          <p style={{ marginTop: 8 }}>
            converge para μ conforme n → ∞. Em português simples: tire a
            média de muitas tentativas e ela vai se aproximar do valor esperado.
          </p>
        </div>

        <h2 className="mat-h2">Por que o McDonald's sabe — e você não</h2>
        <p>
          Você, individualmente, é imprevisível. Às vezes quer pizza, às vezes
          salada, às vezes nem sabe. Seus hábitos alimentares têm variância
          alta — uma amostra de 1 (você hoje) não prevê nada com precisão.
        </p>
        <p>
          O McDonald's atende milhões de pessoas por dia em cada restaurante.
          Com esse volume de repetições, a Lei dos Grandes Números trabalha
          a favor deles: eles sabem que, numa sexta à noite naquele bairro
          específico, vão vender aproximadamente X Big Macs, com variação de
          apenas alguns poucos por cento.
        </p>
        <p>
          O mesmo princípio explica por que seguradoras conseguem precificar
          riscos. Ninguém sabe se <em>você</em> vai bater o carro este ano.
          Mas a seguradora sabe que, de uma frota de 100.000 veículos
          similares ao seu, aproximadamente 8% vão acionar o seguro —
          e cobra o prêmio com base nisso.
        </p>

        <h2 className="mat-h2">Dois exemplos do cotidiano</h2>
        <p>
          <strong>Pesquisa eleitoral:</strong> com uma amostra de 1.000 pessoas
          selecionadas aleatoriamente, a margem de erro típica é de ±3 pontos
          percentuais. Com 10.000 pessoas, cai para ±1%. A LGN garante que
          amostras maiores dão estimativas mais precisas da população total —
          mas o crescimento da precisão é proporcional à <em>raiz quadrada</em>{" "}
          do tamanho da amostra, não ao tamanho em si.
        </p>
        <p>
          <strong>Controle de qualidade industrial:</strong> uma fábrica produz
          parafusos com tolerância de ±0,1mm. Nenhum parafuso é perfeito, mas
          a <em>média</em> de uma grande produção será muito próxima do valor
          nominal. A LGN garante que o processo é controlável estatisticamente,
          mesmo com variação individual.
        </p>

        <div className="mat-box mat-box--ochre">
          <p className="mat-box__titulo">⚠️ O erro mais comum: "compensação" não existe</p>
          <p>
            A LGN <strong>não</strong> diz que desvios passados serão compensados.
            Se você jogar cara 10 vezes seguidas, os próximos lançamentos não
            vão "corrigir" esse desvio. O que a LGN diz é que esses 10 caras
            vão se tornar <em>irrelevantes</em> quando a amostra for grande o
            suficiente — não porque vieram coroas para compensar, mas porque
            foram diluídos no volume total.
          </p>
          <p style={{ marginTop: 8 }}>
            Com 1.000 lançamentos, 10 caras extras representam apenas 1% de
            desvio. Com 100.000 lançamentos, representam 0,01%. O desvio
            some na proporção — não porque foi corrigido, mas porque foi
            engolido pelo tamanho da amostra.
          </p>
        </div>

        <h2 className="mat-h2">LGN e frequências de loteria</h2>
        <p>
          O heatmap da Lotofácil mostra a frequência de cada dezena ao longo
          de mais de 3.700 concursos. Com esse histórico, a LGN garante que
          a distribuição de frequências está muito próxima da distribuição
          teórica uniforme (todas as 25 dezenas com aproximadamente a mesma
          probabilidade de 60% de aparecer em cada concurso).
        </p>
        <p>
          Quando uma dezena parece "atrasada" — digamos, que não sai há 15
          concursos — a LGN não está dizendo que ela vai sair agora. Está
          dizendo que, em 3.700 concursos, ela vai ter aparecido em torno de
          60% deles, independente de quando esses sorteios específicos ocorreram.
        </p>
        <p>
          A LGN é uma lei sobre o <em>coletivo</em>, não sobre o{" "}
          <em>próximo evento</em>. Ela descreve tendências de longo prazo,
          não previsões de curto prazo.
        </p>

        <h2 className="mat-h2">Quando a LGN falha — distribuições com variância infinita</h2>
        <p>
          A LGN funciona quando a distribuição tem média e variância finitas.
          Existem distribuições matemáticas (chamadas de distribuições de
          Cauchy, em homenagem ao matemático francês Augustin-Louis Cauchy)
          onde a média amostral <em>não converge</em> — ela fica oscilando
          para sempre, sem se estabilizar.
        </p>
        <p>
          Na prática, isso significa que a LGN não pode ser aplicada
          cegamente a qualquer fenômeno. Em mercados financeiros, por exemplo,
          eventos extremos (quedas abruptas, crises) têm probabilidade maior
          do que uma distribuição normal prevê — e isso pode invalidar modelos
          que assumem que "a média vai se estabilizar".
        </p>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 4 pontos</p>
          <ol className="mat-resumo__lista">
            <li>Com muitas repetições, a frequência observada converge para a probabilidade teórica.</li>
            <li>Poucos eventos = caos. Muitos eventos = previsibilidade estatística.</li>
            <li>A LGN não cancela desvios passados — ela os dilui no volume crescente de dados.</li>
            <li>Empresas com milhões de transações usam a LGN para prever demanda; indivíduos são imprevisíveis.</li>
          </ol>
        </div>
        <p style={{ marginTop: 24 }}><Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link></p>
      </main>
    </>
  );
}
