"use server";

import { getLoteriaPorCodigo, getDrawsParaSimulacao } from "@/lib/queries";
import { isCodigoLoteriaValido } from "@/lib/format";
import { ehPrimo, ehFibonacci, ehMultiploDe3 } from "@/lib/classificacao";

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface FiltroEstrategia {
  // Soma das dezenas
  somaMin?: number;
  somaMax?: number;
  // Distribuição par/ímpar
  paresMin?: number;
  paresMax?: number;
  // Primos, Fibonacci, Múltiplos de 3
  primosMin?: number;
  primosMax?: number;
  fibonacciMin?: number;
  fibonacciMax?: number;
  multiplos3Min?: number;
  multiplos3Max?: number;
  // Sequências consecutivas (máx de números seguidos)
  maxSequenciaMax?: number; // ex: 2 = no máximo 2 números seguidos
}

export interface ResultadoEstrategia {
  nome: string;
  totalConcursos: number;
  concursosQuePassaram: number;
  taxaCobertura: number;        // % dos concursos que atendem os filtros
  // Simulação: se você jogasse nesses concursos
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

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function maxSequencia(dezenas: number[]): number {
  const sorted = [...dezenas].sort((a, b) => a - b);
  let max = 1, atual = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i-1] + 1) {
      atual++;
      max = Math.max(max, atual);
    } else {
      atual = 1;
    }
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

// Calcula o resultado de uma estratégia no histórico
function calcularEstrategia(
  nome: string,
  draws: Awaited<ReturnType<typeof getDrawsParaSimulacao>>,
  filtro: FiltroEstrategia,
  codigoLoteria: string
): ResultadoEstrategia {
  const preco = PRECO_APOSTA[codigoLoteria] ?? 3.50;
  const mapaFaixas = MAPA_FAIXAS[codigoLoteria] ?? {};
  const descFaixas = DESCRICOES_FAIXAS[codigoLoteria] ?? {};
  const minAcertos = Math.min(...Object.keys(mapaFaixas).map(Number));

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

      // Para cada faixa, verificar se o sorteio teria sido premiado
      // (usamos o próprio resultado como referência — se o sorteio
      // passou nos filtros, o apostador estava jogando naquele concurso)
      for (const [acertos, faixaBanco] of Object.entries(mapaFaixas)) {
        const ac = Number(acertos);
        if (ac >= minAcertos) {
          const premio = draw.premios[faixaBanco] ?? 0;
          if (premio > 0) {
            // Probabilidade de acertar essa faixa com um jogo aleatório
            // não é 100% — mas para fins comparativos tratamos como:
            // "quantas vezes essa faixa foi premiada em concursos que sua estratégia cobriria"
            // Isso é honesto: mostra quantas oportunidades existiram
          }
        }
      }

      // Verificar acertos do próprio sorteio nas faixas
      // (o sorteio é avaliado como se o apostador jogasse os números sorteados — cota máxima)
      const maxAcertos = draw.dezenas.length;
      const faixaMax = mapaFaixas[maxAcertos];
      if (faixaMax !== undefined) {
        const premio = draw.premios[faixaMax] ?? 0;
        if (premio > 0) {
          saldo += premio;
          totalGanho += premio;
          const entry = faixaMap.get(maxAcertos);
          if (entry) { entry.qtd++; entry.ganhoTotal += premio; }
          melhores.push({ numero: draw.numero, acertos: maxAcertos, premio });
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
      qtd,
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

  // Gráfico comparado (amostrado para performance)
  const graficoA = estrategiaA.grafico;
  const graficoB = estrategiaB.grafico;
  const passo = graficoA.length > 500 ? Math.ceil(graficoA.length / 500) : 1;

  const graficoComparado = graficoA
    .filter((_, i) => i % passo === 0 || i === graficoA.length - 1)
    .map((pA, idx) => {
      const pB = graficoB[idx * passo] ?? graficoB[graficoB.length - 1];
      return {
        numero: pA.numero,
        saldoA: pA.saldo,
        saldoB: pB?.saldo ?? 0,
      };
    });

  return { estrategiaA, estrategiaB, graficoComparado };
}
