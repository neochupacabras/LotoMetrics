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
        {/* ── Manual de uso ─────────────────────────────────────────────── */}
        <div className="calc-manual">
          <p className="calc-manual__titulo">📖 Como usar a Calculadora de IMC</p>
          <ol className="calc-manual__passos">
          <li className="calc-manual__passo">
            <span className="calc-manual__num">1</span>
            <div className="calc-manual__texto"><strong>Informe seu peso em quilogramas</strong> — <span dangerouslySetInnerHTML={{__html: "Use ponto ou vírgula como separador decimal (ex: 70.5 ou 70,5). O campo aceita casas decimais."}} /></div>
          </li>
          <li className="calc-manual__passo">
            <span className="calc-manual__num">2</span>
            <div className="calc-manual__texto"><strong>Informe sua altura em metros</strong> — <span dangerouslySetInnerHTML={{__html: "Use o formato com ponto decimal (ex: 1.75 para 1 metro e 75 centímetros). Atenção: a altura deve estar em metros, não em centímetros."}} /></div>
          </li>
          <li className="calc-manual__passo">
            <span className="calc-manual__num">3</span>
            <div className="calc-manual__texto"><strong>Veja o resultado e a classificação</strong> — <span dangerouslySetInnerHTML={{__html: "Seu IMC aparece com uma casa decimal, junto com a classificação da OMS (Organização Mundial da Saúde) em uma escala visual com todas as faixas."}} /></div>
          </li>
          <li className="calc-manual__passo">
            <span className="calc-manual__num">4</span>
            <div className="calc-manual__texto"><strong>Entenda as limitações</strong> — <span dangerouslySetInnerHTML={{__html: "O IMC é uma medida de triagem populacional, não de saúde individual. Não considera massa muscular, distribuição de gordura, idade ou sexo. Consulte um médico para avaliação completa."}} /></div>
          </li>
          </ol>
          <div className="calc-manual__dica" dangerouslySetInnerHTML={{__html: "💡 <strong>Lembrete:</strong> atletas com muita massa muscular podem ter IMC alto mesmo com baixo percentual de gordura. Da mesma forma, pessoas sedentárias podem ter IMC normal com excesso de gordura corporal."}} />
        </div>


      </main>
    </>
  );
}
