import Link from "next/link";
import { useState, useMemo } from "react";
import Masthead from "@/components/Masthead";
import { CurvaGaussiana } from "./ConteudoClient";
export default function ArtigoDistribuicaoNormalPage() {
  return (
    <>
      <Masthead matematicaAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow"><Link href="/matematica" className="breadcrumb">← Matemática sem mistério</Link></p>
        <div className="mat-artigo-header mat-artigo-header--pine">
          <span className="mat-artigo-emoji">🔔</span>
          <div>
            <p className="mat-artigo-conceito">Distribuição gaussiana</p>
            <h1 className="titulo-edicao">Distribuição Normal</h1>
          </div>
        </div>
        <p className="subtitulo-edicao">A curva em forma de sino que governa altura humana, notas de prova, erros de medição — e explica por que as somas das dezenas de loteria formam um padrão previsível.</p>

        <CurvaGaussiana />

        <h2 className="mat-h2">Por que a natureza ama essa curva?</h2>
        <p>A distribuição normal aparece sempre que um resultado é determinado pela soma de muitas influências pequenas e independentes. Altura humana depende de centenas de genes, nutrição, hormônios — cada um contribuindo um pouquinho. O resultado? Uma curva em sino, com a maioria das pessoas perto da média e poucas nos extremos.</p>
        <p>O mesmo vale para erros de medição em fábricas, notas em provas padronizadas, pressão arterial, e muitos fenômenos naturais.</p>

        <div className="mat-box mat-box--pine">
          <p className="mat-box__titulo">📐 Teorema Central do Limite</p>
          <p>O motivo matemático pelo qual a distribuição normal aparece em tantos lugares é o <strong>Teorema Central do Limite</strong>: a soma (ou média) de muitas variáveis aleatórias independentes, com qualquer distribuição, converge para uma distribuição normal conforme o número de variáveis aumenta.</p>
          <p style={{ marginTop: 8 }}>Mesmo que cada dado individual tenha outra distribuição (uniforme, assimétrica, discreta), a média de muitos desses dados vai se parecer com uma curva em sino.</p>
        </div>

        <h2 className="mat-h2">A soma das dezenas da Lotofácil</h2>
        <p>Cada dezena sorteada na Lotofácil é uma variável aleatória entre 1 e 25. A soma das 15 dezenas sorteadas é a soma de 15 variáveis aleatórias — e pelo Teorema Central do Limite, essa soma segue aproximadamente uma distribuição normal.</p>
        <p>Por isso a <Link href="/lotofacil/tabelas/soma" className="breadcrumb">tabela de soma da Lotofácil</Link> mostra um histograma em forma de sino, com pico em torno de 210 (a média esperada) e caindo simetricamente para os extremos. Não é coincidência — é matemática.</p>

        <h2 className="mat-h2">A regra dos 68-95-99,7</h2>
        <p>Para qualquer distribuição normal com média μ e desvio padrão σ:</p>
        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead><tr><th>Intervalo</th><th className="num">% dos dados</th><th>Exemplo (altura, μ=170, σ=10)</th></tr></thead>
            <tbody>
              <tr><td>μ ± 1σ</td><td className="num">68,3%</td><td>160 a 180 cm</td></tr>
              <tr><td>μ ± 2σ</td><td className="num">95,4%</td><td>150 a 190 cm</td></tr>
              <tr><td>μ ± 3σ</td><td className="num">99,7%</td><td>140 a 200 cm</td></tr>
            </tbody>
          </table>
        </div>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 3 pontos</p>
          <ol className="mat-resumo__lista">
            <li>Distribuição normal aparece quando muitos fatores pequenos se somam — altura, notas, erros.</li>
            <li>68% dos dados ficam a 1σ da média; 95% a 2σ; 99,7% a 3σ.</li>
            <li>A soma das dezenas de loteria forma uma distribuição normal pelo Teorema Central do Limite.</li>
          </ol>
        </div>
        <p style={{ marginTop: 24 }}><Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link></p>
      </main>
    </>
  );
}
