import {
  classificarJogo,
  compararComHistorico,
  ConfigGradeLoteria,
  ClassificacaoJogo,
  ComparacaoHistorico,
} from "./classificacao";
import {
  getParesImpares,
  getPrimosDistribuicao,
  getFibonacciDistribuicao,
  getMultiplos3Distribuicao,
  getSequencias,
  getMolduraCentro,
  getSoma,
} from "./estatisticas";

export interface AnaliseConcurso extends ClassificacaoJogo, ComparacaoHistorico {
  repetidas: number | null;
}

export async function analisarConcurso(
  loteriaId: number,
  dezenas: number[],
  dezenasAnterior: number[] | null,
  config: ConfigGradeLoteria
): Promise<AnaliseConcurso> {
  const classificacao = classificarJogo(dezenas, config);

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

  const comparacao = compararComHistorico(classificacao, {
    parImpar: paresImpares,
    primos: primosDist,
    fibonacci: fibonacciDist,
    multiplos3: mult3Dist,
    molduraCentro: molduraCentro.distribuicao,
    sequencia: sequencias.distribuicao,
    somaHistograma: soma.histograma,
  });

  const repetidas = dezenasAnterior
    ? dezenas.filter((d) => dezenasAnterior.includes(d)).length
    : null;

  return {
    ...classificacao,
    ...comparacao,
    repetidas,
  };
}
