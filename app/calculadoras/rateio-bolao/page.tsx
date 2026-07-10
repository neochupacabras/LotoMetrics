import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { CalcRateioBolao } from "./CalcClient";

export const metadata: Metadata = {
  title: "Calculadora de Rateio de Bolão — LotoAnalítica",
  description: "Divida o prêmio de um bolão de loteria entre participantes com cotas iguais ou diferentes. Informe o valor do prêmio e as cotas de cada um.",
  alternates: { canonical: `${SITE_URL}/calculadoras/rateio-bolao` },
  openGraph: { title: "Rateio de Bolão", description: "Divida um prêmio entre participantes com cotas iguais ou diferentes.", url: `${SITE_URL}/calculadoras/rateio-bolao`, siteName: SITE_NAME, locale: "pt_BR", type: "website", images: [`${SITE_URL}/opengraph-image`] },
};

export default function CalcRateioBolaoPage() {
  return (
    <>
      <Masthead calculadorasAtiva />
      <main className="container secao" style={{ maxWidth: 720 }}>
        <p className="eyebrow"><Link href="/calculadoras" className="breadcrumb">← Calculadoras</Link></p>
        <div className="calc-header calc-header--pine">
          <span className="calc-header__emoji">🤝</span>
          <div>
            <p className="calc-header__cat">Loteria</p>
            <h1 className="titulo-edicao" style={{ marginBottom: 4 }}>Rateio de Bolão</h1>
            <p style={{ color: "var(--ink-soft)", fontSize: "0.9rem" }}>Divida um prêmio entre participantes com cotas iguais ou diferentes</p>
          </div>
        </div>
        <CalcRateioBolao />

        <div className="calc-info calc-info--pine">
          O valor do prêmio informado aqui deve ser o valor <strong>já líquido</strong> (depois de eventual imposto de renda retido na fonte), já que é esse o valor efetivamente pago pela Caixa. Veja como funciona a tributação de prêmios nas nossas{" "}
          <Link href="/perguntas-frequentes" className="breadcrumb">perguntas frequentes</Link>.
        </div>

        <div style={{ marginTop: 28 }}>
          <p className="bloco__titulo" style={{ marginBottom: 12 }}>Relacionados</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/perguntas-frequentes" className="botao-copiar" style={{ fontSize: "0.85rem" }}>❓ Como funciona um bolão</Link>
            <Link href="/glossario#bolao" className="botao-copiar" style={{ fontSize: "0.85rem" }}>📖 Bolão no glossário</Link>
          </div>
        </div>

        {/* ── Manual de uso ─────────────────────────────────────────────── */}
        <div className="calc-manual">
          <p className="calc-manual__titulo">📖 Como usar a Calculadora de Rateio de Bolão</p>
          <ol className="calc-manual__passos">
            <li className="calc-manual__passo">
              <span className="calc-manual__num">1</span>
              <div className="calc-manual__texto"><strong>Informe o valor total do prêmio</strong> — o valor líquido recebido, já com eventual imposto retido.</div>
            </li>
            <li className="calc-manual__passo">
              <span className="calc-manual__num">2</span>
              <div className="calc-manual__texto"><strong>Ajuste os participantes e suas cotas</strong> — adicione, remova ou renomeie participantes, e informe quantas cotas cada um comprou (cotas iguais valem o mesmo, sem precisar preencher nada especial).</div>
            </li>
            <li className="calc-manual__passo">
              <span className="calc-manual__num">3</span>
              <div className="calc-manual__texto"><strong>Veja o valor por cota e por participante</strong> — calculado automaticamente e atualizado a cada mudança.</div>
            </li>
          </ol>
          <div className="calc-manual__dica" dangerouslySetInnerHTML={{__html: "💡 <strong>Bolão registrado vs. informal:</strong> num bolão oficial, cada cota já tem comprovante próprio emitido pela Caixa. Num bolão informal (entre amigos), vale combinar por escrito como o grupo vai dividir o prêmio antes do sorteio."}} />
        </div>
      </main>
    </>
  );
}
