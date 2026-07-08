// Cálculo de probabilidades combinatórias (hipergeométrica) para as
// faixas de premiação. Matemática pura, sem dependência de banco —
// só depende das regras da loteria (n, m) e do tamanho da aposta (b).

export function binomial(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  k = Math.min(k, n - k);
  let resultado = 1;
  for (let i = 0; i < k; i++) {
    resultado = (resultado * (n - i)) / (i + 1);
  }
  return Math.round(resultado);
}

export interface FaixaProbabilidade {
  acertos: number;
  combinacoesFavoraveis: number;
  totalCombinacoes: number;
  probabilidade: number; // 0..1
  umEm: number; // 1 / probabilidade, arredondado
}

// n = universo de dezenas da loteria (dezena_max)
// m = quantas dezenas a loteria sorteia
// b = quantas dezenas o apostador escolheu (>= m para apostas estendidas)
export function calcularProbabilidades(
  n: number,
  m: number,
  b: number,
  faixasPremiadas: number[]
): FaixaProbabilidade[] {
  const totalCombinacoes = binomial(n, b);
  return faixasPremiadas
    .filter((k) => k <= b && k <= m && b - k <= n - m)
    .map((k) => {
      const combinacoesFavoraveis = binomial(m, k) * binomial(n - m, b - k);
      const probabilidade = combinacoesFavoraveis / totalCombinacoes;
      return {
        acertos: k,
        combinacoesFavoraveis,
        totalCombinacoes,
        probabilidade,
        umEm: Math.round(1 / probabilidade),
      };
    });
}

export const FAIXAS_PREMIADAS: Record<string, number[]> = {
  lotofacil: [11, 12, 13, 14, 15],
  megasena:  [4, 5, 6],
  quina:     [2, 3, 4, 5],
  // Lotomania: apostador marca 50, sorteia 20. Faixas especiais incluem 0 acertos.
  // O cálculo padrão cobre 15,16,17,18,19,20 — 0 acertos é tratado na UI.
  lotomania:  [15, 16, 17, 18, 19, 20],
  // Dia de Sorte: faixas de 2 a 7 acertos
  diadesorte:     [2, 3, 4, 5, 6, 7],
  maismilionaria: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  timemania:  [3, 4, 5, 6, 7],
  duplasena:  [1, 2, 3, 4, 5, 6, 7, 8], // 8 faixas: 4 por sorteio
};

// Probabilidade de PELO MENOS k das m dezenas sorteadas estarem dentro de
// um pool de b dezenas escolhidas pelo apostador (universo de n dezenas).
// Usada nos fechamentos para mostrar a chance real da condição que
// precisa acontecer para a garantia "valer a pena".
export function probabilidadeAoMenosK(n: number, m: number, b: number, k: number): number {
  const limiteSuperior = Math.min(b, m);
  let combinacoesFavoraveis = 0;
  for (let j = k; j <= limiteSuperior; j++) {
    combinacoesFavoraveis += binomial(m, j) * binomial(n - m, b - j);
  }
  return combinacoesFavoraveis / binomial(n, b);
}

// ── Probabilidades de acúmulo ─────────────────────────────────────────────────

// Parâmetros estruturais das loterias (fonte: Caixa)
export const PARAMS_LOTERIA = {
  lotofacil: {
    n: 25, m: 15,                    // universo e sorteadas
    percFaixa1: 0.35,                // % da arrecadação para a faixa 1
    precoAposta: 3.00,               // preço base (15 dezenas)
    ticketsMedios: 60_000_000,       // estimativa de apostas por concurso
  },
  megasena: {
    n: 60, m: 6,
    percFaixa1: 0.3565,
    precoAposta: 5.00,
    ticketsMedios: 80_000_000,
  },
  quina: {
    n: 80, m: 5,
    percFaixa1: 0.35,
    precoAposta: 2.50,
    ticketsMedios: 40_000_000,
  },
  lotomania: {
    n: 100, m: 20,                   // apostador marca 50 de 100, mas sorteia 20
    percFaixa1: 0.35,
    precoAposta: 3.00,
    ticketsMedios: 15_000_000,
  },
  diadesorte: {
    n: 31, m: 7,
    percFaixa1: 0.35,
    precoAposta: 2.50,
    ticketsMedios: 8_000_000,
  },
  maismilionaria: {
    n: 50, m: 6,   // 6 dezenas de 1-50 + 2 trevos de 1-6 (tratados separadamente)
    percFaixa1: 0.35,
    precoAposta: 6.00,
    ticketsMedios: 25_000_000,
  },
  timemania: {
    n: 80, m: 7,
    percFaixa1: 0.35,
    precoAposta: 3.00,
    ticketsMedios: 10_000_000,
  },
  duplasena: {
    n: 50, m: 6,  // dois sorteios independentes de 6 dezenas de 1-50
    percFaixa1: 0.35,
    precoAposta: 2.50,
    ticketsMedios: 6_000_000,
  },
} as const;

