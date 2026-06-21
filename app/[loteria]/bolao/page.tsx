import { notFound } from "next/navigation";
import BolaoClient from "@/components/BolaoClient";
import { getLoteriaPorCodigo } from "@/lib/queries";
import { isCodigoLoteriaValido } from "@/lib/format";

export default async function BolaoPage({
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
      <h1 className="titulo-edicao">Otimizador de bolão</h1>
      <p className="subtitulo-edicao" style={{ maxWidth: 660 }}>
        Pra quem joga em grupo: diga quanto o grupo quer gastar e a que preço, e o sistema
        mostra qual fechamento garantido cabe nesse orçamento — depois gera um PDF pronto
        pra compartilhar com o grupo, com todos os jogos e o valor por participante.
      </p>

      <BolaoClient
        codigoLoteria={codigoLoteria}
        nomeLoteria={loteria.nome}
        dezenaMin={loteria.dezenaMin}
        dezenaMax={loteria.dezenaMax}
      />

      <div className="aviso-legal">
        <strong>O que isso é:</strong> uma forma de organizar o fechamento (veja a aba
        Fechamentos para o que essa garantia significa, e o que ela não significa) dentro
        de um orçamento definido. Nada aqui aumenta a chance de o grupo ganhar — só ajuda
        a decidir quantos jogos cabem no dinheiro disponível.
      </div>
    </div>
  );
}
