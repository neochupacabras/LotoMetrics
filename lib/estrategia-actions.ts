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

// ── Configurações ─────────────────────────────────────────────────────────────

const MAPA_FAIXAS: Record<string, Record<number, number>> = {
  lotofacil: { 15: 1, 14: 2, 13: 3, 12: 4, 11: 5 },
  megasena:  { 6: 1, 5: 2, 4: 3 },
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
    if (sorted[i] === sorted[i - 1] + 1) { atual++; max = Math.max(max, atual); }
    else atual = 1;
  }
  return max;
}

function atendeEstrategia(dezenas: number[], filtro: FiltroEstrategia): boolean {
  const soma  = dezenas.reduce((s, d) => s + d, 0);
  const pares = dezenas.filter(d => d % 2 === 0).length;
  const primos = dezenas.filter(ehPrimo).length;
  const fibs   = dezenas.filter(ehFibonacci).length;
  const mult3  = dezenas.filter(ehMultiploDe3).length;
  const maxSeq = maxSequencia(dezenas);

  if (filtro.somaMin      !== undefined && soma   < filtro.somaMin)      return false;
  if (filtro.somaMax      !== undefined && soma   > filtro.somaMax)      return false;
  if (filtro.paresMin     !== undefined && pares  < filtro.paresMin)     return false;
  if (filtro.paresMax     !== undefined && pares  > filtro.paresMax)     return false;
  if (filtro.primosMin    !== undefined && primos < filtro.primosMin)    return false;
  if (filtro.primosMax    !== undefined && primos > filtro.primosMax)    return false;
  if (filtro.fibonacciMin !== undefined && fibs   < filtro.fibonacciMin) return false;
  if (filtro.fibonacciMax !== undefined && fibs   > filtro.fibonacciMax) return false;
  if (filtro.multiplos3Min !== undefined && mult3 < filtro.multiplos3Min) return false;
  if (filtro.multiplos3Max !== undefined && mult3 > filtro.multiplos3Max) return false;
  if (filtro.maxSequenciaMax !== undefined && maxSeq > filtro.maxSequenciaMax) return false;
  return true;
}

function validarFiltro(filtro: FiltroEstrategia, qtd: number): string | null {
  if (filtro.paresMin     !== undefined && filtro.paresMin     > qtd) return `Pares mínimo (${filtro.paresMin}) maior que o total de dezenas (${qtd}).`;
  if (filtro.paresMax     !== undefined && filtro.paresMax     > qtd) return `Pares máximo (${filtro.paresMax}) maior que o total de dezenas (${qtd}).`;
  if (filtro.primosMin    !== undefined && filtro.primosMin    > qtd) return `Primos mínimo (${filtro.primosMin}) maior que o total de dezenas (${qtd}).`;
  if (filtro.fibonacciMin !== undefined && filtro.fibonacciMin > qtd) return `Fibonacci mínimo (${filtro.fibonacciMin}) maior que o total de dezenas (${qtd}).`;
  if (filtro.multiplos3Min !== undefined && filtro.multiplos3Min > qtd) return `Múltiplos de 3 mínimo (${filtro.multiplos3Min}) maior que o total de dezenas (${qtd}).`;
  if (filtro.somaMin !== undefined && filtro.somaMax !== undefined && filtro.somaMin > filtro.somaMax) return `Soma mínima não pode ser maior que a soma máxima.`;
  return null;
}

// ── Lógica central ────────────────────────────────────────────────────────────
//
// A estratégia define QUANDO o apostador joga — apenas nos concursos cujo
// sorteio atende os filtros definidos. Para cada concurso coberto, simulamos
// N jogos aleatórios gerados dentro dos mesmos filtros e calculamos os acertos
// reais contra o sorteio. O resultado financeiro é a média desses N jogos,
// que converge para o valor esperado real conforme N aumenta.
//
// Isso garante que sempre haverá dados não-zerados desde que a cobertura > 0.

