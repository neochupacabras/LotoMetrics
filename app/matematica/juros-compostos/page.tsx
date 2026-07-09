import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { SimuladorJuros } from "./ConteudoClient";

export const metadata: Metadata = {
  title: "Juros Compostos — Matemática sem mistério | LotoAnalítica",
  description: "O segredo que bancos sabem e a maioria ignora: juros compostos crescem exponencialmente. Entenda a diferença entre juros simples e compostos com exemplos práticos e interativos.",
  alternates: { canonical: `${SITE_URL}/matematica/juros-compostos` },
  openGraph: { title: "Juros Compostos", description: "Por que Einstein chamou juros compostos de oitava maravilha do mundo.", url: `${SITE_URL}/matematica/juros-compostos`, siteName: SITE_NAME, locale: "pt_BR", type: "article", images: [`${SITE_URL}/opengraph-image`] },
};

export default function ArtigoJurosCompostosPage() {
  return (
    <>
      <Masthead matematicaAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow"><Link href="/matematica" className="breadcrumb">← Matemática sem mistério</Link></p>
        <div className="mat-artigo-header mat-artigo-header--ochre">
          <span className="mat-artigo-emoji">📈</span>
          <div>
            <p className="mat-artigo-conceito">Juros compostos e crescimento exponencial</p>
            <h1 className="titulo-edicao">Juros Compostos</h1>
          </div>
        </div>
        <p className="subtitulo-edicao">
          O segredo que bancos sabem e a maioria das pessoas ignora — e por que
          Einstein (segundo a lenda) chamou isso de "oitava maravilha do mundo".
        </p>

        <SimuladorJuros />

        <h2 className="mat-h2">A diferença fundamental</h2>
        <p>
          Em juros <strong>simples</strong>, você ganha juros sempre sobre o valor
          original. R$1.000 a 10% ao ano rende R$100 por ano — todo ano, sempre R$100.
          Após 10 anos: R$2.000.
        </p>
        <p>
          Em juros <strong>compostos</strong>, você ganha juros sobre o valor
          acumulado — incluindo os juros já ganhos. No 1º ano ganha R$100 (agora tem
          R$1.100). No 2º ano ganha 10% de R$1.100 = R$110. No 3º ano, 10% de R$1.210
          = R$121. Os juros crescem todo ano porque a base cresce.
        </p>
        <div className="mat-formula">
          <div className="mat-formula__linha">Simples: M = C × (1 + r × t)</div>
          <div className="mat-formula__exemplo">R$1.000 × (1 + 0,10 × 10) = R$2.000</div>
          <div className="mat-formula__linha" style={{ marginTop: 12 }}>Compostos: M = C × (1 + r)ᵗ</div>
          <div className="mat-formula__exemplo">R$1.000 × (1,10)¹⁰ = R$2.593,74</div>
        </div>

        <h2 className="mat-h2">O crescimento exponencial na prática</h2>
        <p>
          A diferença parece pequena no início — mas use o simulador acima com 30 ou
          40 anos e veja o que acontece. A curva dos juros compostos dobra, triplica,
          explode. Esse é o crescimento exponencial: lento no início, absurdo no final.
        </p>
        <div className="mat-box mat-box--ochre">
          <p className="mat-box__titulo">📐 Regra do 72</p>
          <p>
            Para estimar em quantos anos um investimento dobra com juros compostos,
            divida 72 pela taxa anual. Com 10% ao ano: 72 ÷ 10 = 7,2 anos para dobrar.
            Com 6% ao ano: 72 ÷ 6 = 12 anos. É uma aproximação rápida e surpreendentemente precisa.
          </p>
        </div>

        <h2 className="mat-h2">A faca de dois gumes: dívida</h2>
        <p>
          O mesmo mecanismo que faz investimentos crescerem faz dívidas explodirem.
          Cartão de crédito a 15% ao mês (não é exagero — esse é o rotativo médio
          brasileiro): R$1.000 não pagos viram R$2.011 em 5 meses. Em 1 ano: R$5.350.
          Em 2 anos: R$28.623. O crescimento exponencial trabalha contra quem deve.
        </p>
        <div className="mat-box mat-box--rust">
          <p className="mat-box__titulo">⚠️ Juros compostos e loteria</p>
          <p>
            Quem joga R$20 por semana na loteria gasta R$1.040 por ano. Investido a
            10% ao ano em renda fixa por 20 anos, esse valor se tornaria aproximadamente
            R$63.000 — graças aos juros compostos. Não é argumento contra jogar (o
            valor esperado do lazer tem valor real), mas é útil saber o custo de oportunidade.
          </p>
        </div>

        <h2 className="mat-h2">Por que bancos não explicam isso claramente</h2>
        <p>
          Bancos ganham com juros compostos de duas formas: cobram de devedores
          (onde o efeito exponencial é devastador) e pagam a investidores
          (onde o efeito é benéfico). A assimetria de informação — devedores
          entendendo menos do que credores — é lucrativa para as instituições.
        </p>
        <p>
          Entender juros compostos é uma das habilidades financeiras mais importantes
          que existe, independente de quanto você ganha ou deve.
        </p>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 3 pontos</p>
          <ol className="mat-resumo__lista">
            <li>Juros simples crescem linearmente; compostos crescem exponencialmente — a diferença é enorme no longo prazo.</li>
            <li>Fórmula dos compostos: M = C × (1 + r)ᵗ. Regra do 72: anos para dobrar ≈ 72 ÷ taxa.</li>
            <li>O mesmo efeito que enriquece investidores endivida consumidores — a direção do fluxo muda tudo.</li>
          </ol>
        </div>

        <p style={{ marginTop: 24 }}><Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link></p>
      </main>
    </>
  );
}
