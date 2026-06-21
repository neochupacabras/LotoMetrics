"use server";

import { analisarTransicao, AnaliseTransicao } from "./markov";
import { getLoteriaPorCodigo } from "./queries";

export interface TransicaoActionResult {
  ok: boolean;
  erro?: string;
  dados?: AnaliseTransicao;
}

export async function analisarTransicaoAction(
  codigoLoteria: string,
  dezenaOrigem: number
): Promise<TransicaoActionResult> {
  const loteria = await getLoteriaPorCodigo(codigoLoteria);
  if (!loteria) {
    return { ok: false, erro: "Loteria não encontrada." };
  }
  if (dezenaOrigem < loteria.dezenaMin || dezenaOrigem > loteria.dezenaMax) {
    return { ok: false, erro: "Dezena fora da faixa válida desta loteria." };
  }

  const dados = await analisarTransicao(loteria.id, dezenaOrigem);
  return { ok: true, dados };
}
