import { notFound } from "next/navigation";
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import SimuladorHistoricoClient from "@/components/SimuladorHistoricoClient";
import BloqueadoPremium from "@/components/BloqueadoPremium";
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
    "/simulador",
    `Simulador histórico — e se eu tivesse jogado todo concurso? ${nome}`,
    `Escolha qualquer combinação e veja quanto teria gasto e ganho se tivesse jogado esse jogo em cada concurso da história da ${nome}. Resultado honesto, com os prêmios históricos reais.`
  );
}

// Free: últimos 100 concursos. Premium: histórico completo.
const LIMITE_FREE = 100;

export default async function SimuladorPage({
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

  const totalLabel = loteria.nome === "Lotofácil" ? "3.700+" : "3.000+";

  return (
    <div className="container secao">
      <p className="eyebrow">Estatísticas de {loteria.nome}</p>
      <h1 className="titulo-edicao">E se eu tivesse jogado todo concurso?</h1>
      <p className="subtitulo-edicao" style={{ maxWidth: 600 }}>
        Escolha uma combinação e veja quanto teria gasto e ganho se tivesse apostado
        esse mesmo jogo {premium ? `em cada um dos ${totalLabel} concursos` : "nos últimos 100 concursos"} da história da {loteria.nome} — com os prêmios históricos reais.
      </p>

      {!premium && (
        <div className="simulador-aviso-free">
          <span className="simulador-aviso-free__badge">Free</span>
          Simulação limitada aos últimos {LIMITE_FREE} concursos.{" "}
          <a href="/assinar" className="simulador-aviso-free__link">
            Assine o Premium para rodar no histórico completo →
          </a>
        </div>
      )}

      <SimuladorHistoricoClient
        codigoLoteria={codigoLoteria}
        nomeLoteria={loteria.nome}
        dezenaMin={loteria.dezenaMin}
        dezenaMax={loteria.dezenaMax}
        qtdDezenasSorteadas={loteria.qtdDezenasSorteadas}
        limiteHistorico={premium ? null : LIMITE_FREE}
        logado={logado}
        premium={premium}
      />
    </div>
  );
}
