"use server";

import { calcularEquilibrio, type ResultadoEquilibrio } from "@/lib/equilibrio";
import { isCodigoLoteriaValido } from "@/lib/format";

export type { ResultadoEquilibrio };

export async function calcularEquilibrioAction(
  codigoLoteria: string,
  dezenas: number[]
): Promise<ResultadoEquilibrio | { erro: string }> {
  if (!isCodigoLoteriaValido(codigoLoteria)) {
    return { erro: "Loteria inválida." };
  }
  return calcularEquilibrio(codigoLoteria, dezenas);
}
