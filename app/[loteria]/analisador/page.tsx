import { notFound } from "next/navigation";
import type { Metadata } from "next";
import AnalisadorClient from "@/components/AnalisadorClient";
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
    "/analisador",
    `Analisador de jogo ${nome} — diagnóstico estatístico`,
    `Selecione suas dezenas e veja em tempo real o perfil estatístico do jogo: soma, par/ímpar, sequências, moldura/centro, primos e mais — comparado com todas as combinações possíveis da ${nome}.`
  );
}

export default async function AnalisadorPage({
  params,
}: {
  params: Promise<{ loteria: string }>;
}) {
  const { loteria: codigoLoteria } = await params;

  if (!isCodigoLoteriaValido(codigoLoteria)) {
    notFound();
  }

  const loteria = await getLoteriaPorCodigo(codigoLoteria);
  if (!loteria) {
    notFound();
  }

  return (
    <>
      <Subnav codigoLoteria={codigoLoteria} ativa="analisador" />
      <div className="container secao">
      <p className="eyebrow">Estatísticas de {loteria.nome}</p>
      <h1 className="titulo-edicao">Analisador de jogo</h1>
      <p className="subtitulo-edicao" style={{ maxWidth: 600 }}>
        Selecione as dezenas do seu jogo e veja instantaneamente o perfil estatístico
        de cada combinação — comparado com todas as combinações possíveis da{" "}
        {loteria.nome}.
      </p>

      <AnalisadorClient
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
