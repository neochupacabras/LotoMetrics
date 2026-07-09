import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { CalcJurosCompostos } from "./CalcClient";

export const metadata: Metadata = {
  title: "Calculadora de Juros Compostos — LotoAnalítica",
  description: "Calcule montante final, taxa de juros ou prazo em juros compostos. Com tabela de evolução período a período. Ideal para investimentos, financiamentos e dívidas.",
  alternates: { canonical: `${SITE_URL}/calculadoras/juros-compostos` },
  openGraph: { title: "Calculadora de Juros Compostos", description: "Calcule montante, taxa ou prazo com tabela de evolução.", url: `${SITE_URL}/calculadoras/juros-compostos`, siteName: SITE_NAME, locale: "pt_BR", type: "website", images: [`${SITE_URL}/opengraph-image`] },
};

export default function CalcJurosCompostosPage() {
  return (
    <>
      <Masthead calculadorasAtiva />
      <main className="container secao" style={{ maxWidth: 720 }}>
        <p className="eyebrow"><Link href="/calculadoras" className="breadcrumb">← Calculadoras</Link></p>
        <div className="calc-header calc-header--pine">
          <span className="calc-header__emoji">📈</span>
          <div>
            <p className="calc-header__cat">Matemática financeira</p>
            <h1 className="titulo-edicao" style={{ marginBottom: 4 }}>Juros Compostos</h1>
            <p style={{ color: "var(--ink-soft)", fontSize: "0.9rem" }}>Calcule montante, taxa ou prazo — com tabela de evolução</p>
          </div>
        </div>

        <CalcJurosCompostos />

        <div className="calc-info calc-info--pine">
          <strong>Fórmula:</strong> M = C × (1 + i)ⁿ — onde C é o capital, i a taxa por período e n o número de períodos.
          <br /><br />
          <strong>Calcular montante</strong> → informe capital, taxa e prazo.<br />
          <strong>Calcular taxa</strong> → informe capital, montante desejado e prazo.<br />
          <strong>Calcular prazo</strong> → informe capital, montante desejado e taxa.
        </div>

        <div style={{ marginTop: 28 }}>
          <p className="bloco__titulo" style={{ marginBottom: 12 }}>Outras calculadoras</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { href: "/calculadoras/parcelamento",  label: "💳 Parcelamento"  },
              { href: "/calculadoras/porcentagem",   label: "🏷️ Porcentagem"   },
              { href: "/calculadoras/regra-de-tres", label: "⚖️ Regra de Três" },
            ].map(l => (
              <Link key={l.href} href={l.href} className="botao-copiar" style={{ fontSize: "0.85rem" }}>{l.label}</Link>
            ))}
          </div>
        </div>

        <p style={{ marginTop: 24 }}><Link href="/matematica/juros-compostos" className="breadcrumb">📖 Entenda a matemática de juros compostos →</Link></p>
        {/* ── Manual de uso ─────────────────────────────────────────────── */}
        <div className="calc-manual">
          <p className="calc-manual__titulo">📖 Como usar a Calculadora de Juros Compostos</p>
          <ol className="calc-manual__passos">
          <li className="calc-manual__passo">
            <span className="calc-manual__num">1</span>
            <div className="calc-manual__texto"><strong>Escolha o que você quer calcular</strong> — <span dangerouslySetInnerHTML={{__html: "Clique em <strong>Calcular montante</strong> (valor final), <strong>Calcular taxa</strong> (qual a taxa do investimento?) ou <strong>Calcular prazo</strong> (quantos períodos para atingir o valor desejado?)."}} /></div>
          </li>
          <li className="calc-manual__passo">
            <span className="calc-manual__num">2</span>
            <div className="calc-manual__texto"><strong>Preencha os campos disponíveis</strong> — <span dangerouslySetInnerHTML={{__html: "Cada modo exibe os campos necessários. Para <em>calcular montante</em>: informe capital, taxa e períodos. Para os outros modos, um dos campos é substituído pelo resultado desejado."}} /></div>
          </li>
          <li className="calc-manual__passo">
            <span className="calc-manual__num">3</span>
            <div className="calc-manual__texto"><strong>Verifique a tabela de evolução</strong> — <span dangerouslySetInnerHTML={{__html: "No modo <strong>Calcular montante</strong>, uma tabela aparece mostrando o saldo a cada período — útil para visualizar como o capital cresce ao longo do tempo."}} /></div>
          </li>
          <li className="calc-manual__passo">
            <span className="calc-manual__num">4</span>
            <div className="calc-manual__texto"><strong>Atenção às unidades</strong> — <span dangerouslySetInnerHTML={{__html: "Taxa e períodos devem ser na mesma unidade: se a taxa é mensal, os períodos devem ser em meses. Se a taxa é anual, os períodos devem ser em anos."}} /></div>
          </li>
          </ol>
          <div className="calc-manual__dica" dangerouslySetInnerHTML={{__html: "💡 <strong>Dica:</strong> para descobrir a taxa real de um parcelamento, use 'Calcular taxa' com capital = preço à vista, montante = total parcelado, e períodos = número de parcelas."}} />
        </div>


      </main>
    </>
  );
}
