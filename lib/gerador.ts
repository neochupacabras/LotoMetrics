import {
  getAtraso,
  getCiclos,
  getDuques,
  getFibonacciDistribuicao,
  getFrequencia,
  getMultiplos3Distribuicao,
  getParesImpares,
  getPrimosDistribuicao,
  getSoma,
  getTrincas,
} from "./estatisticas";

export interface DadosGerador {
  maisAtrasadas: number[];
  maisFrequentes: number[];
  parImparComum: { pares: number; impares: number };
  somaFaixaComum: { min: number; max: number };
  dezenasFaltantesCiclo: number[];
  duquesQuentes: number[][];
  trincasQuentes: number[][];
  primosComuns: number[];
  fibonacciComuns: number[];
  multiplos3Comuns: number[];
}

// Pega os K valores de "quantidade" mais comuns (maior ocorrência) de uma
// distribuição já ordenada por ocorrências — usado para primos, Fibonacci
// e múltiplos de 3, que são contagens discretas (diferente da soma, que é
// um intervalo contínuo).
function valoresMaisComuns(
  distribuicao: { quantidade: number; ocorrencias: number }[],
  k: number
): number[] {
  return distribuicao.slice(0, k).map((d) => d.quantidade);
}

export async function prepararDadosGerador(loteriaId: number): Promise<DadosGerador> {
  const [
    atraso,
    frequencia,
    paresImpares,
    soma,
    ciclos,
    duques,
    trincas,
    primosDistribuicao,
    fibonacciDistribuicao,
    multiplos3Distribuicao,
  ] = await Promise.all([
    getAtraso(loteriaId),
    getFrequencia(loteriaId),
    getParesImpares(loteriaId),
    getSoma(loteriaId),
    getCiclos(loteriaId),
    getDuques(loteriaId, 10),
    getTrincas(loteriaId, 10),
    getPrimosDistribuicao(loteriaId),
    getFibonacciDistribuicao(loteriaId),
    getMultiplos3Distribuicao(loteriaId),
  ]);

  const maisAtrasadas = atraso.slice(0, 10).map((a) => a.dezena);
  const maisFrequentes = frequencia.slice(0, 10).map((f) => f.dezena);

  const parImparComum = paresImpares[0]
    ? { pares: paresImpares[0].pares, impares: paresImpares[0].impares }
    : { pares: 0, impares: 0 };

  const bucketsOrdenados = [...soma.histograma].sort((a, b) => b.ocorrencias - a.ocorrencias);
  const topBuckets = bucketsOrdenados.slice(0, 3);
  const somaFaixaComum =
    topBuckets.length > 0
      ? {
          min: Math.min(...topBuckets.map((b) => b.faixaInicio)),
          max: Math.max(...topBuckets.map((b) => b.faixaFim)),
        }
      : { min: 0, max: 9999 };

  return {
    maisAtrasadas,
    maisFrequentes,
    parImparComum,
    somaFaixaComum,
    dezenasFaltantesCiclo: ciclos.atual?.dezenasFaltantes ?? [],
    duquesQuentes: duques.map((d) => d.dezenas),
    trincasQuentes: trincas.map((t) => t.dezenas),
    primosComuns: valoresMaisComuns(primosDistribuicao, 2),
    fibonacciComuns: valoresMaisComuns(fibonacciDistribuicao, 2),
    multiplos3Comuns: valoresMaisComuns(multiplos3Distribuicao, 2),
  };
}
