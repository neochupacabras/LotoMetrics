import { getEdicoesVirada } from "@/lib/queries";
import { csvMegaDaVirada } from "@/lib/kit-imprensa";

// /imprensa/mega-da-virada.csv — todas as edições da Mega da Virada, para o
// kit de imprensa (app/imprensa/page.tsx). Renovado a cada hora; os dados
// mudam só uma vez por ano.
export const revalidate = 3600;

export async function GET() {
  const csv = csvMegaDaVirada(await getEdicoesVirada());
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="mega-da-virada-lotoanalitica.csv"',
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
