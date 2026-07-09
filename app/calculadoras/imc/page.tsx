import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { CalcIMC } from "./CalcClient";

export const metadata: Metadata = {
  title: "Calculadora de IMC — LotoAnalítica",
  description: "Calcule seu IMC (Índice de Massa Corporal) e descubra sua classificação segundo a OMS. Insira peso e altura para resultado imediato.",
  alternates: { canonical: `${SITE_URL}/calculadoras/imc` },
  openGraph: { title: "Calculadora de IMC", description: "Calcule seu IMC com classificação completa da OMS.", url: `${SITE_URL}/calculadoras/imc`, siteName: SITE_NAME, locale: "pt_BR", type: "website", images: [`${SITE_URL}/opengraph-image`] },
};

export default function CalcIMCPage() {
  return (
    <>
      <Masthead calculadorasAtiva />
      <main className="container secao" style={{ maxWidth: 720 }}>
        <p className="eyebrow"><Link href="/calculadoras" className="breadcrumb">← Calculadoras</Link></p>
        <div className="calc-header calc-header--rust">
          <span className="calc-header__emoji">⚕️</span>
          <div>
            <p className="calc-header__cat">Matemática básica</p>
            <h1 className="titulo-edicao" style={{ marginBottom: 4 }}>IMC — Índice de Massa Corporal</h1>
            <p style={{ color: "var(--ink-soft)", fontSize: "0.9rem" }}>Classificação completa segundo a OMS</p>
          </div>
        </div>
        <CalcIMC />
        <div className="calc-info calc-info--rust">
          <strong>IMC = peso (kg) ÷ altura² (m²).</strong> O IMC é uma medida de triagem — não considera composição corporal, massa muscular ou distribuição de gordura. Consulte um médico para avaliação completa.
        </div>
        <div style={{ marginTop: 28 }}>
          <p className="bloco__titulo" style={{ marginBottom: 12 }}>Outras calculadoras</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/calculadoras/media-ponderada" className="botao-copiar" style={{ fontSize: "0.85rem" }}>🎓 Média Ponderada</Link>
            <Link href="/calculadoras/diferenca-datas" className="botao-copiar" style={{ fontSize: "0.85rem" }}>📅 Diferença de Datas</Link>
          </div>
        </div>
      </main>
    </>
  );
}
