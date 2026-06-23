import { notFound } from "next/navigation";
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import GeradorClient from "@/components/GeradorClient";
import { prepararDadosGerador } from "@/lib/gerador";
import { getLoteriaPorCodigo } from "@/lib/queries";
import { isCodigoLoteriaValido } from "@/lib/format";
import { NOME_LOTERIA, metadataPagina } from "@/lib/seo";
import { getPlanoPremium } from "@/lib/plano";

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
    "/gerador",
    `Gerador de jogos ${nome} — combinações com filtros estatísticos`,
    `Monte combinações aleatórias de ${nome} com filtros opcionais baseados nas tabelas estatísticas do histórico: atraso, ciclo, dezenas quentes e mais.`
  );
}

export default async function GeradorPage({
  params,
}: {
  params: Promise<{ loteria: string }>;
}) {
  const { loteria: codigoLoteria } = await params;

  if (!isCodigoLoteriaValido(codigoLoteria)) {
    notFound();
  }

  const [loteria, { logado, premium }] = await Promise.all([
    getLoteriaPorCodigo(codigoLoteria),
    getPlanoPremium(),
  ]);
  if (!loteria) notFound();

  const dados = await prepararDadosGerador(loteria.id);

  return (
    <div className="container secao">
      <p className="eyebrow">{loteria.nome}</p>
      <h1 className="titulo-edicao">Gerador de jogos</h1>
      <p className="subtitulo-edicao" style={{ maxWidth: 620 }}>
        Monte combinações aleatórias, com filtros opcionais baseados nas tabelas
        estatísticas desta loteria.
      </p>

      <GeradorClient
        dezenaMin={loteria.dezenaMin}
        dezenaMax={loteria.dezenaMax}
        qtdDezenasPadrao={loteria.qtdDezenasSorteadas}
        dados={dados}
        modoAvancadoLiberado={premium}
        logado={logado}
      />

      <div className="aviso-legal">
        <strong>Importante:</strong> a geração segue critérios estatísticos definidos
        por você; não há garantia de acerto. Loterias são jogos de sorteio aleatório —
        nenhum filtro aqui altera a probabilidade real de premiação.
      </div>
    </div>
  );
}
