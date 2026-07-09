import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { CalcParcelamento } from "./CalcClient";

export const metadata: Metadata = {
  title: "Calculadora de Parcelamento — LotoAnalítica",
  description: "Descubra a taxa de juros real embutida em qualquer parcelamento. Informe o preço à vista, número de parcelas e valor de cada parcela.",
  alternates: { canonical: `${SITE_URL}/calculadoras/parcelamento` },
  openGraph: { title: "Calculadora de Parcelamento", description: "Descubra os juros escondidos em qualquer parcelamento.", url: `${SITE_URL}/calculadoras/parcelamento`, siteName: SITE_NAME, locale: "pt_BR", type: "website", images: [`${SITE_URL}/opengraph-image`] },
};

export default function CalcParcelamentoPage() {
  return (
    <>
      <Masthead calculadorasAtiva />
      <main className="container secao" style={{ maxWidth: 720 }}>
        <p className="eyebrow"><Link href="/calculadoras" className="breadcrumb">← Calculadoras</Link></p>
        <div className="calc-header calc-header--ochre">
          <span className="calc-header__emoji">💳</span>
          <div>
            <p className="calc-header__cat">Financeira</p>
            <h1 className="titulo-edicao" style={{ marginBottom: 4 }}>Parcelamento e Juros</h1>
            <p style={{ color: "var(--ink-soft)", fontSize: "0.9rem" }}>Descubra a taxa real embutida em qualquer parcelamento</p>
          </div>
        </div>
        <CalcParcelamento />
        <div className="calc-info calc-info--ochre">
          <strong>Como funciona:</strong> a calculadora usa a fórmula de juros compostos para descobrir qual taxa mensal transforma o preço à vista no total pago parcelado. Parcelamento "sem juros" pode não ser o que parece se o preço à vista for diferente.
        </div>
        <div style={{ marginTop: 28 }}>
          <p className="bloco__titulo" style={{ marginBottom: 12 }}>Relacionados</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/calculadoras/juros-compostos" className="botao-copiar" style={{ fontSize: "0.85rem" }}>📈 Juros Compostos</Link>
            <Link href="/matematica/juros-compostos" className="botao-copiar" style={{ fontSize: "0.85rem" }}>📖 Entender Juros Compostos</Link>
          </div>
        </div>
        {/* ── Manual de uso ─────────────────────────────────────────────── */}
        <div className="calc-manual">
          <p className="calc-manual__titulo">📖 Como usar a Calculadora de Parcelamento</p>
          <ol className="calc-manual__passos">
          <li className="calc-manual__passo">
            <span className="calc-manual__num">1</span>
            <div className="calc-manual__texto"><strong>Informe o preço à vista</strong> — <span dangerouslySetInnerHTML={{__html: "Digite o preço que o produto custa quando pago à vista (ou em dinheiro). Este é o valor de referência para o cálculo dos juros."}} /></div>
          </li>
          <li className="calc-manual__passo">
            <span className="calc-manual__num">2</span>
            <div className="calc-manual__texto"><strong>Informe o número de parcelas</strong> — <span dangerouslySetInnerHTML={{__html: "Quantas vezes o produto é parcelado — ex: 12x, 24x."}} /></div>
          </li>
          <li className="calc-manual__passo">
            <span className="calc-manual__num">3</span>
            <div className="calc-manual__texto"><strong>Informe o valor de cada parcela</strong> — <span dangerouslySetInnerHTML={{__html: "O valor mensal de cada parcela conforme anunciado na loja. A calculadora usa os três valores para descobrir qual é a taxa de juros embutida."}} /></div>
          </li>
          <li className="calc-manual__passo">
            <span className="calc-manual__num">4</span>
            <div className="calc-manual__texto"><strong>Interprete o resultado</strong> — <span dangerouslySetInnerHTML={{__html: "Aparece a taxa mensal real, a taxa anual equivalente, o total pago, os juros totais em reais e o percentual de custo extra. Um aviso indica se a taxa é razoável, moderada ou alta."}} /></div>
          </li>
          </ol>
          <div className="calc-manual__dica" dangerouslySetInnerHTML={{__html: "💡 <strong>Cuidado com parcelamentos 'sem juros':</strong> às vezes o preço à vista já está inflado para compensar o parcelamento. Compare o preço à vista em outras lojas antes de usar como referência."}} />
        </div>


      </main>
    </>
  );
}
