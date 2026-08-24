import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategoriasParaLoteria } from "@/lib/categorias";
import { getLoteriaPorCodigo } from "@/lib/queries";
import { isCodigoLoteriaValido } from "@/lib/format";
import { NOME_LOTERIA, metadataPagina } from "@/lib/seo";

const COR_VAR: Record<string, string> = {
  pine:  "var(--pine)",
  ochre: "var(--ochre)",
  rust:  "var(--rust)",
};

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
    "/tabelas",
    `Tabelas estatísticas da ${nome} — frequência, atraso, ciclos e mais`,
    `Comportamento histórico das dezenas da ${nome}, calculado sobre todos os concursos já sorteados: frequência, atraso, ciclos, primos, Fibonacci e mais 13 categorias.`
  );
}

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
        {getCategoriasParaLoteria(codigoLoteria).map((c) => (
          <Link
            key={c.slug}
            href={`/${codigoLoteria}/tabelas/${c.slug}`}
            className="categoria-card"
          >
            <div className="categoria-card__topo" style={{ background: COR_VAR[c.cor] }}>
              <span aria-hidden>{c.emoji}</span>
            </div>
            <div className="categoria-card__corpo">
              <p className="categoria-card__titulo">{c.titulo}</p>
              <p className="categoria-card__descricao">{c.descricao}</p>
              <span className="categoria-card__cta">Ver tabela →</span>
            </div>
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
