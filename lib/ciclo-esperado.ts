// Duração esperada de um ciclo (concursos até todas as dezenas saírem ao
// menos uma vez), pela cadeia de Markov do número de dezenas já sorteadas
// no ciclo. Em cada concurso saem `sorteadas` dezenas distintas de
// `universo`; com m dezenas já vistas, a chance de ver i novas é
// hipergeométrica: C(universo - m, i) · C(m, sorteadas - i) / C(universo, sorteadas).
// Mega-Sena (60, 6): 45,2 concursos. Lotofácil (25, 15): 4,8.
// Auditoria da Mega-Sena, MS-25: a página mostrava só a média dos 15
// últimos ciclos, sem o esperado.

function comb(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return r;
}

export function cicloEsperado(universo: number, sorteadas: number): number {
  if (sorteadas <= 0 || sorteadas > universo) return NaN;
  const total = comb(universo, sorteadas);
  // esperado[m] = concursos que faltam, partindo de m dezenas já vistas.
  const esperado = new Array<number>(universo + 1).fill(0);
  for (let m = universo - 1; m >= 0; m--) {
    const p0 = comb(m, sorteadas) / total;
    let soma = 1;
    for (let i = 1; i <= Math.min(sorteadas, universo - m); i++) {
      const p = (comb(universo - m, i) * comb(m, sorteadas - i)) / total;
      soma += p * esperado[m + i];
    }
    esperado[m] = soma / (1 - p0);
  }
  return esperado[0];
}
