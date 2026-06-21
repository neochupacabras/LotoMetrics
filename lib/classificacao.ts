// Classificação de um conjunto de dezenas segundo as mesmas categorias
// das tabelas estatísticas (primos, Fibonacci, múltiplos de 3, moldura/
// centro, linhas/colunas, sequências). Função pura, sem dependência de
// banco — reaproveitada pelo gerador de jogos, pela análise de concurso
// e pelo simulador.

export function ehPrimo(n: number): boolean {
  if (n < 2) return false;
  if (n === 2 || n === 3) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i * i <= n; i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

// Lista fixa em vez de teste matemático: evita problema de precisão de
// ponto flutuante, e o domínio é pequeno e conhecido (dezenas vão até 60
// no máximo, entre as duas loterias) — mesma lógica de
// estatisticas_fase4.sql.
const FIBONACCI_ATE_144 = new Set([1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144]);
export function ehFibonacci(n: number): boolean {
  return FIBONACCI_ATE_144.has(n);
}

export function ehMultiploDe3(n: number): boolean {
  return n % 3 === 0;
}

// ---------- Posição no volante (mesmas fórmulas de estatisticas_fase3.sql) ----------

export function linhaDaDezena(dezena: number, gridColunas: number): number {
  return Math.ceil(dezena / gridColunas);
}

export function colunaDaDezena(dezena: number, gridColunas: number): number {
  return ((dezena - 1) % gridColunas) + 1;
}

export function zonaDaDezena(
  dezena: number,
  dezenaMax: number,
  gridColunas: number
): "moldura" | "centro" {
  const linha = linhaDaDezena(dezena, gridColunas);
  const maxLinha = Math.ceil(dezenaMax / gridColunas);
  const coluna = colunaDaDezena(dezena, gridColunas);
  if (linha === 1 || linha === maxLinha || coluna === 1 || coluna === gridColunas) {
    return "moldura";
  }
  return "centro";
}

export function maiorSequenciaConsecutiva(dezenas: number[]): number {
  if (dezenas.length === 0) return 0;
  const ordenadas = [...dezenas].sort((a, b) => a - b);
  let maior = 1;
  let atual = 1;
  for (let i = 1; i < ordenadas.length; i++) {
    if (ordenadas[i] === ordenadas[i - 1] + 1) {
      atual++;
      maior = Math.max(maior, atual);
    } else {
      atual = 1;
    }
  }
  return maior;
}

// ---------- Classificação completa de um jogo ----------

export interface ConfigGradeLoteria {
  dezenaMax: number;
  gridColunas: number;
}

export interface ClassificacaoJogo {
  pares: number;
  impares: number;
  soma: number;
  primos: number;
  fibonacci: number;
  multiplos3: number;
  moldura: number;
  centro: number;
  maiorSequencia: number;
  porLinha: Record<number, number>;
  porColuna: Record<number, number>;
}

export function classificarJogo(
  dezenas: number[],
  config: ConfigGradeLoteria
): ClassificacaoJogo {
  const pares = dezenas.filter((d) => d % 2 === 0).length;
  const soma = dezenas.reduce((acc, d) => acc + d, 0);
  const primos = dezenas.filter(ehPrimo).length;
  const fibonacci = dezenas.filter(ehFibonacci).length;
  const multiplos3 = dezenas.filter(ehMultiploDe3).length;

  let moldura = 0;
  let centro = 0;
  const porLinha: Record<number, number> = {};
  const porColuna: Record<number, number> = {};

  for (const d of dezenas) {
    const zona = zonaDaDezena(d, config.dezenaMax, config.gridColunas);
    if (zona === "moldura") moldura++;
    else centro++;

    const linha = linhaDaDezena(d, config.gridColunas);
    const coluna = colunaDaDezena(d, config.gridColunas);
    porLinha[linha] = (porLinha[linha] ?? 0) + 1;
    porColuna[coluna] = (porColuna[coluna] ?? 0) + 1;
  }

  return {
    pares,
    impares: dezenas.length - pares,
    soma,
    primos,
    fibonacci,
    multiplos3,
    moldura,
    centro,
    maiorSequencia: maiorSequenciaConsecutiva(dezenas),
    porLinha,
    porColuna,
  };
}

// ---------- Comparação com o histórico ----------
// Função pura (sem banco) — recebe tabelas de distribuição já buscadas
// (no servidor, uma vez) e calcula os percentuais correspondentes pra
// uma classificação qualquer. Usada tanto na análise de um concurso já
// sorteado quanto no simulador, em que o usuário monta o jogo dezena por
// dezena e precisa de resposta instantânea, sem round-trip ao servidor
// a cada clique.

export interface TabelasComparacao {
  parImpar: { pares: number; percentual: number }[];
  primos: { quantidade: number; percentual: number }[];
  fibonacci: { quantidade: number; percentual: number }[];
  multiplos3: { quantidade: number; percentual: number }[];
  molduraCentro: { qtdMoldura: number; qtdCentro: number; percentual: number }[];
  sequencia: { maiorSequencia: number; percentual: number }[];
  somaHistograma: { faixaInicio: number; faixaFim: number; ocorrencias: number }[];
}

export interface ComparacaoHistorico {
  percentualParImpar: number | null;
  percentualSoma: number | null;
  percentualPrimos: number | null;
  percentualFibonacci: number | null;
  percentualMultiplos3: number | null;
  percentualMolduraCentro: number | null;
  percentualSequencia: number | null;
}

export function compararComHistorico(
  classificacao: ClassificacaoJogo,
  tabelas: TabelasComparacao
): ComparacaoHistorico {
  const percentualParImpar =
    tabelas.parImpar.find((p) => p.pares === classificacao.pares)?.percentual ?? null;

  const percentualPrimos =
    tabelas.primos.find((p) => p.quantidade === classificacao.primos)?.percentual ?? null;

  const percentualFibonacci =
    tabelas.fibonacci.find((p) => p.quantidade === classificacao.fibonacci)?.percentual ?? null;

  const percentualMultiplos3 =
    tabelas.multiplos3.find((p) => p.quantidade === classificacao.multiplos3)?.percentual ?? null;

  const percentualSequencia =
    tabelas.sequencia.find((s) => s.maiorSequencia === classificacao.maiorSequencia)
      ?.percentual ?? null;

  const percentualMolduraCentro =
    tabelas.molduraCentro.find(
      (d) => d.qtdMoldura === classificacao.moldura && d.qtdCentro === classificacao.centro
    )?.percentual ?? null;

  const totalSoma = tabelas.somaHistograma.reduce((acc, h) => acc + h.ocorrencias, 0);
  const faixaSoma = tabelas.somaHistograma.find(
    (h) => classificacao.soma >= h.faixaInicio && classificacao.soma <= h.faixaFim
  );
  const percentualSoma =
    faixaSoma && totalSoma > 0
      ? Math.round((faixaSoma.ocorrencias / totalSoma) * 1000) / 10
      : null;

  return {
    percentualParImpar,
    percentualSoma,
    percentualPrimos,
    percentualFibonacci,
    percentualMultiplos3,
    percentualMolduraCentro,
    percentualSequencia,
  };
}
