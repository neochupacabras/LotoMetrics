import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { CalcCombinacoes } from "./CalcClient";

export const metadata: Metadata = {
  title: "Calculadora de Combinações C(n,k) — LotoAnalítica",
  description: "Calcule C(n,k) — quantas formas existem de escolher k itens de n sem importar a ordem. Com exemplos de loteria, pôquer e outros casos práticos.",
  alternates: { canonical: `${SITE_URL}/calculadoras/combinacoes` },
  openGraph: { title: "Combinações C(n,k)", description: "Calcule combinações matemáticas com exemplos práticos.", url: `${SITE_URL}/calculadoras/combinacoes`, siteName: SITE_NAME, locale: "pt_BR", type: "website", images: [`${SITE_URL}/opengraph-image`] },
};

export default function CalcCombinacoesPage() {
  return (
    <>
      <Masthead calculadorasAtiva />
      <main className="container secao" style={{ maxWidth: 720 }}>
        <p className="eyebrow"><Link href="/calculadoras" className="breadcrumb">← Calculadoras</Link></p>
        <div className="calc-header calc-header--ochre">
          <span className="calc-header__emoji">🔢</span>
          <div>
            <p className="calc-header__cat">Probabilidade</p>
            <h1 className="titulo-edicao" style={{ marginBottom: 4 }}>Combinações C(n, k)</h1>
            <p style={{ color: "var(--ink-soft)", fontSize: "0.9rem" }}>Quantas formas de escolher k itens de n sem importar a ordem</p>
          </div>
        </div>
        <CalcCombinacoes />
        <div className="calc-info calc-info--ochre">
          <strong>Fórmula:</strong> C(n, k) = n! ÷ (k! × (n−k)!) — onde a ordem não importa. C(25,15) = 3.268.760 combinações possíveis na Lotofácil.
        </div>
        <div style={{ marginTop: 28 }}>
          <p className="bloco__titulo" style={{ marginBottom: 12 }}>Relacionados</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/calculadoras/probabilidade-loteria" className="botao-copiar" style={{ fontSize: "0.85rem" }}>🎯 Probabilidade de Loteria</Link>
            <Link href="/matematica/combinatoria" className="botao-copiar" style={{ fontSize: "0.85rem" }}>📖 Entender Combinatória</Link>
            <Link href="/matematica/fatorial" className="botao-copiar" style={{ fontSize: "0.85rem" }}>📖 Entender Fatorial</Link>
          </div>
        </div>
      </main>
    </>
  );
}
