import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { SITE_URL, SITE_NAME, articleJsonLd } from "@/lib/seo";
import { getTaxasBcb } from "@/lib/taxas-bcb";
import { calcularRendimentos } from "@/lib/rendimento-premio";
import { formatarMoedaCompacta } from "@/lib/resumo-concurso";
import { CalcRendimentoPremio } from "./CalcClient";
import "./rendimento.css";

// Calculadora "quanto rende o prêmio" (semana 5 do roadmap de growth, gancho
// da Mega da Virada). Taxas do Banco Central, renovadas uma vez por dia.
export const revalidate = 86400;

const CAMINHO = "/calculadoras/quanto-rende-o-premio";

// Exemplo do título: R$ 1 bilhão anunciado (R$ 700 milhões líquidos) na poupança.
async function exemplo() {
  const taxas = await getTaxasBcb();
  const r = calcularRendimentos(1_000_000_000, true, taxas);
  return { taxas, poupancaMes: r.linhas.find((l) => l.id === "poupanca")!.mensal };
}

export async function generateMetadata(): Promise<Metadata> {
  const { poupancaMes } = await exemplo();
  const titulo = `Quanto rende R$ 1 bilhão da loteria? ${formatarMoedaCompacta(poupancaMes)} por mês na poupança`;
  const descricao = `Calculadora de rendimento do prêmio da Mega da Virada e das outras loterias: quanto rende por mês na poupança, no Tesouro Selic e num CDB, já sem os 30% de imposto do prêmio e com as taxas do Banco Central de hoje.`;
  const url = `${SITE_URL}${CAMINHO}`;
  return {
    title: titulo,
    description: descricao,
    alternates: { canonical: url },
    openGraph: { title: titulo, description: descricao, url, siteName: SITE_NAME, locale: "pt_BR", type: "website", images: [`${SITE_URL}/opengraph-image`] },
  };
}

export default async function CalcRendimentoPremioPage() {
  const { taxas } = await exemplo();
  return (
    <>
      <BreadcrumbJsonLd
        itens={[
          { nome: "Calculadoras", caminho: "/calculadoras" },
          { nome: "Quanto rende o prêmio da loteria", caminho: CAMINHO },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            articleJsonLd({
              titulo: "Quanto rende o prêmio da loteria",
              descricao: "Quanto um prêmio de loteria rende por mês na poupança, no Tesouro Selic e num CDB, já sem o imposto do prêmio.",
              caminho: CAMINHO,
            })
          ).replace(/</g, "\\u003c"),
        }}
      />
      <Masthead calculadorasAtiva />
      <main className="container secao" style={{ maxWidth: 720 }}>
        <p className="eyebrow"><Link href="/calculadoras" className="breadcrumb">← Calculadoras</Link></p>
        <div className="calc-header calc-header--pine">
          <span className="calc-header__emoji">💰</span>
          <div>
            <p className="calc-header__cat">Loteria</p>
            <h1 className="titulo-edicao" style={{ marginBottom: 4 }}>Quanto rende o prêmio da loteria</h1>
            <p style={{ color: "var(--ink-soft)", fontSize: "0.9rem" }}>
              Poupança, Tesouro Selic e CDB, com as taxas de hoje e sem o imposto do prêmio
            </p>
          </div>
        </div>

        <CalcRendimentoPremio taxas={taxas} />

        <div className="calc-info calc-info--pine">
          <strong>Primeiro sai o imposto, depois o dinheiro rende.</strong> A Caixa retém 30% de imposto de
          renda sobre o prêmio antes de pagar, então um prêmio anunciado de R$ 1 bilhão vira R$ 700
          milhões na conta. É sobre esse valor líquido que a calculadora mostra o rendimento. Na
          poupança o rendimento é isento; no Tesouro Selic e no CDB há imposto sobre o ganho (aqui, 15%,
          a alíquota de quem deixa o dinheiro aplicado por mais de 2 anos).
        </div>

        <div style={{ marginTop: 28 }}>
          <p className="bloco__titulo" style={{ marginBottom: 12 }}>Relacionados</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/calculadoras/imposto-premio-loteria" className="botao-copiar" style={{ fontSize: "0.85rem" }}>Imposto sobre o prêmio</Link>
            <Link href="/mega-da-virada" className="botao-copiar" style={{ fontSize: "0.85rem" }}>Mega da Virada</Link>
            <Link href="/recordes" className="botao-copiar" style={{ fontSize: "0.85rem" }}>Maiores prêmios das loterias</Link>
            <Link href="/calculadoras/juros-compostos" className="botao-copiar" style={{ fontSize: "0.85rem" }}>Juros compostos</Link>
          </div>
        </div>

        <div className="calc-manual">
          <p className="calc-manual__titulo">Como a conta é feita</p>
          <ol className="calc-manual__passos">
            <li className="calc-manual__passo">
              <span className="calc-manual__num">1</span>
              <div className="calc-manual__texto">
                <strong>Valor líquido.</strong> Se o valor digitado é o anunciado antes do sorteio, saem os 30% de
                imposto retidos pela Caixa. Se já é o valor pago, ele entra como está.
              </div>
            </li>
            <li className="calc-manual__passo">
              <span className="calc-manual__num">2</span>
              <div className="calc-manual__texto">
                <strong>Taxas do Banco Central.</strong> Poupança: o rendimento do último mês. Tesouro Selic: a Selic
                menos a custódia da B3 (0,20% ao ano). CDB: 100% do CDI. As taxas são de {taxas.data}.
              </div>
            </li>
            <li className="calc-manual__passo">
              <span className="calc-manual__num">3</span>
              <div className="calc-manual__texto">
                <strong>Imposto sobre o ganho.</strong> 15% no Tesouro Selic e no CDB, a alíquota para prazos acima
                de 2 anos. Em prazos menores ela é maior (de 22,5% a 17,5%).
              </div>
            </li>
          </ol>
          <div className="calc-manual__dica">
            <strong>É uma estimativa, não uma recomendação de investimento.</strong> As taxas mudam ao longo do tempo
            e o rendimento real depende do produto, do prazo e da instituição. Num CDB, a garantia do FGC vai só até
            R$ 250 mil por CPF e por instituição, muito abaixo de um prêmio grande. Para decidir onde aplicar,
            procure um profissional certificado.
          </div>
        </div>
      </main>
    </>
  );
}
