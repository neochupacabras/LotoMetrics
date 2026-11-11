// Recalcula o índice a partir do histórico completo — muda no máximo uma
// vez por dia (um concurso novo), daí caber cache de 1h.
export const revalidate = 3600;
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import EquilibrioClient from "@/components/EquilibrioClient";
import Subnav from "@/components/Subnav";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import TelemetriaBeacon from "@/components/TelemetriaBeacon";
import { getLoteriaPorCodigo } from "@/lib/queries";
import { isCodigoLoteriaValido } from "@/lib/format";
import { NOME_LOTERIA, metadataPagina } from "@/lib/seo";
import { qtdCriteriosEquilibrio, pesosParaLoteria } from "@/lib/equilibrio";

// Nome de cada critério na ordem em que a nota os pondera.
const NOMES_CRITERIOS: [string, string][] = [
  ["soma", "soma das dezenas"],
  ["pares", "pares e ímpares"],
  ["sequencias", "maior sequência consecutiva"],
  ["primos", "números primos"],
  ["fibonacci", "números de Fibonacci"],
  ["multiplos3", "múltiplos de 3"],
  ["moldura", "moldura e centro do volante"],
];

function descricaoPesos(codigoLoteria: string): string {
  const pesos = pesosParaLoteria(codigoLoteria);
  return NOMES_CRITERIOS.filter(([chave]) => (pesos[chave] ?? 0) > 0)
    .map(([chave, nome]) => `${nome} (${Math.round(pesos[chave] * 100)}%)`)
    .join(", ");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ loteria: string }>;
}): Promise<Metadata> {
  const { loteria: codigoLoteria } = await params;
  if (!isCodigoLoteriaValido(codigoLoteria)) return {};
  const nome = NOME_LOTERIA[codigoLoteria] ?? codigoLoteria;
  const qtdCriterios = qtdCriteriosEquilibrio(codigoLoteria);
  return metadataPagina(
    codigoLoteria,
    "/equilibrio",
    `Índice de Equilíbrio — ${nome}`,
    `Pontue seu jogo de 0 a 100 e veja o quão típico ele é em relação ao histórico da ${nome} — em ${qtdCriterios} métricas combinadas numa nota única.`
  );
}

// Probabilidade da faixa principal (aposta mínima) de cada loteria — não é
// sempre um simples C(universo, sorteadas): Lotomania e Timemania têm aposta
// mínima maior que o número de dezenas sorteadas, então a conta real é
// hipergeométrica; +Milionária combina dezenas e trevos; Super Sete é
// 10 elevado a 7 colunas. Todos os valores abaixo foram verificados.
const PROBABILIDADE_FAIXA_PRINCIPAL: Record<string, string> = {
  lotofacil: "3.268.760",
  megasena: "50.063.860",
  quina: "24.040.016",
  lotomania: "11.372.636",
  diadesorte: "2.629.575",
  maismilionaria: "238.360.500",
  timemania: "26.472.637",
  duplasena: "15.890.700",
  supersete: "10.000.000",
};

export default async function EquilibrioPage({
  params,
}: {
  params: Promise<{ loteria: string }>;
}) {
  const { loteria: codigoLoteria } = await params;
  if (!isCodigoLoteriaValido(codigoLoteria)) notFound();

  const loteria = await getLoteriaPorCodigo(codigoLoteria);
  if (!loteria) notFound();

  const qtdCriterios = qtdCriteriosEquilibrio(codigoLoteria);

  return (
    <>
      <TelemetriaBeacon tool="equilibrio" lottery={codigoLoteria} />
      <BreadcrumbJsonLd
        itens={[
          { nome: loteria.nome, caminho: `/${codigoLoteria}/resultados` },
          { nome: "Equilíbrio", caminho: `/${codigoLoteria}/equilibrio` },
        ]}
      />
      <Subnav codigoLoteria={codigoLoteria} ativa="equilibrio" />
      <div className="container secao">
        <p className="eyebrow">Ferramentas de {loteria.nome}</p>
        <h1 className="titulo-edicao">Índice de Equilíbrio</h1>
        <p className="subtitulo-edicao" style={{ maxWidth: 620 }}>
          Selecione as dezenas do seu jogo e receba uma nota de 0 a 100 indicando
          o quão típico ele é em relação ao histórico da {loteria.nome} — combinando
          {" "}{qtdCriterios} critérios estatísticos em um único indicador visual.
        </p>

        {/* Link cruzado com o Analisador */}
        <p className="equilibrio-crosslink">
          Quer ver cada critério em separado?{" "}
          <Link href={`/${codigoLoteria}/analisador`} className="equilibrio-crosslink__link">
            Use o Analisador de jogo →
          </Link>
        </p>

        <EquilibrioClient
          codigoLoteria={codigoLoteria}
          nomeLoteria={loteria.nome}
          dezenaMin={loteria.dezenaMin}
          dezenaMax={loteria.dezenaMax}
          qtdDezenasSorteadas={loteria.qtdDezenasSorteadas}
        />

        <div className="ferramenta-explicacao" style={{ maxWidth: 680, marginTop: 40 }}>
          <h2 className="bloco__titulo">O que é o Índice de Equilíbrio</h2>
          <p>
            O Índice de Equilíbrio combina {qtdCriteriosEquilibrio(codigoLoteria)} critérios
            estatísticos em uma única nota de 0 a 100, indicando o quão comum é o perfil
            do seu jogo nos concursos já sorteados da {loteria.nome}.
          </p>
          <p>
            Para cada critério, o site verifica em quantos % dos concursos do histórico
            apareceu o mesmo valor do seu jogo (na soma, a mesma faixa de 10 em 10).
            Um valor que aparece em 12% ou mais dos concursos recebe nota máxima naquele
            critério; abaixo disso, a nota cai na mesma proporção. A nota final é a média
            ponderada dos critérios: {descricaoPesos(codigoLoteria)}. Como a comparação é
            com o histórico, a nota pode mudar um pouco conforme entram novos concursos.
          </p>
          <p>
            Faixas: 75 ou mais, típico; 55 a 74, equilibrado; 35 a 54, razoável; abaixo
            de 35, atípico. A maioria das combinações possíveis recebe nota alta — o
            índice diferencia pouco os jogos comuns entre si e serve mais para apontar
            jogos com um perfil muito incomum.
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
            mesma chance de ganhar que um jogo com nota 95: 1 em{" "}
            {PROBABILIDADE_FAIXA_PRINCIPAL[codigoLoteria] ?? "milhões"}.
            O índice é uma ferramenta de caracterização, não de predição.
          </p>
        </div>
      </div>
    </>
  );
}
