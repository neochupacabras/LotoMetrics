"use server";

import { getLoteriaPorCodigo, getDrawsParaSimulacao } from "@/lib/queries";
import { isCodigoLoteriaValido } from "@/lib/format";
import { ehPrimo, ehFibonacci, ehMultiploDe3 } from "@/lib/classificacao";

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface FiltroEstrategia {
  somaMin?: number;
  somaMax?: number;
  paresMin?: number;
  paresMax?: number;
  primosMin?: number;
  primosMax?: number;
  fibonacciMin?: number;
  fibonacciMax?: number;
  multiplos3Min?: number;
  multiplos3Max?: number;
  maxSequenciaMax?: number;
}

export interface ResultadoEstrategia {
  nome: string;
  totalConcursos: number;
  concursosQuePassaram: number;
  taxaCobertura: number;
  totalGasto: number;
  totalGanho: number;
  saldoFinal: number;
  retornoPct: number;
  porFaixa: { descricao: string; qtd: number; ganhoTotal: number }[];
  melhores: { numero: number; acertos: number; premio: number }[];
  grafico: { numero: number; saldo: number; passou: boolean }[];
}

export interface ResultadoComparacao {
  estrategiaA: ResultadoEstrategia;
  estrategiaB: ResultadoEstrategia;
  graficoComparado: { numero: number; saldoA: number; saldoB: number }[];
}

// ── Configurações por loteria ─────────────────────────────────────────────────

const MAPA_FAIXAS: Record<string, Record<number, number>> = {
  lotofacil: { 15: 1, 14: 2, 13: 3, 12: 4, 11: 5 },
  megasena:  { 6: 1,  5: 2,  4: 3 },
};

const PRECO_APOSTA: Record<string, number> = {
  lotofacil: 3.50,
  megasena:  6.00,
};

const DESCRICOES_FAIXAS: Record<string, Record<number, string>> = {
  lotofacil: { 15: "15 pontos", 14: "14 pontos", 13: "13 pontos", 12: "12 pontos", 11: "11 pontos" },
  megasena:  { 6: "Sena", 5: "Quina", 4: "Quadra" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function maxSequencia(dezenas: number[]): number {
  const sorted = [...dezenas].sort((a, b) => a - b);
  let max = 1, atual = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i-1] + 1) { atual++; max = Math.max(max, atual); }
    else atual = 1;
  }
  return max;
}

// Verifica se um sorteio atende os filtros da estratégia
function atendeEstrategia(dezenas: number[], filtro: FiltroEstrategia): boolean {
  const soma = dezenas.reduce((s, d) => s + d, 0);
  const pares = dezenas.filter(d => d % 2 === 0).length;
  const primos = dezenas.filter(ehPrimo).length;
  const fibs = dezenas.filter(ehFibonacci).length;
  const mult3 = dezenas.filter(ehMultiploDe3).length;
  const maxSeq = maxSequencia(dezenas);

  if (filtro.somaMin !== undefined && soma < filtro.somaMin) return false;
  if (filtro.somaMax !== undefined && soma > filtro.somaMax) return false;
  if (filtro.paresMin !== undefined && pares < filtro.paresMin) return false;
  if (filtro.paresMax !== undefined && pares > filtro.paresMax) return false;
  if (filtro.primosMin !== undefined && primos < filtro.primosMin) return false;
  if (filtro.primosMax !== undefined && primos > filtro.primosMax) return false;
  if (filtro.fibonacciMin !== undefined && fibs < filtro.fibonacciMin) return false;
  if (filtro.fibonacciMax !== undefined && fibs > filtro.fibonacciMax) return false;
  if (filtro.multiplos3Min !== undefined && mult3 < filtro.multiplos3Min) return false;
  if (filtro.multiplos3Max !== undefined && mult3 > filtro.multiplos3Max) return false;
  if (filtro.maxSequenciaMax !== undefined && maxSeq > filtro.maxSequenciaMax) return false;

  return true;
}

// ── Lógica central ────────────────────────────────────────────────────────────
//
// A estratégia define QUANDO o apostador joga — nos concursos cujo sorteio
// atende os filtros. O pressuposto é: "eu só jogo quando o resultado anterior
// tinha essas características" (estratégia reativa baseada no sorteio anterior).
//
// Para calcular os acertos, usamos o próprio sorteio como proxy do jogo
// do apostador: se o apostador seguia a estratégia, ele estava jogando naquele
// concurso. Os acertos são calculados como a interseção entre as dezenas do
// sorteio e as dezenas do sorteio ANTERIOR (que motivou a aposta) — mas como
// não temos o jogo específico, usamos a média histórica de acertos por faixa:
//
// Abordagem mais simples e honesta: calcular quantos GANHADORES existiram em
// cada faixa nos concursos cobertos pela estratégia. Isso responde:
// "Se eu tivesse jogado em TODOS os concursos que minha estratégia cobria,
// qual seria minha chance de ter premiado? Quantas vezes haveria ganhadores?"
//
// O custo é real (uma aposta por concurso coberto), o ganho é o valor médio
// da faixa mais baixa premiada, ponderado pela probabilidade de acerto.

