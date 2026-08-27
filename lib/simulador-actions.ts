"use server";

import { getLoteriaPorCodigo, getDrawsParaSimulacao, getMapaFaixasPorAcertos, ConcessaoSimulacao } from "@/lib/queries";
import { isCodigoLoteriaValido } from "@/lib/format";
import { PARAMS_LOTERIA, FAIXAS_MILIONARIA, FAIXAS_DUPLASENA_POR_SORTEIO } from "@/lib/probabilidades";
import { contarColunasAcertadas } from "@/lib/classificacao";

export interface ResultadoSimulacao {
  nomeLoteria: string;
  totalConcursos: number;
  precoAposta: number;
  totalGasto: number;
  totalGanho: number;
  saldoFinal: number;
  retornoPct: number;
  // Drawdown: pior sequência sem prêmio
  drawdown: {
    maiorSeca: number;
    maiorDrawdown: number;
    concursoInicioSeca: number | null;
    concursoFimSeca: number | null;
  };
  porFaixa: {
    faixa: number;
    descricao: string;
    qtd: number;
    ganhoTotal: number;
  }[];
  melhores: {
    numero: number;
    acertos: number;
    premio: number;
  }[];
  grafico: { numero: number; saldo: number }[];
}

// ── Pontuação de um concurso contra um jogo ────────────────────────────────────
// Isolado numa função pura pra não duplicar essa lógica entre simularHistorico
// e compararJogos (foi exatamente essa duplicação, com a tabela de faixas
// incompleta, que deixou a ferramenta quebrada pra 7 das 9 loterias).

interface Pontuacao {
  faixa: number;
  premio: number;
  acertosExibicao: number; // valor mostrado na UI (acertos de dezenas)
  descricao: string;
}

// `jogo` é sempre o array original (não um Set): a Super Sete precisa da
// ordem (índice = coluna), então converter cedo demais pra Set perderia
// exatamente a informação que decide o acerto.
//
// Retorna uma lista (não um valor único) porque a Dupla Sena confere o
// MESMO jogo duas vezes por concurso — 1º e 2º sorteio, cada um podendo
// bater uma faixa premiada de forma independente. Pra todas as outras
// loterias a lista tem no máximo 1 item.
function pontuarDraw(
  draw: ConcessaoSimulacao,
  jogo: number[],
  contexto:
    | { tipo: "padrao"; mapaFaixas: Record<number, number> }
    | { tipo: "milionaria"; trevosSet: Set<number> }
    | { tipo: "supersete"; mapaFaixas: Record<number, number> }
    | { tipo: "duplasena" }
): Pontuacao[] {
  if (contexto.tipo === "supersete") {
    const acertos = contarColunasAcertadas(jogo, draw.dezenas);
    const faixa = contexto.mapaFaixas[acertos];
    const premio = faixa !== undefined ? (draw.premios[faixa] ?? 0) : 0;
    return premio > 0
      ? [{ faixa, premio, acertosExibicao: acertos, descricao: `${acertos} colunas certas` }]
      : [];
  }

  if (contexto.tipo === "duplasena") {
    const jogoSet = new Set(jogo);
    const acertos1 = draw.dezenas.filter((d) => jogoSet.has(d)).length;
    const acertos2 = (draw.dezenasSegundoSorteio ?? []).filter((d) => jogoSet.has(d)).length;
    const hits: Pontuacao[] = [];
    const faixa1 = FAIXAS_DUPLASENA_POR_SORTEIO[1][acertos1];
    if (faixa1 !== undefined) {
      const premio = draw.premios[faixa1] ?? 0;
      if (premio > 0) {
        hits.push({ faixa: faixa1, premio, acertosExibicao: acertos1, descricao: `${acertos1} acertos (1º sorteio)` });
      }
    }
    const faixa2 = FAIXAS_DUPLASENA_POR_SORTEIO[2][acertos2];
    if (faixa2 !== undefined) {
      const premio = draw.premios[faixa2] ?? 0;
      if (premio > 0) {
        hits.push({ faixa: faixa2, premio, acertosExibicao: acertos2, descricao: `${acertos2} acertos (2º sorteio)` });
      }
    }
    return hits;
  }

  const dezenasSet = new Set(jogo);
  const acertos = draw.dezenas.filter((d) => dezenasSet.has(d)).length;

  if (contexto.tipo === "milionaria") {
    const acertosTrevos = (draw.trevos ?? []).filter((t) => contexto.trevosSet.has(t)).length;
    const faixa = FAIXAS_MILIONARIA[`${acertos},${acertosTrevos}`];
    const premio = faixa !== undefined ? (draw.premios[faixa] ?? 0) : 0;
    return premio > 0
      ? [{
          faixa,
          premio,
          acertosExibicao: acertos,
          descricao: `${acertos} acertos + ${acertosTrevos} trevo${acertosTrevos !== 1 ? "s" : ""}`,
        }]
      : [];
  }

  const faixa = contexto.mapaFaixas[acertos];
  const premio = faixa !== undefined ? (draw.premios[faixa] ?? 0) : 0;
  return premio > 0 ? [{ faixa, premio, acertosExibicao: acertos, descricao: `${acertos} acertos` }] : [];
}

