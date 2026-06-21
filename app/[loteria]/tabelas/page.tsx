import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORIAS } from "@/lib/categorias";
import { getLoteriaPorCodigo } from "@/lib/queries";
import { isCodigoLoteriaValido } from "@/lib/format";

export default async function TabelasIndexPage({
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
      <p className="eyebrow">Estatísticas de {loteria.nome}</p>
      <h1 className="titulo-edicao">Tabelas estatísticas</h1>
      <p className="subtitulo-edicao" style={{ maxWidth: 620 }}>
        Comportamento histórico das dezenas, calculado sobre todos os concursos já
        sorteados. Cada tabela tem uma finalidade informativa — nenhuma delas prevê
        o próximo resultado.
      </p>

      <div className="grade-categorias">
        {CATEGORIAS.map((c) => (
          <Link
            key={c.slug}
            href={`/${codigoLoteria}/tabelas/${c.slug}`}
            className="cartao-categoria"
          >
            <p className="cartao-categoria__titulo">{c.titulo}</p>
            <p className="cartao-categoria__descricao">{c.descricao}</p>
          </Link>
        ))}
      </div>

      <div className="aviso-legal">
        <strong>Lembrete:</strong> as tabelas acima descrevem o que já aconteceu, não o
        que vai acontecer. Cada sorteio é um evento independente — frequência ou atraso
        históricos não alteram a probabilidade do próximo concurso.
      </div>
    </div>
  );
}
