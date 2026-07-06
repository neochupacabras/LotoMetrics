import { notFound } from "next/navigation";
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import ConferidorClient from "@/components/ConferidorClient";
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
    "/conferidor",
    `Conferidor de jogos ${nome} — todos os concursos de uma vez`,
    `Confira quantos pontos uma combinação de ${nome} já fez em cada concurso do histórico, e simule o retorno financeiro de tê-la jogado sempre.`
  );
}

export default async function ConferidorPage({
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

  return (
    <div className="container secao">
      <p className="eyebrow">{loteria.nome}</p>
      <h1 className="titulo-edicao">Conferidor de jogos</h1>
      <p className="subtitulo-edicao" style={{ maxWidth: 620 }}>
        Veja como um jogo se saiu contra todo o histórico de concursos já sorteados —
        quantos pontos faria em cada um, e se já bateu alguma faixa premiada.
        {!premium && <span className="conferidor-aviso-free"> (Free: 1 jogo por sessão)</span>}
      </p>

      <div className="ferramenta-explicacao" style={{ maxWidth: 680, marginBottom: 32 }}>
        <h2 className="bloco__titulo">O que o conferidor mostra</h2>
        <p>
          O conferidor analisa uma combinação de dezenas contra todo o histórico de
          concursos já sorteados da {loteria.nome} e mostra, concurso por concurso,
          quantos pontos aquela combinação teria feito — e se teria acertado alguma
          faixa premiada. É uma forma de ver o desempenho histórico real de qualquer
          jogo, sem viés de confirmação.
        </p>
        <p>
          Esse é o antídoto para o viés de confirmação descrito no artigo sobre{" "}
          <a href={`/${codigoLoteria}/dicas/vieses-cognitivos`} className="breadcrumb">
            vieses cognitivos
          </a>: em vez de lembrar seletivamente dos concursos em que um jogo "quase ganhou",
          o conferidor mostra todos os concursos — incluindo os que ficaram longe.
          O resultado honesto costuma ser diferente da impressão que o apostador tinha.
        </p>
        <p>
          Além da pontuação por concurso, o conferidor calcula o custo total de ter jogado
          essa combinação em todos os concursos do período, os prêmios brutos que teria
          ganho e o saldo final — que quase sempre é negativo, refletindo o retorno
          ao apostador de{" "}
          <a href={`/${codigoLoteria}/dicas/retorno-ao-apostador`} className="breadcrumb">
            ~43% da arrecadação
          </a>{" "}que a Caixa destina a prêmios.
        </p>
        <h3 style={{ fontWeight: 600, marginTop: 16, marginBottom: 8, fontSize: "0.95rem" }}>
          Versão Premium
        </h3>
        <p>
          Usuários gratuitos podem conferir 1 jogo por sessão. Assinantes Premium podem
          conferir múltiplos jogos simultaneamente e também fazer conferência por foto
          do bilhete físico — útil para verificar rapidamente o resultado de apostas
          feitas na lotérica.
        </p>
      </div>

      <ConferidorClient
        codigoLoteria={codigoLoteria}
        dezenaMin={loteria.dezenaMin}
        dezenaMax={loteria.dezenaMax}
        qtdDezenasSorteadas={loteria.qtdDezenasSorteadas}
        jogoUnico={!premium}
        logado={logado}
        isPremium={premium}
      />
    </div>
  );
}
