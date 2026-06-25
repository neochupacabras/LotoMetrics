export const dynamic = "force-dynamic";
import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLoteriaPorCodigo, getUltimoConcurso } from "@/lib/queries";
import { isCodigoLoteriaValido, formatarData } from "@/lib/format";
import { SITE_URL, SITE_NAME, NOME_LOTERIA, metadataPagina } from "@/lib/seo";

// Esta página captura buscas como:
//   "resultado lotofácil hoje"
//   "resultado mega-sena agora"
//   "último resultado lotofácil"
// e redireciona para a página do concurso mais recente.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ loteria: string }>;
}): Promise<Metadata> {
  const { loteria: codigoLoteria } = await params;
  if (!isCodigoLoteriaValido(codigoLoteria)) return {};

  const nome = NOME_LOTERIA[codigoLoteria] ?? codigoLoteria;
  const loteria = await getLoteriaPorCodigo(codigoLoteria);
  const ultimo = loteria ? await getUltimoConcurso(loteria.id) : null;

  const titulo = ultimo
    ? `Resultado ${nome} hoje — Concurso ${ultimo.numero} de ${formatarData(ultimo.dataSorteio)}`
    : `Resultado ${nome} hoje — último concurso`;

  const dezenas = ultimo
    ? ultimo.dezenas.map((d: number) => String(d).padStart(2, "0")).join(", ")
    : "";

  const descricao = ultimo
    ? `Resultado do último concurso da ${nome}: ${dezenas}. Confira as dezenas sorteadas, premiação completa e estatísticas do concurso ${ultimo.numero}.`
    : `Resultado do último concurso da ${nome} com dezenas sorteadas e premiação completa.`;

  return metadataPagina(codigoLoteria, "/resultado", titulo, descricao);
}

export default async function ResultadoHojePage({
  params,
}: {
  params: Promise<{ loteria: string }>;
}) {
  const { loteria: codigoLoteria } = await params;
  if (!isCodigoLoteriaValido(codigoLoteria)) notFound();

  const loteria = await getLoteriaPorCodigo(codigoLoteria);
  if (!loteria) notFound();

  const ultimo = await getUltimoConcurso(loteria.id);
  if (!ultimo) notFound();

  // Redireciona para a página do concurso com URL canônica
  redirect(`/${codigoLoteria}/resultados/${ultimo.numero}`);
}
