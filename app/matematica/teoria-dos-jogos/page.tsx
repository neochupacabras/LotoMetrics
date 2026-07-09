import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { DilemaJogavel } from "./ConteudoClient";

export const metadata: Metadata = {
  title: "Teoria dos Jogos — Matemática sem mistério | LotoAnalítica",
  description: "O dilema do prisioneiro: por que duas pessoas racionais chegam a um resultado coletivamente pior. Equilíbrio de Nash, Tit-for-Tat e teoria dos jogos no cotidiano.",
  alternates: { canonical: `${SITE_URL}/matematica/teoria-dos-jogos` },
  openGraph: { title: "Teoria dos Jogos", description: "Dilema do prisioneiro, equilíbrio de Nash e por que cooperar pode ser racional.", url: `${SITE_URL}/matematica/teoria-dos-jogos`, siteName: SITE_NAME, locale: "pt_BR", type: "article", images: [`${SITE_URL}/opengraph-image`] },
};

export default function ArtigoTeoriaDosJogosPage() {
  return (
    <>
      <Masthead matematicaAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow"><Link href="/matematica" className="breadcrumb">← Matemática sem mistério</Link></p>
        <div className="mat-artigo-header mat-artigo-header--pine">
          <span className="mat-artigo-emoji">🎯</span>
          <div>
            <p className="mat-artigo-conceito">Equilíbrio de Nash e estratégias (em inglês: <em>game theory</em>)</p>
            <h1 className="titulo-edicao">Teoria dos Jogos</h1>
          </div>
        </div>
        <p className="subtitulo-edicao">O dilema do prisioneiro: por que duas pessoas completamente racionais, agindo no próprio interesse, chegam a um resultado pior para ambas do que se tivessem cooperado.</p>

        <DilemaJogavel />

        <h2 className="mat-h2">O que é teoria dos jogos?</h2>
        <p>A teoria dos jogos (em inglês: <em>game theory</em>) é o ramo da matemática que estuda tomadas de decisão em situações onde o resultado de cada pessoa depende das escolhas das outras. Não é sobre jogos de tabuleiro — é sobre qualquer interação estratégica: negociações, leilões, guerras de preço entre empresas, política internacional e até evolução biológica.</p>
        <p>O campo foi formalizado pelo matemático húngaro-americano John von Neumann e o economista Oskar Morgenstern no livro "Teoria dos Jogos e Comportamento Econômico" (em inglês: <em>Theory of Games and Economic Behavior</em>), publicado em 1944.</p>

        <h2 className="mat-h2">O dilema do prisioneiro</h2>
        <p>Dois suspeitos são presos e interrogados em salas separadas, sem comunicação. Cada um pode cooperar (ficar em silêncio) ou trair (delatar o outro). Os resultados:</p>
        <div className="mat-box mat-box--pine">
          <p className="mat-box__titulo">⚖️ A matriz de recompensas (anos de prisão)</p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", fontFamily: "var(--font-mono)" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--line)" }}>
                  <th style={{ padding: "8px", color: "var(--pine)" }}></th>
                  <th style={{ padding: "8px", textAlign: "center", color: "var(--pine)" }}>B coopera</th>
                  <th style={{ padding: "8px", textAlign: "center", color: "var(--pine)" }}>B trai</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "8px", fontWeight: 700, color: "var(--pine)" }}>A coopera</td>
                  <td style={{ padding: "8px", textAlign: "center", color: "var(--pine)", fontWeight: 700 }}>1 ano cada ← ótimo coletivo</td>
                  <td style={{ padding: "8px", textAlign: "center", color: "var(--rust)" }}>A: 10 anos / B: livre</td>
                </tr>
                <tr>
                  <td style={{ padding: "8px", fontWeight: 700, color: "var(--pine)" }}>A trai</td>
                  <td style={{ padding: "8px", textAlign: "center", color: "var(--rust)" }}>A: livre / B: 10 anos</td>
                  <td style={{ padding: "8px", textAlign: "center", color: "var(--ochre)", fontWeight: 700 }}>5 anos cada ← equilíbrio de Nash</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <p>Para A: se B coopera, A fica melhor traindo (livre vs 1 ano). Se B trai, A ainda fica melhor traindo (5 vs 10 anos). Trair é a <strong>estratégia dominante</strong> (em inglês: <em>dominant strategy</em>) para A — e, pela mesma lógica, para B. Resultado: ambos traem e ficam 5 anos, quando poderiam ter ficado 1 ano cada.</p>

        <h2 className="mat-h2">Equilíbrio de Nash</h2>
        <p>John Nash (1928-2015), matemático americano retratado no filme "Uma Mente Brilhante" (em inglês: <em>A Beautiful Mind</em>), formalizou o conceito que leva seu nome: um <strong>equilíbrio de Nash</strong> (em inglês: <em>Nash equilibrium</em>) é um conjunto de estratégias onde nenhum jogador melhora mudando apenas sua própria estratégia, mantendo as dos outros fixas.</p>
        <p>No dilema do prisioneiro, "ambos traem" é o equilíbrio de Nash — nenhum dos dois tem incentivo unilateral para mudar. Mesmo que o resultado coletivo seja pior do que "ambos cooperam", a lógica individual leva inevitavelmente a esse ponto.</p>
        <p>Nash provou que todo jogo finito com número finito de jogadores tem pelo menos um equilíbrio — possivelmente em estratégias mistas (onde os jogadores aleatorizam entre opções). Esse resultado, o "Teorema de Nash" (em inglês: <em>Nash's theorem</em>), lhe valeu o Prêmio Nobel de Economia em 1994.</p>

        <h2 className="mat-h2">Jogos repetidos e a estratégia Tit-for-Tat</h2>
        <p>O dilema do prisioneiro num único encontro tem uma solução clara: trair. Mas e se os mesmos dois jogadores se encontram muitas vezes?</p>
        <p>Em jogos repetidos (em inglês: <em>repeated games</em>), cooperação pode emergir. O cientista político Robert Axelrod realizou em 1984 um torneio de dilema do prisioneiro iterado entre programas de computador — e a vencedora foi a estratégia mais simples: <strong>Tit-for-Tat</strong>.</p>
        <p>Tit-for-Tat (literalmente "olho por olho"): coopera na primeira rodada, depois copia exatamente o que o adversário fez na rodada anterior. Ela é:</p>
        <p><strong>Gentil</strong> — começa cooperando, nunca é a primeira a trair. <strong>Retaliatória</strong> — pune imediatamente qualquer traição. <strong>Perdoadora</strong> — volta a cooperar se o adversário cooperar. <strong>Clara</strong> — fácil de entender e de antecipar. Essas quatro características juntas tornam-na imbatível no longo prazo.</p>

        <h2 className="mat-h2">Teoria dos jogos no cotidiano</h2>
        <p><strong>Guerra de preços:</strong> quando duas empresas baixam preços mutuamente até o limite da lucratividade, estão presas num equilíbrio de Nash subótimo — ambas ganhariam mais se pudessem coordenar (mas isso é cartel, ilegal).</p>
        <p><strong>Leilões:</strong> quanto dar num leilão de lance fechado? A estratégia ótima depende do tipo de leilão. Em leilões Vickrey (em inglês: <em>Vickrey auction</em>), onde o ganhador paga o segundo maior lance, a estratégia dominante é dar exatamente quanto o item vale para você — honestidade é ótima.</p>
        <p><strong>Corrida armamentista:</strong> dois países que armam simultaneamente se veem num dilema do prisioneiro clássico — ambos investem em armamentos caros para se proteger um do outro, quando poderiam gastar menos cooperando.</p>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 4 pontos</p>
          <ol className="mat-resumo__lista">
            <li>Teoria dos jogos estuda decisões estratégicas onde o resultado depende das escolhas de outros.</li>
            <li>Equilíbrio de Nash: ninguém melhora mudando só sua estratégia — mesmo que o resultado coletivo seja ruim.</li>
            <li>No dilema do prisioneiro, a lógica individual leva ao pior resultado coletivo.</li>
            <li>Em jogos repetidos, cooperação emerge naturalmente — Tit-for-Tat supera estratégias mais sofisticadas.</li>
          </ol>
        </div>
        <p style={{ marginTop: 24 }}><Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link></p>
      </main>
    </>
  );
}
