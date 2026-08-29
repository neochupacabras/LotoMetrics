import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { SITE_URL, SITE_NAME, articleJsonLd } from "@/lib/seo";
import { CalcFinanciamento } from "./CalcClient";

export const metadata: Metadata = {
  title: "Calculadora de Financiamento e Empréstimo — LotoAnalítica",
  description: "Simule o valor das parcelas de um financiamento ou empréstimo pelos sistemas Price (parcelas fixas) e SAC (parcelas decrescentes), com total de juros e valor final pago.",
  alternates: { canonical: `${SITE_URL}/calculadoras/financiamento` },
  openGraph: { title: "Financiamento e Empréstimo", description: "Simule parcelas pelo sistema Price ou SAC.", url: `${SITE_URL}/calculadoras/financiamento`, siteName: SITE_NAME, locale: "pt_BR", type: "website", images: [`${SITE_URL}/opengraph-image`] },
};

export default function CalcFinanciamentoPage() {
  return (
    <>
      <BreadcrumbJsonLd
        itens={[
          { nome: "Calculadoras", caminho: "/calculadoras" },
          { nome: "Calculadora de Financiamento e Empréstimo — LotoAnalítica", caminho: "/calculadoras/financiamento" },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            articleJsonLd({ titulo: "Calculadora de Financiamento e Empréstimo — LotoAnalítica", descricao: "Simule o valor das parcelas de um financiamento ou empréstimo pelos sistemas Price (parcelas fixas) e SAC (parcelas decrescentes), com total de juros e valor final pago.", caminho: "/calculadoras/financiamento" })
          ),
        }}
      />
      <Masthead calculadorasAtiva />
      <main className="container secao" style={{ maxWidth: 720 }}>
        <p className="eyebrow"><Link href="/calculadoras" className="breadcrumb">← Calculadoras</Link></p>
        <div className="calc-header calc-header--pine">
          <span className="calc-header__emoji"></span>
          <div>
            <p className="calc-header__cat">Financeira</p>
            <h1 className="titulo-edicao" style={{ marginBottom: 4 }}>Financiamento e Empréstimo</h1>
            <p style={{ color: "var(--ink-soft)", fontSize: "0.9rem" }}>Simule parcelas pelo sistema Price (fixas) ou SAC (decrescentes)</p>
          </div>
        </div>
        <CalcFinanciamento />

        <div className="calc-info calc-info--pine">
          <strong>Price vs. SAC:</strong> no sistema Price, todas as parcelas têm o
          mesmo valor do início ao fim. No SAC, a amortização (parte que reduz a
          dívida) é sempre igual, mas os juros incidem sobre um saldo devedor cada
          vez menor — então as parcelas começam mais altas e vão caindo mês a mês.
          O SAC costuma gerar menos juros totais, mas exige uma parcela inicial
          maior. É o sistema mais comum em financiamentos imobiliários no Brasil.
        </div>

        <div style={{ marginTop: 28 }}>
          <p className="bloco__titulo" style={{ marginBottom: 12 }}>Relacionados</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/calculadoras/juros-compostos" className="botao-copiar" style={{ fontSize: "0.85rem" }}>Juros Compostos</Link>
            <Link href="/calculadoras/parcelamento" className="botao-copiar" style={{ fontSize: "0.85rem" }}>Parcelamento e Juros</Link>
            <Link href="/matematica/juros-compostos" className="botao-copiar" style={{ fontSize: "0.85rem" }}>Entenda juros compostos</Link>
          </div>
        </div>

        {/* ── Manual de uso ─────────────────────────────────────────────── */}
        <div className="calc-manual">
          <p className="calc-manual__titulo">Como usar a Calculadora de Financiamento</p>
          <ol className="calc-manual__passos">
            <li className="calc-manual__passo">
              <span className="calc-manual__num">1</span>
              <div className="calc-manual__texto"><strong>Escolha o sistema</strong> — Price para parcelas fixas, SAC para parcelas decrescentes.</div>
            </li>
            <li className="calc-manual__passo">
              <span className="calc-manual__num">2</span>
              <div className="calc-manual__texto"><strong>Informe o valor financiado, a taxa de juros mensal e o número de parcelas</strong> — a taxa geralmente vem no contrato de financiamento; se você só tiver a taxa anual, divida por 12 para uma estimativa aproximada.</div>
            </li>
            <li className="calc-manual__passo">
              <span className="calc-manual__num">3</span>
              <div className="calc-manual__texto"><strong>Veja o valor das parcelas e o total de juros</strong> — útil para comparar propostas de financiamento antes de assinar.</div>
            </li>
          </ol>
          <div className="calc-manual__dica" dangerouslySetInnerHTML={{__html: "<strong>Isso é uma simulação simplificada:</strong> financiamentos reais podem incluir seguros, taxas administrativas e correção monetária (como a TR em financiamentos imobiliários), que não entram nesta conta. Use como estimativa, e confirme sempre os valores exatos com a instituição financeira."}} />
        </div>
      </main>
    </>
  );
}
