import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { VisualizadorCorrelacao } from "./ConteudoClient";

export const metadata: Metadata = {
  title: "Correlação e Causalidade — Matemática sem mistério | LotoAnalítica",
  description: "Países que comem mais chocolate ganham mais Nobel. Isso não significa que chocolate causa inteligência. Aprenda a diferença entre correlação e causalidade.",
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
            <p className="mat-artigo-conceito">Correlação de Pearson e falácia da causalidade</p>
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
          Correlação mede o quanto duas variáveis variam juntas. O coeficiente de
          correlação de Pearson (r) vai de −1 a +1:
        </p>
        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead><tr><th>Valor de r</th><th>Interpretação</th><th>Exemplo</th></tr></thead>
            <tbody>
              <tr><td>+1,00</td><td>Correlação perfeita positiva</td><td>Temperatura em °C e °F</td></tr>
              <tr><td>+0,7 a +0,9</td><td>Correlação forte positiva</td><td>Altura de pais e filhos</td></tr>
              <tr><td>+0,3 a +0,6</td><td>Correlação moderada</td><td>Salário e anos de estudo</td></tr>
              <tr><td>≈ 0</td><td>Sem correlação</td><td>Número do sapato e QI</td></tr>
              <tr><td>−0,7 a −0,9</td><td>Correlação forte negativa</td><td>Exercício e pressão arterial</td></tr>
            </tbody>
          </table>
        </div>

        <h2 className="mat-h2">Por que correlação não implica causalidade</h2>
        <p>
          Três mecanismos podem gerar correlação sem causalidade:
        </p>
        <div className="mat-box mat-box--ochre">
          <p className="mat-box__titulo">🔍 Os três culpados</p>
          <p>
            <strong>1. Variável oculta:</strong> chocolate e Nobel são ambos causados
            por riqueza. Remova o efeito da riqueza e a correlação desaparece.
          </p>
          <p style={{ marginTop: 8 }}>
            <strong>2. Causalidade reversa:</strong> países mais saudáveis têm mais
            médicos — mas isso não significa que médicos causam saúde. Talvez seja
            o inverso: países saudáveis podem pagar por mais médicos.
          </p>
          <p style={{ marginTop: 8 }}>
            <strong>3. Coincidência pura:</strong> o número de filmes com Nicolas Cage
            correlaciona com afogamentos em piscinas. Isso é espúrio — sem nenhum
            mecanismo que ligue as duas variáveis.
          </p>
        </div>

        <h2 className="mat-h2">Como provar causalidade de verdade</h2>
        <p>
          O padrão ouro é o <strong>experimento controlado aleatorizado</strong>:
          divida pessoas aleatoriamente em dois grupos, aplique o tratamento em um
          só, meça a diferença. A aleatorização elimina as variáveis ocultas.
        </p>
        <p>
          Quando experimentos são impossíveis (não dá pra randomizar fumantes),
          usam-se técnicas como diferenças em diferenças, variáveis instrumentais
          e regressão descontínua — formas de simular um experimento com dados
          observacionais.
        </p>

        <h2 className="mat-h2">Correlação e dezenas de loteria</h2>
        <p>
          Às vezes as tabelas de frequência da Lotofácil mostram que a dezena 7
          e a dezena 13 saem juntas com frequência acima do esperado. Isso é
          correlação — mas não causalidade. Não existe mecanismo pelo qual uma
          bolinha influencia outra no tambor de sorteio. É variação aleatória
          que vai desaparecer com mais dados.
        </p>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 3 pontos</p>
          <ol className="mat-resumo__lista">
            <li>Correlação mede co-variação — r próximo de ±1 indica relação forte, r ≈ 0 indica ausência.</li>
            <li>Correlação pode surgir por variável oculta, causalidade reversa ou pura coincidência.</li>
            <li>Só experimentos controlados aleatorizados provam causalidade com rigor.</li>
          </ol>
        </div>

        <p style={{ marginTop: 24 }}><Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link></p>
      </main>
    </>
  );
}