function precoAposta(codigoLoteria: string): number {
  const params = (PARAMS_LOTERIA as Record<string, { precoAposta: number }>)[codigoLoteria];
  return params?.precoAposta ?? 3.5;
}

async function contextoPontuacao(
  codigoLoteria: string,
  loteriaId: number,
  trevos?: number[]
): Promise<
  | { erro: string }
  | { tipo: "padrao"; mapaFaixas: Record<number, number> }
  | { tipo: "milionaria"; trevosSet: Set<number> }
  | { tipo: "supersete"; mapaFaixas: Record<number, number> }
  | { tipo: "duplasena" }
> {
  if (codigoLoteria === "maismilionaria") {
    if (!trevos || trevos.length !== 2) return { erro: "Selecione exatamente 2 trevos." };
    return { tipo: "milionaria", trevosSet: new Set(trevos) };
  }
  if (codigoLoteria === "supersete") {
    return { tipo: "supersete", mapaFaixas: await getMapaFaixasPorAcertos(loteriaId) };
  }
  // Dupla Sena: as faixas por acertos não são únicas (1º e 2º sorteio
  // compartilham a mesma descrição — "6 acertos" etc.), então o mapa
  // derivado do texto real (getMapaFaixasPorAcertos) não serve aqui. Usa
  // o mapeamento fixo de índice de faixa da Caixa (FAIXAS_DUPLASENA_POR_SORTEIO).
  if (codigoLoteria === "duplasena") {
    return { tipo: "duplasena" };
  }
  return { tipo: "padrao", mapaFaixas: await getMapaFaixasPorAcertos(loteriaId) };
}

