import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { CalcCombinacoes } from "./CalcClient";

export const metadata: Metadata = {
  title: "Calculadora de Combinações C(n,k) — LotoAnalítica",
  description: "Calcule C(n,k) — quantas formas existem de escolher k itens de n sem importar a ordem. Com exemplos de loteria, pôquer e outros casos práticos.",
  alternates: { canonical: `${SITE_URL}/calculadoras/combinacoes` },
  openGraph: { title: "Combinações C(n,k)", description: "Calcule combinações matemáticas com exemplos práticos.", url: `${SITE_URL}/calculadoras/combinacoes`, siteName: SITE_NAME, locale: "pt_BR", type: "website", images: [`${SITE_URL}/opengraph-image`] },
};

export default function CalcCombinacoesPage() {
  return (
    <>
      <Masthead calculadorasAtiva />
      <main className="container secao" style={{ maxWidth: 720 }}>
        <p className="eyebrow"><Link href="/calculadoras" className="breadcrumb">← Calculadoras</Link></p>
        <div className="calc-header calc-header--ochre">
          <span className="calc-header__emoji">🔢</span>
          <div>
            <p className="calc-header__cat">Probabilidade</p>
            <h1 className="titulo-edicao" style={{ marginBottom: 4 }}>Combinações C(n, k)</h1>
            <p style={{ color: "var(--ink-soft)", fontSize: "0.9rem" }}>Quantas formas de escolher k itens de n sem importar a ordem</p>
          </div>
        </div>
        <CalcCombinacoes />
        <div className="calc-info calc-info--ochre">
          <strong>Fórmula:</strong> C(n, k) = n! ÷ (k! × (n−k)!) — onde a ordem não importa. C(25,15) = 3.268.760 combinações possíveis na Lotofácil.
        </div>
        <div style={{ marginTop: 28 }}>
          <p className="bloco__titulo" style={{ marginBottom: 12 }}>Relacionados</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/calculadoras/probabilidade-loteria" className="botao-copiar" style={{ fontSize: "0.85rem" }}>🎯 Probabilidade de Loteria</Link>
            <Link href="/matematica/combinatoria" className="botao-copiar" style={{ fontSize: "0.85rem" }}>📖 Entender Combinatória</Link>
            <Link href="/matematica/fatorial" className="botao-copiar" style={{ fontSize: "0.85rem" }}>📖 Entender Fatorial</Link>
          </div>
        </div>
        {/* ── Manual de uso ─────────────────────────────────────────────── */}
        <div className="calc-manual">
          <p className="calc-manual__titulo">📖 Como usar a Calculadora de Combinações C(n,k)</p>
          <ol className="calc-manual__passos">
          <li className="calc-manual__passo">
            <span className="calc-manual__num">1</span>
            <div className="calc-manual__texto"><strong>Defina n — o total de opções</strong> — <span dangerouslySetInnerHTML={{__html: "Use o controle deslizante ou digite diretamente. n é o tamanho do conjunto total de onde você está escolhendo — ex: 25 dezenas da Lotofácil, 52 cartas de um baralho."}} /></div>
          </li>
          <li className="calc-manual__passo">
            <span className="calc-manual__num">2</span>
            <div className="calc-manual__texto"><strong>Defina k — quantos você vai escolher</strong> — <span dangerouslySetInnerHTML={{__html: "k deve ser menor ou igual a n. É a quantidade de itens que você está selecionando — ex: 15 dezenas, 5 cartas de pôquer."}} /></div>
          </li>
          <li className="calc-manual__passo">
            <span className="calc-manual__num">3</span>
            <div className="calc-manual__texto"><strong>Use os exemplos rápidos</strong> — <span dangerouslySetInnerHTML={{__html: "Os botões abaixo dos controles (Lotofácil, Mega-Sena, Mão no pôquer etc.) preenchem automaticamente os valores mais comuns para referência rápida."}} /></div>
          </li>
          <li className="calc-manual__passo">
            <span className="calc-manual__num">4</span>
            <div className="calc-manual__texto"><strong>Interprete o resultado</strong> — <span dangerouslySetInnerHTML={{__html: "C(n,k) é o número total de formas diferentes de escolher k itens de n, sem se importar com a ordem. O resultado também mostra a chance de acertar tudo (1 ÷ C(n,k))."}} /></div>
          </li>
          </ol>
          <div className="calc-manual__dica" dangerouslySetInnerHTML={{__html: "💡 <strong>Quando a ordem importa</strong> (pódio, ranking), use a fórmula de arranjos: A(n,k) = n! ÷ (n−k)!. A calculadora de combinações é para quando a ordem NÃO importa."}} />
        </div>


      </main>
    </>
  );
}
