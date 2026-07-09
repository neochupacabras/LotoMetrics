import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { CalcProbLoteria } from "./CalcClient";

export const metadata: Metadata = {
  title: "Calculadora de Probabilidade de Loteria — LotoAnalítica",
  description: "Descubra a chance exata de acertar qualquer faixa em Lotofácil, Mega-Sena, Quina, Lotomania, Dia de Sorte, +Milionária, Timemania, Dupla Sena e Super Sete.",
  alternates: { canonical: `${SITE_URL}/calculadoras/probabilidade-loteria` },
  openGraph: { title: "Probabilidade de Loteria", description: "Chance exata de acertar qualquer faixa em 9 loterias diferentes.", url: `${SITE_URL}/calculadoras/probabilidade-loteria`, siteName: SITE_NAME, locale: "pt_BR", type: "website", images: [`${SITE_URL}/opengraph-image`] },
};

export default function CalcProbLoteriaPage() {
  return (
    <>
      <Masthead calculadorasAtiva />
      <main className="container secao" style={{ maxWidth: 720 }}>
        <p className="eyebrow"><Link href="/calculadoras" className="breadcrumb">← Calculadoras</Link></p>
        <div className="calc-header calc-header--rust">
          <span className="calc-header__emoji">🎯</span>
          <div>
            <p className="calc-header__cat">Probabilidade</p>
            <h1 className="titulo-edicao" style={{ marginBottom: 4 }}>Probabilidade de Loteria</h1>
            <p style={{ color: "var(--ink-soft)", fontSize: "0.9rem" }}>Chance exata de acertar qualquer faixa em 9 loterias</p>
          </div>
        </div>

        <CalcProbLoteria />

        <div className="calc-info calc-info--rust">
          <strong>Como funciona:</strong> as probabilidades são calculadas pela fórmula de combinações hipergeométricas — a mesma usada pela Caixa Econômica Federal. Ao apostar mais dezenas, você cobre mais combinações e aumenta proporcionalmente a chance de cada faixa.
        </div>

        <div style={{ marginTop: 28 }}>
          <p className="bloco__titulo" style={{ marginBottom: 12 }}>Veja também</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { href: "/calculadoras/combinacoes",    label: "🔢 Combinações C(n,k)" },
              { href: "/lotofacil/probabilidades",    label: "📊 Probabilidades Lotofácil" },
              { href: "/megasena/probabilidades",     label: "📊 Probabilidades Mega-Sena" },
              { href: "/matematica/combinatoria",     label: "📖 Entenda combinatória"  },
            ].map(l => (
              <Link key={l.href} href={l.href} className="botao-copiar" style={{ fontSize: "0.85rem" }}>{l.label}</Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
