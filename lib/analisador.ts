// Módulo de análise estatística de combinações para o analisador interativo.
// Todas as distribuições são pre-computadas por combinatória exata (Lotofácil)
// ou amostragem de 1M combinações (Mega-Sena sequências), sem dados históricos.

// ─── Definições de grupos numéricos ─────────────────────────────────────────

const PRIMOS_LF  = new Set([2,3,5,7,11,13,17,19,23]);
const FIB_LF     = new Set([1,2,3,5,8,13,21]);
const MULT3_LF   = new Set([3,6,9,12,15,18,21,24]);
const MOLDURA_LF = new Set([1,2,3,4,5,6,10,11,15,16,20,21,22,23,24,25]);
const CENTRO_LF  = new Set([7,8,9,12,13,14,17,18,19]);

const PRIMOS_MS  = new Set([2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59]);
const FIB_MS     = new Set([1,2,3,5,8,13,21,34,55]);
const MULT3_MS   = new Set([3,6,9,12,15,18,21,24,27,30,33,36,39,42,45,48,51,54,57,60]);
const MOLDURA_MS = new Set([1,2,3,4,5,6,7,12,13,18,19,24,25,30,31,36,37,42,43,48,49,54,55,56,57,58,59,60]);
const CENTRO_MS  = new Set([8,9,10,11,14,15,16,17,20,21,22,23,26,27,28,29,32,33,34,35,38,39,40,41,44,45,46,47,50,51,52,53]);

// ─── CDF da soma: índice = soma - offset ────────────────────────────────────
// Valor = percentual acumulado de combinações com soma ≤ índice+offset

const CDF_SOMA_LF_OFFSET = 120;
const CDF_SOMA_LF: number[] = [0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.1,0.1,0.1,0.1,0.1,0.2,0.2,0.3,0.3,0.4,0.5,0.6,0.7,0.8,1.0,1.1,1.3,1.5,1.8,2.1,2.4,2.7,3.1,3.5,4.0,4.5,5.1,5.8,6.4,7.2,8.0,8.9,9.8,10.8,11.9,13.0,14.3,15.6,16.9,18.3,19.8,21.4,23.1,24.8,26.5,28.4,30.2,32.2,34.1,36.2,38.2,40.3,42.4,44.6,46.7,48.9,51.1,53.3,55.4,57.6,59.7,61.8,63.8,65.9,67.8,69.8,71.6,73.5,75.2,76.9,78.6,80.2,81.7,83.1,84.4,85.7,87.0,88.1,89.2,90.2,91.1,92.0,92.8,93.6,94.2,94.9,95.5,96.0,96.5,96.9,97.3,97.6,97.9,98.2,98.5,98.7,98.9,99.0,99.2,99.3,99.4,99.5,99.6,99.7,99.7,99.8,99.8,99.9,99.9,99.9,99.9,99.9,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0];

const CDF_SOMA_MS_OFFSET = 21;
const CDF_SOMA_MS: number[] = [0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.2,0.2,0.2,0.2,0.2,0.3,0.3,0.3,0.3,0.4,0.4,0.4,0.5,0.5,0.6,0.6,0.7,0.7,0.8,0.8,0.9,1.0,1.1,1.1,1.2,1.3,1.4,1.5,1.6,1.7,1.9,2.0,2.1,2.3,2.4,2.6,2.7,2.9,3.1,3.3,3.5,3.7,3.9,4.1,4.4,4.6,4.9,5.1,5.4,5.7,6.0,6.3,6.6,6.9,7.3,7.6,8.0,8.4,8.8,9.2,9.6,10.1,10.5,11.0,11.4,11.9,12.4,13.0,13.5,14.0,14.6,15.2,15.7,16.3,17.0,17.6,18.2,18.9,19.6,20.2,20.9,21.6,22.4,23.1,23.8,24.6,25.4,26.2,27.0,27.8,28.6,29.4,30.2,31.1,32.0,32.8,33.7,34.6,35.5,36.4,37.3,38.2,39.1,40.0,41.0,41.9,42.9,43.8,44.7,45.7,46.7,47.6,48.6,49.5,50.5,51.4,52.4,53.3,54.3,55.3,56.2,57.1,58.1,59.0,60.0,60.9,61.8,62.7,63.6,64.5,65.4,66.3,67.2,68.0,68.9,69.8,70.6,71.4,72.2,73.0,73.8,74.6,75.4,76.2,76.9,77.6,78.4,79.1,79.8,80.4,81.1,81.8,82.4,83.0,83.7,84.3,84.8,85.4,86.0,86.5,87.0,87.6,88.1,88.6,89.0,89.5,89.9,90.4,90.8,91.2,91.6,92.0,92.4,92.7,93.1,93.4,93.7,94.0,94.3,94.6,94.9,95.1,95.4,95.6,95.9,96.1,96.3,96.5,96.7,96.9,97.1,97.3,97.4,97.6,97.7,97.9,98.0,98.1,98.3,98.4,98.5,98.6,98.7,98.8,98.9,98.9,99.0,99.1,99.2,99.2,99.3,99.3,99.4,99.4,99.5,99.5,99.6,99.6,99.6,99.7,99.7,99.7,99.7,99.8,99.8,99.8,99.8,99.8,99.9,99.9,99.9,99.9,99.9,99.9,99.9,99.9,99.9,99.9,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0,100.0];

