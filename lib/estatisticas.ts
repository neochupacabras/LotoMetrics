import pool from "./db";

// ---------- Frequência ----------
export interface FrequenciaDezena {
  dezena: number;
  frequencia: number;
}

export async function getFrequencia(loteriaId: number, ultimosN?: number): Promise<FrequenciaDezena[]> {
  const { rows } = await pool.query(
    `SELECT dezena, frequencia FROM fn_frequencia($1, $2) ORDER BY frequencia DESC, dezena`,
    [loteriaId, ultimosN ?? null]
  );
  return rows.map((r) => ({ dezena: r.dezena, frequencia: Number(r.frequencia) }));
}

// ---------- Atraso ----------
export interface AtrasoDezena {
  dezena: number;
  ultimoConcurso: number;
  atraso: number;
  maiorAtraso: number;
}

export async function getAtraso(loteriaId: number): Promise<AtrasoDezena[]> {
  const [{ rows: atrasoRows }, { rows: maiorRows }] = await Promise.all([
    pool.query(
      `SELECT dezena, ultimo_concurso, atraso FROM fn_atraso($1) ORDER BY atraso DESC, dezena`,
      [loteriaId]
    ),
    pool.query(`SELECT dezena, maior_atraso FROM fn_maior_atraso_historico($1)`, [loteriaId]),
  ]);
  const maiorPorDezena = new Map<number, number>(
    maiorRows.map((r) => [r.dezena, Number(r.maior_atraso)])
  );
  return atrasoRows.map((r) => ({
    dezena: r.dezena,
    ultimoConcurso: r.ultimo_concurso,
    atraso: r.atraso,
    maiorAtraso: maiorPorDezena.get(r.dezena) ?? 0,
  }));
}

// ---------- Ciclos ----------
export interface CicloHistorico {
  ciclo: number;
  concursoInicio: number;
  concursoFim: number;
  qtdConcursos: number;
}

export interface CicloAtual {
  concursoInicio: number;
  concursosNoCiclo: number;
  dezenasSorteadas: number[];
  dezenasFaltantes: number[];
}

export async function getCiclos(
  loteriaId: number
): Promise<{ atual: CicloAtual | null; historico: CicloHistorico[] }> {
  const [{ rows: atualRows }, { rows: historicoRows }] = await Promise.all([
    pool.query(
      `SELECT concurso_inicio, concursos_no_ciclo, dezenas_sorteadas, dezenas_faltantes FROM fn_ciclo_atual($1)`,
      [loteriaId]
    ),
    pool.query(
      `SELECT ciclo, concurso_inicio, concurso_fim, qtd_concursos FROM fn_ciclos_historico($1) ORDER BY ciclo DESC LIMIT 15`,
      [loteriaId]
    ),
  ]);
  const atual = atualRows[0]
    ? {
        concursoInicio: atualRows[0].concurso_inicio,
        concursosNoCiclo: atualRows[0].concursos_no_ciclo,
        dezenasSorteadas: atualRows[0].dezenas_sorteadas ?? [],
        dezenasFaltantes: atualRows[0].dezenas_faltantes ?? [],
      }
    : null;
  return {
    atual,
    historico: historicoRows.map((r) => ({
      ciclo: r.ciclo,
      concursoInicio: r.concurso_inicio,
      concursoFim: r.concurso_fim,
      qtdConcursos: r.qtd_concursos,
    })),
  };
}

// ---------- Sequências ----------
export interface DistribuicaoSequencia {
  maiorSequencia: number;
  ocorrencias: number;
  percentual: number;
}

export interface SequenciaConsecutivaDezena {
  dezena: number;
  maiorSequenciaConcursos: number;
}

export async function getSequencias(loteriaId: number): Promise<{
  distribuicao: DistribuicaoSequencia[];
  consecutivasPorDezena: SequenciaConsecutivaDezena[];
}> {
  const [{ rows: distRows }, { rows: consRows }] = await Promise.all([
    pool.query(
      `SELECT maior_sequencia, ocorrencias, percentual FROM fn_distribuicao_sequencias($1) ORDER BY ocorrencias DESC`,
      [loteriaId]
    ),
    pool.query(
      `SELECT dezena, maior_sequencia_concursos FROM fn_maior_sequencia_consecutiva_dezena($1) ORDER BY maior_sequencia_concursos DESC, dezena LIMIT 10`,
      [loteriaId]
    ),
  ]);
  return {
    distribuicao: distRows.map((r) => ({
      maiorSequencia: r.maior_sequencia,
      ocorrencias: Number(r.ocorrencias),
      percentual: Number(r.percentual),
    })),
    consecutivasPorDezena: consRows.map((r) => ({
      dezena: r.dezena,
      maiorSequenciaConcursos: r.maior_sequencia_concursos,
    })),
  };
}

