import Link from "next/link";
import Masthead from "@/components/Masthead";
import { CalculadoraVE } from "./ConteudoClient";
export default function ArtigoValorEsperadoPage() {
  return (
    <>
      <Masthead matematicaAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow"><Link href="/matematica" className="breadcrumb">← Matemática sem mistério</Link></p>
        <div className="mat-artigo-header mat-artigo-header--ochre">
          <span className="mat-artigo-emoji">⚖️</span>
          <div>
            <p className="mat-artigo-conceito">Esperança matemática</p>
            <h1 className="titulo-edicao">Valor Esperado</h1>
          </div>
        </div>
        <p className="subtitulo-edicao">A conta que toda empresa de seguro faz — e que revela por que loteria é sempre um mau negócio matematicamente (e por que isso não impede ninguém de jogar).</p>

        <CalculadoraVE />

        <h2 className="mat-h2">O que é valor esperado?</h2>
        <p>Valor esperado (ou esperança matemática) é a média ponderada de todos os resultados possíveis de uma aposta, onde cada resultado é ponderado pela sua probabilidade. É o que você ganharia <em>em média</em> por tentativa se repetisse a aposta infinitas vezes.</p>
        <div className="mat-formula">
          <div className="mat-formula__linha">VE = Σ (probabilidade × ganho) − custo</div>
          <div className="mat-formula__exemplo">Dado honesto: VE = (1/6 × R$6) + (5/6 × R$0) − R$1 = R$0</div>
        </div>

        <h2 className="mat-h2">Por que seguros fazem sentido mesmo com VE negativo</h2>
        <p>Um seguro de carro tem VE negativo para você — a seguradora cobra mais do que vai pagar em média, caso contrário ela quebra. Mas você ainda deve ter seguro. Por quê?</p>
        <p>Porque o valor esperado ignora o impacto de resultados extremos. Perder R$2.000 por ano em prêmio de seguro é suportável. Perder R$80.000 num acidente sem seguro pode ser devastador. A utilidade de evitar o pior caso supera a perda matemática do prêmio.</p>
        <div className="mat-box mat-box--ochre">
          <p className="mat-box__titulo">💡 VE e loteria</p>
          <p>A loteria tem VE fortemente negativo — o governo retém parte da arrecadação antes de distribuir os prêmios. Mas as pessoas jogam porque o custo de R$6 é irrelevante, e a chance (pequena) de mudar de vida tem um apelo que vai além da matemática. Isso não é irracional — é humano.</p>
          <p style={{ marginTop: 8 }}>O problema surge quando alguém gasta mais do que pode perder baseado em expectativas irreais de ganho.</p>
        </div>

        <h2 className="mat-h2">Quando o VE é positivo</h2>
        <p>Acúmulos muito grandes podem, em teoria, tornar o VE positivo — quando o prêmio supera as probabilidades. Use a calculadora acima: com um prêmio de R$500M e probabilidade de 1/50M, o VE fica positivo mesmo descontando o custo. Isso é real, mas ignora impostos, divisão de prêmio com outros ganhadores e a inflação do próprio valor do prêmio.</p>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 3 pontos</p>
          <ol className="mat-resumo__lista">
            <li>VE = média ponderada de todos os resultados possíveis menos o custo.</li>
            <li>VE negativo não significa "não faça" — depende do contexto e do impacto de cada resultado.</li>
            <li>Loteria tem VE negativo por design, mas isso não é o único motivo pelo qual as pessoas jogam.</li>
          </ol>
        </div>
        <p style={{ marginTop: 24 }}><Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link></p>
      </main>
    </>
  );
}
