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
  megasena: [4, 5, 6],
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