// ---------- Pares e ímpares ----------
export interface DistribuicaoParImpar {
  pares: number;
  impares: number;
  ocorrencias: number;
  percentual: number;
}

export async function getParesImpares(loteriaId: number): Promise<DistribuicaoParImpar[]> {
  const { rows } = await pool.query(
    `SELECT pares, impares, ocorrencias, percentual FROM fn_distribuicao_par_impar($1) ORDER BY ocorrencias DESC`,
    [loteriaId]
  );
  return rows.map((r) => ({
    pares: r.pares,
    impares: r.impares,
    ocorrencias: Number(r.ocorrencias),
    percentual: Number(r.percentual),
  }));
}

// ---------- Categoria binária genérica (primos, fibonacci, múltiplos de 3) ----------
export interface FrequenciaCategoria {
  categoria: string;
  frequencia: number;
  percentual: number;
}

export interface DistribuicaoQuantidade {
  quantidade: number;
  ocorrencias: number;
  percentual: number;
}

async function getFrequenciaCategoria(
  funcao: string,
  loteriaId: number
): Promise<FrequenciaCategoria[]> {
  const { rows } = await pool.query(
    `SELECT categoria, frequencia, percentual FROM ${funcao}($1) ORDER BY frequencia DESC`,
    [loteriaId]
  );
  return rows.map((r) => ({
    categoria: r.categoria,
    frequencia: Number(r.frequencia),
    percentual: Number(r.percentual),
  }));
}

async function getDistribuicaoQuantidade(
  funcao: string,
  colunaQuantidade: string,
  loteriaId: number
): Promise<DistribuicaoQuantidade[]> {
  const { rows } = await pool.query(
    `SELECT ${colunaQuantidade} AS quantidade, ocorrencias, percentual FROM ${funcao}($1) ORDER BY ocorrencias DESC`,
    [loteriaId]
  );
  return rows.map((r) => ({
    quantidade: r.quantidade,
    ocorrencias: Number(r.ocorrencias),
    percentual: Number(r.percentual),
  }));
}

export const getPrimosFrequencia = (loteriaId: number) =>
  getFrequenciaCategoria("fn_primos_frequencia", loteriaId);
export const getPrimosDistribuicao = (loteriaId: number) =>
  getDistribuicaoQuantidade("fn_primos_distribuicao", "qtd_primos", loteriaId);

export const getFibonacciFrequencia = (loteriaId: number) =>
  getFrequenciaCategoria("fn_fibonacci_frequencia", loteriaId);
export const getFibonacciDistribuicao = (loteriaId: number) =>
  getDistribuicaoQuantidade("fn_fibonacci_distribuicao", "qtd_fibonacci", loteriaId);

export const getMultiplos3Frequencia = (loteriaId: number) =>
  getFrequenciaCategoria("fn_multiplos_3_frequencia", loteriaId);
export const getMultiplos3Distribuicao = (loteriaId: number) =>
  getDistribuicaoQuantidade("fn_multiplos_3_distribuicao", "qtd_multiplos", loteriaId);

// ---------- Soma ----------
export interface EstatisticasSoma {
  minimo: number;
  maximo: number;
  media: number;
  mediana: number;
}

export interface HistogramaSoma {
  faixaInicio: number;
  faixaFim: number;
  ocorrencias: number;
}

