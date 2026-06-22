import { notFound } from "next/navigation";
import type { Metadata } from "next";
import AcumulosClient from "@/components/AcumulosClient";
import Subnav from "@/components/Subnav";
import { getLoteriaPorCodigo, getAcumulos } from "@/lib/queries";
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
    "/acumulos",
    `Linha do tempo dos acúmulos — ${nome}`,
    `Todos os acúmulos da ${nome} em ordem cronológica — quais foram os mais longos, os maiores prêmios e como a distribuição muda ao longo da história da loteria.`
  );
}

export default async function AcumulosPage({
  params,
}: {
  params: Promise<{ loteria: string }>;
}) {
  const { loteria: codigoLoteria } = await params;

  if (!isCodigoLoteriaValido(codigoLoteria)) notFound();

  const loteria = await getLoteriaPorCodigo(codigoLoteria);
  if (!loteria) notFound();

  const acumulos = await getAcumulos(loteria.id);

  return (
    <>
      <Subnav codigoLoteria={codigoLoteria} ativa="acumulos" />
      <div className="container secao">
        <p className="eyebrow">Estatísticas de {loteria.nome}</p>
        <h1 className="titulo-edicao">Linha do tempo dos acúmulos</h1>
        <p className="subtitulo-edicao" style={{ maxWidth: 620 }}>
          Cada vez que um concurso fecha sem ganhador na faixa 1, o prêmio acumula. Aqui
          está o histórico completo de como isso aconteceu — quando, por quanto tempo, e
          quanto foi pago ao final de cada sequência.
        </p>

        <AcumulosClient
          acumulos={acumulos}
          nomeLoteria={loteria.nome}
          codigoLoteria={codigoLoteria}
        />

        <div className="aviso-legal" style={{ marginTop: "32px" }}>
          Dados históricos oficiais. Padrões de acúmulo passados não preveem
          comportamento futuro — cada sorteio é independente dos anteriores.
        </div>
      </div>
    </>
  );
}
