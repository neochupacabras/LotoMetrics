"use server";

import { getLoteriaPorCodigo, getDrawsParaSimulacao } from "@/lib/queries";
import { isCodigoLoteriaValido } from "@/lib/format";

// Mapeamento acertos → faixa para cada loteria
const MAPA_FAIXAS: Record<string, Record<number, number>> = {
  lotofacil: { 15: 1, 14: 2, 13: 3, 12: 4, 11: 5 },
  megasena:  { 6: 1,  5: 2,  4: 3 },
};

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
    acertos: number;
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

// Preços por aposta (vigência: agosto 2025)
const PRECO_APOSTA: Record<string, number> = {
  lotofacil: 3.50,
  megasena:  6.00,
};

export async function simularHistorico(
  codigoLoteria: string,
  dezenas: number[],
  limiteHistorico?: number  // undefined = histórico completo (premium)
): Promise<ResultadoSimulacao | { erro: string }> {
  if (!isCodigoLoteriaValido(codigoLoteria))
    return { erro: "Loteria inválida" };

  const loteria = await getLoteriaPorCodigo(codigoLoteria);
  if (!loteria) return { erro: "Loteria não encontrada" };

  if (dezenas.length !== loteria.qtdDezenasSorteadas)
    return { erro: `Selecione exatamente ${loteria.qtdDezenasSorteadas} dezenas` };

  const todosDraws = await getDrawsParaSimulacao(loteria.id);
  // Aplica limite: free usa últimos N concursos, premium usa todos
  const draws = limiteHistorico ? todosDraws.slice(-limiteHistorico) : todosDraws;
  const dezenasSet = new Set(dezenas);
  const mapaFaixas = MAPA_FAIXAS[codigoLoteria] ?? {};
  const minAcertos = Math.min(...Object.keys(mapaFaixas).map(Number));
  const preco = PRECO_APOSTA[codigoLoteria] ?? 3.50;

  let saldoCumulativo = 0;
  const porFaixaMap = new Map<number, { qtd: number; ganhoTotal: number }>();
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

  for (const acertos of Object.keys(mapaFaixas).map(Number)) {
    porFaixaMap.set(acertos, { qtd: 0, ganhoTotal: 0 });
  }

  let totalGanho = 0;

  for (const draw of draws) {
    saldoCumulativo -= preco;

    // Contar acertos
    const acertos = draw.dezenas.filter((d) => dezenasSet.has(d)).length;

    if (acertos >= minAcertos) {
      const faixa = mapaFaixas[acertos];
      if (faixa !== undefined) {
        const premio = draw.premios[faixa] ?? 0;
        if (premio > 0) {
          saldoCumulativo += premio;
          totalGanho += premio;
          const entry = porFaixaMap.get(acertos)!;
          entry.qtd++;
          entry.ganhoTotal += premio;
          melhores.push({ numero: draw.numero, acertos, premio });
        }
      }
    }

    // Drawdown: rastrear seca (concursos sem prêmio)
    const temPremio = acertos >= minAcertos && (mapaFaixas[acertos] !== undefined) &&
      ((draw.premios[mapaFaixas[acertos]] ?? 0) > 0);
    if (!temPremio) {
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

  const descricoesFaixas: Record<string, Record<number, string>> = {
    lotofacil: { 15: "15 acertos", 14: "14 acertos", 13: "13 acertos", 12: "12 acertos", 11: "11 acertos" },
    megasena:  { 6: "Sena (6 acertos)", 5: "Quina (5 acertos)", 4: "Quadra (4 acertos)" },
  };

  const porFaixa = Array.from(porFaixaMap.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([acertos, { qtd, ganhoTotal }]) => ({
      acertos,
      descricao: descricoesFaixas[codigoLoteria]?.[acertos] ?? `${acertos} acertos`,
      qtd,
      ganhoTotal,
    }));

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
  limiteHistorico?: number
): Promise<ResultadoComparacao | { erro: string }> {
  if (!isCodigoLoteriaValido(codigoLoteria))
    return { erro: "Loteria inválida" };

  const loteria = await getLoteriaPorCodigo(codigoLoteria);
  if (!loteria) return { erro: "Loteria não encontrada" };

  const n = loteria.qtdDezenasSorteadas;
  if (dezenasA.length !== n || dezenasB.length !== n)
    return { erro: `Cada jogo precisa ter exatamente ${n} dezenas` };

  const todosDraws = await getDrawsParaSimulacao(loteria.id);
  const draws = limiteHistorico ? todosDraws.slice(-limiteHistorico) : todosDraws;

  const setA = new Set(dezenasA);
  const setB = new Set(dezenasB);
  const mapaFaixas = MAPA_FAIXAS[codigoLoteria] ?? {};
  const minAcertos = Math.min(...Object.keys(mapaFaixas).map(Number));
  const preco = PRECO_APOSTA[codigoLoteria] ?? 3.50;

  let saldoA = 0, saldoB = 0;
  let ganhoA = 0, ganhoB = 0;
  const faixaMapA = new Map<number, { qtd: number; ganhoTotal: number }>();
  const faixaMapB = new Map<number, { qtd: number; ganhoTotal: number }>();
  const melhoresA: { numero: number; acertos: number; premio: number }[] = [];
  const melhoresB: { numero: number; acertos: number; premio: number }[] = [];
  const graficoComparado: { numero: number; saldoA: number; saldoB: number }[] = [];

  for (const acertos of Object.keys(mapaFaixas).map(Number)) {
    faixaMapA.set(acertos, { qtd: 0, ganhoTotal: 0 });
    faixaMapB.set(acertos, { qtd: 0, ganhoTotal: 0 });
  }

  for (const draw of draws) {
    saldoA -= preco;
    saldoB -= preco;

    const acA = draw.dezenas.filter((d) => setA.has(d)).length;
    const acB = draw.dezenas.filter((d) => setB.has(d)).length;

    if (acA >= minAcertos) {
      const faixa = mapaFaixas[acA];
      if (faixa !== undefined) {
        const premio = draw.premios[faixa] ?? 0;
        if (premio > 0) {
          saldoA += premio; ganhoA += premio;
          faixaMapA.get(acA)!.qtd++;
          faixaMapA.get(acA)!.ganhoTotal += premio;
          melhoresA.push({ numero: draw.numero, acertos: acA, premio });
        }
      }
    }

    if (acB >= minAcertos) {
      const faixa = mapaFaixas[acB];
      if (faixa !== undefined) {
        const premio = draw.premios[faixa] ?? 0;
        if (premio > 0) {
          saldoB += premio; ganhoB += premio;
          faixaMapB.get(acB)!.qtd++;
          faixaMapB.get(acB)!.ganhoTotal += premio;
          melhoresB.push({ numero: draw.numero, acertos: acB, premio });
        }
      }
    }

    graficoComparado.push({
      numero: draw.numero,
      saldoA: Math.round(saldoA * 100) / 100,
      saldoB: Math.round(saldoB * 100) / 100,
    });
  }

  const totalGasto = draws.length * preco;
  const descricoesFaixas: Record<string, Record<number, string>> = {
    lotofacil: { 15: "15 acertos", 14: "14 acertos", 13: "13 acertos", 12: "12 acertos", 11: "11 acertos" },
    megasena:  { 6: "Sena", 5: "Quina", 4: "Quadra" },
  };

  function montarResultado(
    dezenas: number[],
    ganho: number,
    saldoFinal: number,
    faixaMap: Map<number, { qtd: number; ganhoTotal: number }>,
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
        .sort((a, b) => b[0] - a[0])
        .map(([acertos, { qtd, ganhoTotal }]) => ({
          acertos,
          descricao: descricoesFaixas[codigoLoteria]?.[acertos] ?? `${acertos} acertos`,
          qtd,
          ganhoTotal,
        })),
      melhores: melhores.sort((a, b) => b.premio - a.premio).slice(0, 5),
      grafico: [],
    };
  }

  return {
    jogoA: montarResultado(dezenasA, ganhoA, saldoA, faixaMapA, melhoresA),
    jogoB: montarResultado(dezenasB, ganhoB, saldoB, faixaMapB, melhoresB),
    graficoComparado,
  };
}
