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
      </main>
    </>
  );
}
