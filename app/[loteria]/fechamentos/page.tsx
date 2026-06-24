import { notFound } from "next/navigation";
import type { Metadata } from "next";
import FechamentoClient from "@/components/FechamentoClient";
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
    "/fechamentos",
    `Fechamento de dezenas — ${nome}`,
    `O que é fechamento, como funciona e o que ele não faz — explicado de forma simples, com exemplos.`
  );
}

const EXEMPLOS: Record<
  string,
  { pool: number; completo: number; reduzido: number; k: number; sorteadas: number }
> = {
  lotofacil: { pool: 18, completo: 816, reduzido: 164, k: 12, sorteadas: 15 },
  megasena:  { pool: 10, completo: 210, reduzido: 27,  k: 4,  sorteadas: 6  },
};

export default async function FechamentosPage({
  params,
}: {
  params: Promise<{ loteria: string }>;
}) {
  const { loteria: codigoLoteria } = await params;
  if (!isCodigoLoteriaValido(codigoLoteria)) notFound();

  const loteria = await getLoteriaPorCodigo(codigoLoteria);
  if (!loteria) notFound();

  const ex = EXEMPLOS[codigoLoteria];

  return (
    <div className="container secao">
      <p className="eyebrow">{loteria.nome}</p>
      <h1 className="titulo-edicao">Fechamentos</h1>

      <div className="bloco fechamento-explicacao" style={{ maxWidth: 680 }}>

        <h2 className="bloco__titulo">O que é um fechamento?</h2>
        <p>
          Imagine que você está de olho em 18 dezenas da Lotofácil, mas só pode
          jogar algumas delas em cada bilhete. O problema é: e se as 15 dezenas
          sorteadas caírem espalhadas no meio do seu grupo de 18? Você pode ter
          escolhido certo, mas se elas ficaram divididas entre bilhetes diferentes,
          nenhum bilhete individual acerta muitos pontos.
        </p>
        <p>
          O fechamento resolve exatamente isso. Ele organiza as combinações de
          jogos de um jeito inteligente, para que, <strong>se as dezenas sorteadas
          estiverem dentro do grupo que você escolheu</strong>, pelo menos um dos
          seus bilhetes vai ter uma boa pontuação — independente de como elas
          aparecerem espalhadas.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: 28 }}>
          Como funciona na prática?
        </h2>
        <p>
          Pensa assim: você escolheu {ex.pool} dezenas. Para cobrir{" "}
          <em>absolutamente todas</em> as combinações de {ex.sorteadas} dezenas
          possíveis dentro desse grupo, precisaria de {ex.completo} jogos. Isso é
          o <strong>fechamento completo</strong> — caro, mas não deixa nenhum buraco.
        </p>
        <p>
          O <strong>fechamento reduzido</strong> é a versão inteligente: em vez de
          jogar todas as {ex.completo} combinações possíveis, o sistema escolhe
          apenas {ex.reduzido} jogos. Com esses {ex.reduzido} jogos, se pelo menos{" "}
          {ex.k} das suas {ex.pool} dezenas estiverem entre as sorteadas, um dos
          seus bilhetes vai ter pelo menos {ex.k} pontos — mesmo que as dezenas
          estejam espalhadas de formas diferentes.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: 28 }}>
          O que o fechamento <em>não</em> faz
        </h2>
        <p>
          Isso é a parte mais importante. O fechamento <strong>não aumenta a
          chance de as suas dezenas serem sorteadas</strong>. Escolher 18 dezenas
          não faz com que elas apareçam mais no sorteio — a probabilidade é
          exatamente a mesma que qualquer outra combinação de 18 dezenas teria.
        </p>
        <p>
          O que o fechamento faz é simples: <strong>organiza seus bilhetes</strong>{" "}
          para que você não desperdice um bom resultado por azar de distribuição.
          Se suas dezenas saírem, você vai capturar isso. Se não saírem, nenhum
          sistema no mundo ajudaria.
        </p>
        <p>
          Outra coisa importante: o fechamento reduzido cobre faixas de premiação
          menores, não o prêmio máximo. Para cobrir o máximo, precisaria do
          fechamento completo — com todos os {ex.completo} jogos.
        </p>

      </div>

      <FechamentoClient
        codigoLoteria={codigoLoteria}
        dezenaMin={loteria.dezenaMin}
        dezenaMax={loteria.dezenaMax}
        qtdDezenasSorteadas={loteria.qtdDezenasSorteadas}
      />

      <div className="aviso-legal">
        O fechamento é uma técnica de organização de bilhetes — não uma forma de
        prever sorteios ou aumentar a probabilidade de acerto. A probabilidade de
        qualquer dezena ser sorteada é sempre a mesma, independente do sistema usado.
      </div>
    </div>
  );
}
