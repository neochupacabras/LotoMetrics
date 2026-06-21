import { notFound } from "next/navigation";
import GeradorClient from "@/components/GeradorClient";
import { prepararDadosGerador } from "@/lib/gerador";
import { getLoteriaPorCodigo } from "@/lib/queries";
import { isCodigoLoteriaValido } from "@/lib/format";

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
  if (!loteria) {
    notFound();
  }

  const dados = await prepararDadosGerador(loteria.id);

  return (
    <div className="container secao">
      <p className="eyebrow">{loteria.nome}</p>
      <h1 className="titulo-edicao">Gerador de jogos</h1>
      <p className="subtitulo-edicao" style={{ maxWidth: 620 }}>
        Monte combinações aleatórias, com filtros opcionais baseados nas tabelas
        estatísticas desta loteria.
      </p>

      <GeradorClient
        dezenaMin={loteria.dezenaMin}
        dezenaMax={loteria.dezenaMax}
        qtdDezenasPadrao={loteria.qtdDezenasSorteadas}
        dados={dados}
      />

      <div className="aviso-legal">
        <strong>Importante:</strong> a geração segue critérios estatísticos definidos
        por você; não há garantia de acerto. Loterias são jogos de sorteio aleatório —
        nenhum filtro aqui altera a probabilidade real de premiação.
      </div>
    </div>
  );
}