export async function getSoma(
  loteriaId: number
): Promise<{ estatisticas: EstatisticasSoma | null; histograma: HistogramaSoma[] }> {
  const [{ rows: estRows }, { rows: histRows }] = await Promise.all([
    pool.query(`SELECT minimo, maximo, media, mediana FROM fn_estatisticas_soma($1)`, [loteriaId]),
    pool.query(
      `SELECT faixa_inicio, faixa_fim, ocorrencias FROM fn_histograma_soma($1, 10) ORDER BY faixa_inicio`,
      [loteriaId]
    ),
  ]);
  const estatisticas = estRows[0]
    ? {
        minimo: Number(estRows[0].minimo),
        maximo: Number(estRows[0].maximo),
        media: Number(estRows[0].media),
        mediana: Number(estRows[0].mediana),
      }
    : null;
  return {
    estatisticas,
    histograma: histRows.map((r) => ({
      faixaInicio: Number(r.faixa_inicio),
      faixaFim: Number(r.faixa_fim),
      ocorrencias: Number(r.ocorrencias),
    })),
  };
}

// ---------- Repetidas do concurso anterior ----------
export async function getRepetidas(loteriaId: number): Promise<DistribuicaoQuantidade[]> {
  return getDistribuicaoQuantidade("fn_distribuicao_repetidas", "qtd_repetidas", loteriaId);
}

// ---------- Moldura e centro ----------
export interface DistribuicaoMolduraCentro {
  qtdMoldura: number;
  qtdCentro: number;
  ocorrencias: number;
  percentual: number;
}

export async function getMolduraCentro(loteriaId: number): Promise<{
  frequencia: FrequenciaCategoria[];
  distribuicao: DistribuicaoMolduraCentro[];
}> {
  const [{ rows: freqRows }, { rows: distRows }] = await Promise.all([
    pool.query(
      `SELECT zona AS categoria, frequencia, percentual FROM fn_moldura_centro_frequencia($1) ORDER BY frequencia DESC`,
      [loteriaId]
    ),
    pool.query(
      `SELECT qtd_moldura, qtd_centro, ocorrencias, percentual FROM fn_distribuicao_moldura_centro($1) ORDER BY ocorrencias DESC`,
      [loteriaId]
    ),
  ]);
  return {
    frequencia: freqRows.map((r) => ({
      categoria: r.categoria,
      frequencia: Number(r.frequencia),
      percentual: Number(r.percentual),
    })),
    distribuicao: distRows.map((r) => ({
      qtdMoldura: r.qtd_moldura,
      qtdCentro: r.qtd_centro,
      ocorrencias: Number(r.ocorrencias),
      percentual: Number(r.percentual),
    })),
  };
}

// ---------- Linhas e colunas ----------
export interface FrequenciaPosicao {
  posicao: number;
  frequencia: number;
}

export async function getLinhasColunas(
  loteriaId: number
): Promise<{ linhas: FrequenciaPosicao[]; colunas: FrequenciaPosicao[] }> {
  const [{ rows: linhaRows }, { rows: colunaRows }] = await Promise.all([
    pool.query(`SELECT linha AS posicao, frequencia FROM fn_frequencia_por_linha($1) ORDER BY linha`, [
      loteriaId,
    ]),
    pool.query(`SELECT coluna AS posicao, frequencia FROM fn_frequencia_por_coluna($1) ORDER BY coluna`, [
      loteriaId,
    ]),
  ]);
  return {
    linhas: linhaRows.map((r) => ({ posicao: r.posicao, frequencia: Number(r.frequencia) })),
    colunas: colunaRows.map((r) => ({ posicao: r.posicao, frequencia: Number(r.frequencia) })),
  };
}

// ---------- Duques e trincas ----------
export interface DuqueOuTrinca {
  dezenas: number[];
  ocorrencias: number;
}

export async function getDuques(loteriaId: number, top = 20): Promise<DuqueOuTrinca[]> {
  const { rows } = await pool.query(
    `SELECT dezena_1, dezena_2, ocorrencias FROM fn_duques_mais_frequentes($1, $2)`,
    [loteriaId, top]
  );
  return rows.map((r) => ({ dezenas: [r.dezena_1, r.dezena_2], ocorrencias: Number(r.ocorrencias) }));
}

export async function getTrincas(loteriaId: number, top = 20): Promise<DuqueOuTrinca[]> {
  const { rows } = await pool.query(
    `SELECT dezena_1, dezena_2, dezena_3, ocorrencias FROM fn_trincas_mais_frequentes($1, $2)`,
    [loteriaId, top]
  );
  return rows.map((r) => ({
    dezenas: [r.dezena_1, r.dezena_2, r.dezena_3],
    ocorrencias: Number(r.ocorrencias),
  }));
}
