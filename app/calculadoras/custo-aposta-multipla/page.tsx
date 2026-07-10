import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { CalcCustoApostaMultipla } from "./CalcClient";

export const metadata: Metadata = {
  title: "Calculadora de Custo da Aposta Múltipla — LotoAnalítica",
  description: "Descubra a quantos jogos simples uma aposta com mais dezenas equivale e o valor total, para Lotofácil, Mega-Sena, Quina, Dupla Sena, Timemania, Dia de Sorte e +Milionária.",
  alternates: { canonical: `${SITE_URL}/calculadoras/custo-aposta-multipla` },
  openGraph: { title: "Custo da Aposta Múltipla", description: "Quantos jogos simples uma aposta com mais dezenas equivale, e quanto custa.", url: `${SITE_URL}/calculadoras/custo-aposta-multipla`, siteName: SITE_NAME, locale: "pt_BR", type: "website", images: [`${SITE_URL}/opengraph-image`] },
};

export default function CalcCustoApostaMultiplaPage() {
  return (
    <>
      <Masthead calculadorasAtiva />
      <main className="container secao" style={{ maxWidth: 720 }}>
        <p className="eyebrow"><Link href="/calculadoras" className="breadcrumb">← Calculadoras</Link></p>
        <div className="calc-header calc-header--rust">
          <span className="calc-header__emoji">🧾</span>
          <div>
            <p className="calc-header__cat">Loteria</p>
            <h1 className="titulo-edicao" style={{ marginBottom: 4 }}>Custo da Aposta Múltipla</h1>
            <p style={{ color: "var(--ink-soft)", fontSize: "0.9rem" }}>Quanto custa apostar em mais dezenas do que o mínimo, em qualquer loteria</p>
          </div>
        </div>
        <CalcCustoApostaMultipla />

        <div className="calc-info calc-info--rust">
          <strong>Isso não é um "fechamento com desconto".</strong> Uma aposta múltipla com <em>m</em> dezenas custa exatamente o mesmo que jogar, separadamente, todas as C(m, mínimo) combinações simples possíveis — não há economia nenhuma nisso, matematicamente. O que existe são <Link href="/dicas/fechamento" className="breadcrumb">fechamentos reduzidos</Link>, que usam tabelas específicas para cobrir menos jogos garantindo um prêmio mínimo — essa é uma técnica totalmente diferente, disponível na ferramenta de Fechamentos de cada loteria.
        </div>

        <div style={{ marginTop: 28 }}>
          <p className="bloco__titulo" style={{ marginBottom: 12 }}>Relacionados</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/dicas/fechamento" className="botao-copiar" style={{ fontSize: "0.85rem" }}>📖 Como funciona um fechamento</Link>
            <Link href="/dicas/mais-dezenas-vale-a-pena" className="botao-copiar" style={{ fontSize: "0.85rem" }}>📖 Vale a pena apostar em mais dezenas?</Link>
            <Link href="/calculadoras/combinacoes" className="botao-copiar" style={{ fontSize: "0.85rem" }}>🔢 Combinações C(n,k)</Link>
          </div>
        </div>

        {/* ── Manual de uso ─────────────────────────────────────────────── */}
        <div className="calc-manual">
          <p className="calc-manual__titulo">📖 Como usar a Calculadora de Custo da Aposta Múltipla</p>
          <ol className="calc-manual__passos">
            <li className="calc-manual__passo">
              <span className="calc-manual__num">1</span>
              <div className="calc-manual__texto"><strong>Escolha a loteria</strong> — cada uma tem sua aposta mínima e seu preço base.</div>
            </li>
            <li className="calc-manual__passo">
              <span className="calc-manual__num">2</span>
              <div className="calc-manual__texto"><strong>Informe quantas dezenas quer marcar</strong> — dentro do intervalo permitido para essa loteria.</div>
            </li>
            <li className="calc-manual__passo">
              <span className="calc-manual__num">3</span>
              <div className="calc-manual__texto"><strong>Veja o número de jogos equivalentes e o custo total</strong> — calculado por combinatória, não por tabela de preços fixa.</div>
            </li>
          </ol>
          <div className="calc-manual__dica" dangerouslySetInnerHTML={{__html: "💡 <strong>Valores de referência:</strong> os preços usados são os valores oficiais vigentes em 2026. A Caixa reajusta preços periodicamente — confirme o valor exato no momento da aposta em loterias.caixa.gov.br."}} />
        </div>
      </main>
    </>
  );
}
