import { unstable_cache } from "next/cache";
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

// As 7 distribuições abaixo dependem só da loteria (loteriaId) — o resultado é
// IDÊNTICO para qualquer concurso daquela loteria, já que agregam o histórico
// inteiro, não um concurso específico. Sem esse cache, cada uma das milhares de
// páginas /[loteria]/resultados/[numero] recalculava tudo do zero, mesmo que o
// resultado fosse sempre o mesmo — foi isso que sobrecarregou o pool de conexões
// do Supabase durante o rastreamento do Googlebot e gerou os erros 5xx reportados
// no Search Console. Com unstable_cache, essas 7 queries rodam no máximo 1x por
// dia por loteria (9 loterias = 9 execuções/dia), e todas as páginas de concurso
// daquela loteria compartilham o mesmo resultado em cache.
const getDistribuicoesCacheadas = unstable_cache(
  async (loteriaId: number) => {
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
    return { paresImpares, primosDist, fibonacciDist, mult3Dist, sequencias, molduraCentro, soma };
  },
  ["distribuicoes-por-loteria"],
  { revalidate: 86400 } // 24 horas
);

export async function analisarConcurso(
  loteriaId: number,
  dezenas: number[],
  dezenasAnterior: number[] | null,
  config: ConfigGradeLoteria
): Promise<AnaliseConcurso> {
  const classificacao = classificarJogo(dezenas, config);

  const { paresImpares, primosDist, fibonacciDist, mult3Dist, sequencias, molduraCentro, soma } =
    await getDistribuicoesCacheadas(loteriaId);

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
