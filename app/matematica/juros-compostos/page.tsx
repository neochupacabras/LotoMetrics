import Link from "next/link";
import type {{ Metadata }} from "next";
import Masthead from "@/components/Masthead";
import {{ SITE_URL, SITE_NAME }} from "@/lib/seo";
import {{ SimuladorJuros }} from "./ConteudoClient";

export const metadata: Metadata = {{
  title: "Juros Compostos — Matemática sem mistério | LotoAnalítica",
  description: "O segredo que bancos sabem e a maioria ignora. Entenda juros simples vs compostos, a Regra do 72 e por que dívida de cartão de crédito cresce tão rápido.",
  alternates: {{ canonical: `${{SITE_URL}}/matematica/juros-compostos` }},
  openGraph: {{ title: "Juros Compostos", description: "Por que Einstein chamou juros compostos de oitava maravilha do mundo.", url: `${{SITE_URL}}/matematica/juros-compostos`, siteName: SITE_NAME, locale: "pt_BR", type: "article", images: [`${{SITE_URL}}/opengraph-image`] }},
}};

export default function ArtigoJurosCompostosPage() {{
  return (
    <>
      <Masthead matematicaAtiva />
      <main className="container secao" style={{{{ maxWidth: 760 }}}}>
        <p className="eyebrow"><Link href="/matematica" className="breadcrumb">← Matemática sem mistério</Link></p>
        <div className="mat-artigo-header mat-artigo-header--ochre">
          <span className="mat-artigo-emoji">📈</span>
          <div>
            <p className="mat-artigo-conceito">Juros compostos e crescimento exponencial (em inglês: <em>compound interest</em>)</p>
            <h1 className="titulo-edicao">Juros Compostos</h1>
          </div>
        </div>
        <p className="subtitulo-edicao">
          O segredo que bancos sabem e a maioria das pessoas ignora — e por que
          Albert Einstein (segundo a lenda) chamou os juros compostos de
          "a oitava maravilha do mundo".
        </p>

        <SimuladorJuros />

        <h2 className="mat-h2">A diferença fundamental: juros sobre juros</h2>
        <p>Em juros <strong>simples</strong>, você ganha juros sempre sobre o valor original. R$1.000 a 10% ao ano rende R$100 por ano — todo ano, sempre R$100, sempre sobre os mesmos R$1.000. Após 10 anos: R$2.000.</p>
        <p>Em juros <strong>compostos</strong>, você ganha juros sobre o valor acumulado — incluindo os juros já ganhos. No 1º ano: +R$100 (agora tem R$1.100). No 2º: +R$110 (10% de R$1.100 = R$110). No 3º: +R$121. Os juros crescem todo ano porque a base cresce. Após 10 anos: R$2.593,74.</p>
        <div className="mat-formula">
          <div className="mat-formula__linha">Simples: M = C × (1 + r × t)</div>
          <div className="mat-formula__exemplo">R$1.000 × (1 + 0,10 × 10) = R$2.000</div>
          <div className="mat-formula__linha" style={{{{ marginTop: 12 }}}}>Compostos: M = C × (1 + r)ᵗ</div>
          <div className="mat-formula__exemplo">R$1.000 × (1,10)¹⁰ = R$2.593,74</div>
        </div>

        <h2 className="mat-h2">A Regra do 72 — cálculo mental rápido</h2>
        <p>Para estimar em quantos períodos um capital dobra com juros compostos, divide-se 72 pela taxa:</p>
        <div className="mat-formula">
          <div className="mat-formula__linha">Períodos para dobrar ≈ 72 ÷ taxa (%)</div>
          <div className="mat-formula__exemplo">10% ao ano → 72÷10 = 7,2 anos para dobrar{"
"}1% ao mês → 72÷1 = 72 meses = 6 anos para dobrar{"
"}15% ao mês (cartão) → 72÷15 = 4,8 meses para dobrar a dívida</div>
        </div>
        <p>A regra do 72 é uma aproximação muito precisa para taxas entre 6% e 20%. Para taxas extremas, o resultado é menos preciso — mas ainda útil como estimativa mental rápida.</p>

        <h2 className="mat-h2">O lado sombrio: dívida de cartão de crédito</h2>
        <p>O mesmo mecanismo que enriquece investidores pacientemente destrói devedores. O rotativo do cartão de crédito no Brasil cobra taxas médias de 15% ao mês — uma das mais altas do mundo.</p>
        <p>Com 15% ao mês, pela Regra do 72: a dívida dobra em 72÷15 ≈ 4,8 meses. Em um ano, R$1.000 de dívida não paga vira R$1.000 × (1,15)¹² ≈ R$5.350. Em dois anos: R$28.600.</p>
        <div className="mat-box mat-box--rust">
          <p className="mat-box__titulo">⚠️ Comparação: investimento vs dívida</p>
          <p>R$1.000 investidos a 10% ao ano por 10 anos → R$2.593 (+159%)</p>
          <p style={{{{ marginTop: 6 }}}}>R$1.000 de dívida no cartão a 15% ao mês por 12 meses → R$5.350 (+435%)</p>
          <p style={{{{ marginTop: 6 }}}}>O juro composto trabalha lentamente para investidores e rapidamente contra devedores. A diferença: a taxa mensal do cartão é o triplo da taxa anual típica de investimento — mas incide mensalmente.</p>
        </div>

        <h2 className="mat-h2">Juros compostos e o longo prazo: o poder do tempo</h2>
        <p>O maior aliado dos juros compostos não é a taxa — é o tempo. Considere duas pessoas:</p>
        <p><strong>Ana</strong> investe R$5.000 por ano dos 25 aos 35 anos (10 anos) e depois para. Total investido: R$50.000.</p>
        <p><strong>Bruno</strong> investe R$5.000 por ano dos 35 aos 65 anos (30 anos). Total investido: R$150.000.</p>
        <p>Com 8% ao ano, quem tem mais aos 65 anos? Ana, com R$787.000 contra R$611.000 de Bruno — apesar de ter investido R$100.000 a menos. Os 10 anos de vantagem de Ana valem mais do que 30 anos de investimento de Bruno.</p>

        <h2 className="mat-h2">Juros compostos e loteria</h2>
        <p>Quem joga R$20 por semana na Mega-Sena gasta R$1.040 por ano. Investindo esse valor a 8% ao ano em renda fixa por 30 anos, teria aproximadamente R$130.000. Por <Link href="/matematica/valor-esperado" className="breadcrumb">valor esperado</Link>, a loteria devolve ~45% em prêmios — ou seja, o valor esperado de R$1.040 investidos em loteria por ano é ~R$468. O custo de oportunidade de 30 anos é enorme.</p>
        <p>Isso não é argumento contra jogar — o lazer e a expectativa têm valor real. Mas é útil ter clareza sobre o custo financeiro da decisão.</p>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 4 pontos</p>
          <ol className="mat-resumo__lista">
            <li>Juros simples: incide sempre sobre o principal. Compostos: incide sobre principal + juros acumulados.</li>
            <li>Fórmula: M = C × (1 + r)ᵗ. Regra do 72: períodos para dobrar ≈ 72 ÷ taxa.</li>
            <li>O tempo é mais importante que a taxa — começar cedo tem mais impacto que taxas maiores.</li>
            <li>O mesmo mecanismo que gera riqueza lentamente cria dívidas rapidamente com taxas altas.</li>
          </ol>
        </div>
        <p style={{{{ marginTop: 24 }}}}><Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link></p>
      </main>
    </>
  );
}}