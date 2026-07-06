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

      <div className="ferramenta-explicacao" style={{ maxWidth: 680, marginBottom: 32 }}>
        <h2 className="bloco__titulo">Como o gerador funciona</h2>
        <p>
          O gerador sorteia combinações aleatórias dentro do universo de dezenas da
          {" "}{loteria.nome}. No modo simples, a escolha é puramente aleatória — qualquer
          combinação tem a mesma probabilidade de ser gerada. No modo avançado, você
          pode aplicar filtros baseados nas tabelas estatísticas do histórico: dezenas
          por faixa de atraso, quantidade de números primos, distribuição par/ímpar,
          soma das dezenas, dezenas que fazem parte do ciclo atual e mais.
        </p>
        <p>
          Os filtros não aumentam a probabilidade de ganhar — cada combinação específica
          tem sempre a mesma chance, independente de quais critérios foram usados para
          gerá-la. O que eles fazem é restringir o espaço de combinações geradas a um
          subconjunto de sua preferência. Por exemplo, filtrar por distribuição par/ímpar
          próxima de 7-8 exclui as combinações extremas (0-15 ou 15-0), que existem mas
          são raras historicamente — como explicado no artigo sobre{" "}
          <a href={`/${codigoLoteria}/dicas/par-impar`} className="breadcrumb">
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

      <GeradorClient
        dezenaMin={loteria.dezenaMin}
        dezenaMax={loteria.dezenaMax}
        qtdDezenasPadrao={loteria.qtdDezenasSorteadas}
        dados={dados}
        nomeLoteria={loteria.nome}
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
