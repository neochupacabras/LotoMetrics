import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { DilemaJogavel } from "./ConteudoClient";

export const metadata: Metadata = {
  title: "Teoria dos Jogos — Matemática sem mistério | LotoAnalítica",
  description: "O dilema do prisioneiro: por que duas pessoas racionais tomam uma decisão coletivamente irracional. Jogue contra o computador e veja na prática.",
  alternates: { canonical: `${SITE_URL}/matematica/teoria-dos-jogos` },
  openGraph: { title: "Teoria dos Jogos", description: "Equilíbrio de Nash e por que cooperar pode ser racional.", url: `${SITE_URL}/matematica/teoria-dos-jogos`, siteName: SITE_NAME, locale: "pt_BR", type: "article", images: [`${SITE_URL}/opengraph-image`] },
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
            <p className="mat-artigo-conceito">Equilíbrio de Nash e estratégias dominantes</p>
            <h1 className="titulo-edicao">Teoria dos Jogos</h1>
          </div>
        </div>
        <p className="subtitulo-edicao">
          O dilema do prisioneiro: por que duas pessoas completamente racionais,
          agindo no próprio interesse, chegam a um resultado pior para ambas
          do que se tivessem cooperado.
        </p>

        <DilemaJogavel />

        <h2 className="mat-h2">O dilema do prisioneiro</h2>
        <p>
          Dois suspeitos são presos e interrogados separadamente. Cada um pode
          cooperar (ficar em silêncio) ou trair (delatar o outro). Os resultados:
        </p>
        <div className="mat-box mat-box--pine">
          <p className="mat-box__titulo">⚖️ A matriz de payoff original</p>
          <p>• Ambos cooperam: 1 ano de prisão cada (melhor resultado coletivo).</p>
          <p>• Você trai, ele coopera: você sai livre, ele pega 10 anos.</p>
          <p>• Você coopera, ele trai: você pega 10 anos, ele sai livre.</p>
          <p>• Ambos traem: 5 anos cada (pior resultado coletivo).</p>
          <p style={{ marginTop: 8 }}>
            Racionalmente, trair é sempre a melhor escolha <em>independente do que o outro fizer</em>.
            Resultado: ambos traem e ficam 5 anos — pior do que se ambos cooperassem (1 ano cada).
          </p>
        </div>

        <h2 className="mat-h2">Equilíbrio de Nash</h2>
        <p>
          John Nash (do filme "Uma Mente Brilhante") formalizou o conceito:
          um equilíbrio é um conjunto de estratégias onde nenhum jogador
          melhora mudando só sua própria estratégia. No dilema do prisioneiro,
          "ambos traem" é o equilíbrio de Nash — mesmo sendo subótimo coletivamente.
        </p>
        <p>
          Nash provou que todo jogo finito tem pelo menos um equilíbrio (possivelmente
          em estratégias mistas). Isso foi tão importante que lhe valeu o Nobel de
          Economia em 1994.
        </p>

        <h2 className="mat-h2">Tit-for-Tat — a estratégia que funciona</h2>
        <p>
          No simulador acima, o computador usa <strong>Tit-for-Tat</strong>: coopera
          na primeira rodada e depois copia exatamente o que você fez na rodada anterior.
          É simples, transparente e surpreendentemente eficaz.
        </p>
        <p>
          Axelrod (1984) realizou torneios de dilema do prisioneiro repetido entre
          programas de computador — e Tit-for-Tat ganhou. O motivo: é amigável
          (começa cooperando), retaliatório (pune traição imediatamente), perdoador
          (volta a cooperar se o outro cooperar) e claro (fácil de entender).
        </p>

        <h2 className="mat-h2">Teoria dos jogos no cotidiano</h2>
        <p>
          <strong>Negociação salarial:</strong> pedir demais pode custar a vaga;
          pedir de menos deixa dinheiro na mesa. A teoria dos jogos modela esse
          trade-off com jogos de barganha.
        </p>
        <p>
          <strong>Leilão de lance fechado:</strong> quanto dar? Dar o valor real
          maximiza chance de ganhar sem pagar a mais (estratégia dominante em
          leilões Vickrey, onde o ganhador paga o segundo maior lance).
        </p>
        <p>
          <strong>Bolões de loteria:</strong> quando um bolão grande ganha, divide
          o prêmio entre muitos. Mas se todos pensarem assim e evitarem bolões,
          os prêmios ficam menos disputados. É um equilíbrio dinâmico.
        </p>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 3 pontos</p>
          <ol className="mat-resumo__lista">
            <li>Teoria dos jogos estuda decisões onde o resultado depende das escolhas de outros.</li>
            <li>Equilíbrio de Nash: ninguém melhora mudando só sua estratégia — mesmo que o resultado coletivo seja ruim.</li>
            <li>Em jogos repetidos, cooperação emerge naturalmente — estratégias como Tit-for-Tat superam traição pura.</li>
          </ol>
        </div>

        <p style={{ marginTop: 24 }}><Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link></p>
      </main>
    </>
  );
}
