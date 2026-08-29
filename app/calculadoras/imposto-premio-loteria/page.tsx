import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { SITE_URL, SITE_NAME, articleJsonLd } from "@/lib/seo";
import { CalcImpostoPremio } from "./CalcClient";

export const metadata: Metadata = {
  title: "Calculadora de Imposto sobre Prêmio de Loteria — LotoAnalítica",
  description: "Quanto o Leão leva de um prêmio de loteria: os 30% de imposto de renda retidos na fonte pela Caixa incidem sobre qualquer prêmio, de qualquer faixa, em Mega-Sena, Lotofácil e as outras loterias.",
  alternates: { canonical: `${SITE_URL}/calculadoras/imposto-premio-loteria` },
  openGraph: { title: "Imposto sobre Prêmio de Loteria", description: "Quanto sobra líquido de um prêmio de loteria depois do imposto de renda.", url: `${SITE_URL}/calculadoras/imposto-premio-loteria`, siteName: SITE_NAME, locale: "pt_BR", type: "website", images: [`${SITE_URL}/opengraph-image`] },
};

export default function CalcImpostoPremioPage() {
  return (
    <>
      <BreadcrumbJsonLd
        itens={[
          { nome: "Calculadoras", caminho: "/calculadoras" },
          { nome: "Calculadora de Imposto sobre Prêmio de Loteria — LotoAnalítica", caminho: "/calculadoras/imposto-premio-loteria" },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            articleJsonLd({ titulo: "Calculadora de Imposto sobre Prêmio de Loteria — LotoAnalítica", descricao: "Quanto o Leão leva de um prêmio de loteria: os 30% de imposto de renda retidos na fonte pela Caixa incidem sobre qualquer prêmio, de qualquer faixa, em Mega-Sena, Lotofácil e as outras loterias.", caminho: "/calculadoras/imposto-premio-loteria" })
          ),
        }}
      />
      <Masthead calculadorasAtiva />
      <main className="container secao" style={{ maxWidth: 720 }}>
        <p className="eyebrow"><Link href="/calculadoras" className="breadcrumb">← Calculadoras</Link></p>
        <div className="calc-header calc-header--rust">
          <span className="calc-header__emoji">🦁</span>
          <div>
            <p className="calc-header__cat">Loteria</p>
            <h1 className="titulo-edicao" style={{ marginBottom: 4 }}>Imposto sobre Prêmio de Loteria</h1>
            <p style={{ color: "var(--ink-soft)", fontSize: "0.9rem" }}>Quanto o Leão leva — e quanto sobra líquido — de qualquer prêmio</p>
          </div>
        </div>
        <CalcImpostoPremio />

        <div className="calc-info calc-info--rust">
          <strong>A alíquota é fixa em 30%, sem faixa de isenção.</strong> Diferente das apostas esportivas de quota fixa (bets), que só são tributadas sobre o lucro anual acima de um limite isento, prêmios das loterias da Caixa — Mega-Sena, Lotofácil, Quina, Lotomania, Dia de Sorte, +Milionária, Timemania, Dupla Sena e Super Sete — pagam 30% de imposto de renda sobre o valor total do prêmio, retido na fonte pela própria Caixa antes do pagamento. Isso vale para qualquer faixa premiada, inclusive prêmios pequenos como uma quadra ou uma quina — não existe piso de isenção para loteria tradicional.
        </div>

        <div style={{ marginTop: 28 }}>
          <p className="bloco__titulo" style={{ marginBottom: 12 }}>Relacionados</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/dicas/retorno-ao-apostador" className="botao-copiar" style={{ fontSize: "0.85rem" }}>Retorno ao apostador</Link>
            <Link href="/calculadoras/rateio-bolao" className="botao-copiar" style={{ fontSize: "0.85rem" }}>Rateio de bolão</Link>
            <Link href="/megasena/probabilidades" className="botao-copiar" style={{ fontSize: "0.85rem" }}>Probabilidades da Mega-Sena</Link>
          </div>
        </div>

        {/* ── Manual de uso ─────────────────────────────────────────────── */}
        <div className="calc-manual">
          <p className="calc-manual__titulo">Como usar a Calculadora de Imposto sobre Prêmio</p>
          <ol className="calc-manual__passos">
            <li className="calc-manual__passo">
              <span className="calc-manual__num">1</span>
              <div className="calc-manual__texto"><strong>Digite o valor do prêmio antes do imposto</strong> — normalmente é esse o valor estimado divulgado antes do sorteio.</div>
            </li>
            <li className="calc-manual__passo">
              <span className="calc-manual__num">2</span>
              <div className="calc-manual__texto"><strong>Veja o valor líquido</strong> — os 30% de imposto já retirados, exatamente como a Caixa faz antes de pagar o ganhador.</div>
            </li>
          </ol>
          <div className="calc-manual__dica" dangerouslySetInnerHTML={{__html: "<strong>Sobre declarar no Imposto de Renda:</strong> mesmo com o imposto já retido na fonte, o valor recebido precisa ser informado na declaração anual, na ficha \"Rendimentos Sujeitos à Tributação Exclusiva/Definitiva\". Os valores de prêmio que a Caixa divulga oficialmente após o sorteio já são os valores líquidos, efetivamente pagos ao ganhador — o imposto já foi descontado antes da divulgação."}} />
        </div>
      </main>
    </>
  );
}
