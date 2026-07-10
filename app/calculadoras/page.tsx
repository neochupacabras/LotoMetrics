import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { CALCULADORAS, CATEGORIAS_CALC } from "@/lib/calculadoras";

export const metadata: Metadata = {
  title: "Calculadoras online gratuitas — LotoAnalítica",
  description:
    "Calculadoras de porcentagem, juros compostos, regra de três, datas, combinações, probabilidade de loteria, área, IMC e mais. Simples, rápidas e sem cadastro.",
  alternates: { canonical: `${SITE_URL}/calculadoras` },
  openGraph: {
    title: "Calculadoras online gratuitas — LotoAnalítica",
    description: "Calculadoras de matemática, finanças e probabilidade. Simples, rápidas e sem cadastro.",
    url: `${SITE_URL}/calculadoras`,
    siteName: SITE_NAME, locale: "pt_BR", type: "website",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

const COR_BG: Record<string, string> = {
  pine:  "var(--pine)",
  ochre: "var(--ochre)",
  rust:  "var(--rust)",
};

const COR_LIGHT: Record<string, string> = {
  pine:  "color-mix(in srgb, var(--pine)  12%, transparent)",
  ochre: "color-mix(in srgb, var(--ochre) 12%, transparent)",
  rust:  "color-mix(in srgb, var(--rust)  12%, transparent)",
};

const categorias = Object.entries(CATEGORIAS_CALC) as [keyof typeof CATEGORIAS_CALC, { label: string; cor: string }][];

export default function CalculadorasPage() {
  return (
    <>
      <Masthead calculadorasAtiva />
      <main className="container secao" style={{ maxWidth: 920 }}>
        <p className="eyebrow">Ferramentas</p>
        <h1 className="titulo-edicao">Calculadoras</h1>
        <p className="subtitulo-edicao" style={{ maxWidth: 620 }}>
          Calculadoras online gratuitas para o dia a dia — porcentagem, juros,
          datas, geometria, probabilidade e mais. Resultado imediato, sem cadastro
          e sem anúncios.
        </p>

        {/* Stats rápidas */}
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", margin: "24px 0 36px" }}>
          {[
            { numero: "14", label: "calculadoras" },
            { numero: "6", label: "categorias" },
            { numero: "0", label: "cadastros necessários" },
          ].map(({ numero, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "2rem", fontWeight: 700, color: "var(--pine)", lineHeight: 1 }}>{numero}</div>
              <div style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Grade por categoria */}
        {categorias.map(([catKey, catInfo]) => {
          const calcs = CALCULADORAS.filter(c => c.categoria === catKey);
          if (calcs.length === 0) return null;
          return (
            <section key={catKey} style={{ marginBottom: 40 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{
                  padding: "3px 12px", borderRadius: 20,
                  background: COR_BG[catInfo.cor],
                  color: "#fff", fontSize: "0.72rem", fontFamily: "var(--font-mono)",
                  textTransform: "uppercase", letterSpacing: "0.07em",
                }}>
                  {catInfo.label}
                </span>
              </div>
              <div className="calc-grade">
                {calcs.map(c => (
                  <Link key={c.slug} href={`/calculadoras/${c.slug}`} className="calc-card">
                    <div className="calc-card__topo" style={{ background: COR_BG[c.cor] }}>
                      <span className="calc-card__emoji">{c.emoji}</span>
                      <span className="calc-card__categoria">{CATEGORIAS_CALC[c.categoria].label}</span>
                    </div>
                    <div className="calc-card__corpo">
                      <h2 className="calc-card__titulo">{c.titulo}</h2>
                      <p className="calc-card__subtitulo">{c.subtitulo}</p>
                      <span className="calc-card__cta">Abrir calculadora →</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </>
  );
}
