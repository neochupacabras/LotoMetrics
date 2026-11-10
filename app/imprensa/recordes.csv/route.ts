import { getMaioresPremiosPorLoteria } from "@/lib/recordes";
import { csvRecordes } from "@/lib/kit-imprensa";
import { NOME_LOTERIA } from "@/lib/seo";

// /imprensa/recordes.csv — o maior prêmio por aposta de cada loteria, para o
// kit de imprensa (app/imprensa/page.tsx). Mesmos dados de /recordes.
export const revalidate = 3600;

export async function GET() {
  const csv = csvRecordes(await getMaioresPremiosPorLoteria(), NOME_LOTERIA);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="recordes-loterias-lotoanalitica.csv"',
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
