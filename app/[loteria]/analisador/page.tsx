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
      <p className="equilibrio-crosslink">
          Quer uma nota única que combine todos os critérios?{" "}
          <a href={`/${codigoLoteria}/equilibrio`} className="equilibrio-crosslink__link">
            Experimente o Índice de Equilíbrio →
          </a>
        </p>
      <p className="subtitulo-edicao" style={{ maxWidth: 600 }}>
        Selecione as dezenas do seu jogo e veja instantaneamente o perfil estatístico
        de cada combinação — comparado com todas as combinações possíveis da{" "}
        {loteria.nome}.
      </p>

      <div className="ferramenta-explicacao" style={{ maxWidth: 680, marginBottom: 32 }}>
        <h2 className="bloco__titulo">O que o analisador calcula</h2>
        <p>
          O analisador recebe uma combinação de dezenas e calcula, em tempo real, o
          perfil estatístico completo daquele jogo — comparando cada métrica com a
          distribuição de todas as combinações possíveis. Para cada critério, você vê
          não só o valor do seu jogo mas também em qual percentil ele se encontra entre
          todas as combinações existentes.
        </p>
        <p>
          As métricas calculadas incluem: soma das dezenas (comparada com a distribuição
          de todas as somas possíveis), distribuição par/ímpar (quantas dezenas pares e
          ímpares), maior sequência consecutiva, divisão moldura/centro do volante,
          quantidade de primos, múltiplos de 3 e números de Fibonacci no jogo. Para cada
          uma dessas métricas, existe um artigo explicativo na seção{" "}
          <a href={`/${codigoLoteria}/dicas`} className="breadcrumb">Dicas e estratégias</a>.
        </p>
        <p>
          O objetivo do analisador é responder: "esse jogo tem um perfil estatístico
          típico ou é estatisticamente incomum?" Um jogo com soma muito baixa, por
          exemplo, está em um percentil raro da distribuição de somas — não porque seja
          melhor ou pior, mas porque poucos das milhões de combinações possíveis têm
          soma tão baixa. Essa informação não prevê o próximo sorteio, mas ajuda a
          entender onde o jogo se encaixa no espaço de todas as possibilidades.
        </p>
      </div>

      <AnalisadorClient
        codigoLoteria={codigoLoteria}
        nomeLoteria={loteria.nome}
        dezenaMin={loteria.dezenaMin}
        dezenaMax={loteria.dezenaMax}
        qtdDezenasSorteadas={loteria.qtdDezenasSorteadas}
        gridColunas={loteria.gridColunas}
      />
    </div>
    </>
  );
}
