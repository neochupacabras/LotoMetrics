import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SimuladorHistoricoClient from "@/components/SimuladorHistoricoClient";
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
    "/simulador",
    `Simulador histórico — e se eu tivesse jogado todo concurso? ${nome}`,
    `Escolha qualquer combinação e veja quanto teria gasto e ganho se tivesse jogado esse jogo em cada concurso da história da ${nome}. Resultado honesto, com os prêmios históricos reais.`
  );
}

export default async function SimuladorPage({
  params,
}: {
  params: Promise<{ loteria: string }>;
}) {
  const { loteria: codigoLoteria } = await params;

  if (!isCodigoLoteriaValido(codigoLoteria)) notFound();

  const loteria = await getLoteriaPorCodigo(codigoLoteria);
  if (!loteria) notFound();

  return (
    <div className="container secao">
        <p className="eyebrow">Estatísticas de {loteria.nome}</p>
        <h1 className="titulo-edicao">E se eu tivesse jogado todo concurso?</h1>
        <p className="subtitulo-edicao" style={{ maxWidth: 600 }}>
          Escolha uma combinação e veja quanto teria gasto e ganho se tivesse apostado
          esse mesmo jogo em cada um dos {loteria.nome === "Lotofácil" ? "3.700+" : "3.000+"} concursos
          da história da {loteria.nome} — com os prêmios históricos reais.
        </p>

        <SimuladorHistoricoClient
          codigoLoteria={codigoLoteria}
          nomeLoteria={loteria.nome}
          dezenaMin={loteria.dezenaMin}
          dezenaMax={loteria.dezenaMax}
          qtdDezenasSorteadas={loteria.qtdDezenasSorteadas}
        />
      </div>
  );
}
