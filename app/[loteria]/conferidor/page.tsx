import { notFound } from "next/navigation";
import ConferidorClient from "@/components/ConferidorClient";
import { getLoteriaPorCodigo } from "@/lib/queries";
import { isCodigoLoteriaValido } from "@/lib/format";

export default async function ConferidorPage({
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
    <div className="container secao">
      <p className="eyebrow">{loteria.nome}</p>
      <h1 className="titulo-edicao">Conferidor de jogos</h1>
      <p className="subtitulo-edicao" style={{ maxWidth: 620 }}>
        Veja como um jogo se saiu contra todo o histórico de concursos já sorteados —
        quantos pontos faria em cada um, e se já bateu alguma faixa premiada.
      </p>

      <ConferidorClient
        codigoLoteria={codigoLoteria}
        dezenaMin={loteria.dezenaMin}
        dezenaMax={loteria.dezenaMax}
        qtdDezenasSorteadas={loteria.qtdDezenasSorteadas}
      />
    </div>
  );
}
