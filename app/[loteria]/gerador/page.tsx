import { notFound } from "next/navigation";

// ISR: o plano do visitante é lido no navegador (GeradorClient) e os dados
// estatísticos vêm de prepararDadosGerador, cacheado por loteria e
// invalidado pela tag "concursos" a cada importação.
export const revalidate = 3600;

import type { Metadata } from "next";
import GeradorClient from "@/components/GeradorClient";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import TelemetriaBeacon from "@/components/TelemetriaBeacon";
import { prepararDadosGerador } from "@/lib/gerador";
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

  const loteria = await getLoteriaPorCodigo(codigoLoteria);
  if (!loteria) notFound();

  const dados = await prepararDadosGerador(loteria.id);

  return (
    <>
      <TelemetriaBeacon tool="gerador" lottery={codigoLoteria} />
      <BreadcrumbJsonLd
        itens={[
          { nome: loteria.nome, caminho: `/${codigoLoteria}/resultados` },
          { nome: "Gerador", caminho: `/${codigoLoteria}/gerador` },
        ]}
      />
    <div className="container secao">
      <p className="eyebrow">{loteria.nome}</p>
      <h1 className="titulo-edicao">Gerador de jogos</h1>
      <p className="subtitulo-edicao" style={{ maxWidth: 620 }}>
        Monte combinações aleatórias, com filtros opcionais baseados nas tabelas
        estatísticas desta loteria.
      </p>

      <GeradorClient
        codigoLoteria={codigoLoteria}
        dezenaMin={loteria.dezenaMin}
        dezenaMax={loteria.dezenaMax}
        gridColunas={loteria.gridColunas}
        qtdDezenasPadrao={loteria.qtdDezenasSorteadas}
        dados={dados}
        nomeLoteria={loteria.nome}
      />

      <div className="aviso-legal">
        <strong>Importante:</strong> a geração segue critérios estatísticos definidos
        por você; não há garantia de acerto. Loterias são jogos de sorteio aleatório —
        nenhum filtro aqui altera a probabilidade real de premiação.
      </div>

      <div className="ferramenta-explicacao" style={{ maxWidth: 680, marginTop: 40 }}>
        <h2 className="bloco__titulo">Como o gerador funciona</h2>
        <p>
          O gerador sorteia combinações aleatórias dentro do universo de dezenas da
          {" "}{loteria.nome}.{" "}
          {codigoLoteria === "supersete"
            ? "No modo simples, a escolha é puramente aleatória — qualquer combinação tem a mesma probabilidade de ser gerada."
            : "No modo simples, o gerador aplica uma combinação fixa de filtros (descrita acima do botão de gerar) e sorteia ao acaso entre as combinações que passam neles."}{" "}
          No modo avançado, você
          pode aplicar filtros baseados nas tabelas estatísticas do histórico: dezenas
          por faixa de atraso, quantidade de números primos, distribuição par/ímpar,
          soma das dezenas, dezenas que fazem parte do ciclo atual e mais.
        </p>
        <p>
          Os filtros não aumentam a probabilidade de ganhar — cada combinação específica
          tem sempre a mesma chance, independente de quais critérios foram usados para
          gerá-la. O que eles fazem é restringir o espaço de combinações geradas a um
          subconjunto de sua preferência. Por exemplo, filtrar por distribuição par/ímpar
          equilibrada exclui as divisões mais desequilibradas, que existem mas são
          raras — como explicado no artigo sobre{" "}
          <a href={`/dicas/par-impar`} className="breadcrumb">
            distribuição par/ímpar
          </a>.
        </p>
        <h3 style={{ fontWeight: 600, marginTop: 16, marginBottom: 8, fontSize: "0.95rem" }}>
          Modo avançado (Premium)
        </h3>
        <p>
          Assinantes Premium têm acesso ao modo avançado, que permite configurar até
          dez parâmetros de filtro simultaneamente. O gerador gera combinações
          aleatórias que atendam a todos os critérios selecionados — se nenhuma
          combinação for possível com os filtros definidos, o sistema avisa.
        </p>
      </div>
    </div>
    </>
  );
}
