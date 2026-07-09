import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { TesteLogica } from "./ConteudoClient";

export const metadata: Metadata = {
  title: "Lógica e Conjuntos — Matemática sem mistério | LotoAnalítica",
  description: "Por que 'todos os cachorros são animais' não significa que 'todos os animais são cachorros' — e como a lógica formal evita erros de raciocínio graves.",
  alternates: { canonical: `${SITE_URL}/matematica/logica-conjuntos` },
  openGraph: { title: "Lógica e Conjuntos", description: "Subconjuntos, silogismos e as falácias mais comuns no raciocínio cotidiano.", url: `${SITE_URL}/matematica/logica-conjuntos`, siteName: SITE_NAME, locale: "pt_BR", type: "article", images: [`${SITE_URL}/opengraph-image`] },
};

export default function ArtigoLogicaConjuntosPage() {
  return (
    <>
      <Masthead matematicaAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow"><Link href="/matematica" className="breadcrumb">← Matemática sem mistério</Link></p>
        <div className="mat-artigo-header mat-artigo-header--pine">
          <span className="mat-artigo-emoji">🔵</span>
          <div>
            <p className="mat-artigo-conceito">Conjuntos, subconjuntos e lógica proposicional</p>
            <h1 className="titulo-edicao">Lógica e Conjuntos</h1>
          </div>
        </div>
        <p className="subtitulo-edicao">
          Por que "todos os gatos são animais" não significa que "todos os animais são gatos"
          — e como esse tipo de erro leva a conclusões absurdas na vida real.
        </p>

        <TesteLogica />

        <h2 className="mat-h2">Conjuntos e subconjuntos</h2>
        <p>
          Um conjunto é qualquer coleção de objetos. O conjunto dos cachorros está
          completamente dentro do conjunto dos animais — é um subconjunto. Isso
          significa que todo elemento do conjunto "cachorros" também é elemento do
          conjunto "animais".
        </p>
        <p>
          Mas o inverso não é verdade: existem animais que não são cachorros (gatos,
          peixes, pássaros). "A está contido em B" não implica "B está contido em A".
        </p>

        <div className="mat-box mat-box--pine">
          <p className="mat-box__titulo">📐 Notação básica de conjuntos</p>
          <p>A ⊂ B = "A é subconjunto de B" (todo elemento de A está em B)</p>
          <p>A ∩ B = interseção (elementos em A E em B)</p>
          <p>A ∪ B = união (elementos em A OU em B)</p>
          <p>A \ B = diferença (elementos em A mas não em B)</p>
        </div>

        <h2 className="mat-h2">Lógica proposicional e silogismos</h2>
        <p>
          Um silogismo válido: "Todos os humanos são mortais. Sócrates é humano.
          Logo, Sócrates é mortal." A conclusão segue necessariamente das premissas.
        </p>
        <p>
          Um silogismo inválido: "Todos os ganhadores da Mega-Sena compraram
          bilhetes. Eu comprei um bilhete. Logo, vou ganhar a Mega-Sena."
          A segunda premissa não satisfaz a condição completa da primeira.
        </p>

        <h2 className="mat-h2">A falácia mais comum em probabilidade</h2>
        <p>
          "Todo ganhador de loteria escolheu os números X. Eu escolhi os números X.
          Logo, vou ganhar." Isso confunde "condição necessária" com "condição suficiente".
          Ter os números certos é necessário para ganhar — mas não é suficiente
          para garantir a vitória. Milhares de outros bilhetes podem ter os mesmos números.
        </p>
        <div className="mat-box mat-box--ochre">
          <p className="mat-box__titulo">🔍 Na loteria e em diagnóstico médico</p>
          <p>
            Testes de diagnóstico médico são um terreno fértil para erros de lógica.
            Um teste com 99% de sensibilidade detecta 99% dos doentes. Mas se a doença
            afeta 0,1% da população, um resultado positivo ainda tem apenas ~9% de
            chance de ser um verdadeiro positivo (Teorema de Bayes). A lógica formal
            evita essa confusão.
          </p>
        </div>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 3 pontos</p>
          <ol className="mat-resumo__lista">
            <li>A ⊂ B não implica B ⊂ A — subconjunto não é igualdade.</li>
            <li>"Se P então Q" não é o mesmo que "Se Q então P" — confundir os dois é falácia.</li>
            <li>Condição necessária ≠ condição suficiente — ter um bilhete é necessário, não suficiente.</li>
          </ol>
        </div>

        <p style={{ marginTop: 24 }}><Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link></p>
      </main>
    </>
  );
}
