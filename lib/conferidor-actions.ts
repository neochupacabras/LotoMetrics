"use server";

import pool from "./db";
import {
  conferirJogo,
  conferirJogoSuperSete,
  conferirJogoDuplaSena,
  ResultadoConferidor,
  calcularRetornoFinanceiro,
  RetornoFinanceiro,
  ResultadoConcurso,
} from "./conferidor";
import { getLoteriaPorCodigo } from "./queries";
import { FAIXAS_PREMIADAS, FAIXAS_MILIONARIA } from "./probabilidades";

export interface ConferidorActionResult {
  ok: boolean;
  erro?: string;
  dados?: ResultadoConferidor;
  trevos?: number[];
}

export async function conferirJogoAction(
  codigoLoteria: string,
  dezenas: number[],
  trevos?: number[]
): Promise<ConferidorActionResult> {
  const loteria = await getLoteriaPorCodigo(codigoLoteria);
  if (!loteria) {
    return { ok: false, erro: "Loteria não encontrada." };
  }

  // Super Sete: cada uma das 7 posições é uma coluna independente — o
  // mesmo dígito pode (e costuma) repetir entre colunas, então a checagem
  // de "sem repetidos" das outras 8 loterias não se aplica aqui.
  if (codigoLoteria === "supersete") {
    if (dezenas.length !== loteria.qtdDezenasSorteadas) {
      return { ok: false, erro: `Selecione um dígito para cada uma das ${loteria.qtdDezenasSorteadas} colunas.` };
    }
    if (dezenas.some((d) => d < loteria.dezenaMin || d > loteria.dezenaMax)) {
      return { ok: false, erro: "Há um dígito fora da faixa válida (0 a 9)." };
    }
    const faixasPremiadas = FAIXAS_PREMIADAS[codigoLoteria] ?? [];
    const dados = await conferirJogoSuperSete(loteria.id, dezenas, faixasPremiadas);
    return { ok: true, dados };
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

  // +Milionária: ajustar pontos considerando os trevos
  if (codigoLoteria === "maismilionaria" && trevos && trevos.length === 2) {
    const dados = await conferirJogo(loteria.id, dezenas, faixasPremiadas);

    // Buscar trevos históricos do banco
    const { rows } = await pool.query(
      `SELECT numero, trevos FROM concurso
       WHERE loteria_id = $1 AND trevos IS NOT NULL
       ORDER BY numero DESC`,
      [loteria.id]
    );

    const trevosPorConcurso = new Map<number, number[]>(
      rows.map((r: any) => [r.numero, r.trevos as number[]])
    );

    // Recalcular faixas considerando acertos de trevos
    const acertosNasFaixas = dados.acertosNasFaixas.map(r => {
      const trevosSorteados = trevosPorConcurso.get(r.numero) ?? [];
      const acertosTrevos = trevos.filter(t => trevosSorteados.includes(t)).length;
      const chave = `${r.pontos},${acertosTrevos}`;
      const faixa = FAIXAS_MILIONARIA[chave] ?? null;
      return { ...r, acertosTrevos, faixaMilionaria: faixa };
    }).filter(r => r.faixaMilionaria !== null);

    return {
      ok: true,
      dados: {
        ...dados,
        acertosNasFaixas,
      },
      trevos,
    };
  }

  // Dupla Sena: o jogo é conferido contra os dois sorteios do concurso, não
  // só o primeiro (ver conferirJogoDuplaSena).
  const dados = codigoLoteria === "duplasena"
    ? await conferirJogoDuplaSena(loteria.id, dezenas, faixasPremiadas)
    : await conferirJogo(loteria.id, dezenas, faixasPremiadas);
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
