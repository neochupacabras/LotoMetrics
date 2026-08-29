// Redireciona pro concurso mais recente conhecido — só muda quando sai um
// novo resultado, daí caber cache de 1h em vez de recalcular a cada acesso.
export const revalidate = 3600;
import { redirect, notFound } from "next/navigation";
import { getLoteriaPorCodigo, getUltimoConcurso } from "@/lib/queries";
import { isCodigoLoteriaValido } from "@/lib/format";

// Esta página captura buscas como:
//   "resultado lotofácil hoje"
//   "resultado mega-sena agora"
//   "último resultado lotofácil"
// e redireciona para a página do concurso mais recente.
//
// Sem generateMetadata aqui de propósito: essa rota sempre chama redirect()
// antes de renderizar qualquer HTML, e um redirect() do Next.js interrompe
// a resposta com um 307 — não existe `<head>` pra carregar title/canonical
// nesse meio de caminho. Definir metadata (inclusive um canonical pra si
// mesma) era código morto: nunca chegava a ser servido a ninguém, nem ao
// Googlebot, que só vê o redirect e segue direto pra URL de destino.

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
