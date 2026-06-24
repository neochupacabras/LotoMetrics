export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ComparadorEstrategiasClient from "@/components/ComparadorEstrategiasClient";
import Subnav from "@/components/Subnav";
import { getLoteriaPorCodigo } from "@/lib/queries";
import { isCodigoLoteriaValido } from "@/lib/format";
import { NOME_LOTERIA, metadataPagina } from "@/lib/seo";
import { getPlanoPremium } from "@/lib/plano";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ loteria: string }>;
}): Promise<Metadata> {
  const { loteria } = await params;
  if (!isCodigoLoteriaValido(loteria)) return {};
  const nome = NOME_LOTERIA[loteria] ?? loteria;
  return metadataPagina(
    loteria,
    "/estrategias",
    `Comparador de estratégias — ${nome}`,
    `Compare duas estratégias estatísticas no histórico completo da ${nome} e veja qual teria funcionado melhor.`
  );
}

const LIMITE_FREE = 100;

export default async function EstrategiasPage({
  params,
}: {
  params: Promise<{ loteria: string }>;
}) {
  const { loteria: codigoLoteria } = await params;
  if (!isCodigoLoteriaValido(codigoLoteria)) notFound();

  const [loteria, { logado, premium }] = await Promise.all([
    getLoteriaPorCodigo(codigoLoteria),
    getPlanoPremium(),
  ]);
  if (!loteria) notFound();

  return (
    <>
      <Subnav codigoLoteria={codigoLoteria} ativa="estrategias" />
      <div className="container secao">
        <p className="eyebrow">Ferramentas de {loteria.nome}</p>
        <h1 className="titulo-edicao">Comparador de estratégias</h1>
        <p className="subtitulo-edicao" style={{ maxWidth: 620 }}>
          Defina dois conjuntos de filtros estatísticos e veja qual teria coberto mais
          concursos — e qual teria gerado melhor retorno financeiro no histórico da {loteria.nome}.
          Uma ferramenta para testar hipóteses, não para prever resultados.
        </p>

        {!premium && (
          <div className="simulador-aviso-free" style={{ marginBottom: 24 }}>
            <span className="simulador-aviso-free__badge">Free</span>
            Análise limitada aos últimos {LIMITE_FREE} concursos.{" "}
            <a href="/assinar" className="simulador-aviso-free__link">
              Assine o Premium para rodar no histórico completo →
            </a>
          </div>
        )}

        <ComparadorEstrategiasClient
          codigoLoteria={codigoLoteria}
          nomeLoteria={loteria.nome}
          dezenaMin={loteria.dezenaMin}
          dezenaMax={loteria.dezenaMax}
          qtdDezenasSorteadas={loteria.qtdDezenasSorteadas}
          premium={premium}
          logado={logado}
          limiteHistorico={premium ? null : LIMITE_FREE}
        />
      </div>
    </>
  );
}
