import { TabelasComparacao } from "./classificacao";
import {
  getParesImpares,
  getPrimosDistribuicao,
  getFibonacciDistribuicao,
  getMultiplos3Distribuicao,
  getSequencias,
  getMolduraCentro,
  getSoma,
} from "./estatisticas";

export interface DadosSimulador extends TabelasComparacao {
  somaEstatisticas: { minimo: number; maximo: number; media: number; mediana: number } | null;
}

export async function prepararDadosSimulador(loteriaId: number): Promise<DadosSimulador> {
  const [paresImpares, primosDist, fibonacciDist, mult3Dist, sequencias, molduraCentro, soma] =
    await Promise.all([
      getParesImpares(loteriaId),
      getPrimosDistribuicao(loteriaId),
      getFibonacciDistribuicao(loteriaId),
      getMultiplos3Distribuicao(loteriaId),
      getSequencias(loteriaId),
      getMolduraCentro(loteriaId),
      getSoma(loteriaId),
    ]);

  return {
    parImpar: paresImpares,
    primos: primosDist,
    fibonacci: fibonacciDist,
    multiplos3: mult3Dist,
    molduraCentro: molduraCentro.distribuicao,
    sequencia: sequencias.distribuicao,
    somaHistograma: soma.histograma,
    somaEstatisticas: soma.estatisticas,
  };
}
