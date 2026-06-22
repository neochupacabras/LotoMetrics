import { notFound } from "next/navigation";
import type { Metadata } from "next";
import HeatmapPageClient, { type PeriodoData } from "@/components/HeatmapPageClient";
import Subnav from "@/components/Subnav";
import { getLoteriaPorCodigo, getFrequenciaHeatmap } from "@/lib/queries";
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
    "/heatmap",
    `Heatmap do volante — frequência das dezenas da ${nome}`,
    `Visualize quais dezenas saem mais na ${nome}, em qualquer período do histórico — e por que a variação que você vê é exatamente o esperado pela estatística.`
  );
}

const PERIODOS: { id: string; label: string; lookback: number | null }[] = [
  { id: "tudo",   label: "Todo o histórico", lookback: null },
  { id: "500",    label: "Últimos 500",       lookback: 500  },
  { id: "100",    label: "Últimos 100",       lookback: 100  },
  { id: "50",     label: "Últimos 50",        lookback: 50   },
];

export default async function HeatmapPage({
  params,
}: {
  params: Promise<{ loteria: string }>;
}) {
  const { loteria: codigoLoteria } = await params;

  if (!isCodigoLoteriaValido(codigoLoteria)) notFound();

  const loteria = await getLoteriaPorCodigo(codigoLoteria);
  if (!loteria) notFound();

  // Pre-busca todos os períodos de uma vez — dados pequenos (25 ou 60 linhas × 4 períodos)
  const periodosData: PeriodoData[] = await Promise.all(
    PERIODOS.map(async (p) => {
      const dados = await getFrequenciaHeatmap(loteria.id, p.lookback);
      const totalConcursos = dados[0]?.totalConcursos ?? 0;
      return {
        id: p.id,
        label: p.label,
        totalConcursos,
        frequencias: dados.map(({ dezena, frequencia }) => ({ dezena, frequencia })),
      };
    })
  );

  return (
    <>
      <Subnav codigoLoteria={codigoLoteria} ativa="heatmap" />
      <div className="container secao">
        <p className="eyebrow">Estatísticas de {loteria.nome}</p>
        <h1 className="titulo-edicao">Heatmap do volante</h1>
        <p className="subtitulo-edicao" style={{ maxWidth: 600 }}>
          Cada célula mostra quantas vezes aquela dezena saiu no período selecionado.
          Troque o período e observe como a variação muda — e o que isso revela sobre
          aleatoriedade.
        </p>

        <HeatmapPageClient loteria={loteria} periodos={periodosData} />

        <div className="aviso-legal" style={{ marginTop: "36px" }}>
          Frequência histórica não prevê sorteios futuros. Cada concurso é independente
          dos anteriores — a distribuição observada descreve o passado, não o que vai
          acontecer.
        </div>
      </div>
    </>
  );
}