export async function simularHistorico(
  codigoLoteria: string,
  dezenas: number[],
  limiteHistorico?: number, // undefined = histórico completo (premium)
  trevos?: number[] // +Milionária
): Promise<ResultadoSimulacao | { erro: string }> {
  if (!isCodigoLoteriaValido(codigoLoteria))
    return { erro: "Loteria inválida" };

  const loteria = await getLoteriaPorCodigo(codigoLoteria);
  if (!loteria) return { erro: "Loteria não encontrada" };

  if (dezenas.length !== loteria.qtdDezenasSorteadas)
    return { erro: `Selecione exatamente ${loteria.qtdDezenasSorteadas} dezenas` };

  const contexto = await contextoPontuacao(codigoLoteria, loteria.id, trevos);
  if ("erro" in contexto) return contexto;

  const todosDraws = await getDrawsParaSimulacao(loteria.id);
  // Aplica limite: free usa últimos N concursos, premium usa todos
  const draws = limiteHistorico ? todosDraws.slice(-limiteHistorico) : todosDraws;
  const preco = precoAposta(codigoLoteria);

  let saldoCumulativo = 0;
  const porFaixaMap = new Map<number, { descricao: string; qtd: number; ganhoTotal: number }>();
  const melhores: { numero: number; acertos: number; premio: number }[] = [];
  const grafico: { numero: number; saldo: number }[] = [];

  // Drawdown tracking
  let secaAtual = 0;
  let maiorSeca = 0;
  let inicioSecaAtual = 0;
  let inicioMaiorSeca: number | null = null;
  let fimMaiorSeca: number | null = null;
  let picoSaldo = 0;
  let maiorDrawdown = 0;
  let totalGanho = 0;

  for (const draw of draws) {
    saldoCumulativo -= preco;

    const hits = pontuarDraw(draw, dezenas, contexto);

    for (const { faixa, premio, acertosExibicao, descricao } of hits) {
      saldoCumulativo += premio;
      totalGanho += premio;
      const entry = porFaixaMap.get(faixa) ?? { descricao, qtd: 0, ganhoTotal: 0 };
      entry.qtd++;
      entry.ganhoTotal += premio;
      porFaixaMap.set(faixa, entry);
      melhores.push({ numero: draw.numero, acertos: acertosExibicao, premio });
    }

    // Drawdown: rastrear seca (concursos sem prêmio)
    if (hits.length === 0) {
      secaAtual++;
      if (secaAtual === 1) inicioSecaAtual = draw.numero;
      if (secaAtual > maiorSeca) {
        maiorSeca = secaAtual;
        inicioMaiorSeca = inicioSecaAtual;
        fimMaiorSeca = draw.numero;
      }
    } else {
      secaAtual = 0;
    }

    // Drawdown: maior queda do pico
    if (saldoCumulativo > picoSaldo) picoSaldo = saldoCumulativo;
    const quedaAtual = saldoCumulativo - picoSaldo;
    if (quedaAtual < maiorDrawdown) maiorDrawdown = quedaAtual;

    grafico.push({ numero: draw.numero, saldo: Math.round(saldoCumulativo * 100) / 100 });
  }

  const totalGasto = draws.length * preco;

  const porFaixa = Array.from(porFaixaMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([faixa, { descricao, qtd, ganhoTotal }]) => ({ faixa, descricao, qtd, ganhoTotal }));

  const melhoresOrdenados = melhores
    .sort((a, b) => b.premio - a.premio || b.acertos - a.acertos)
    .slice(0, 5);

  return {
    nomeLoteria: loteria.nome,
    totalConcursos: draws.length,
    precoAposta: preco,
    totalGasto,
    totalGanho,
    saldoFinal: saldoCumulativo,
    retornoPct: totalGasto > 0 ? (totalGanho / totalGasto) * 100 : 0,
    drawdown: {
      maiorSeca,
      maiorDrawdown: Math.round(maiorDrawdown * 100) / 100,
      concursoInicioSeca: inicioMaiorSeca,
      concursoFimSeca: fimMaiorSeca,
    },
    porFaixa,
    melhores: melhoresOrdenados,
    grafico,
  };
}

// ── Comparador: simula dois jogos em paralelo ─────────────────────────────────
export interface ResultadoComparacao {
  jogoA: ResultadoSimulacao & { dezenas: number[] };
  jogoB: ResultadoSimulacao & { dezenas: number[] };
  graficoComparado: { numero: number; saldoA: number; saldoB: number }[];
}

