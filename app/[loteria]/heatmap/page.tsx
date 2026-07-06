export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import HeatmapPageClient, { type PeriodoData } from "@/components/HeatmapPageClient";
import Subnav from "@/components/Subnav";
import { getLoteriaPorCodigo, getFrequenciaHeatmap } from "@/lib/queries";
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
    "/heatmap",
    `Heatmap do volante — frequência das dezenas da ${nome}`,
    `Visualize quais dezenas saem mais na ${nome}, em qualquer período do histórico.`
  );
}

const TODOS_PERIODOS: { id: string; label: string; lookback: number | null }[] = [
  { id: "tudo", label: "Todo o histórico", lookback: null },
  { id: "500",  label: "Últimos 500",      lookback: 500  },
  { id: "100",  label: "Últimos 100",      lookback: 100  },
  { id: "50",   label: "Últimos 50",       lookback: 50   },
];

export default async function HeatmapPage({
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

  // Free: busca só o período "tudo". Premium: busca todos os 4.
  // Os períodos bloqueados são renderizados no client com overlay,
  // mas sem dados reais (evita query desnecessária).
  const periodosParaBuscar = premium ? TODOS_PERIODOS : [TODOS_PERIODOS[0]];

  const periodosComDados: PeriodoData[] = await Promise.all(
    periodosParaBuscar.map(async (p) => {
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

  // Para usuários free, adiciona os períodos premium como "fantasmas" sem dados
  const periodosData: (PeriodoData & { bloqueado?: boolean })[] = premium
    ? periodosComDados
    : [
        ...periodosComDados,
        ...TODOS_PERIODOS.slice(1).map((p) => ({
          id: p.id,
          label: p.label,
          totalConcursos: 0,
          frequencias: [],
          bloqueado: true,
        })),
      ];

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

        <div className="ferramenta-explicacao" style={{ maxWidth: 680, marginBottom: 32 }}>
          <h2 className="bloco__titulo">Como ler o heatmap</h2>
          <p>
            O heatmap colore cada dezena do volante de acordo com sua frequência no
            período selecionado — quanto mais escura a célula, mais vezes aquela dezena
            saiu. É uma forma visual de ver a distribuição de frequências que complementa
            as tabelas numéricas, tornando padrões de variação mais fáceis de perceber
            à primeira vista.
          </p>
          <p>
            A interpretação correta é importante: as diferenças de intensidade que você
            vê não indicam dezenas "melhores" ou "piores" para jogar. Como explicado no
            artigo sobre{" "}
            <a href={`/${codigoLoteria}/dicas/frequencia`} className="breadcrumb">
              frequência
            </a>, a variação observada está dentro do intervalo esperado por pura
            aleatoriedade — qualquer sorteio honesto produz esse tipo de distribuição
            desigual naturalmente. O heatmap descreve o passado, não prevê o futuro.
          </p>
          <p>
            O recurso mais interessante do heatmap é comparar períodos diferentes:
            selecione "todo o histórico" e depois "últimos 50 concursos" e observe
            como as dezenas que parecem "mais quentes" mudam completamente. Isso
            ilustra visualmente que frequências de curto prazo são muito mais voláteis
            do que as de longo prazo — e que nenhuma delas prevê o próximo concurso.
          </p>
          <h3 style={{ fontWeight: 600, marginTop: 16, marginBottom: 8, fontSize: "0.95rem" }}>
            Períodos disponíveis (Premium)
          </h3>
          <p>
            A versão gratuita mostra o heatmap do histórico completo. Assinantes Premium
            também podem ver os períodos dos últimos 500, 100 e 50 concursos, permitindo
            a comparação entre o comportamento histórico de longo prazo e o comportamento
            recente.
          </p>
        </div>

        <HeatmapPageClient
          loteria={loteria}
          periodos={periodosData}
          premium={premium}
          logado={logado}
        />

        <div className="aviso-legal" style={{ marginTop: "36px" }}>
          Frequência histórica não prevê sorteios futuros. Cada concurso é independente
          dos anteriores — a distribuição observada descreve o passado, não o que vai
          acontecer.
        </div>
      </div>
    </>
  );
}
