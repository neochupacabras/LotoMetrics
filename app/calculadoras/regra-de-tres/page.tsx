import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { CalcRegraDeTres } from "./CalcClient";

export const metadata: Metadata = {
  title: "Calculadora de Regra de Três — LotoAnalítica",
  description: "Resolva regra de três simples direta e inversa instantaneamente. Digite os três valores conhecidos e descubra o quarto. Com explicação do raciocínio.",
  alternates: { canonical: `${SITE_URL}/calculadoras/regra-de-tres` },
  openGraph: { title: "Calculadora de Regra de Três", description: "Direta e inversa — resolva qualquer proporção em segundos.", url: `${SITE_URL}/calculadoras/regra-de-tres`, siteName: SITE_NAME, locale: "pt_BR", type: "website", images: [`${SITE_URL}/opengraph-image`] },
};

export default function CalcRegraDeTresPage() {
  return (
    <>
      <Masthead calculadorasAtiva />
      <main className="container secao" style={{ maxWidth: 720 }}>
        <p className="eyebrow"><Link href="/calculadoras" className="breadcrumb">← Calculadoras</Link></p>
        <div className="calc-header calc-header--rust">
          <span className="calc-header__emoji">⚖️</span>
          <div>
            <p className="calc-header__cat">Matemática básica</p>
            <h1 className="titulo-edicao" style={{ marginBottom: 4 }}>Regra de Três</h1>
            <p style={{ color: "var(--ink-soft)", fontSize: "0.9rem" }}>Direta e inversa — resolva qualquer proporção em segundos</p>
          </div>
        </div>

        <CalcRegraDeTres />

        <div className="calc-info calc-info--rust">
          <strong>Direta:</strong> 3 operários fazem 1 parede em 2 dias. Quantos dias para 6 operários? → A=3, B=2, C=6 → D=1 dia. (Mais operários = menos dias = inversa!)<br /><br />
          <strong>Inversa:</strong> 4 bicos enchem um tanque em 6h. 3 bicos levam quantas horas? → A=4, B=6, C=3 → D=8h.
        </div>

        <div style={{ marginTop: 28 }}>
          <p className="bloco__titulo" style={{ marginBottom: 12 }}>Outras calculadoras</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { href: "/calculadoras/porcentagem",    label: "🏷️ Porcentagem"  },
              { href: "/calculadoras/media-ponderada",label: "🎓 Média Ponderada" },
            ].map(l => (
              <Link key={l.href} href={l.href} className="botao-copiar" style={{ fontSize: "0.85rem" }}>{l.label}</Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