export async function compararJogos(
  codigoLoteria: string,
  dezenasA: number[],
  dezenasB: number[],
  limiteHistorico?: number,
  trevosA?: number[],
  trevosB?: number[]
): Promise<ResultadoComparacao | { erro: string }> {
  if (!isCodigoLoteriaValido(codigoLoteria))
    return { erro: "Loteria inválida" };

  const loteria = await getLoteriaPorCodigo(codigoLoteria);
  if (!loteria) return { erro: "Loteria não encontrada" };

  const n = loteria.qtdDezenasSorteadas;
  if (dezenasA.length !== n || dezenasB.length !== n)
    return { erro: `Cada jogo precisa ter exatamente ${n} dezenas` };

  const contextoA = await contextoPontuacao(codigoLoteria, loteria.id, trevosA);
  if ("erro" in contextoA) return contextoA;
  const contextoB = await contextoPontuacao(codigoLoteria, loteria.id, trevosB);
  if ("erro" in contextoB) return contextoB;

  const todosDraws = await getDrawsParaSimulacao(loteria.id);
  const draws = limiteHistorico ? todosDraws.slice(-limiteHistorico) : todosDraws;

  const preco = precoAposta(codigoLoteria);

  let saldoA = 0, saldoB = 0;
  let ganhoA = 0, ganhoB = 0;
  const faixaMapA = new Map<number, { descricao: string; qtd: number; ganhoTotal: number }>();
  const faixaMapB = new Map<number, { descricao: string; qtd: number; ganhoTotal: number }>();
  const melhoresA: { numero: number; acertos: number; premio: number }[] = [];
  const melhoresB: { numero: number; acertos: number; premio: number }[] = [];
  const graficoComparado: { numero: number; saldoA: number; saldoB: number }[] = [];

  for (const draw of draws) {
    saldoA -= preco;
    saldoB -= preco;

    for (const pA of pontuarDraw(draw, dezenasA, contextoA)) {
      saldoA += pA.premio; ganhoA += pA.premio;
      const entry = faixaMapA.get(pA.faixa) ?? { descricao: pA.descricao, qtd: 0, ganhoTotal: 0 };
      entry.qtd++; entry.ganhoTotal += pA.premio;
      faixaMapA.set(pA.faixa, entry);
      melhoresA.push({ numero: draw.numero, acertos: pA.acertosExibicao, premio: pA.premio });
    }

    for (const pB of pontuarDraw(draw, dezenasB, contextoB)) {
      saldoB += pB.premio; ganhoB += pB.premio;
      const entry = faixaMapB.get(pB.faixa) ?? { descricao: pB.descricao, qtd: 0, ganhoTotal: 0 };
      entry.qtd++; entry.ganhoTotal += pB.premio;
      faixaMapB.set(pB.faixa, entry);
      melhoresB.push({ numero: draw.numero, acertos: pB.acertosExibicao, premio: pB.premio });
    }

    graficoComparado.push({
      numero: draw.numero,
      saldoA: Math.round(saldoA * 100) / 100,
      saldoB: Math.round(saldoB * 100) / 100,
    });
  }

  const totalGasto = draws.length * preco;

  function montarResultado(
    dezenas: number[],
    ganho: number,
    saldoFinal: number,
    faixaMap: Map<number, { descricao: string; qtd: number; ganhoTotal: number }>,
    melhores: { numero: number; acertos: number; premio: number }[]
  ): ResultadoSimulacao & { dezenas: number[] } {
    return {
      dezenas,
      nomeLoteria: loteria!.nome,
      totalConcursos: draws.length,
      precoAposta: preco,
      totalGasto,
      totalGanho: ganho,
      saldoFinal,
      retornoPct: totalGasto > 0 ? (ganho / totalGasto) * 100 : 0,
      porFaixa: Array.from(faixaMap.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([faixa, { descricao, qtd, ganhoTotal }]) => ({ faixa, descricao, qtd, ganhoTotal })),
      melhores: melhores.sort((a, b) => b.premio - a.premio).slice(0, 5),
      grafico: [],
      // O comparador não calcula drawdown individual — campo vazio
      drawdown: {
        maiorSeca: 0,
        maiorDrawdown: 0,
        concursoInicioSeca: null,
        concursoFimSeca: null,
      },
    };
  }

  return {
    jogoA: montarResultado(dezenasA, ganhoA, saldoA, faixaMapA, melhoresA),
    jogoB: montarResultado(dezenasB, ganhoB, saldoB, faixaMapB, melhoresB),
    graficoComparado,
  };
}
