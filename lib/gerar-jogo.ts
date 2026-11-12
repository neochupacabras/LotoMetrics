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
  // Filtros que o jogo devolvido não cumpre (vazio quando atendeu todos).
  filtrosNaoAtendidos?: string[];
  trevos?: number[]; // +Milionária: 2 trevos de 1 a 6, sorteados à parte das dezenas
}

function contar(dezenas: number[], teste: (n: number) => boolean): number {
  return dezenas.filter(teste).length;
}

export function gerarJogo(params: ParametrosGeracao): ResultadoGeracao {
  const {
    dezenaMin,
    dezenaMax,
    qtdDezenas,
    dezenasExcluidas = [],
    somaFaixa,
    parImparAlvo,
    primosAlvo,
    fibonacciAlvo,
    multiplos3Alvo,
    maxTentativas = 500,
  } = params;

  // Obrigatórias repetidas viravam jogo com dezenas a menos (LF-26).
  const dezenasObrigatorias = Array.from(new Set(params.dezenasObrigatorias ?? []));
  // Uma dezena não pode ser obrigatória e excluída ao mesmo tempo — antes ela
  // entrava no jogo marcado como "atendeu todos os filtros" (LF-25).
  const conflito = dezenasObrigatorias.filter((d) => dezenasExcluidas.includes(d));
  if (conflito.length > 0) {
    throw new Error(
      `A dezena ${conflito.join(", ")} está ao mesmo tempo entre as obrigatórias e as excluídas.`
    );
  }

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

  // Sem combinação que atenda tudo, devolve a tentativa que atendeu mais
  // filtros, dizendo quais faltaram (antes: a 1ª tentativa, qualquer que
  // fosse — LF-26).
  let melhorTentativa: number[] | null = null;
  let melhorFalhas: string[] = [];

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

    const falhas: string[] = [];
    if (!passaSoma) falhas.push("soma");
    if (!passaParImpar) falhas.push("pares e ímpares");
    if (!passaPrimos) falhas.push("primos");
    if (!passaFibonacci) falhas.push("Fibonacci");
    if (!passaMultiplos3) falhas.push("múltiplos de 3");

    if (falhas.length === 0) {
      return {
        dezenas: candidato,
        soma,
        pares,
        impares: candidato.length - pares,
        atendeuTodosFiltros: true,
        filtrosNaoAtendidos: [],
      };
    }

    if (!melhorTentativa || falhas.length < melhorFalhas.length) {
      melhorTentativa = candidato;
      melhorFalhas = falhas;
    }
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
    filtrosNaoAtendidos: melhorFalhas,
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
// atrasadas (em vez de forçar sempre as mesmas). `excluir` tira do pool as
// dezenas que o jogo não pode ter (ex.: as mais frequentes excluídas no
// mesmo preset), evitando o conflito de LF-25.
export function amostrarSubconjunto(pool: number[], qtd: number, excluir: number[] = []): number[] {
  const disponiveis = Array.from(new Set(pool)).filter((d) => !excluir.includes(d));
  return amostrarAleatorio(disponiveis, Math.min(qtd, disponiveis.length));
}

// PRNG determinístico (mulberry32) — mesma seed sempre produz a mesma
// sequência. Usado pelo "jogo da data especial": a mesma data sempre gera
// o mesmo jogo, em vez de um resultado novo a cada clique.
function criarGeradorComSeed(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Super Sete: 7 colunas independentes, dígito de 0 a 9 cada, repetição
// livre entre colunas — não "escolha 7 dezenas distintas de um universo",
// que é o que gerarJogo() faz pras outras 8 loterias.
export function gerarJogoSuperSete(): number[] {
  return Array.from({ length: 7 }, () => Math.floor(Math.random() * 10));
}

export interface JogoDaData {
  dezenas: number[];
  trevos?: number[]; // +Milionária
}

// Gera um jogo "de mentirinha personalizado" a partir de uma data —
// determinístico (a mesma data sempre dá o mesmo jogo), mas isso não muda
// a probabilidade real de nada: é só uma forma memorável de escolher
// números, equivalente a jogar qualquer outra combinação.
export function gerarJogoDaData(
  data: Date,
  dezenaMin: number,
  dezenaMax: number,
  qtdDezenas: number,
  qtdTrevos?: number
): JogoDaData {
  const seed = data.getFullYear() * 10000 + (data.getMonth() + 1) * 100 + data.getDate();
  const rand = criarGeradorComSeed(seed);

  function embaralharEPegar(min: number, max: number, qtd: number): number[] {
    const pool = Array.from({ length: max - min + 1 }, (_, i) => min + i);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, qtd).sort((a, b) => a - b);
  }

  const dezenas = embaralharEPegar(dezenaMin, dezenaMax, qtdDezenas);
  const trevos = qtdTrevos ? embaralharEPegar(1, 6, qtdTrevos) : undefined;

  return { dezenas, trevos };
}
