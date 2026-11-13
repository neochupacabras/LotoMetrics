// Implementação de REFERÊNCIA da matemática da Mega-Sena, usada só pelos
// testes da auditoria (docs/auditorias/mega-sena). Escrita a partir das
// regras oficiais (01-ficha-matematica.md), sem importar nada do código
// auditado — é o "segundo cálculo" contra o qual o código de produção é
// comparado. Contagens em BigInt (exatas); probabilidades só no fim.

export const N = 60; // universo: 1..60
export const M = 6; // dezenas sorteadas
export const APOSTA_MIN = 6;
export const APOSTA_MAX = 20;
export const FAIXAS = [4, 5, 6] as const;
export const PRECO_ATUAL = 6;
export const UNIVERSO = Array.from({ length: N }, (_, i) => i + 1);

export function comb(n: number, k: number): bigint {
  if (!Number.isInteger(n) || !Number.isInteger(k) || k < 0 || k > n) return BigInt(0);
  let r = BigInt(1);
  const kk = Math.min(k, n - k);
  for (let i = 1; i <= kk; i++) r = (r * BigInt(n - kk + i)) / BigInt(i);
  return r;
}

export const TOTAL_COMBINACOES = comb(N, M); // 50.063.860

// P(K = k) para uma aposta de b dezenas: hipergeométrica (população 60,
// 6 sorteadas, amostra b).
export function favoraveis(b: number, k: number): bigint {
  return comb(M, k) * comb(N - M, b - k);
}
export function probAcertos(b: number, k: number): number {
  return Number(favoraveis(b, k)) / Number(comb(N, b));
}

// Quantidade de elementos de uma categoria com K dezenas num sorteio de 6.
export function probCategoria(K: number, x: number): number {
  return Number(comb(K, x) * comb(N - K, M - x)) / Number(TOTAL_COMBINACOES);
}

// Conjuntos definidos pelas regras, listados à mão.
export const PARES = UNIVERSO.filter((d) => d % 2 === 0);
export const PRIMOS = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59];
export const FIBONACCI = [1, 2, 3, 5, 8, 13, 21, 34, 55];
export const MULTIPLOS_3 = UNIVERSO.filter((d) => d % 3 === 0);

// Moldura da grade usada hoje pelo site (10 linhas × 6 colunas,
// `grid_colunas = 6`). A grade do volante oficial está PENDENTE (MS-06):
// se for 6 × 10, a moldura correta é MOLDURA_6X10. As duas têm 28 dezenas.
export const MOLDURA_10X6 = [1, 2, 3, 4, 5, 6, 7, 12, 13, 18, 19, 24, 25, 30, 31, 36, 37, 42, 43, 48, 49, 54, 55, 56, 57, 58, 59, 60];
export const MOLDURA_6X10 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 20, 21, 30, 31, 40, 41, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60];

// Tabela oficial da Caixa ("1 em N"), lida em 11/11/2026. Índice = b − 6.
export const TABELA_CAIXA_1_EM: Record<number, number[]> = {
  6: [50063860, 7151980, 1787995, 595998, 238399, 108363, 54182, 29175, 16671, 10003, 6252, 4045, 2697, 1845, 1292],
  5: [154518, 44981, 17192, 7791, 3973, 2211, 1317, 828, 544, 370, 260, 188, 139, 105, 81],
  4: [2332, 1038, 539, 312, 195, 129, 90, 65, 48, 37, 29, 23, 19, 16, 13],
};
// Preços oficiais (C(b,6) × R$ 6,00), mesma página. Índice = b − 6.
export const PRECOS_CAIXA = [6, 42, 168, 504, 1260, 2772, 5544, 10296, 18018, 30030, 48048, 74256, 111384, 162792, 232560];

