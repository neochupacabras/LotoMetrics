import Link from "next/link";
import { notFound } from "next/navigation";
import { getLoteriaPorCodigo } from "@/lib/queries";
import { gerarDestaques } from "@/lib/destaques";
import { isCodigoLoteriaValido } from "@/lib/format";

export default async function DestaquesPage({
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

  const destaques = await gerarDestaques(loteria.id, codigoLoteria, {
    dezenaMax: loteria.dezenaMax,
    gridColunas: loteria.gridColunas,
  });

  return (
    <div className="container secao">
      <p className="eyebrow">{loteria.nome}</p>
      <h1 className="titulo-edicao">Destaques</h1>
      <p className="subtitulo-edicao" style={{ maxWidth: 620 }}>
        O que há de notável no histórico agora — sempre descrevendo o que já
        aconteceu, nunca sugerindo o que vai sair no próximo concurso.
      </p>

      {destaques.length > 0 ? (
        <div style={{ marginTop: "28px" }}>
          {destaques.map((d, i) => (
            <Link key={i} href={d.link} className="destaque-cartao">
              <p className="destaque-cartao__titulo">{d.titulo}</p>
              <p className="destaque-cartao__descricao">{d.descricao}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="subtitulo-edicao">Nada fora do comum no momento.</p>
      )}

      <div className="aviso-legal" style={{ marginTop: "20px" }}>
        <strong>Lembrete:</strong> estes fatos descrevem o histórico. Nenhum deles indica
        que uma dezena "vai sair" ou "está devendo" — cada concurso é um sorteio
        independente.
      </div>
    </div>
  );
}
