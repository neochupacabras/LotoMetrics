import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { CalcJurosCompostos } from "./CalcClient";

export const metadata: Metadata = {
  title: "Calculadora de Juros Compostos — LotoAnalítica",
  description: "Calcule montante final, taxa de juros ou prazo em juros compostos. Com tabela de evolução período a período. Ideal para investimentos, financiamentos e dívidas.",
  alternates: { canonical: `${SITE_URL}/calculadoras/juros-compostos` },
  openGraph: { title: "Calculadora de Juros Compostos", description: "Calcule montante, taxa ou prazo com tabela de evolução.", url: `${SITE_URL}/calculadoras/juros-compostos`, siteName: SITE_NAME, locale: "pt_BR", type: "website", images: [`${SITE_URL}/opengraph-image`] },
};

export default function CalcJurosCompostosPage() {
  return (
    <>
      <Masthead calculadorasAtiva />
      <main className="container secao" style={{ maxWidth: 720 }}>
        <p className="eyebrow"><Link href="/calculadoras" className="breadcrumb">← Calculadoras</Link></p>
        <div className="calc-header calc-header--pine">
          <span className="calc-header__emoji">📈</span>
          <div>
            <p className="calc-header__cat">Matemática financeira</p>
            <h1 className="titulo-edicao" style={{ marginBottom: 4 }}>Juros Compostos</h1>
            <p style={{ color: "var(--ink-soft)", fontSize: "0.9rem" }}>Calcule montante, taxa ou prazo — com tabela de evolução</p>
          </div>
        </div>

        <CalcJurosCompostos />

        <div className="calc-info calc-info--pine">
          <strong>Fórmula:</strong> M = C × (1 + i)ⁿ — onde C é o capital, i a taxa por período e n o número de períodos.
          <br /><br />
          <strong>Calcular montante</strong> → informe capital, taxa e prazo.<br />
          <strong>Calcular taxa</strong> → informe capital, montante desejado e prazo.<br />
          <strong>Calcular prazo</strong> → informe capital, montante desejado e taxa.
        </div>

        <div style={{ marginTop: 28 }}>
          <p className="bloco__titulo" style={{ marginBottom: 12 }}>Outras calculadoras</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { href: "/calculadoras/parcelamento",  label: "💳 Parcelamento"  },
              { href: "/calculadoras/porcentagem",   label: "🏷️ Porcentagem"   },
              { href: "/calculadoras/regra-de-tres", label: "⚖️ Regra de Três" },
            ].map(l => (
              <Link key={l.href} href={l.href} className="botao-copiar" style={{ fontSize: "0.85rem" }}>{l.label}</Link>
            ))}
          </div>
        </div>

        <p style={{ marginTop: 24 }}><Link href="/matematica/juros-compostos" className="breadcrumb">📖 Entenda a matemática de juros compostos →</Link></p>
      </main>
    </>
  );
}
