import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { CalcValorEsperado } from "./CalcClient";

export const metadata: Metadata = {
  title: "Calculadora de Valor Esperado de uma Aposta — LotoAnalítica",
  description: "Informe o custo, o prêmio e a probabilidade de qualquer aposta e veja o valor esperado — o retorno médio por real gasto, em qualquer jogo de sorte.",
  alternates: { canonical: `${SITE_URL}/calculadoras/valor-esperado-aposta` },
  openGraph: { title: "Valor Esperado de uma Aposta", description: "Veja se, em média, uma aposta compensa o que custa.", url: `${SITE_URL}/calculadoras/valor-esperado-aposta`, siteName: SITE_NAME, locale: "pt_BR", type: "website", images: [`${SITE_URL}/opengraph-image`] },
};

export default function CalcValorEsperadoPage() {
  return (
    <>
      <Masthead calculadorasAtiva />
      <main className="container secao" style={{ maxWidth: 720 }}>
        <p className="eyebrow"><Link href="/calculadoras" className="breadcrumb">← Calculadoras</Link></p>
        <div className="calc-header calc-header--ochre">
          <span className="calc-header__emoji">⚖️</span>
          <div>
            <p className="calc-header__cat">Probabilidade</p>
            <h1 className="titulo-edicao" style={{ marginBottom: 4 }}>Valor Esperado de uma Aposta</h1>
            <p style={{ color: "var(--ink-soft)", fontSize: "0.9rem" }}>Veja se, em média, uma aposta compensa o que custa</p>
          </div>
        </div>
        <CalcValorEsperado />

        <div className="calc-info calc-info--ochre">
          O <strong>valor esperado</strong> é a média de longo prazo, não o resultado de uma aposta específica. Um valor esperado negativo não significa que ninguém ganha — significa que, repetindo a aposta muitas vezes, o resultado médio tende a ser uma perda. Toda loteria tem valor esperado negativo por definição: é assim que ela se sustenta financeiramente.
        </div>

        <div style={{ marginTop: 28 }}>
          <p className="bloco__titulo" style={{ marginBottom: 12 }}>Relacionados</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/matematica/valor-esperado" className="botao-copiar" style={{ fontSize: "0.85rem" }}>📖 Entenda valor esperado</Link>
            <Link href="/dicas/retorno-ao-apostador" className="botao-copiar" style={{ fontSize: "0.85rem" }}>📖 Retorno ao apostador</Link>
            <Link href="/calculadoras/probabilidade-loteria" className="botao-copiar" style={{ fontSize: "0.85rem" }}>🎯 Probabilidade de loteria</Link>
          </div>
        </div>

        {/* ── Manual de uso ─────────────────────────────────────────────── */}
        <div className="calc-manual">
          <p className="calc-manual__titulo">📖 Como usar a Calculadora de Valor Esperado</p>
          <ol className="calc-manual__passos">
            <li className="calc-manual__passo">
              <span className="calc-manual__num">1</span>
              <div className="calc-manual__texto"><strong>Informe o custo da aposta</strong> — quanto você paga para participar.</div>
            </li>
            <li className="calc-manual__passo">
              <span className="calc-manual__num">2</span>
              <div className="calc-manual__texto"><strong>Informe o prêmio, se ganhar</strong> — o valor que você recebe em caso de acerto.</div>
            </li>
            <li className="calc-manual__passo">
              <span className="calc-manual__num">3</span>
              <div className="calc-manual__texto"><strong>Informe a probabilidade</strong> — no formato "1 em quantos" (por exemplo, 50.063.860 para a sena da Mega-Sena). Use os exemplos prontos para começar rápido, ou pegue o número certo na <Link href="/calculadoras/probabilidade-loteria" className="breadcrumb">calculadora de probabilidade de loteria</Link>.</div>
            </li>
          </ol>
          <div className="calc-manual__dica" dangerouslySetInnerHTML={{__html: "💡 <strong>Não é só para loteria:</strong> essa mesma conta serve para avaliar qualquer aposta ou jogo de sorte — de uma rifa entre amigos a um jogo de cassino."}} />
        </div>
      </main>
    </>
  );
}
