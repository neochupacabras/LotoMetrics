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

      <div className="ferramenta-explicacao" style={{ maxWidth: 680, marginBottom: 32 }}>
        <h2 className="bloco__titulo">Como funciona o simulador histórico</h2>
        <p>
          O simulador responde à pergunta: "e se eu tivesse jogado esse jogo todo
          concurso desde o início?" Você escolhe qualquer combinação de dezenas e o
          simulador calcula, para cada concurso do histórico da {loteria.nome}, quanto
          teria gasto (o preço do bilhete em cada concurso), quais prêmios teria ganho
          (usando os valores históricos reais de cada faixa em cada concurso) e o saldo
          acumulado ao longo do tempo.
        </p>
        <p>
          O resultado é quase sempre negativo — e isso é esperado. Como explicado no
          artigo sobre{" "}
          <a href={`/${codigoLoteria}/dicas/retorno-ao-apostador`} className="breadcrumb">
            retorno ao apostador
          </a>, a Caixa destina aproximadamente 43% da arrecadação a prêmios, o que
          significa que o apostador espera perder ~57% do que aposta no longo prazo.
          O simulador transforma esse número abstrato em um resultado concreto com dados
          reais do histórico.
        </p>
        <p>
          O simulador também mostra os momentos em que o jogo ganhou alguma faixa ao
          longo do tempo — e a diferença entre o prêmio ganho e o total acumulado
          apostado até aquele ponto. É uma ferramenta de clareza financeira, não de
          estratégia: mostra o que teria acontecido, sem prometer o que vai acontecer.
        </p>
        <h3 style={{ fontWeight: 600, marginTop: 16, marginBottom: 8, fontSize: "0.95rem" }}>
          Free vs Premium
        </h3>
        <p>
          A versão gratuita simula os últimos 100 concursos. A versão Premium simula
          o histórico completo — mais de 3.700 concursos para a Lotofácil e mais de
          3.000 para a Mega-Sena — o que permite ver o desempenho de qualquer jogo
          ao longo de toda a história da loteria.
        </p>
      </div>

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