export interface ProjecaoAcumulo {
  // Próximo concurso
  premioEstimado: number;
  premioMinimo: number;              // acumulado garantido mesmo sem ganhador anterior
  // Probabilidade de haver ganhador
  probGanhadorUmTicket: number;      // prob de 1 ticket ganhar a faixa 1
  probAoMenosUmGanhador: number;     // prob de pelo menos 1 ganhador dado volume estimado
  ticketsEstimados: number;          // estimativa de bilhetes no próximo concurso
  // Histórico de acúmulo
  concursosAcumulados: number;       // quantos concursos seguidos sem ganhador na faixa 1
  // Cenários
  probGanhadorSeVenderMais: number;  // se vender 50% mais tickets
  probGanhadorSeVenderMenos: number; // se vender 50% menos tickets
}

// Calcula a probabilidade de pelo menos 1 ganhador na faixa 1
// dado que N tickets foram vendidos, cada um com prob p de ganhar.
// Usa P(ao menos 1) = 1 - (1-p)^N
export function probAoMenosUmGanhador(p: number, n: number): number {
  return 1 - Math.pow(1 - p, n);
}

// Estima o número de tickets com base na arrecadação do último concurso
export function estimarTickets(
  valorArrecadado: number | null,
  codigoLoteria: keyof typeof PARAMS_LOTERIA
): number {
  const params = PARAMS_LOTERIA[codigoLoteria];
  if (!valorArrecadado || valorArrecadado <= 0) return params.ticketsMedios;
  return Math.round(valorArrecadado / params.precoAposta);
}

export function calcularProjecao(
  codigoLoteria: keyof typeof PARAMS_LOTERIA,
  valorAcumuladoProximo: number | null,
  valorEstimadoProximo: number | null,
  valorArrecadado: number | null,
  concursosAcumulados: number
): ProjecaoAcumulo {
  const params = PARAMS_LOTERIA[codigoLoteria];

  // Probabilidade de 1 ticket ganhar a faixa 1
  const totalComb = binomial(params.n, params.m);
  const p = 1 / totalComb;

  // Estimativa de tickets no próximo concurso
  // Quando acumula, a arrecadação tende a crescer (mais interesse)
  const ticketsBase = estimarTickets(valorArrecadado, codigoLoteria);
  // Fator de crescimento por acúmulo: cada concurso acumulado aumenta ~20% o interesse
  const fatorAcumulo = Math.min(1 + concursosAcumulados * 0.20, 5);
  const ticketsEstimados = Math.round(ticketsBase * fatorAcumulo);

  const premioMinimo = valorAcumuladoProximo ?? 0;
  const premioEstimado = valorEstimadoProximo ?? premioMinimo;

  return {
    premioEstimado,
    premioMinimo,
    probGanhadorUmTicket: p,
    probAoMenosUmGanhador: probAoMenosUmGanhador(p, ticketsEstimados),
    ticketsEstimados,
    concursosAcumulados,
    probGanhadorSeVenderMais: probAoMenosUmGanhador(p, Math.round(ticketsEstimados * 1.5)),
    probGanhadorSeVenderMenos: probAoMenosUmGanhador(p, Math.round(ticketsEstimados * 0.5)),
  };
}