// ─── Distribuições por categoria: chave = valor observado, valor = % ────────

// Lotofácil (N=25, K=15, total=3.268.760)
const DIST_PI_LF:  Record<number, number> = {2:0.0,3:0.09,4:1.18,5:6.93,6:20.21,7:31.18,8:25.99,9:11.55,10:2.6,11:0.26,12:0.01}; // k = pares
const DIST_SEQ_LF: Record<number, number> = {2:0.28,3:12.31,4:30.29,5:26.52,6:15.9,7:8.16,8:3.85,9:1.68,10:0.67,11:0.24,12:0.07,13:0.02}; // maior seq
const DIST_MC_LF:  Record<number, number> = {7:3.15,8:14.17,9:29.4,10:30.87,11:16.84,12:4.68,13:0.86,14:0.01}; // k = moldura
const DIST_PR_LF:  Record<number, number> = {1:0.01,2:0.26,3:4.68,4:16.84,5:30.87,6:29.4,7:14.17,8:3.15,9:0.09}; // k = primos
const DIST_FIB_LF: Record<number, number> = {0:0.18,1:0.48,2:5.5,3:19.88,4:34.08,5:28.11,6:10.41,7:1.34}; // k = fibonacci
const DIST_M3_LF:  Record<number, number> = {1:0.09,2:2.04,3:10.6,4:26.5,5:33.32,6:20.82,7:5.95,8:0.67}; // k = múltiplos de 3

// Mega-Sena (N=60, K=6, total=50.063.860)
const DIST_PI_MS:  Record<number, number> = {0:1.19,1:8.54,2:23.81,3:32.93,4:23.81,5:8.54,6:1.19}; // k = pares
const DIST_SEQ_MS: Record<number, number> = {1:57.9,2:38.8,3:3.1,4:0.2,5:0.0,6:0.0}; // maior seq
const DIST_MC_MS:  Record<number, number> = {0:0.02,1:11.26,2:27.15,3:32.46,4:20.29,5:6.28,6:2.52}; // k = moldura
const DIST_PR_MS:  Record<number, number> = {0:12.18,1:32.69,2:33.52,3:16.76,4:4.29,5:0.53,6:0.02}; // k = primos
const DIST_FIB_MS: Record<number, number> = {0:35.97,1:42.23,2:17.97,3:3.49,4:0.32,5:0.01,6:0.0}; // k = fibonacci
const DIST_M3_MS:  Record<number, number> = {0:7.67,1:26.29,2:34.68,3:22.5,4:7.55,5:1.24,6:0.08}; // k = múltiplos de 3

// ─── Tipos exportados ────────────────────────────────────────────────────────

export type LabelTipicidade = "Muito comum" | "Comum" | "Incomum" | "Raro";

export interface MetricaAnalisador {
  pct: number;       // % de todas as combinações possíveis com esse valor
  label: LabelTipicidade;
}

