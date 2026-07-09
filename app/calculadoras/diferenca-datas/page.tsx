import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { CalcDatas } from "./CalcClient";

export const metadata: Metadata = {
  title: "Calculadora de Diferença entre Datas — LotoAnalítica",
  description: "Calcule quantos dias, semanas, meses e anos separam duas datas. Ou adicione e subtraia dias de uma data para descobrir qual data cai.",
  alternates: { canonical: `${SITE_URL}/calculadoras/diferenca-datas` },
  openGraph: { title: "Calculadora de Datas", description: "Diferença entre datas e adicionar/subtrair dias com dia da semana.", url: `${SITE_URL}/calculadoras/diferenca-datas`, siteName: SITE_NAME, locale: "pt_BR", type: "website", images: [`${SITE_URL}/opengraph-image`] },
};

export default function CalcDataPage() {
  return (
    <>
      <Masthead calculadorasAtiva />
      <main className="container secao" style={{ maxWidth: 720 }}>
        <p className="eyebrow"><Link href="/calculadoras" className="breadcrumb">← Calculadoras</Link></p>
        <div className="calc-header calc-header--pine">
          <span className="calc-header__emoji">📅</span>
          <div>
            <p className="calc-header__cat">Data e tempo</p>
            <h1 className="titulo-edicao" style={{ marginBottom: 4 }}>Diferença entre Datas</h1>
            <p style={{ color: "var(--ink-soft)", fontSize: "0.9rem" }}>Quantos dias, semanas e meses entre duas datas — ou adicione dias a uma data</p>
          </div>
        </div>

        <CalcDatas />

        <div className="calc-info calc-info--pine">
          <strong>Diferença entre datas</strong> → prazo de contratos, tempo de gestação, dias até um evento, idade exata em dias.<br /><br />
          <strong>Adicionar / subtrair dias</strong> → descubra qual data cai 90 dias após hoje, ou qual era a data 30 dias atrás.
        </div>

        <div style={{ marginTop: 28 }}>
          <p className="bloco__titulo" style={{ marginBottom: 12 }}>Outras calculadoras</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { href: "/calculadoras/imc",          label: "⚕️ IMC"         },
              { href: "/calculadoras/porcentagem",  label: "🏷️ Porcentagem" },
            ].map(l => (
              <Link key={l.href} href={l.href} className="botao-copiar" style={{ fontSize: "0.85rem" }}>{l.label}</Link>
            ))}
          </div>
        </div>
        {/* ── Manual de uso ─────────────────────────────────────────────── */}
        <div className="calc-manual">
          <p className="calc-manual__titulo">📖 Como usar a Calculadora de Diferença entre Datas</p>
          <ol className="calc-manual__passos">
          <li className="calc-manual__passo">
            <span className="calc-manual__num">1</span>
            <div className="calc-manual__texto"><strong>Escolha o modo de cálculo</strong> — <span dangerouslySetInnerHTML={{__html: "Clique em <strong>Diferença entre datas</strong> (para saber quantos dias/meses entre dois momentos) ou <strong>Adicionar / subtrair dias</strong> (para descobrir que data cai daqui a N dias)."}} /></div>
          </li>
          <li className="calc-manual__passo">
            <span className="calc-manual__num">2</span>
            <div className="calc-manual__texto"><strong>Preencha as datas usando o seletor</strong> — <span dangerouslySetInnerHTML={{__html: "Clique no campo de data — um calendário nativo do seu sistema aparece. Selecione o dia, mês e ano. Funciona em celular e computador."}} /></div>
          </li>
          <li className="calc-manual__passo">
            <span className="calc-manual__num">3</span>
            <div className="calc-manual__texto"><strong>Leia os resultados</strong> — <span dangerouslySetInnerHTML={{__html: "Para diferença: aparecem os valores em dias, semanas, meses e anos aproximados. Para adicionar/subtrair: aparece a data resultante com o dia da semana por extenso."}} /></div>
          </li>
          <li className="calc-manual__passo">
            <span className="calc-manual__num">4</span>
            <div className="calc-manual__texto"><strong>Datas no passado e no futuro</strong> — <span dangerouslySetInnerHTML={{__html: "A calculadora aceita qualquer data — passado (para calcular idade em dias) ou futuro (para contar prazo de contratos). Use valores negativos no modo 'Adicionar dias' para subtrair."}} /></div>
          </li>
          </ol>
          <div className="calc-manual__dica" dangerouslySetInnerHTML={{__html: "💡 <strong>Dica:</strong> para calcular quantos dias você tem de vida, coloque sua data de nascimento em 'Data inicial' e hoje em 'Data final' no modo de diferença."}} />
        </div>


      </main>
    </>
  );
}
