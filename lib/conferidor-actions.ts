"use server";

import {
  conferirJogo,
  ResultadoConferidor,
  calcularRetornoFinanceiro,
  RetornoFinanceiro,
  ResultadoConcurso,
} from "./conferidor";
import { getLoteriaPorCodigo } from "./queries";
import { FAIXAS_PREMIADAS } from "./probabilidades";

export interface ConferidorActionResult {
  ok: boolean;
  erro?: string;
  dados?: ResultadoConferidor;
}

export async function conferirJogoAction(
  codigoLoteria: string,
  dezenas: number[]
): Promise<ConferidorActionResult> {
  const loteria = await getLoteriaPorCodigo(codigoLoteria);
  if (!loteria) {
    return { ok: false, erro: "Loteria não encontrada." };
  }

  const dezenasUnicas = Array.from(new Set(dezenas));
  if (dezenasUnicas.length !== dezenas.length) {
    return { ok: false, erro: "Há dezenas repetidas no jogo." };
  }
  if (dezenas.length !== loteria.qtdDezenasSorteadas) {
    return {
      ok: false,
      erro: `Selecione exatamente ${loteria.qtdDezenasSorteadas} dezenas (o tamanho de um jogo simples).`,
    };
  }
  if (dezenas.some((d) => d < loteria.dezenaMin || d > loteria.dezenaMax)) {
    return { ok: false, erro: "Há uma dezena fora da faixa válida desta loteria." };
  }

  const faixasPremiadas = FAIXAS_PREMIADAS[codigoLoteria] ?? [];
  const dados = await conferirJogo(loteria.id, dezenas, faixasPremiadas);

  return { ok: true, dados };
}

export interface RetornoFinanceiroActionResult {
  ok: boolean;
  erro?: string;
  dados?: RetornoFinanceiro;
}

export async function calcularRetornoFinanceiroAction(
  codigoLoteria: string,
  acertosNasFaixas: ResultadoConcurso[],
  totalConcursosAnalisados: number,
  precoAposta: number
): Promise<RetornoFinanceiroActionResult> {
  const loteria = await getLoteriaPorCodigo(codigoLoteria);
  if (!loteria) {
    return { ok: false, erro: "Loteria não encontrada." };
  }
  if (!Number.isFinite(precoAposta) || precoAposta <= 0) {
    return { ok: false, erro: "Digite um preço de aposta válido (maior que zero)." };
  }
  if (totalConcursosAnalisados <= 0) {
    return { ok: false, erro: "Confira o jogo antes de calcular o retorno financeiro." };
  }

  const dados = await calcularRetornoFinanceiro(
    loteria.id,
    acertosNasFaixas,
    totalConcursosAnalisados,
    precoAposta
  );

  return { ok: true, dados };
}
