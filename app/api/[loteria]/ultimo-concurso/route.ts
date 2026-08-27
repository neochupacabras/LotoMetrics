import { NextResponse } from "next/server";
import { getLoteriaPorCodigo, getUltimoConcurso } from "@/lib/queries";
import { isCodigoLoteriaValido } from "@/lib/format";

export const runtime = "nodejs";

// Endpoint público e leve — só o essencial do último concurso, pra
// alimentar o polling da página "sorteio ao vivo" (components/AoVivoClient.tsx).
// Sem autenticação: é o mesmo dado que já aparece em /{loteria}/resultados.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ loteria: string }> }
) {
  const { loteria: codigoLoteria } = await params;

  if (!isCodigoLoteriaValido(codigoLoteria)) {
    return NextResponse.json({ erro: "Loteria inválida." }, { status: 400 });
  }

  const loteria = await getLoteriaPorCodigo(codigoLoteria);
  if (!loteria) {
    return NextResponse.json({ erro: "Loteria não encontrada." }, { status: 404 });
  }

  const concurso = await getUltimoConcurso(loteria.id);
  if (!concurso) {
    return NextResponse.json({ erro: "Nenhum concurso encontrado." }, { status: 404 });
  }

  return NextResponse.json(
    {
      numero: concurso.numero,
      dataSorteio: concurso.dataSorteio,
      dezenas: concurso.dezenas,
      acumulado: concurso.acumulado,
      trevos: concurso.trevos,
      mesSorte: concurso.mesSorte,
    },
    { headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=60" } }
  );
}
