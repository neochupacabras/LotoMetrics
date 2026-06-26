"use server";

import { calcularEquilibrio } from "@/lib/equilibrio";
import { isCodigoLoteriaValido } from "@/lib/format";
import type { ResultadoEquilibrio } from "@/lib/equilibrio";

export async function calcularEquilibrioAction(
  codigoLoteria: string,
  dezenas: number[]
): Promise<ResultadoEquilibrio | { erro: string }> {
  if (!isCodigoLoteriaValido(codigoLoteria)) {
    return { erro: "Loteria inválida." };
  }
  return calcularEquilibrio(codigoLoteria, dezenas);
}
