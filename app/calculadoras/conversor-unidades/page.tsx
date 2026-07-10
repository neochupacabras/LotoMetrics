import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { CalcConversorUnidades } from "./CalcClient";

export const metadata: Metadata = {
  title: "Conversor de Unidades — LotoAnalítica",
  description: "Converta comprimento, peso, volume e temperatura entre as principais unidades do sistema métrico e imperial. Resultado instantâneo.",
  alternates: { canonical: `${SITE_URL}/calculadoras/conversor-unidades` },
  openGraph: { title: "Conversor de Unidades", description: "Comprimento, peso, volume e temperatura, tudo em um só lugar.", url: `${SITE_URL}/calculadoras/conversor-unidades`, siteName: SITE_NAME, locale: "pt_BR", type: "website", images: [`${SITE_URL}/opengraph-image`] },
};

export default function CalcConversorUnidadesPage() {
  return (
    <>
      <Masthead calculadorasAtiva />
      <main className="container secao" style={{ maxWidth: 720 }}>
        <p className="eyebrow"><Link href="/calculadoras" className="breadcrumb">← Calculadoras</Link></p>
        <div className="calc-header calc-header--pine">
          <span className="calc-header__emoji">📏</span>
          <div>
            <p className="calc-header__cat">Matemática</p>
            <h1 className="titulo-edicao" style={{ marginBottom: 4 }}>Conversor de Unidades</h1>
            <p style={{ color: "var(--ink-soft)", fontSize: "0.9rem" }}>Comprimento, peso, volume e temperatura, tudo em um só lugar</p>
          </div>
        </div>
        <CalcConversorUnidades />

        <div style={{ marginTop: 28 }}>
          <p className="bloco__titulo" style={{ marginBottom: 12 }}>Relacionados</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/calculadoras/area-perimetro" className="botao-copiar" style={{ fontSize: "0.85rem" }}>📐 Área e Perímetro</Link>
            <Link href="/calculadoras/porcentagem" className="botao-copiar" style={{ fontSize: "0.85rem" }}>🏷️ Porcentagem</Link>
          </div>
        </div>

        {/* ── Manual de uso ─────────────────────────────────────────────── */}
        <div className="calc-manual">
          <p className="calc-manual__titulo">📖 Como usar o Conversor de Unidades</p>
          <ol className="calc-manual__passos">
            <li className="calc-manual__passo">
              <span className="calc-manual__num">1</span>
              <div className="calc-manual__texto"><strong>Escolha a categoria</strong> — Comprimento, Peso, Volume ou Temperatura.</div>
            </li>
            <li className="calc-manual__passo">
              <span className="calc-manual__num">2</span>
              <div className="calc-manual__texto"><strong>Digite o valor e escolha as unidades</strong> — de onde e para onde converter.</div>
            </li>
            <li className="calc-manual__passo">
              <span className="calc-manual__num">3</span>
              <div className="calc-manual__texto"><strong>Veja o resultado instantâneo</strong> — atualizado a cada mudança, sem precisar clicar em nada.</div>
            </li>
          </ol>
          <div className="calc-manual__dica" dangerouslySetInnerHTML={{__html: "💡 <strong>Temperatura funciona diferente:</strong> Celsius, Fahrenheit e Kelvin não têm um fator de multiplicação simples entre si — por isso essa categoria usa fórmulas próprias de conversão, calculadas por trás dos panos."}} />
        </div>
      </main>
    </>
  );
}
