import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { CalcMediaPonderada } from "./CalcClient";

export const metadata: Metadata = {
  title: "Calculadora de Média Ponderada — LotoAnalítica",
  description: "Calcule a média ponderada com pesos diferentes para cada valor. Ideal para notas escolares com créditos, produtos com quantidades ou qualquer média com pesos.",
  alternates: { canonical: `${SITE_URL}/calculadoras/media-ponderada` },
  openGraph: { title: "Média Ponderada", description: "Calcule médias com pesos — notas, créditos, quantidades.", url: `${SITE_URL}/calculadoras/media-ponderada`, siteName: SITE_NAME, locale: "pt_BR", type: "website", images: [`${SITE_URL}/opengraph-image`] },
};

export default function CalcMediaPonderadaPage() {
  return (
    <>
      <Masthead calculadorasAtiva />
      <main className="container secao" style={{ maxWidth: 720 }}>
        <p className="eyebrow"><Link href="/calculadoras" className="breadcrumb">← Calculadoras</Link></p>
        <div className="calc-header calc-header--pine">
          <span className="calc-header__emoji">🎓</span>
          <div>
            <p className="calc-header__cat">Matemática básica</p>
            <h1 className="titulo-edicao" style={{ marginBottom: 4 }}>Média Ponderada</h1>
            <p style={{ color: "var(--ink-soft)", fontSize: "0.9rem" }}>Calcule a média com pesos diferentes — notas, créditos, quantidades</p>
          </div>
        </div>
        <CalcMediaPonderada />
        <div className="calc-info calc-info--pine">
          <strong>Fórmula:</strong> MP = Σ(valor × peso) ÷ Σ(pesos). Adicione quantos itens precisar. <strong>Exemplos de uso:</strong> notas com pesos diferentes (prova = 4, trabalho = 2), produtos com quantidades, avaliações com critérios ponderados.
        </div>
        <div style={{ marginTop: 28 }}>
          <p className="bloco__titulo" style={{ marginBottom: 12 }}>Relacionados</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/matematica/media-moda-mediana" className="botao-copiar" style={{ fontSize: "0.85rem" }}>📖 Média, Moda e Mediana</Link>
            <Link href="/calculadoras/porcentagem" className="botao-copiar" style={{ fontSize: "0.85rem" }}>🏷️ Porcentagem</Link>
          </div>
        </div>
      </main>
    </>
  );
}
