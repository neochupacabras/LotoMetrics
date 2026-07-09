import Link from "next/link";
import Masthead from "@/components/Masthead";
import { SimuladorDesconto } from "./ConteudoClient";
export default function ArtigoPorcentagemPage() {
  return (
    <>
      <Masthead matematicaAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow"><Link href="/matematica" className="breadcrumb">← Matemática sem mistério</Link></p>
        <div className="mat-artigo-header mat-artigo-header--rust">
          <span className="mat-artigo-emoji">🏷️</span>
          <div>
            <p className="mat-artigo-conceito">Razão, proporção e variação percentual</p>
            <h1 className="titulo-edicao">Porcentagem</h1>
          </div>
        </div>
        <p className="subtitulo-edicao">Por que "50% de desconto sobre o preço com 100% de aumento" não te devolve ao preço original — e outros erros clássicos com porcentagem.</p>

        <SimuladorDesconto />

        <h2 className="mat-h2">O erro mais comum com porcentagem</h2>
        <p>Um produto custava R$100. O preço subiu 100% (agora custa R$200). Depois veio um desconto de 50% sobre o novo preço. Qual o preço final?</p>
        <p>Resposta: R$100. Coincidência? Não — nesse caso específico, 100% de aumento seguido de 50% de desconto cancela. Mas experimente com 50% de aumento e 50% de desconto:</p>
        <div className="mat-formula">
          <div className="mat-formula__linha">R$100 + 50% = R$150 → R$150 − 50% = R$75</div>
          <div className="mat-formula__exemplo">Perdeu R$25, não voltou ao original!</div>
        </div>
        <p>O motivo: o desconto é calculado sobre o preço aumentado (maior), não sobre o original. 50% de R$150 = R$75, não R$50.</p>

        <div className="mat-box mat-box--ochre">
          <p className="mat-box__titulo">📐 A fórmula correta</p>
          <p>Para um aumento de a% seguido de um desconto de d%, o preço final é:</p>
          <p style={{ fontFamily: "var(--font-mono)", marginTop: 8 }}>Preço_final = Preço × (1 + a/100) × (1 − d/100)</p>
          <p style={{ marginTop: 8 }}>Para voltar exatamente ao original, você precisa que (1 + a/100) × (1 − d/100) = 1, ou seja, d = a/(1 + a/100).</p>
        </div>

        <h2 className="mat-h2">Porcentagem na loteria</h2>
        <p>Quando o governo diz que a Caixa repassa "45% da arrecadação em prêmios", isso significa que o VE de cada real apostado é R$0,45. Esse é o "retorno ao apostador" — o contrário do "take rate" da casa, que é 55%. Use a ferramenta de <Link href="/dicas/retorno-ao-apostador" className="breadcrumb">retorno ao apostador</Link> para ver isso por loteria.</p>

        <h2 className="mat-h2">Inflação composta — porcentagem ao longo do tempo</h2>
        <p>Se a inflação é 5% ao ano por 10 anos, o preço não sobe 50% — sobe 62,9%. Porque cada ano aplica 5% sobre o preço <em>já inflacionado</em> do ano anterior: 1,05¹⁰ = 1,629. Esse é o juros composto — a mesma lógica do rendimento de investimentos e das dívidas que crescem se não pagas.</p>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 3 pontos</p>
          <ol className="mat-resumo__lista">
            <li>Porcentagem é sempre relativa a uma base — mudar a base muda o resultado.</li>
            <li>Aumento e desconto iguais não se cancelam: a base do desconto é maior que a original.</li>
            <li>Porcentagens compostas (juros, inflação) multiplicam — não somam.</li>
          </ol>
        </div>
        <p style={{ marginTop: 24 }}><Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link></p>
      </main>
    </>
  );
}
