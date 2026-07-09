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
        {/* ── Manual de uso ─────────────────────────────────────────────── */}
        <div className="calc-manual">
          <p className="calc-manual__titulo">📖 Como usar a Calculadora de Regra de Três</p>
          <ol className="calc-manual__passos">
          <li className="calc-manual__passo">
            <span className="calc-manual__num">1</span>
            <div className="calc-manual__texto"><strong>Escolha o tipo: direta ou inversa</strong> — <span dangerouslySetInnerHTML={{__html: "Se quando A aumenta, D também aumenta → <strong>direta</strong> (mais peças produzidas, mais material gasto). Se quando A aumenta, D diminui → <strong>inversa</strong> (mais operários, menos dias para terminar)."}} /></div>
          </li>
          <li className="calc-manual__passo">
            <span className="calc-manual__num">2</span>
            <div className="calc-manual__texto"><strong>Preencha os três valores conhecidos</strong> — <span dangerouslySetInnerHTML={{__html: "A regra de três tem 4 valores: A, B, C e D. Você preenche os três que conhece (A, B e C), e a calculadora encontra D automaticamente."}} /></div>
          </li>
          <li className="calc-manual__passo">
            <span className="calc-manual__num">3</span>
            <div className="calc-manual__texto"><strong>Leia o resultado no campo D</strong> — <span dangerouslySetInnerHTML={{__html: "O campo D (em verde) mostra o resultado. A fórmula usada também aparece abaixo — direta: D = B×C÷A / inversa: D = A×B÷C."}} /></div>
          </li>
          <li className="calc-manual__passo">
            <span className="calc-manual__num">4</span>
            <div className="calc-manual__texto"><strong>Dica para identificar direta ou inversa</strong> — <span dangerouslySetInnerHTML={{__html: "Pergunte: 'se A dobrar, D dobra também?' Se sim → direta. 'Se A dobrar, D cai pela metade?' → inversa."}} /></div>
          </li>
          </ol>
          <div className="calc-manual__dica" dangerouslySetInnerHTML={{__html: "💡 <strong>Exemplo direto:</strong> 3 pintores pintam 1 casa em 2 dias. Quantos dias para 5 pintores? Aqui: mais pintores = menos dias → inversa. A=3, B=2, C=5, D = 3×2÷5 = 1,2 dias."}} />
        </div>


      </main>
    </>
  );
}
