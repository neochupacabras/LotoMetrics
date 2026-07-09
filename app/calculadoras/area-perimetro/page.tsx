import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { CalcAreaPerimetro } from "./CalcClient";

export const metadata: Metadata = {
  title: "Calculadora de Área e Perímetro — LotoAnalítica",
  description: "Calcule área e perímetro de círculo, retângulo, quadrado e triângulo. Com visualização proporcional da figura e fórmulas explicadas.",
  alternates: { canonical: `${SITE_URL}/calculadoras/area-perimetro` },
  openGraph: { title: "Área e Perímetro", description: "Círculo, retângulo, quadrado e triângulo com visualização.", url: `${SITE_URL}/calculadoras/area-perimetro`, siteName: SITE_NAME, locale: "pt_BR", type: "website", images: [`${SITE_URL}/opengraph-image`] },
};

export default function CalcAreaPage() {
  return (
    <>
      <Masthead calculadorasAtiva />
      <main className="container secao" style={{ maxWidth: 720 }}>
        <p className="eyebrow"><Link href="/calculadoras" className="breadcrumb">← Calculadoras</Link></p>
        <div className="calc-header calc-header--pine">
          <span className="calc-header__emoji">📐</span>
          <div>
            <p className="calc-header__cat">Geometria</p>
            <h1 className="titulo-edicao" style={{ marginBottom: 4 }}>Área e Perímetro</h1>
            <p style={{ color: "var(--ink-soft)", fontSize: "0.9rem" }}>Círculo, retângulo, quadrado e triângulo — com visualização proporcional</p>
          </div>
        </div>
        <CalcAreaPerimetro />
        <div className="calc-info calc-info--pine">
          Para o <strong>triângulo</strong>, informe os três lados e a área é calculada pela fórmula de Heron. O triângulo precisa satisfazer a desigualdade triangular (a soma de dois lados deve ser maior que o terceiro).
        </div>
        <div style={{ marginTop: 28 }}>
          <p className="bloco__titulo" style={{ marginBottom: 12 }}>Relacionados</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/matematica/geometria-cotidiano" className="botao-copiar" style={{ fontSize: "0.85rem" }}>📖 Geometria no Cotidiano</Link>
            <Link href="/calculadoras/porcentagem" className="botao-copiar" style={{ fontSize: "0.85rem" }}>🏷️ Porcentagem</Link>
          </div>
        </div>
        {/* ── Manual de uso ─────────────────────────────────────────────── */}
        <div className="calc-manual">
          <p className="calc-manual__titulo">📖 Como usar a Calculadora de Área e Perímetro</p>
          <ol className="calc-manual__passos">
          <li className="calc-manual__passo">
            <span className="calc-manual__num">1</span>
            <div className="calc-manual__texto"><strong>Escolha a figura geométrica</strong> — <span dangerouslySetInnerHTML={{__html: "Clique em <strong>Círculo</strong>, <strong>Retângulo</strong>, <strong>Quadrado</strong> ou <strong>Triângulo</strong>. Os campos de entrada mudam conforme a figura."}} /></div>
          </li>
          <li className="calc-manual__passo">
            <span className="calc-manual__num">2</span>
            <div className="calc-manual__texto"><strong>Preencha as dimensões</strong> — <span dangerouslySetInnerHTML={{__html: "Informe as dimensões na mesma unidade (cm, m, km). Para o triângulo, informe os três lados (a, b, c) — a área é calculada pela fórmula de Heron."}} /></div>
          </li>
          <li className="calc-manual__passo">
            <span className="calc-manual__num">3</span>
            <div className="calc-manual__texto"><strong>Veja a visualização proporcional</strong> — <span dangerouslySetInnerHTML={{__html: "Um desenho SVG da figura aparece proporcional às dimensões informadas, junto com os valores de área (em unidades²) e perímetro (em unidades)."}} /></div>
          </li>
          <li className="calc-manual__passo">
            <span className="calc-manual__num">4</span>
            <div className="calc-manual__texto"><strong>Leia a fórmula aplicada</strong> — <span dangerouslySetInnerHTML={{__html: "A fórmula utilizada aparece em texto abaixo do resultado — útil para estudar ou verificar o cálculo manualmente."}} /></div>
          </li>
          </ol>
          <div className="calc-manual__dica" dangerouslySetInnerHTML={{__html: "💡 <strong>Atenção para o triângulo:</strong> os três lados precisam satisfazer a desigualdade triangular (a soma de dois lados deve ser maior que o terceiro). Caso contrário, o triângulo não existe e a área não será calculada."}} />
        </div>


      </main>
    </>
  );
}
