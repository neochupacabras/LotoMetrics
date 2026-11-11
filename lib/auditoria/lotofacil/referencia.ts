// Implementação de REFERÊNCIA da matemática da Lotofácil, usada só pelos
// testes da auditoria (docs/auditorias/lotofacil). Escrita a partir das
// regras oficiais (01-ficha-matematica.md), sem importar nada do código
// auditado — é o "segundo cálculo" contra o qual o código de produção é
// comparado. Contagens em BigInt (exatas); probabilidades só no fim.

export const N = 25; // universo: 1..25
export const M = 15; // dezenas sorteadas
export const APOSTA_MIN = 15;
export const APOSTA_MAX = 20;
export const FAIXAS = [11, 12, 13, 14, 15] as const;
export const UNIVERSO = Array.from({ length: N }, (_, i) => i + 1);

export function comb(n: number, k: number): bigint {
  if (!Number.isInteger(n) || !Number.isInteger(k) || k < 0 || k > n) return BigInt(0);
  let r = BigInt(1);
  const kk = Math.min(k, n - k);
  for (let i = 1; i <= kk; i++) r = (r * BigInt(n - kk + i)) / BigInt(i);
  return r;
}

export const TOTAL_COMBINACOES = comb(N, M); // 3.268.760

// P(K = k) para uma aposta de b dezenas: hipergeométrica com população 25,
// 15 "sucessos" (sorteadas) e amostra b.
export function favoraveis(b: number, k: number): bigint {
  return comb(M, k) * comb(N - M, b - k);
}
export function probAcertos(b: number, k: number): number {
  return Number(favoraveis(b, k)) / Number(comb(N, b));
}

// Distribuição da quantidade de elementos de uma categoria (K elementos no
// volante) dentro de um sorteio de 15.
export function probCategoria(K: number, x: number): number {
  return Number(comb(K, x) * comb(N - K, M - x)) / Number(TOTAL_COMBINACOES);
}

// Conjuntos definidos pelas regras (volante 5 x 5), listados à mão.
export const PRIMOS = [2, 3, 5, 7, 11, 13, 17, 19, 23];
export const FIBONACCI = [1, 2, 3, 5, 8, 13, 21];
export const MULTIPLOS_3 = [3, 6, 9, 12, 15, 18, 21, 24];
export const PARES = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24];
export const MOLDURA = [1, 2, 3, 4, 5, 6, 10, 11, 15, 16, 20, 21, 22, 23, 24, 25];
export const CENTRO = [7, 8, 9, 12, 13, 14, 17, 18, 19];

// Percorre todos os 15-subconjuntos de {1..25} como bitmask (truque de
// Gosper). O bit i representa a dezena i+1.
export function paraCadaCombinacao(fn: (mask: number) => void): number {
  let v = (1 << M) - 1;
  let n = 0;
  const limite = 1 << N;
  while (v < limite) {
    fn(v);
    n++;
    const c = v & -v;
    const r = v + c;
    v = (((r ^ v) >>> 2) / c) | r;
  }
  return n;
}

export function somaMascara(mask: number): number {
  let s = 0;
  for (let i = 0; i < N; i++) if ((mask >> i) & 1) s += i + 1;
  return s;
}

export function maiorCorrida(mask: number): number {
  let melhor = 0;
  let atual = 0;
  for (let i = 0; i < N; i++) {
    if ((mask >> i) & 1) {
      atual++;
      if (atual > melhor) melhor = atual;
    } else atual = 0;
  }
  return melhor;
}

// Distribuições exatas por enumeração (contagens).
export function distribuicoesEnumeradas(): { soma: Map<number, number>; corrida: Map<number, number>; total: number } {
  const soma = new Map<number, number>();
  const corrida = new Map<number, number>();
  const total = paraCadaCombinacao((m) => {
    const s = somaMascara(m);
    soma.set(s, (soma.get(s) ?? 0) + 1);
    const c = maiorCorrida(m);
    corrida.set(c, (corrida.get(c) ?? 0) + 1);
  });
  return { soma, corrida, total };
}

// Garantia de fechamento "k se k": todo k-subconjunto do pool está contido
// em algum jogo. Verificação exaustiva própria (bitmask sobre o pool).
export function cobreTodosKSubconjuntos(pool: number[], jogos: number[][], k: number): boolean {
  const idx = new Map(pool.map((d, i) => [d, i]));
  const mascaras = jogos.map((j) => j.reduce((m, d) => m | (1 << (idx.get(d) as number)), 0));
  const v = pool.length;
  for (let s = (1 << k) - 1; s < 1 << v; ) {
    if (!mascaras.some((t) => (t & s) === s)) return false;
    const c = s & -s;
    const r = s + c;
    s = (((r ^ s) >>> 2) / c) | r;
  }
  return true;
}

// Limite inferior de Schönheim para cobertura C(v, 15, t).
export function limiteSchonheim(v: number, t: number, tamanhoJogo = M): number {
  let L = 1;
  for (let i = t - 1; i >= 0; i--) L = Math.ceil(((v - i) / (tamanhoJogo - i)) * L);
  return L;
}

export function acertos(jogo: number[], sorteio: number[]): number {
  const s = new Set(sorteio);
  return jogo.filter((d) => s.has(d)).length;
}

// Jogo válido segundo as regras oficiais.
export function jogoValido(dezenas: number[], tamanho = APOSTA_MIN): boolean {
  return (
    dezenas.length === tamanho &&
    new Set(dezenas).size === tamanho &&
    dezenas.every((d) => Number.isInteger(d) && d >= 1 && d <= N)
  );
}

// Jogo com exatamente x elementos da categoria (determinístico).
export function jogoComCategoria(categoria: number[], x: number): number[] | null {
  const fora = UNIVERSO.filter((d) => !categoria.includes(d));
  if (x > categoria.length || M - x > fora.length || x < 0) return null;
  return [...categoria.slice(0, x), ...fora.slice(0, M - x)].sort((a, b) => a - b);
}

// Teste qui-quadrado de uniformidade da frequência das dezenas em `n` jogos
// de 15: estatística corrigida pela soma fixa (24 graus de liberdade).
export function quiQuadradoFrequencia(freq: number[], n: number): number {
  const p = M / N;
  let x2 = 0;
  for (let d = 1; d <= N; d++) x2 += (freq[d] - n * p) ** 2 / (n * p * (1 - p));
  return (x2 * (N - 1)) / N;
}

// Tabela oficial da Caixa ("1 em N"), página da Lotofácil lida em 11/11/2026.
export const TABELA_CAIXA_1_EM: Record<number, number[]> = {
  15: [3268760, 204298, 24035, 4006, 843, 211],
  14: [21792, 3027, 601, 153, 47, 17],
  13: [692, 162, 49, 18, 8, 4.2],
  12: [60, 21, 9, 5, 3.2, 2.6],
  11: [11, 6, 4, 3, 2.9, 3.9],
};
