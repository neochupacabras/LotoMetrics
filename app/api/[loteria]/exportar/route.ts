import { NextResponse } from "next/server";
import { getLoteriaPorCodigo, getConcursosParaExportacao } from "@/lib/queries";
import { isCodigoLoteriaValido } from "@/lib/format";
import { getPlanoPremium } from "@/lib/plano";

export const runtime = "nodejs";

// Exporta o histórico completo de uma loteria em CSV — recurso Premium.
// Autenticado via cookie de sessão (mesma origem), então um <a href> normal
// já funciona sem precisar de fetch/JS no cliente.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ loteria: string }> }
) {
  const { loteria: codigoLoteria } = await params;

  if (!isCodigoLoteriaValido(codigoLoteria)) {
    return NextResponse.json({ erro: "Loteria inválida." }, { status: 400 });
  }

  const { logado, premium } = await getPlanoPremium();
  if (!logado) {
    return NextResponse.json({ erro: "Faça login para exportar dados." }, { status: 401 });
  }
  if (!premium) {
    return NextResponse.json({ erro: "Exportação de dados é exclusiva para assinantes Premium." }, { status: 403 });
  }

  const loteria = await getLoteriaPorCodigo(codigoLoteria);
  if (!loteria) {
    return NextResponse.json({ erro: "Loteria não encontrada." }, { status: 404 });
  }

  const concursos = await getConcursosParaExportacao(loteria.id);

  const temTrevos = concursos.some((c) => c.trevos && c.trevos.length > 0);
  const temMesSorte = concursos.some((c) => c.mesSorte);
  const temSegundoSorteio = concursos.some((c) => c.dezenasSegundoSorteio && c.dezenasSegundoSorteio.length > 0);

  const colunas = ["concurso", "data", "dezenas", "acumulou"];
  if (temTrevos) colunas.push("trevos");
  if (temMesSorte) colunas.push(codigoLoteria === "timemania" ? "time_do_coracao" : "mes_da_sorte");
  if (temSegundoSorteio) colunas.push("dezenas_segundo_sorteio");

  const linhas = [colunas.join(",")];

  for (const c of concursos) {
    const data = c.dataSorteio.slice(0, 10); // YYYY-MM-DD
    const dezenas = c.dezenas.map((d) => String(d).padStart(2, "0")).join("-");
    const campos = [String(c.numero), data, dezenas, c.acumulado ? "sim" : "nao"];
    if (temTrevos) campos.push(c.trevos?.join("-") ?? "");
    if (temMesSorte) campos.push(c.mesSorte ?? "");
    if (temSegundoSorteio) {
      campos.push(c.dezenasSegundoSorteio?.map((d) => String(d).padStart(2, "0")).join("-") ?? "");
    }
    linhas.push(campos.join(","));
  }

  const csv = "﻿" + linhas.join("\r\n"); // BOM — abre acentuado corretamente no Excel

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="lotoanalitica-${codigoLoteria}-historico.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