export interface ResultadoAnalisador {
  soma: { valor: number; percentil: number } & MetricaAnalisador;
  parImpar: { pares: number; impares: number } & MetricaAnalisador;
  sequencias: { maior: number } & MetricaAnalisador;
  molduraCentro: { moldura: number; centro: number } & MetricaAnalisador;
  primos: { qtd: number } & MetricaAnalisador;
  fibonacci: { qtd: number } & MetricaAnalisador;
  multiplos3: { qtd: number } & MetricaAnalisador;
  tipicas: number;  // quantas métricas são "Muito comum" ou "Comum"
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function label(pct: number): LabelTipicidade {
  if (pct >= 20) return "Muito comum";
  if (pct >= 10) return "Comum";
  if (pct >= 3)  return "Incomum";
  return "Raro";
}

function maiorSeq(dezenas: number[]): number {
  if (dezenas.length === 0) return 0;
  const s = [...dezenas].sort((a, b) => a - b);
  let maior = 1, atual = 1;
  for (let i = 1; i < s.length; i++) {
    if (s[i] === s[i - 1] + 1) { atual++; if (atual > maior) maior = atual; }
    else atual = 1;
  }
  return maior;
}

function percentilSoma(soma: number, cdf: number[], offset: number): number {
  const idx = soma - offset;
  if (idx < 0) return 0;
  if (idx >= cdf.length) return 100;
  return cdf[idx];
}

function pctDist(dist: Record<number, number>, chave: number): number {
  return dist[chave] ?? 0;
}

// ─── Função principal ─────────────────────────────────────────────────────────

export function analisar(
  dezenas: number[],
  codigoLoteria: string
): ResultadoAnalisador | null {
  if (dezenas.length === 0) return null;
  const isLF = codigoLoteria === "lotofacil";

  const primos_set   = isLF ? PRIMOS_LF   : PRIMOS_MS;
  const fib_set      = isLF ? FIB_LF      : FIB_MS;
  const mult3_set    = isLF ? MULT3_LF    : MULT3_MS;
  const moldura_set  = isLF ? MOLDURA_LF  : MOLDURA_MS;

  const dist_pi  = isLF ? DIST_PI_LF  : DIST_PI_MS;
  const dist_seq = isLF ? DIST_SEQ_LF : DIST_SEQ_MS;
  const dist_mc  = isLF ? DIST_MC_LF  : DIST_MC_MS;
  const dist_pr  = isLF ? DIST_PR_LF  : DIST_PR_MS;
  const dist_fib = isLF ? DIST_FIB_LF : DIST_FIB_MS;
  const dist_m3  = isLF ? DIST_M3_LF  : DIST_M3_MS;

  const cdf_soma  = isLF ? CDF_SOMA_LF  : CDF_SOMA_MS;
  const cdf_off   = isLF ? CDF_SOMA_LF_OFFSET : CDF_SOMA_MS_OFFSET;

  const soma = dezenas.reduce((a, b) => a + b, 0);
  const pares = dezenas.filter(d => d % 2 === 0).length;
  const impares = dezenas.length - pares;
  const maior = maiorSeq(dezenas);
  const qtdMoldura = dezenas.filter(d => moldura_set.has(d)).length;
  const qtdCentro = dezenas.length - qtdMoldura;
  const qtdPrimos = dezenas.filter(d => primos_set.has(d)).length;
  const qtdFib = dezenas.filter(d => fib_set.has(d)).length;
  const qtdM3 = dezenas.filter(d => mult3_set.has(d)).length;

  const percentil = percentilSoma(soma, cdf_soma, cdf_off);
  // proximidade do centro: 0% nas extremidades, 100% na mediana
  const centrality = 100 - Math.abs(50 - percentil) * 2;
  const somaLabel: LabelTipicidade =
    centrality >= 60 ? "Muito comum" : centrality >= 40 ? "Comum" : centrality >= 20 ? "Incomum" : "Raro";
  const somaPct = Math.max(0.1, Math.min(99.9, centrality));

  const metricas = [
    { pct: somaPct, label: somaLabel },
    { pct: pctDist(dist_pi, pares), label: label(pctDist(dist_pi, pares)) },
    { pct: pctDist(dist_seq, maior), label: label(pctDist(dist_seq, maior)) },
    { pct: pctDist(dist_mc, qtdMoldura), label: label(pctDist(dist_mc, qtdMoldura)) },
    { pct: pctDist(dist_pr, qtdPrimos), label: label(pctDist(dist_pr, qtdPrimos)) },
    { pct: pctDist(dist_fib, qtdFib), label: label(pctDist(dist_fib, qtdFib)) },
    { pct: pctDist(dist_m3, qtdM3), label: label(pctDist(dist_m3, qtdM3)) },
  ];
  const tipicas = metricas.filter(m => m.label === "Muito comum" || m.label === "Comum").length;

  return {
    soma: { valor: soma, percentil, pct: somaPct, label: somaLabel },
    parImpar: { pares, impares, pct: pctDist(dist_pi, pares), label: label(pctDist(dist_pi, pares)) },
    sequencias: { maior, pct: pctDist(dist_seq, maior), label: label(pctDist(dist_seq, maior)) },
    molduraCentro: { moldura: qtdMoldura, centro: qtdCentro, pct: pctDist(dist_mc, qtdMoldura), label: label(pctDist(dist_mc, qtdMoldura)) },
    primos: { qtd: qtdPrimos, pct: pctDist(dist_pr, qtdPrimos), label: label(pctDist(dist_pr, qtdPrimos)) },
    fibonacci: { qtd: qtdFib, pct: pctDist(dist_fib, qtdFib), label: label(pctDist(dist_fib, qtdFib)) },
    multiplos3: { qtd: qtdM3, pct: pctDist(dist_m3, qtdM3), label: label(pctDist(dist_m3, qtdM3)) },
    tipicas,
  };
}
