import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { CalcProbLoteria } from "./CalcClient";

export const metadata: Metadata = {
  title: "Calculadora de Probabilidade de Loteria — LotoAnalítica",
  description: "Descubra a chance exata de acertar qualquer faixa em Lotofácil, Mega-Sena, Quina, Lotomania, Dia de Sorte, +Milionária, Timemania, Dupla Sena e Super Sete.",
  alternates: { canonical: `${SITE_URL}/calculadoras/probabilidade-loteria` },
  openGraph: { title: "Probabilidade de Loteria", description: "Chance exata de acertar qualquer faixa em 9 loterias diferentes.", url: `${SITE_URL}/calculadoras/probabilidade-loteria`, siteName: SITE_NAME, locale: "pt_BR", type: "website", images: [`${SITE_URL}/opengraph-image`] },
};

export default function CalcProbLoteriaPage() {
  return (
    <>
      <Masthead calculadorasAtiva />
      <main className="container secao" style={{ maxWidth: 720 }}>
        <p className="eyebrow"><Link href="/calculadoras" className="breadcrumb">← Calculadoras</Link></p>
        <div className="calc-header calc-header--rust">
          <span className="calc-header__emoji">🎯</span>
          <div>
            <p className="calc-header__cat">Probabilidade</p>
            <h1 className="titulo-edicao" style={{ marginBottom: 4 }}>Probabilidade de Loteria</h1>
            <p style={{ color: "var(--ink-soft)", fontSize: "0.9rem" }}>Chance exata de acertar qualquer faixa em 9 loterias</p>
          </div>
        </div>

        <CalcProbLoteria />

        <div className="calc-info calc-info--rust">
          <strong>Como funciona:</strong> as probabilidades são calculadas pela fórmula de combinações hipergeométricas — a mesma usada pela Caixa Econômica Federal. Ao apostar mais dezenas, você cobre mais combinações e aumenta proporcionalmente a chance de cada faixa.
        </div>

        <div style={{ marginTop: 28 }}>
          <p className="bloco__titulo" style={{ marginBottom: 12 }}>Veja também</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { href: "/calculadoras/combinacoes",    label: "🔢 Combinações C(n,k)" },
              { href: "/lotofacil/probabilidades",    label: "📊 Probabilidades Lotofácil" },
              { href: "/megasena/probabilidades",     label: "📊 Probabilidades Mega-Sena" },
              { href: "/matematica/combinatoria",     label: "📖 Entenda combinatória"  },
            ].map(l => (
              <Link key={l.href} href={l.href} className="botao-copiar" style={{ fontSize: "0.85rem" }}>{l.label}</Link>
            ))}
          </div>
        </div>
        {/* ── Manual de uso ─────────────────────────────────────────────── */}
        <div className="calc-manual">
          <p className="calc-manual__titulo">📖 Como usar a Calculadora de Probabilidade de Loteria</p>
          <ol className="calc-manual__passos">
          <li className="calc-manual__passo">
            <span className="calc-manual__num">1</span>
            <div className="calc-manual__texto"><strong>Selecione a loteria</strong> — <span dangerouslySetInnerHTML={{__html: "No menu suspenso, escolha entre as 9 loterias disponíveis: Lotofácil, Mega-Sena, Quina, Lotomania, Dia de Sorte, +Milionária, Timemania, Dupla Sena ou Super Sete."}} /></div>
          </li>
          <li className="calc-manual__passo">
            <span className="calc-manual__num">2</span>
            <div className="calc-manual__texto"><strong>Informe quantas dezenas você aposta</strong> — <span dangerouslySetInnerHTML={{__html: "O campo já vem preenchido com a quantidade mínima (aposta simples). Aumente o número para ver como apostar mais dezenas muda as probabilidades de cada faixa."}} /></div>
          </li>
          <li className="calc-manual__passo">
            <span className="calc-manual__num">3</span>
            <div className="calc-manual__texto"><strong>Leia a tabela de probabilidades</strong> — <span dangerouslySetInnerHTML={{__html: "Para cada faixa de premiação, a tabela mostra a probabilidade em formato '1 em X' e em porcentagem. Cores indicam: verde = mais acessível, vermelho = mais raro."}} /></div>
          </li>
          <li className="calc-manual__passo">
            <span className="calc-manual__num">4</span>
            <div className="calc-manual__texto"><strong>Compare entre loterias</strong> — <span dangerouslySetInnerHTML={{__html: "Troque a loteria selecionada e observe como as probabilidades mudam — útil para entender por que a Mega-Sena é mais difícil que a Lotofácil, mesmo com menos dezenas."}} /></div>
          </li>
          </ol>
          <div className="calc-manual__dica" dangerouslySetInnerHTML={{__html: "💡 <strong>Dica:</strong> ao apostar mais dezenas, você não multiplica a chance por esse número — você cobre mais combinações. C(dezenas_apostadas, k) diz quantas combinações sua aposta cobre."}} />
        </div>


      </main>
    </>
  );
}
