import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SimuladorClient from "@/components/SimuladorClient";
import { prepararDadosSimulador } from "@/lib/simulador";
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
    "/simulador",
    `Simulador de retorno financeiro ${nome}`,
    `Compare quanto custaria jogar uma combinação da ${nome} em todos os concursos já realizados contra os prêmios reais que ela teria ganhado.`
  );
}

export default async function SimuladorPage({
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

  const dados = await prepararDadosSimulador(loteria.id);

  return (
    <div className="container secao">
      <p className="eyebrow">{loteria.nome}</p>
      <h1 className="titulo-edicao">Simulador</h1>
      <p className="subtitulo-edicao" style={{ maxWidth: 620 }}>
        Monte seu jogo dezena por dezena e veja, em tempo real, como ele se compara ao
        histórico — sem nenhum filtro automático. É a mesma análise que aplicamos a
        qualquer concurso já sorteado, só que para o jogo que você está montando agora.
      </p>

      <SimuladorClient
        codigoLoteria={codigoLoteria}
        dezenaMin={loteria.dezenaMin}
        dezenaMax={loteria.dezenaMax}
        qtdDezenasSorteadas={loteria.qtdDezenasSorteadas}
        gridColunas={loteria.gridColunas}
        dados={dados}
      />

      <div className="aviso-legal">
        <strong>Importante:</strong> nada aqui muda sua chance real de ganhar. O
        simulador só mostra como a combinação que você montou se compara ao que já
        aconteceu — uma combinação "comum" e uma "rara" têm exatamente a mesma
        probabilidade de serem sorteadas.
      </div>
    </div>
  );
}