function gerarJogoAleatorio(
  dezenaMin: number,
  dezenaMax: number,
  qtd: number,
  filtro: FiltroEstrategia,
  maxTentativas = 200
): number[] | null {
  const pool = Array.from({ length: dezenaMax - dezenaMin + 1 }, (_, i) => i + dezenaMin);

  for (let t = 0; t < maxTentativas; t++) {
    // Fisher-Yates parcial para sortear qtd elementos
    const arr = [...pool];
    for (let i = 0; i < qtd; i++) {
      const j = i + Math.floor(Math.random() * (arr.length - i));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    const candidato = arr.slice(0, qtd).sort((a, b) => a - b);
    if (atendeEstrategia(candidato, filtro)) return candidato;
  }
  return null; // filtro muito restritivo — não encontrou jogo válido
}

function calcularEstrategia(
  nome: string,
  draws: Awaited<ReturnType<typeof getDrawsParaSimulacao>>,
  filtro: FiltroEstrategia,
  codigoLoteria: string,
  dezenaMin: number,
  dezenaMax: number,
  qtdDezenas: number
): ResultadoEstrategia {
  const preco = PRECO_APOSTA[codigoLoteria] ?? 3.50;
  const mapaFaixas = MAPA_FAIXAS[codigoLoteria] ?? {};
  const descFaixas = DESCRICOES_FAIXAS[codigoLoteria] ?? {};
  const minAcertos = Math.min(...Object.keys(mapaFaixas).map(Number));
  const JOGOS_POR_CONCURSO = 5; // média de N jogos para estabilizar o resultado

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
      const sorteio = new Set(draw.dezenas);
      let ganhoNoConcurso = 0;

      for (let j = 0; j < JOGOS_POR_CONCURSO; j++) {
        saldo -= preco / JOGOS_POR_CONCURSO;
        totalGasto += preco / JOGOS_POR_CONCURSO;

        // Gerar um jogo aleatório que atende os filtros
        const jogo = gerarJogoAleatorio(dezenaMin, dezenaMax, qtdDezenas, filtro);
        if (!jogo) continue;

        // Calcular acertos reais contra o sorteio
        const acertos = jogo.filter(d => sorteio.has(d)).length;

        if (acertos >= minAcertos) {
          const faixaBanco = mapaFaixas[acertos];
          if (faixaBanco !== undefined) {
            const premio = (draw.premios[faixaBanco] ?? 0) / JOGOS_POR_CONCURSO;
            if (premio > 0) {
              saldo += premio;
              totalGanho += premio;
              ganhoNoConcurso += premio;
              const entry = faixaMap.get(acertos);
              if (entry) { entry.qtd += 1 / JOGOS_POR_CONCURSO; entry.ganhoTotal += premio; }
            }
          }
        }
      }

      if (ganhoNoConcurso > 0) {
        melhores.push({ numero: draw.numero, acertos: qtdDezenas, premio: ganhoNoConcurso });
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
      qtd: Math.round(qtd * 10) / 10,
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
  limiteHistorico?: number,
  dezenaMinOverride?: number,
  dezenaMaxOverride?: number,
  qtdOverride?: number
): Promise<ResultadoComparacao | { erro: string }> {
  if (!isCodigoLoteriaValido(codigoLoteria)) return { erro: "Loteria inválida" };

  const loteria = await getLoteriaPorCodigo(codigoLoteria);
  if (!loteria) return { erro: "Loteria não encontrada" };

  const erroA = validarFiltro(filtroA, loteria.qtdDezenasSorteadas);
  if (erroA) return { erro: `Estratégia A — ${erroA}` };
  const erroB = validarFiltro(filtroB, loteria.qtdDezenasSorteadas);
  if (erroB) return { erro: `Estratégia B — ${erroB}` };

  const todosDraws = await getDrawsParaSimulacao(loteria.id);
  const draws = limiteHistorico ? todosDraws.slice(-limiteHistorico) : todosDraws;

  const dMin = dezenaMinOverride ?? loteria.dezenaMin;
  const dMax = dezenaMaxOverride ?? loteria.dezenaMax;
  const qtd  = qtdOverride ?? loteria.qtdDezenasSorteadas;

  const estrategiaA = calcularEstrategia(nomeA, draws, filtroA, codigoLoteria, dMin, dMax, qtd);
  const estrategiaB = calcularEstrategia(nomeB, draws, filtroB, codigoLoteria, dMin, dMax, qtd);

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
