import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { CalcPorcentagem } from "./CalcClient";

export const metadata: Metadata = {
  title: "Calculadora de Porcentagem — LotoAnalítica",
  description: "Calcule porcentagens instantaneamente: X% de Y, X é que % de Y, aumentar ou diminuir por %, e variação percentual entre dois valores.",
  alternates: { canonical: `${SITE_URL}/calculadoras/porcentagem` },
  openGraph: { title: "Calculadora de Porcentagem", description: "5 modos: X% de Y, X é % de Y, aumento, desconto e variação.", url: `${SITE_URL}/calculadoras/porcentagem`, siteName: SITE_NAME, locale: "pt_BR", type: "website", images: [`${SITE_URL}/opengraph-image`] },
};

export default function CalcPorcentagemPage() {
  return (
    <>
      <Masthead calculadorasAtiva />
      <main className="container secao" style={{ maxWidth: 720 }}>
        <p className="eyebrow"><Link href="/calculadoras" className="breadcrumb">← Calculadoras</Link></p>
        <div className="calc-header calc-header--ochre">
          <span className="calc-header__emoji">🏷️</span>
          <div>
            <p className="calc-header__cat">Matemática básica</p>
            <h1 className="titulo-edicao" style={{ marginBottom: 4 }}>Calculadora de Porcentagem</h1>
            <p style={{ color: "var(--ink-soft)", fontSize: "0.9rem" }}>5 modos diferentes — escolha o que você precisa calcular</p>
          </div>
        </div>

        <CalcPorcentagem />

        <div className="calc-info calc-info--ochre">
          <strong>Como usar:</strong> escolha o modo no topo, preencha os dois campos e o resultado aparece automaticamente.
          <ul style={{ marginTop: 8, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 4 }}>
            <li><strong>X% de Y</strong> — quanto é 15% de R$350? → R$52,50</li>
            <li><strong>X é % de Y</strong> — 25 é que % de 200? → 12,5%</li>
            <li><strong>Aumentar por %</strong> — R$100 com 20% de aumento → R$120</li>
            <li><strong>Diminuir por %</strong> — R$100 com 30% de desconto → R$70</li>
            <li><strong>Variação %</strong> — de R$80 para R$100, qual a variação? → +25%</li>
          </ul>
        </div>

        <div style={{ marginTop: 28 }}>
          <p className="bloco__titulo" style={{ marginBottom: 12 }}>Outras calculadoras</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { href: "/calculadoras/juros-compostos", label: "📈 Juros Compostos" },
              { href: "/calculadoras/regra-de-tres",   label: "⚖️ Regra de Três"  },
              { href: "/calculadoras/parcelamento",    label: "💳 Parcelamento"    },
            ].map(l => (
              <Link key={l.href} href={l.href} className="botao-copiar" style={{ fontSize: "0.85rem" }}>{l.label}</Link>
            ))}
          </div>
        </div>

        <p style={{ marginTop: 24 }}><Link href="/matematica/porcentagem" className="breadcrumb">📖 Entenda a matemática de porcentagem →</Link></p>
        {/* ── Manual de uso ─────────────────────────────────────────────── */}
        <div className="calc-manual">
          <p className="calc-manual__titulo">📖 Como usar a Calculadora de Porcentagem</p>
          <ol className="calc-manual__passos">
          <li className="calc-manual__passo">
            <span className="calc-manual__num">1</span>
            <div className="calc-manual__texto"><strong>Escolha o modo de cálculo</strong> — <span dangerouslySetInnerHTML={{__html: "Clique em um dos 5 botões no topo: <strong>X% de Y</strong> (quanto é 15% de R$350?), <strong>X é % de Y</strong> (25 é que % de 200?), <strong>Aumentar por %</strong>, <strong>Diminuir por %</strong> ou <strong>Variação %</strong>."}} /></div>
          </li>
          <li className="calc-manual__passo">
            <span className="calc-manual__num">2</span>
            <div className="calc-manual__texto"><strong>Preencha os dois campos</strong> — <span dangerouslySetInnerHTML={{__html: "Conforme o modo escolhido, preencha os campos A e B. Os campos se adaptam automaticamente ao modo — os rótulos indicam o que cada um representa."}} /></div>
          </li>
          <li className="calc-manual__passo">
            <span className="calc-manual__num">3</span>
            <div className="calc-manual__texto"><strong>Leia o resultado</strong> — <span dangerouslySetInnerHTML={{__html: "O resultado aparece automaticamente abaixo, sem precisar clicar em nenhum botão. Para o modo <strong>X é % de Y</strong>, uma barra visual mostra a proporção."}} /></div>
          </li>
          <li className="calc-manual__passo">
            <span className="calc-manual__num">4</span>
            <div className="calc-manual__texto"><strong>Troque o modo sem perder o raciocínio</strong> — <span dangerouslySetInnerHTML={{__html: "Você pode mudar de modo a qualquer hora. Os campos são limpos ao trocar o modo — comece a digitação novamente para o novo cálculo."}} /></div>
          </li>
          </ol>
          <div className="calc-manual__dica" dangerouslySetInnerHTML={{__html: "💡 <strong>Dica:</strong> para calcular quantos por cento uma parcela representa do total, use o modo 'X é % de Y' — coloque a parcela em X e o total em Y."}} />
        </div>


      </main>
    </>
  );
}