// Percorre as 50.063.860 combinações com 6 laços aninhados (rápido em JS).
export function paraCadaCombinacao(fn: (d: number[]) => void): number {
  const d = [0, 0, 0, 0, 0, 0];
  let n = 0;
  for (d[0] = 1; d[0] <= 55; d[0]++)
    for (d[1] = d[0] + 1; d[1] <= 56; d[1]++)
      for (d[2] = d[1] + 1; d[2] <= 57; d[2]++)
        for (d[3] = d[2] + 1; d[3] <= 58; d[3]++)
          for (d[4] = d[3] + 1; d[4] <= 59; d[4]++)
            for (d[5] = d[4] + 1; d[5] <= 60; d[5]++) {
              fn(d);
              n++;
            }
  return n;
}

// Contagem de combinações por soma e por maior sequência de consecutivos,
// calculada uma vez e reaproveitada pelos testes (≈ 3 s).
let cache: { somas: Map<number, number>; corridas: Map<number, number> } | null = null;
export function distribuicoesEnumeradas() {
  if (cache) return cache;
  const somas = new Map<number, number>();
  const corridas = new Map<number, number>();
  paraCadaCombinacao((d) => {
    let s = d[0];
    let melhor = 1;
    let atual = 1;
    for (let i = 1; i < 6; i++) {
      s += d[i];
      atual = d[i] === d[i - 1] + 1 ? atual + 1 : 1;
      if (atual > melhor) melhor = atual;
    }
    somas.set(s, (somas.get(s) ?? 0) + 1);
    corridas.set(melhor, (corridas.get(melhor) ?? 0) + 1);
  });
  cache = { somas, corridas };
  return cache;
}

export function acertos(jogo: number[], sorteio: number[]): number {
  const s = new Set(sorteio);
  return jogo.filter((d) => s.has(d)).length;
}

export function jogoValido(jogo: number[], tamanho: number): boolean {
  return (
    jogo.length === tamanho &&
    new Set(jogo).size === tamanho &&
    jogo.every((d) => Number.isInteger(d) && d >= 1 && d <= N)
  );
}

// Verifica se `jogos` cobre todos os k-subconjuntos de `pool` (garantia
// "k se k"). Enumeração própria por bitmask, independente de lib/fechamento.
export function cobreTodos(pool: number[], jogos: number[][], k: number): boolean {
  const idx = new Map(pool.map((d, i) => [d, i]));
  const mascaras = jogos.map((j) => j.reduce((m, d) => m | (1 << idx.get(d)!), 0));
  const v = pool.length;
  for (let s = (1 << k) - 1; s < 1 << v; ) {
    if (!mascaras.some((t) => (t & s) === s)) return false;
    const c = s & -s;
    const r = s + c;
    s = (((r ^ s) >>> 2) / c) | r;
  }
  return true;
}

// Cota inferior de Schönheim para cobrir os t-subconjuntos de v pontos com
// blocos de tamanho K.
export function schonheim(v: number, K: number, t: number): number {
  let L = 1;
  for (let i = t - 1; i >= 0; i--) L = Math.ceil(((v - i) / (K - i)) * L);
  return L;
}

// Qui-quadrado das frequências de dezenas em `n` jogos de 6 (cada dezena
// aparece com prob. 0,1 por jogo). Aproximadamente χ² com 59 gl.
export function quiQuadradoFrequencias(freq: number[], n: number): number {
  const e = n * 0.1;
  const v = n * 0.1 * 0.9;
  let x2 = 0;
  for (let d = 1; d <= N; d++) x2 += (freq[d] - e) ** 2 / v;
  return (x2 * (N - 1)) / N;
}

// Concurso real 3084 (10/11/2026), lido do banco de produção na Fase 2.
export const CONCURSO_3084 = {
  numero: 3084,
  dezenas: [6, 14, 22, 30, 31, 37],
  faixas: [
    { faixa: 1, descricaoFaixa: "6 acertos", qtdGanhadores: 1, valorPremio: 3287949.91 },
    { faixa: 2, descricaoFaixa: "5 acertos", qtdGanhadores: 29, valorPremio: 28344.4 },
    { faixa: 3, descricaoFaixa: "4 acertos", qtdGanhadores: 2264, valorPremio: 518.66 },
  ],
};
