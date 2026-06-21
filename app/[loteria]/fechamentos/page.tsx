import { notFound } from "next/navigation";
import FechamentoClient from "@/components/FechamentoClient";
import { getLoteriaPorCodigo } from "@/lib/queries";
import { isCodigoLoteriaValido } from "@/lib/format";

// Exemplos concretos (números já validados nos testes de performance) só
// pra tornar a explicação tangível — não são usados em nenhum cálculo,
// são puramente ilustrativos.
const EXEMPLOS: Record<
  string,
  { pool: number; completo: number; reduzido: number; k: number; minimo: number; sorteadas: number }
> = {
  lotofacil: { pool: 18, completo: 816, reduzido: 164, k: 12, minimo: 15, sorteadas: 15 },
  megasena: { pool: 10, completo: 210, reduzido: 27, k: 4, minimo: 6, sorteadas: 6 },
};

export default async function FechamentosPage({
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

  const ex = EXEMPLOS[codigoLoteria];

  return (
    <div className="container secao">
      <p className="eyebrow">{loteria.nome}</p>
      <h1 className="titulo-edicao">Fechamentos garantidos</h1>

      <div className="bloco" style={{ maxWidth: 700 }}>
        <p className="subtitulo-edicao" style={{ maxWidth: 700 }}>
          Normalmente você escolhe só as {ex.minimo} dezenas mínimas e faz um jogo. Um
          fechamento deixa você escolher mais dezenas que isso — e, em vez de cobrir
          manualmente todas as combinações possíveis entre elas (o que fica caro rápido),
          calcula um conjunto menor de jogos que ainda garante um resultado mínimo, desde
          que dezenas suficientes da sua escolha sejam sorteadas.
        </p>
        <p className="subtitulo-edicao" style={{ maxWidth: 700 }}>
          Exemplo: escolhendo {ex.pool} dezenas, cobrir todas as combinações possíveis
          exigiria {ex.completo} jogos (isso é o "fechamento completo", logo abaixo).
          Um fechamento reduzido entrega a garantia de {ex.k} pontos com só{" "}
          {ex.reduzido} jogos — desde que pelo menos {ex.k} das suas {ex.pool} dezenas
          estejam entre as {ex.sorteadas} sorteadas. O "X" da garantia (aqui, {ex.k}) é
          sempre um número fixo que você escolhe antes de gerar — não é "qualquer
          quantidade".
        </p>
      </div>

      <FechamentoClient
        codigoLoteria={codigoLoteria}
        dezenaMin={loteria.dezenaMin}
        dezenaMax={loteria.dezenaMax}
        qtdDezenasSorteadas={loteria.qtdDezenasSorteadas}
      />

      <div className="aviso-legal">
        <strong>O que essa garantia significa:</strong> se pelo menos a quantidade
        combinada das suas dezenas escolhidas sair no sorteio, então pelo menos um dos
        seus jogos vai acertar essa faixa de prêmio. Isso é matemática de combinação —
        testamos e verificamos cada fechamento gerado, um por um, antes de mostrar o
        resultado.
        <br />
        <br />
        <strong>O que ela NÃO significa:</strong> ela não aumenta a chance de as suas
        dezenas serem sorteadas — essa chance é exatamente a mesma de qualquer aposta
        (veja o número exato logo acima, depois de escolher suas dezenas). O fechamento
        só evita desperdiçar o acerto se ele vier; não influencia se vai vir. E o
        fechamento reduzido nunca garante o prêmio máximo, só faixas menores — para
        cobrir o prêmio máximo, só apostando em todas as combinações possíveis
        (o fechamento completo), que custa proporcionalmente mais.
      </div>
    </div>
  );
}
