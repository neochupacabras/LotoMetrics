import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { SimuladorDesconto } from "./ConteudoClient";

export const metadata: Metadata = {
  title: "Porcentagem — Matemática sem mistério | LotoAnalítica",
  description: "Por que 50% de desconto sobre o preço com 100% de aumento não te devolve ao preço original. Erros clássicos de porcentagem, juros compostos e variação percentual.",
  alternates: { canonical: `${SITE_URL}/matematica/porcentagem` },
  openGraph: { title: "Porcentagem", description: "Os erros mais comuns com porcentagem — e como evitá-los.", url: `${SITE_URL}/matematica/porcentagem`, siteName: SITE_NAME, locale: "pt_BR", type: "article", images: [`${SITE_URL}/opengraph-image`] },
};

export default function ArtigoPorcentagemPage() {
  return (
    <>
      <Masthead matematicaAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow"><Link href="/matematica" className="breadcrumb">← Matemática sem mistério</Link></p>
        <div className="mat-artigo-header mat-artigo-header--rust">
          <span className="mat-artigo-emoji">🏷️</span>
          <div>
            <p className="mat-artigo-conceito">Razão, proporção e variação percentual (em inglês: <em>percentage and ratio</em>)</p>
            <h1 className="titulo-edicao">Porcentagem</h1>
          </div>
        </div>
        <p className="subtitulo-edicao">
          Por que "50% de desconto sobre o preço com 100% de aumento" não te devolve
          ao preço original — e outros erros clássicos que custam dinheiro.
        </p>

        <SimuladorDesconto />

        <h2 className="mat-h2">O que é porcentagem?</h2>
        <p>
          Porcentagem (do latim <em>per centum</em>, "por cem") é uma forma de
          expressar uma proporção em relação a 100. Quando dizemos que algo
          custa "20% mais caro", queremos dizer que o aumento equivale a
          20 partes de um todo de 100 partes.
        </p>
        <p>
          A notação matemática: 20% = 20/100 = 0,20. Para calcular X% de Y,
          multiplicamos: Y × (X/100) = Y × 0,X.
        </p>
        <div className="mat-formula">
          <div className="mat-formula__linha">X% de Y = Y × (X ÷ 100)</div>
          <div className="mat-formula__exemplo">
            15% de R$350 = R$350 × 0,15 = R$52,50{"\n"}
            25 é que % de 200? → (25 ÷ 200) × 100 = 12,5%
          </div>
        </div>

        <h2 className="mat-h2">O erro mais comum: porcentagens não se somam</h2>
        <p>
          Um produto custava R$100. O preço subiu 50% (agora custa R$150).
          Depois veio um desconto de 50% sobre o novo preço. Qual o preço final?
        </p>
        <p>
          A maioria responde "R$100". A resposta correta é <strong>R$75</strong>.
        </p>
        <p>
          Por quê? O desconto de 50% é calculado sobre o novo preço (R$150),
          não sobre o original (R$100). 50% de R$150 = R$75. O aumento e o
          desconto têm a mesma porcentagem, mas bases diferentes.
        </p>
        <div className="mat-formula">
          <div className="mat-formula__linha">Preço final = P × (1 + a/100) × (1 − d/100)</div>
          <div className="mat-formula__exemplo">
            R$100 × 1,50 × 0,50 = R$75{"\n"}
            Para voltar ao original: d = a ÷ (1 + a/100){"\n"}
            Com 50% de aumento, precisa de 33,3% de desconto (não 50%)
          </div>
        </div>

        <h2 className="mat-h2">Porcentagem de porcentagem — outro erro clássico</h2>
        <p>
          "A taxa de desemprego caiu de 12% para 10%." Caiu quanto?
        </p>
        <p>
          Resposta errada (mas comum): "2 por cento". Resposta correta:
          "2 pontos percentuais" — ou "16,7% em termos relativos"
          (porque 2 é 16,7% de 12).
        </p>
        <p>
          Ponto percentual (em inglês: <em>percentage point</em>) é a diferença
          absoluta entre duas porcentagens. Variação relativa é a mudança em
          relação ao valor original. Confundir os dois é um erro frequente
          em noticiários e relatórios — e pode ser usado para inflar ou
          minimizar mudanças dependendo do interesse.
        </p>

        <div className="mat-box mat-box--rust">
          <p className="mat-box__titulo">📰 Como manchetes enganam com porcentagens</p>
          <p>
            "Risco de câncer aumenta 100% com consumo de produto X."
            Parece alarmante. Mas se o risco base era de 0,001% (1 em 100.000),
            um aumento de 100% o leva para 0,002% (2 em 100.000). O risco
            dobrou — mas ainda é mínimo em termos absolutos.
          </p>
          <p style={{ marginTop: 8 }}>
            A regra: sempre pergunte qual é a base quando alguém cita
            uma variação percentual. "50% mais eficaz" que quê? 50% de quanto?
          </p>
        </div>

        <h2 className="mat-h2">Porcentagem e loteria: retorno ao apostador</h2>
        <p>
          A Caixa divulga que repassa aproximadamente 45% da arrecadação
          em prêmios na Mega-Sena. Isso significa que, a cada R$100 apostados
          por todos os jogadores juntos, R$45 voltam como prêmio e R$55
          ficam com a Caixa (destinados a educação, despesas operacionais etc.).
        </p>
        <p>
          Esse percentual se chama <strong>retorno ao apostador</strong> (em inglês:{" "}
          <em>return to player</em> ou RTP). Para a Lotofácil, é um pouco mais
          alto — cerca de 55%. Para comparação, máquinas caça-níqueis em cassinos
          legalizados costumam ter RTP entre 85% e 98%.
        </p>
        <p>
          Use a página de{" "}
          <Link href="/dicas/retorno-ao-apostador" className="breadcrumb">
            retorno ao apostador
          </Link>{" "}
          para ver os percentuais por loteria.
        </p>

        <h2 className="mat-h2">Juros compostos: porcentagem acumulada ao longo do tempo</h2>
        <p>
          Uma inflação de 5% ao ano por 10 anos não resulta em 50% de aumento
          — resulta em 62,9%. Porque cada ano aplica os 5% sobre o preço{" "}
          <em>já corrigido</em> do ano anterior:
        </p>
        <div className="mat-formula">
          <div className="mat-formula__linha">Fator acumulado = (1 + taxa)ⁿ</div>
          <div className="mat-formula__exemplo">
            (1,05)¹⁰ = 1,629 → aumento de 62,9% (não 50%){"\n"}
            (1,10)¹⁰ = 2,594 → quase triplicou com 10% ao ano por 10 anos
          </div>
        </div>
        <p>
          Esse é o princípio dos{" "}
          <Link href="/matematica/juros-compostos" className="breadcrumb">
            juros compostos
          </Link>{" "}
          — a porcentagem incide sobre uma base que cresce. É o mesmo mecanismo
          que faz investimentos crescerem, dívidas explodirem e a inflação
          acumulada surpreender quem não conta direito.
        </p>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 4 pontos</p>
          <ol className="mat-resumo__lista">
            <li>Porcentagem é sempre relativa a uma base — mudar a base muda o resultado.</li>
            <li>Aumento e desconto da mesma porcentagem não se cancelam: as bases são diferentes.</li>
            <li>Ponto percentual ≠ variação relativa. "Subiu 2 pontos" é diferente de "subiu 2%".</li>
            <li>Porcentagens compostas (inflação, juros) multiplicam ao longo do tempo, não somam.</li>
          </ol>
        </div>
        <p style={{ marginTop: 24 }}><Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link></p>
      </main>
    </>
  );
}