function calcularEstrategia(
  nome: string,
  draws: Awaited<ReturnType<typeof getDrawsParaSimulacao>>,
  filtro: FiltroEstrategia,
  codigoLoteria: string
): ResultadoEstrategia {
  const preco = PRECO_APOSTA[codigoLoteria] ?? 3.50;
  const mapaFaixas = MAPA_FAIXAS[codigoLoteria] ?? {};
  const descFaixas = DESCRICOES_FAIXAS[codigoLoteria] ?? {};

  // Probabilidades de acerto por faixa (calculadas combinatoriamente)
  // Lotofácil: C(15,k)*C(10,15-k)/C(25,15) para k acertos
  // Mega-Sena: C(6,k)*C(54,6-k)/C(60,6) para k acertos
  // Fonte: regras oficiais da Caixa
  const probAcerto: Record<string, Record<number, number>> = {
    lotofacil: { 15: 1/3268760, 14: 1/21791, 13: 1/906, 12: 1/80, 11: 1/12 },
    megasena:  { 6: 1/50063860, 5: 1/154518, 4: 1/2332 },
  };

  const probs = probAcerto[codigoLoteria] ?? {};

  const faixaMap = new Map<number, { qtd: number; ganhoTotal: number }>();
  for (const ac of Object.keys(mapaFaixas).map(Number)) {
    faixaMap.set(ac, { qtd: 0, ganhoTotal: 0 });
  }

  const melhores: ResultadoEstrategia["melhores"] = [];
  const grafico: ResultadoEstrategia["grafico"] = [];

  let totalGasto = 0;
  let totalGanho = 0;
  let saldo = 0;
  let concursosQuePassaram = 0;

  for (const draw of draws) {
    const passou = atendeEstrategia(draw.dezenas, filtro);

    if (passou) {
      concursosQuePassaram++;
      saldo -= preco;
      totalGasto += preco;

      // Para cada faixa, calcular ganho esperado baseado na probabilidade
      // e no prêmio real daquele concurso
      for (const [acertosStr, faixaBanco] of Object.entries(mapaFaixas)) {
        const acertos = Number(acertosStr);
        const prob = probs[acertos] ?? 0;
        const premio = draw.premios[faixaBanco] ?? 0;

        if (prob > 0 && premio > 0) {
          // Valor esperado: prob * prêmio
          const ganhoEsperado = prob * premio;
          saldo += ganhoEsperado;
          totalGanho += ganhoEsperado;
          const entry = faixaMap.get(acertos);
          if (entry) {
            entry.qtd += prob; // acumulado de probabilidade = expectativa de premiações
            entry.ganhoTotal += ganhoEsperado;
          }
          // Registrar nos melhores se for um prêmio significativo
          if (acertos === Math.max(...Object.keys(mapaFaixas).map(Number)) && ganhoEsperado > 1) {
            melhores.push({ numero: draw.numero, acertos, premio: ganhoEsperado });
          }
        }
      }
    }

    grafico.push({
      numero: draw.numero,
      saldo: Math.round(saldo * 100) / 100,
      passou,
    });
  }

  const porFaixa = Array.from(faixaMap.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([acertos, { qtd, ganhoTotal }]) => ({
      descricao: descFaixas[acertos] ?? `${acertos} acertos`,
      qtd: Math.round(qtd * 100) / 100, // esperança de premiações
      ganhoTotal,
    }));

  return {
    nome,
    totalConcursos: draws.length,
    concursosQuePassaram,
    taxaCobertura: draws.length > 0 ? (concursosQuePassaram / draws.length) * 100 : 0,
    totalGasto,
    totalGanho,
    saldoFinal: saldo,
    retornoPct: totalGasto > 0 ? (totalGanho / totalGasto) * 100 : 0,
    porFaixa,
    melhores: melhores.sort((a, b) => b.premio - a.premio).slice(0, 5),
    grafico,
  };
}

// ── Action principal ──────────────────────────────────────────────────────────

export async function compararEstrategias(
  codigoLoteria: string,
  nomeA: string,
  filtroA: FiltroEstrategia,
  nomeB: string,
  filtroB: FiltroEstrategia,
  limiteHistorico?: number
): Promise<ResultadoComparacao | { erro: string }> {
  if (!isCodigoLoteriaValido(codigoLoteria)) return { erro: "Loteria inválida" };

  const loteria = await getLoteriaPorCodigo(codigoLoteria);
  if (!loteria) return { erro: "Loteria não encontrada" };

  const todosDraws = await getDrawsParaSimulacao(loteria.id);
  const draws = limiteHistorico ? todosDraws.slice(-limiteHistorico) : todosDraws;

  const estrategiaA = calcularEstrategia(nomeA, draws, filtroA, codigoLoteria);
  const estrategiaB = calcularEstrategia(nomeB, draws, filtroB, codigoLoteria);

  const graficoA = estrategiaA.grafico;
  const graficoB = estrategiaB.grafico;
  const passo = graficoA.length > 500 ? Math.ceil(graficoA.length / 500) : 1;

  const graficoComparado = graficoA
    .filter((_, i) => i % passo === 0 || i === graficoA.length - 1)
    .map((pA, idx) => {
      const pB = graficoB[idx * passo] ?? graficoB[graficoB.length - 1];
      return { numero: pA.numero, saldoA: pA.saldo, saldoB: pB?.saldo ?? 0 };
    });

  return { estrategiaA, estrategiaB, graficoComparado };
}
