import Link from "next/link";
import Masthead from "@/components/Masthead";
import { SimuladorLGN } from "./ConteudoClient";
export default function ArtigoLGNPage() {
  return (
    <>
      <Masthead matematicaAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow"><Link href="/matematica" className="breadcrumb">← Matemática sem mistério</Link></p>
        <div className="mat-artigo-header mat-artigo-header--pine">
          <span className="mat-artigo-emoji">📊</span>
          <div>
            <p className="mat-artigo-conceito">Convergência e grandes amostras</p>
            <h1 className="titulo-edicao">Lei dos Grandes Números</h1>
          </div>
        </div>
        <p className="subtitulo-edicao">Por que o McDonald's sabe quantos hambúrgueres vender amanhã — mas você não sabe o que vai querer almoçar.</p>

        <SimuladorLGN />

        <h2 className="mat-h2">O que diz a lei</h2>
        <p>A Lei dos Grandes Números diz que, conforme o número de tentativas aumenta, a frequência observada se aproxima cada vez mais da probabilidade teórica. Com 10 lançamentos de dado, sair 1 em 20% ou 10% é normal — variação esperada. Com 100.000 lançamentos, a frequência vai estar muito próxima de 16,67%.</p>
        <div className="mat-box mat-box--pine">
          <p className="mat-box__titulo">📐 A lei formal</p>
          <p>Se X₁, X₂, ... são variáveis aleatórias independentes e identicamente distribuídas com esperança μ, então a média amostral (X₁ + X₂ + ... + Xₙ) / n converge para μ conforme n → ∞.</p>
          <p style={{ marginTop: 8 }}>Em português: tire a média de muitas tentativas e ela vai se aproximar do valor esperado.</p>
        </div>

        <h2 className="mat-h2">Por que o McDonald's sabe, e você não</h2>
        <p>Você, individualmente, é imprevisível. Às vezes quer pizza, às vezes salada. Mas o McDonald's serve milhões de pessoas por dia — e com números tão grandes, a média se estabiliza. Eles sabem com precisão razoável quantos Big Macs vão vender na próxima sexta à noite num restaurante específico, porque já viram esse padrão se repetir milhares de vezes.</p>
        <p>É o mesmo princípio que faz seguradoras funcionarem: ninguém sabe se você vai bater o carro esse ano, mas a seguradora sabe com precisão que X% da frota vai acionar o seguro — e cobra o prêmio baseada nisso.</p>

        <h2 className="mat-h2">A confusão mais comum</h2>
        <p>A LGN <strong>não</strong> diz que os desvios se cancelam. Se você jogar cara 10 vezes seguidas, a LGN não diz que virão 10 coroas para "compensar" — ela diz que 10 caras vão se tornar irrelevantes quando você tiver 100.000 lançamentos no total.</p>
        <div className="mat-box mat-box--rust">
          <p className="mat-box__titulo">⚠️ LGN e loteria</p>
          <p>A Lei dos Grandes Números garante que, em milhares de sorteios, cada dezena vai aparecer aproximadamente com a mesma frequência. Mas não diz <em>quando</em> uma dezena atrasada vai sair — só que eventualmente vai convergir. Um número que não saiu em 50 concursos não está "devendo".</p>
        </div>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 3 pontos</p>
          <ol className="mat-resumo__lista">
            <li>Com poucos eventos, os resultados são imprevisíveis. Com muitos, a média converge.</li>
            <li>É a base de seguros, controle de qualidade industrial e previsão de demanda.</li>
            <li>Não cancela desvios passados — só os dilui numa amostra grande.</li>
          </ol>
        </div>
        <p style={{ marginTop: 24 }}><Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link></p>
      </main>
    </>
  );
}
