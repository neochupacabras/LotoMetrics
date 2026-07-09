import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { VisualizadorCorrelacao } from "./ConteudoClient";

export const metadata: Metadata = {
  title: "Correlação e Causalidade — Matemática sem mistério | LotoAnalítica",
  description: "Artigo educativo sobre correlação e causalidade com exemplos práticos e componentes interativos. Parte da seção Matemática sem mistério do LotoAnalítica.",
  alternates: { canonical:  },
  openGraph: { title: "Correlação e Causalidade", description: "Países que comem mais chocolate ganham mais Nobel — mas isso não significa o que parece.", url: , siteName: SITE_NAME, locale: "pt_BR", type: "article", images: [] },
};

export default function Page() {
  return (
    <>
      <Masthead matematicaAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow"><Link href="/matematica" className="breadcrumb">← Matemática sem mistério</Link></p>
        <div className="mat-artigo-header mat-artigo-header--ochre">
          <span className="mat-artigo-emoji">🍫</span>
          <div>
            <p className="mat-artigo-conceito">Correlação de Pearson (em inglês: <em>correlation and causation</em>)</p>
            <h1 className="titulo-edicao">Correlação e Causalidade</h1>
          </div>
        </div>
        <p className="subtitulo-edicao">Países que comem mais chocolate ganham mais Nobel — mas isso não significa o que parece.</p>
        <VisualizadorCorrelacao />
        
        <h2 className="mat-h2">O que é correlação?</h2>
        <p>A correlação é uma medida estatística que quantifica o quanto duas variáveis variam juntas. O coeficiente de correlação de Pearson (r) varia de −1 a +1, onde: +1 indica que quando uma sobe, a outra sempre sobe na mesma proporção; −1 indica que quando uma sobe, a outra sempre desce; e 0 indica ausência de relação linear entre as duas variáveis. A fórmula: r = Σ[(xᵢ−x̄)(yᵢ−ȳ)] ÷ [n × σₓ × σᵧ]. Parece complicada, mas a intuição é simples: r mede o quanto os dois conjuntos de dados se movem juntos em torno das suas respectivas médias.</p>

        <h2 className="mat-h2">Três mecanismos que geram correlação sem causalidade</h2>
        <p>O erro de confundir correlação com causalidade (em inglês: <em>confusing correlation with causation</em>) é um dos mais frequentes em divulgação científica e tomada de decisão. Há três mecanismos distintos que podem gerar correlação sem nenhuma relação causal direta:

1. <strong>Variável de confusão</strong> (em inglês: <em>confounding variable</em>): uma terceira variável oculta causa as duas variáveis observadas. Chocolate e Nobel são ambos causados por riqueza — países mais ricos consomem mais chocolate E têm mais instituições de pesquisa. A variável oculta é a riqueza.

2. <strong>Causalidade reversa</strong> (em inglês: <em>reverse causation</em>): B causa A, não A causa B. Países com mais médicos têm população mais saudável — mas talvez seja porque países saudáveis podem pagar por mais médicos, e não o contrário.

3. <strong>Correlação espúria</strong> (em inglês: <em>spurious correlation</em>): pura coincidência em conjuntos de dados pequenos. O número de filmes com Nicolas Cage lançados por ano correlaciona com o número de afogamentos em piscinas nos EUA. Sem nenhum mecanismo plausível de ligação.</p>

        <h2 className="mat-h2">Como provar causalidade</h2>
        <p>O padrão científico para estabelecer causalidade é o <strong>experimento controlado aleatorizado</strong> (em inglês: <em>randomized controlled trial</em> ou RCT). Divide-se os participantes aleatoriamente em grupo de tratamento e grupo de controle, aplica-se a intervenção apenas no grupo de tratamento, e mede-se a diferença de resultados.

A aleatorização é a chave: ela distribui aleatoriamente todas as variáveis de confusão entre os grupos, eliminando o efeito delas na comparação. Por isso os ensaios clínicos randomizados são o padrão-ouro em medicina.

Quando experimentos são impossíveis (ética, escala, custo), economistas e estatísticos usam técnicas como: diferenças em diferenças, variáveis instrumentais, regressão descontínua e experimentos naturais — todas formas de aproximar as condições de um RCT sem realizá-lo.</p>

        <h2 className="mat-h2">Correlação e dezenas de loteria</h2>
        <p>É comum encontrar análises que identificam pares de dezenas que "saem juntas" com frequência acima do esperado na Lotofácil. Isso é correlação — mas não causalidade. Não existe nenhum mecanismo pelo qual uma bolinha de sorteio influencia outra no tambor.

Com 3.700 concursos e C(25,2) = 300 pares possíveis de dezenas, é estatisticamente esperado que alguns pares apareçam juntos mais vezes que a média por pura variação aleatória. Isso é o que estatísticos chamam de <strong>variação de amostragem</strong> (em inglês: <em>sampling variation</em>) — não evidência de padrão real.

A regra: sempre pergunte se há um mecanismo causal plausível antes de concluir que uma correlação significa algo.</p>

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
