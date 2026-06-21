// Algoritmo de geração de combinações. Função pura — não depende de
// React nem do banco — para ser fácil de testar isoladamente.

import { ehPrimo, ehFibonacci, ehMultiploDe3 } from "./classificacao";

export interface ParametrosGeracao {
  dezenaMin: number;
  dezenaMax: number;
  qtdDezenas: number;
  dezenasObrigatorias?: number[];
  dezenasExcluidas?: number[];
  somaFaixa?: { min: number; max: number };
  parImparAlvo?: { pares: number; impares: number };
  primosAlvo?: number[];
  fibonacciAlvo?: number[];
  multiplos3Alvo?: number[];
  maxTentativas?: number;
}

export interface ResultadoGeracao {
  dezenas: number[];
  soma: number;
  pares: number;
  impares: number;
  atendeuTodosFiltros: boolean;
}

function contar(dezenas: number[], teste: (n: number) => boolean): number {
  return dezenas.filter(teste).length;
}

export function gerarJogo(params: ParametrosGeracao): ResultadoGeracao {
  const {
    dezenaMin,
    dezenaMax,
    qtdDezenas,
    dezenasObrigatorias = [],
    dezenasExcluidas = [],
    somaFaixa,
    parImparAlvo,
    primosAlvo,
    fibonacciAlvo,
    multiplos3Alvo,
    maxTentativas = 500,
  } = params;

  if (qtdDezenas < dezenasObrigatorias.length) {
    throw new Error("Número de dezenas obrigatórias maior que o tamanho do jogo.");
  }

  const poolBase: number[] = [];
  for (let n = dezenaMin; n <= dezenaMax; n++) {
    if (!dezenasObrigatorias.includes(n) && !dezenasExcluidas.includes(n)) {
      poolBase.push(n);
    }
  }

  const qtdRestante = qtdDezenas - dezenasObrigatorias.length;
  if (qtdRestante > poolBase.length) {
    throw new Error("Não há dezenas suficientes disponíveis após as exclusões.");
  }

  let melhorTentativa: number[] | null = null;

  for (let tentativa = 0; tentativa < maxTentativas; tentativa++) {
    const candidato = [...dezenasObrigatorias, ...amostrarAleatorio(poolBase, qtdRestante)].sort(
      (a, b) => a - b
    );

    const soma = candidato.reduce((acc, d) => acc + d, 0);
    const pares = candidato.filter((d) => d % 2 === 0).length;

    const passaSoma = !somaFaixa || (soma >= somaFaixa.min && soma <= somaFaixa.max);
    const passaParImpar = !parImparAlvo || pares === parImparAlvo.pares;
    const passaPrimos = !primosAlvo || primosAlvo.includes(contar(candidato, ehPrimo));
    const passaFibonacci =
      !fibonacciAlvo || fibonacciAlvo.includes(contar(candidato, ehFibonacci));
    const passaMultiplos3 =
      !multiplos3Alvo || multiplos3Alvo.includes(contar(candidato, ehMultiploDe3));

    if (passaSoma && passaParImpar && passaPrimos && passaFibonacci && passaMultiplos3) {
      return {
        dezenas: candidato,
        soma,
        pares,
        impares: candidato.length - pares,
        atendeuTodosFiltros: true,
      };
    }

    if (!melhorTentativa) melhorTentativa = candidato;
  }

  const dezenas = melhorTentativa as number[];
  const soma = dezenas.reduce((acc, d) => acc + d, 0);
  const pares = dezenas.filter((d) => d % 2 === 0).length;
  return {
    dezenas,
    soma,
    pares,
    impares: dezenas.length - pares,
    atendeuTodosFiltros: false,
  };
}

function amostrarAleatorio(pool: number[], qtd: number): number[] {
  const copia = [...pool];
  const resultado: number[] = [];
  for (let i = 0; i < qtd; i++) {
    const idx = Math.floor(Math.random() * copia.length);
    resultado.push(copia[idx]);
    copia.splice(idx, 1);
  }
  return resultado;
}

// Sorteia `qtd` dezenas distintas de dentro de um pool maior — usado para
// escolher, a cada jogo gerado, um subconjunto diferente das dezenas mais
// atrasadas (em vez de forçar sempre as mesmas).
export function amostrarSubconjunto(pool: number[], qtd: number): number[] {
  return amostrarAleatorio(pool, Math.min(qtd, pool.length));
}
