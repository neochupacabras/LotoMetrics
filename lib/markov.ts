import pool from "./db";
import { getFrequencia } from "./estatisticas";

export interface TransicaoDezena {
  dezena: number;
  percentualCondicional: number;
  percentualBase: number;
  diferenca: number;
}

export interface AnaliseTransicao {
  dezenaOrigem: number;
  totalTransicoes: number;
  transicoes: TransicaoDezena[];
  diferencaMediaAbsoluta: number;
}

export async function analisarTransicao(
  loteriaId: number,
  dezenaOrigem: number
): Promise<AnaliseTransicao> {
  const [{ rows: transRows }, { rows: totalRows }, frequenciaBase] = await Promise.all([
    pool.query(
      `SELECT dezena_destino, frequencia, percentual FROM fn_transicao_markov($1, $2) ORDER BY dezena_destino`,
      [loteriaId, dezenaOrigem]
    ),
    pool.query(`SELECT fn_total_transicoes($1, $2) AS total`, [loteriaId, dezenaOrigem]),
    getFrequencia(loteriaId),
  ]);

  const totalDezenasSorteadas = frequenciaBase.reduce((acc, f) => acc + f.frequencia, 0);
  const baseMap = new Map(
    frequenciaBase.map((f) => [f.dezena, (f.frequencia / totalDezenasSorteadas) * 100])
  );

  const transicoes: TransicaoDezena[] = transRows.map((r) => {
    const percentualBase = baseMap.get(r.dezena_destino) ?? 0;
    const percentualCondicional = Number(r.percentual);
    return {
      dezena: r.dezena_destino,
      percentualCondicional,
      percentualBase: Math.round(percentualBase * 100) / 100,
      diferenca: Math.round((percentualCondicional - percentualBase) * 100) / 100,
    };
  });

  const diferencaMediaAbsoluta =
    transicoes.length > 0
      ? Math.round(
          (transicoes.reduce((acc, t) => acc + Math.abs(t.diferenca), 0) / transicoes.length) * 100
        ) / 100
      : 0;

  return {
    dezenaOrigem,
    totalTransicoes: totalRows[0]?.total ?? 0,
    transicoes,
    diferencaMediaAbsoluta,
  };
}
