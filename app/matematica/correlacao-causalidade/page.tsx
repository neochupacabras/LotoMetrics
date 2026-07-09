import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { VisualizadorCorrelacao } from "./ConteudoClient";

export const metadata: Metadata = {
  title: "Correlação e Causalidade — Matemática sem mistério | LotoAnalítica",
  description: "Países que comem mais chocolate ganham mais Nobel — mas isso não significa o que parece. Aprenda a diferença entre correlação e causalidade com exemplos reais.",
  alternates: { canonical: `${SITE_URL}/matematica/correlacao-causalidade` },
  openGraph: { title: "Correlação e Causalidade", description: "Por que duas coisas que andam juntas não significa que uma causa a outra.", url: `${SITE_URL}/matematica/correlacao-causalidade`, siteName: SITE_NAME, locale: "pt_BR", type: "article", images: [`${SITE_URL}/opengraph-image`] },
};

export default function ArtigoCorrelacaoCausalidadePage() {
  return (
    <>
      <Masthead matematicaAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow"><Link href="/matematica" className="breadcrumb">← Matemática sem mistério</Link></p>
        <div className="mat-artigo-header mat-artigo-header--ochre">
          <span className="mat-artigo-emoji">🍫</span>
          <div>
            <p className="mat-artigo-conceito">Correlação de Pearson (em inglês: <em>correlation vs causation</em>)</p>
            <h1 className="titulo-edicao">Correlação e Causalidade</h1>
          </div>
        </div>
        <p className="subtitulo-edicao">
          Países que comem mais chocolate ganham mais Nobel. Afogamentos aumentam
          quando as vendas de sorvete aumentam. Correlação não é causalidade —
          e confundir os dois leva a decisões terríveis.
        </p>

        <VisualizadorCorrelacao />

        <h2 className="mat-h2">O que é correlação?</h2>
        <p>
          Correlação é uma medida estatística que quantifica o quanto duas
          variáveis variam juntas. O coeficiente de correlação de Pearson (r)
          varia de −1 a +1:
        </p>
        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Valor de r</th>
                <th>Interpretação</th>
                <th>Exemplo</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>+1,00</td><td>Correlação perfeita positiva</td><td>Temperatura em °C e °F</td></tr>
              <tr><td>+0,7 a +0,9</td><td>Correlação forte positiva</td><td>Altura de pais e filhos</td></tr>
              <tr><td>≈ 0</td><td>Sem correlação</td><td>Número do sapato e QI</td></tr>
              <tr><td>−0,7 a −0,9</td><td>Correlação forte negativa</td><td>Exercício e pressão arterial</td></tr>
            </tbody>
          </table>
        </div>

        <h2 className="mat-h2">Três mecanismos que geram correlação sem causalidade</h2>
        <p>
          O erro de confundir correlação com causalidade (em inglês:{" "}
          <em>confusing correlation with causation</em>) é um dos mais frequentes
          em divulgação científica. Há três mecanismos distintos:
        </p>
        <div className="mat-box mat-box--ochre">
          <p className="mat-box__titulo">🔍 Os três culpados</p>
          <p>
            <strong>1. Variável de confusão</strong> (em inglês:{" "}
            <em>confounding variable</em>): uma terceira variável oculta causa
            as duas variáveis observadas. Chocolate e Nobel são ambos causados
            por riqueza — países mais ricos consomem mais chocolate E têm mais
            instituições de pesquisa.
          </p>
          <p style={{ marginTop: 8 }}>
            <strong>2. Causalidade reversa</strong> (em inglês:{" "}
            <em>reverse causation</em>): B causa A, não A causa B. Países com
            mais médicos têm população mais saudável — mas talvez porque países
            saudáveis podem pagar por mais médicos.
          </p>
          <p style={{ marginTop: 8 }}>
            <strong>3. Correlação espúria</strong> (em inglês:{" "}
            <em>spurious correlation</em>): pura coincidência. O número de filmes
            com Nicolas Cage lançados por ano correlaciona com afogamentos em piscinas
            nos EUA. Sem nenhum mecanismo plausível de ligação.
          </p>
        </div>

        <h2 className="mat-h2">Como provar causalidade de verdade</h2>
        <p>
          O padrão científico para estabelecer causalidade é o{" "}
          <strong>experimento controlado aleatorizado</strong> (em inglês:{" "}
          <em>randomized controlled trial</em> ou RCT). Divide-se os participantes
          aleatoriamente em grupo de tratamento e grupo de controle, aplica-se
          a intervenção apenas no grupo de tratamento e mede-se a diferença.
        </p>
        <p>
          A aleatorização distribui aleatoriamente todas as variáveis de confusão
          entre os grupos, eliminando o efeito delas. Por isso os ensaios clínicos
          randomizados são o padrão-ouro em medicina.
        </p>
        <p>
          Quando experimentos são impossíveis (ética, escala, custo), economistas
          usam técnicas como diferenças em diferenças, variáveis instrumentais e
          regressão descontínua — formas de aproximar as condições de um RCT
          sem realizá-lo.
        </p>

        <h2 className="mat-h2">Correlação e dezenas de loteria</h2>
        <p>
          É comum encontrar análises que identificam pares de dezenas que "saem
          juntas" com frequência acima do esperado na Lotofácil. Isso é correlação —
          mas não causalidade. Não existe nenhum mecanismo pelo qual uma bolinha
          de sorteio influencia outra no tambor.
        </p>
        <p>
          Com 3.700 concursos e C(25,2) = 300 pares possíveis de dezenas, é
          estatisticamente esperado que alguns pares apareçam juntos mais vezes
          que a média por pura variação aleatória. Isso é{" "}
          <strong>variação de amostragem</strong> (em inglês:{" "}
          <em>sampling variation</em>) — não evidência de padrão real.
        </p>
        <p>
          A regra: sempre pergunte se há um mecanismo causal plausível antes de
          concluir que uma correlação significa algo.
        </p>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 4 pontos</p>
          <ol className="mat-resumo__lista">
            <li>Correlação mede co-variação — r próximo de ±1 indica relação forte, r ≈ 0 indica ausência de relação linear.</li>
            <li>Correlação pode surgir por variável de confusão, causalidade reversa ou pura coincidência.</li>
            <li>Só experimentos controlados aleatorizados (RCT) estabelecem causalidade com rigor científico.</li>
            <li>Na loteria, pares de dezenas com alta co-ocorrência são variação aleatória normal — não padrão causal.</li>
          </ol>
        </div>
        <p style={{ marginTop: 24 }}><Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link></p>
      </main>
    </>
  );
}
