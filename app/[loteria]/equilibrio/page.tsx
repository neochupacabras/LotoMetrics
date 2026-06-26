export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import EquilibrioClient from "@/components/EquilibrioClient";
import Subnav from "@/components/Subnav";
import { getLoteriaPorCodigo } from "@/lib/queries";
import { isCodigoLoteriaValido } from "@/lib/format";
import { NOME_LOTERIA, metadataPagina } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ loteria: string }>;
}): Promise<Metadata> {
  const { loteria: codigoLoteria } = await params;
  if (!isCodigoLoteriaValido(codigoLoteria)) return {};
  const nome = NOME_LOTERIA[codigoLoteria] ?? codigoLoteria;
  return metadataPagina(
    codigoLoteria,
    "/equilibrio",
    `Índice de Equilíbrio — ${nome}`,
    `Pontue seu jogo de 0 a 100 e veja o quão típico ele é em relação ao histórico da ${nome} — em 7 métricas combinadas numa nota única.`
  );
}

export default async function EquilibrioPage({
  params,
}: {
  params: Promise<{ loteria: string }>;
}) {
  const { loteria: codigoLoteria } = await params;
  if (!isCodigoLoteriaValido(codigoLoteria)) notFound();

  const loteria = await getLoteriaPorCodigo(codigoLoteria);
  if (!loteria) notFound();

  return (
    <>
      <Subnav codigoLoteria={codigoLoteria} ativa="equilibrio" />
      <div className="container secao">
        <p className="eyebrow">Ferramentas de {loteria.nome}</p>
        <h1 className="titulo-edicao">Índice de Equilíbrio</h1>
        <p className="subtitulo-edicao" style={{ maxWidth: 620 }}>
          Selecione as dezenas do seu jogo e receba uma nota de 0 a 100 indicando
          o quão típico ele é em relação ao histórico da {loteria.nome} — combinando
          7 critérios estatísticos em um único indicador visual.
        </p>

        {/* Link cruzado com o Analisador */}
        <p className="equilibrio-crosslink">
          Quer ver cada critério em separado?{" "}
          <Link href={`/${codigoLoteria}/analisador`} className="equilibrio-crosslink__link">
            Use o Analisador de jogo →
          </Link>
        </p>

        <EquilibrioClient
          codigoLoteria={codigoLoteria}
          nomeLoteria={loteria.nome}
          dezenaMin={loteria.dezenaMin}
          dezenaMax={loteria.dezenaMax}
          qtdDezenasSorteadas={loteria.qtdDezenasSorteadas}
        />
      </div>
    </>
  );
}
