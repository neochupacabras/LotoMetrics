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

        <div className="ferramenta-explicacao" style={{ maxWidth: 680, marginBottom: 32 }}>
          <h2 className="bloco__titulo">O que é o Índice de Equilíbrio</h2>
          <p>
            O Índice de Equilíbrio combina 7 critérios estatísticos em uma única nota
            de 0 a 100, indicando o quão "típico" é o seu jogo em relação ao histórico
            da {loteria.nome}. Uma nota próxima de 100 significa que o jogo tem um perfil
            próximo da mediana histórica em todos os critérios; notas mais baixas indicam
            que o jogo se afasta do perfil típico em alguma ou várias dimensões.
          </p>
          <p>
            Os 7 critérios avaliados são: soma das dezenas, distribuição par/ímpar,
            tamanho da maior sequência consecutiva, divisão moldura/centro do volante,
            quantidade de números primos, múltiplos de 3 e números de Fibonacci. Para
            cada critério, o jogo é comparado com a distribuição de todas as combinações
            possíveis — não com o histórico de resultados. Isso significa que a nota é
            baseada em combinatória pura, e não muda com o tempo ou com concursos recentes.
          </p>
          <p>
            Para entender qualquer um desses critérios individualmente, o{" "}
            <Link href={`/${codigoLoteria}/analisador`} className="breadcrumb">
              Analisador de jogo
            </Link>{" "}
            mostra cada métrica separadamente com sua posição no percentil de todas as
            combinações possíveis.
          </p>
          <h3 style={{ fontWeight: 600, marginTop: 16, marginBottom: 8, fontSize: "0.95rem" }}>
            A nota alta garante mais chance de ganhar?
          </h3>
          <p>
            Não. O Índice de Equilíbrio mede tipicidade estatística — o quão próximo
            o jogo está do perfil médio historicamente observado. Ele não mede nem
            prediz probabilidade de premiação. Um jogo com nota 20 tem exatamente a
            mesma chance de ganhar que um jogo com nota 95: 1 em {loteria.nome === "Lotofácil" ? "3.268.760" : "50.063.860"}.
            O índice é uma ferramenta de caracterização, não de predição.
          </p>
        </div>

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
