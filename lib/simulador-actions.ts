"use server";

import { after } from "next/server";
import { cookies } from "next/headers";
import { getLoteriaPorCodigo, getDrawsParaSimulacao, getMapaFaixasPorAcertos, ConcessaoSimulacao } from "@/lib/queries";
import { isCodigoLoteriaValido, qtdDezenasAposta } from "@/lib/format";
import { pontuarDraw } from "@/lib/simulador-pontuacao";
import { precoAtual, precoApostaNoConcurso } from "@/lib/precos-loteria";
import { logToolEvent } from "@/lib/telemetry";
import { getPlanoPremium } from "@/lib/plano";
import { limiteHistoricoPorPlano, recortarHistorico, ERRO_COMPARADOR_PREMIUM, LIMITE_HISTORICO_FREE } from "@/lib/simulador-plano";

export interface ResultadoSimulacao {
  nomeLoteria: string;
  totalConcursos: number;
  precoAposta: number; // preço atual da aposta simples
  // Menor e maior preço cobrado no período simulado: o custo de cada
  // concurso usa o preço da época (lib/precos-loteria.ts), não o atual.
  precoMinimo: number;
  precoMaximo: number;
  totalGasto: number;
  totalGanho: number;
  saldoFinal: number;
  retornoPct: number;
  // Drawdown: pior sequência sem prêmio
  drawdown: {
    maiorSeca: number;
    custoMaiorSeca: number; // soma dos preços pagos durante a maior seca
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
  // Concursos em que o jogo teria acertado uma faixa que ficou sem ganhador
  // (acumulou): o valor não é conhecido, então não entra no saldo — mas o
  // acerto aparece, em vez de sumir (auditoria da Lotofácil, LF-05).
  acertosEmFaixaAcumulada: { numero: number; acertos: number; descricao: string }[];
  grafico: { numero: number; saldo: number }[];
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
  | { tipo: "lotomania" }
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
  if (codigoLoteria === "lotomania") {
    return { tipo: "lotomania" };
  }
  return { tipo: "padrao", mapaFaixas: await getMapaFaixasPorAcertos(loteriaId) };
}

// Como o jogo chegou ao simulador (components/SimuladorHistoricoClient.tsx).
const ORIGENS_JOGO = new Set(["digitado", "grade", "link"]);
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// anonymous_id do visitante (cookie la_aid, lib/telemetria-cliente.ts), para
// o tool_completed se ligar ao visit_landing e ao tool_started do navegador.
async function anonymousIdDoCookie(): Promise<string | null> {
  const valor = (await cookies()).get("la_aid")?.value ?? "";
  return UUID_REGEX.test(valor) ? valor : null;
}

// Simulação do card compartilhável (app/api/simulador/card): sempre nos
// últimos LIMITE_HISTORICO_FREE concursos, o mesmo recorte do plano grátis,
// e sem gravar tool_completed (gerar o card ou a prévia do link não é uma
// simulação feita por alguém). Como ação chamável pelo navegador, não dá
// acesso a nada além do que o plano grátis já dá.
export async function simularParaCard(
  codigoLoteria: string,
  dezenas: number[],
  trevos?: number[]
): Promise<ResultadoSimulacao | { erro: string }> {
  return simularHistoricoInterno(codigoLoteria, dezenas, LIMITE_HISTORICO_FREE, trevos);
}

export async function simularHistorico(
  codigoLoteria: string,
  dezenas: number[],
  // Ignorado de propósito: o limite vinha do navegador e qualquer um podia
  // omiti-lo pra simular o histórico completo (Premium). Mantido só pra não
  // quebrar a assinatura; o servidor decide pelo plano da sessão.
  _limiteHistoricoDoCliente?: number,
  trevos?: number[], // +Milionária
  origem?: string // "digitado" | "grade" | "link", só para medição
): Promise<ResultadoSimulacao | { erro: string }> {
  const inicio = Date.now();
  const { premium } = await getPlanoPremium();
  const limiteHistorico = limiteHistoricoPorPlano(premium);
  const resultado = await simularHistoricoInterno(codigoLoteria, dezenas, limiteHistorico, trevos);
  const falhou = "erro" in resultado;
  const anonymousId = await anonymousIdDoCookie();
  // Único registro de tool_completed do simulador: o navegador manda só o
  // tool_started, para a mesma simulação não contar duas vezes.
  after(() =>
    logToolEvent({
      eventName: falhou ? "tool_failed" : "tool_completed",
      tool: "simulador",
      lottery: codigoLoteria,
      success: !falhou,
      plan: premium ? "premium" : "free",
      durationMs: Date.now() - inicio,
      anonymousId,
      metadata: {
        origem: origem && ORIGENS_JOGO.has(origem) ? origem : null,
        ...(falhou
          ? {}
          : {
              concursos: resultado.totalConcursos,
              premiado: resultado.totalGanho > 0,
              maiorAcerto: resultado.melhores[0]?.acertos ?? null,
            }),
      },
    })
  );
  return resultado;
}

// Cálculo da simulação. NÃO exportar: num arquivo "use server" toda função
// exportada vira ação que o navegador pode chamar com qualquer argumento, e
// com limiteHistorico = null isto devolveria o histórico completo (Premium)
// para qualquer um.
async function simularHistoricoInterno(
  codigoLoteria: string,
  dezenas: number[],
  limiteHistorico: number | null, // null = histórico completo
  trevos?: number[]
): Promise<ResultadoSimulacao | { erro: string }> {
  if (!isCodigoLoteriaValido(codigoLoteria))
    return { erro: "Loteria inválida" };

  const loteria = await getLoteriaPorCodigo(codigoLoteria);
  if (!loteria) return { erro: "Loteria não encontrada" };

  const qtdAposta = qtdDezenasAposta(codigoLoteria, loteria.qtdDezenasSorteadas);
  if (dezenas.length !== qtdAposta)
    return { erro: `Selecione exatamente ${qtdAposta} dezenas` };

  const contexto = await contextoPontuacao(codigoLoteria, loteria.id, trevos);
  if ("erro" in contexto) return contexto;

  const todosDraws = await getDrawsParaSimulacao(loteria.id);
  // Aplica limite: free usa últimos N concursos, premium usa todos
  const draws = recortarHistorico(todosDraws, limiteHistorico);

  let saldoCumulativo = 0;
  let totalGasto = 0;
  let precoMinimo = Infinity;
  let precoMaximo = 0;
  const acertosEmFaixaAcumulada: { numero: number; acertos: number; descricao: string }[] = [];
  const porFaixaMap = new Map<number, { descricao: string; qtd: number; ganhoTotal: number }>();
  const melhores: { numero: number; acertos: number; premio: number }[] = [];
  const grafico: { numero: number; saldo: number }[] = [];

  // Drawdown tracking
  let secaAtual = 0;
  let custoSecaAtual = 0;
  let custoMaiorSeca = 0;
  let maiorSeca = 0;
  let inicioSecaAtual = 0;
  let inicioMaiorSeca: number | null = null;
  let fimMaiorSeca: number | null = null;
  let picoSaldo = 0;
  let maiorDrawdown = 0;
  let totalGanho = 0;

  for (const draw of draws) {
    // Preço da época de cada concurso (LF-04), não o preço atual.
    const preco = precoApostaNoConcurso(codigoLoteria, draw.numero);
    saldoCumulativo -= preco;
    totalGasto += preco;
    precoMinimo = Math.min(precoMinimo, preco);
    precoMaximo = Math.max(precoMaximo, preco);

    const pontuacoes = pontuarDraw(draw, dezenas, contexto);
    for (const p of pontuacoes) {
      if (p.acumulado) {
        acertosEmFaixaAcumulada.push({ numero: draw.numero, acertos: p.acertosExibicao, descricao: p.descricao });
      }
    }
    const hits = pontuacoes.filter((p) => !p.acumulado);

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
      custoSecaAtual += preco;
      if (secaAtual === 1) inicioSecaAtual = draw.numero;
      if (secaAtual > maiorSeca) {
        maiorSeca = secaAtual;
        custoMaiorSeca = custoSecaAtual;
        inicioMaiorSeca = inicioSecaAtual;
        fimMaiorSeca = draw.numero;
      }
    } else {
      secaAtual = 0;
      custoSecaAtual = 0;
    }

    // Drawdown: maior queda do pico
    if (saldoCumulativo > picoSaldo) picoSaldo = saldoCumulativo;
    const quedaAtual = saldoCumulativo - picoSaldo;
    if (quedaAtual < maiorDrawdown) maiorDrawdown = quedaAtual;

    grafico.push({ numero: draw.numero, saldo: Math.round(saldoCumulativo * 100) / 100 });
  }

  totalGasto = Math.round(totalGasto * 100) / 100;

  const porFaixa = Array.from(porFaixaMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([faixa, { descricao, qtd, ganhoTotal }]) => ({ faixa, descricao, qtd, ganhoTotal }));

  const melhoresOrdenados = melhores
    .sort((a, b) => b.premio - a.premio || b.acertos - a.acertos)
    .slice(0, 5);

  return {
    nomeLoteria: loteria.nome,
    totalConcursos: draws.length,
    precoAposta: precoAtual(codigoLoteria),
    precoMinimo: draws.length > 0 ? precoMinimo : precoAtual(codigoLoteria),
    precoMaximo: draws.length > 0 ? precoMaximo : precoAtual(codigoLoteria),
    totalGasto,
    totalGanho,
    saldoFinal: saldoCumulativo,
    retornoPct: totalGasto > 0 ? (totalGanho / totalGasto) * 100 : 0,
    drawdown: {
      maiorSeca,
      custoMaiorSeca: Math.round(custoMaiorSeca * 100) / 100,
      maiorDrawdown: Math.round(maiorDrawdown * 100) / 100,
      concursoInicioSeca: inicioMaiorSeca,
      concursoFimSeca: fimMaiorSeca,
    },
    porFaixa,
    melhores: melhoresOrdenados,
    acertosEmFaixaAcumulada,
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
  // Ignorado: ver simularHistorico. O comparador é só Premium, então roda
  // sempre no histórico completo.
  _limiteHistoricoDoCliente?: number,
  trevosA?: number[],
  trevosB?: number[]
): Promise<ResultadoComparacao | { erro: string }> {
  const { premium } = await getPlanoPremium();
  const resultado = premium
    ? await compararJogosInterno(codigoLoteria, dezenasA, dezenasB, limiteHistoricoPorPlano(premium), trevosA, trevosB)
    : { erro: ERRO_COMPARADOR_PREMIUM };
  const falhou = "erro" in resultado;
  after(() =>
    logToolEvent({
      eventName: falhou ? "tool_failed" : "tool_completed",
      tool: "simulador-comparador",
      lottery: codigoLoteria,
      success: !falhou,
      plan: premium ? "premium" : "free",
    })
  );
  return resultado;
}

async function compararJogosInterno(
  codigoLoteria: string,
  dezenasA: number[],
  dezenasB: number[],
  limiteHistorico: number | null,
  trevosA?: number[],
  trevosB?: number[]
): Promise<ResultadoComparacao | { erro: string }> {
  if (!isCodigoLoteriaValido(codigoLoteria))
    return { erro: "Loteria inválida" };

  const loteria = await getLoteriaPorCodigo(codigoLoteria);
  if (!loteria) return { erro: "Loteria não encontrada" };

  const n = qtdDezenasAposta(codigoLoteria, loteria.qtdDezenasSorteadas);
  if (dezenasA.length !== n || dezenasB.length !== n)
    return { erro: `Cada jogo precisa ter exatamente ${n} dezenas` };

  const contextoA = await contextoPontuacao(codigoLoteria, loteria.id, trevosA);
  if ("erro" in contextoA) return contextoA;
  const contextoB = await contextoPontuacao(codigoLoteria, loteria.id, trevosB);
  if ("erro" in contextoB) return contextoB;

  const todosDraws = await getDrawsParaSimulacao(loteria.id);
  const draws = recortarHistorico(todosDraws, limiteHistorico);

  let totalGasto = 0;
  let precoMinimo = Infinity;
  let precoMaximo = 0;
  const acumuladosA: { numero: number; acertos: number; descricao: string }[] = [];
  const acumuladosB: { numero: number; acertos: number; descricao: string }[] = [];

  let saldoA = 0, saldoB = 0;
  let ganhoA = 0, ganhoB = 0;
  const faixaMapA = new Map<number, { descricao: string; qtd: number; ganhoTotal: number }>();
  const faixaMapB = new Map<number, { descricao: string; qtd: number; ganhoTotal: number }>();
  const melhoresA: { numero: number; acertos: number; premio: number }[] = [];
  const melhoresB: { numero: number; acertos: number; premio: number }[] = [];
  const graficoComparado: { numero: number; saldoA: number; saldoB: number }[] = [];

  for (const draw of draws) {
    const preco = precoApostaNoConcurso(codigoLoteria, draw.numero);
    totalGasto += preco;
    precoMinimo = Math.min(precoMinimo, preco);
    precoMaximo = Math.max(precoMaximo, preco);
    saldoA -= preco;
    saldoB -= preco;

    for (const pA of pontuarDraw(draw, dezenasA, contextoA)) {
      if (pA.acumulado) {
        acumuladosA.push({ numero: draw.numero, acertos: pA.acertosExibicao, descricao: pA.descricao });
        continue;
      }
      saldoA += pA.premio; ganhoA += pA.premio;
      const entry = faixaMapA.get(pA.faixa) ?? { descricao: pA.descricao, qtd: 0, ganhoTotal: 0 };
      entry.qtd++; entry.ganhoTotal += pA.premio;
      faixaMapA.set(pA.faixa, entry);
      melhoresA.push({ numero: draw.numero, acertos: pA.acertosExibicao, premio: pA.premio });
    }

    for (const pB of pontuarDraw(draw, dezenasB, contextoB)) {
      if (pB.acumulado) {
        acumuladosB.push({ numero: draw.numero, acertos: pB.acertosExibicao, descricao: pB.descricao });
        continue;
      }
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

  totalGasto = Math.round(totalGasto * 100) / 100;

  function montarResultado(
    dezenas: number[],
    ganho: number,
    saldoFinal: number,
    faixaMap: Map<number, { descricao: string; qtd: number; ganhoTotal: number }>,
    melhores: { numero: number; acertos: number; premio: number }[],
    acertosEmFaixaAcumulada: { numero: number; acertos: number; descricao: string }[]
  ): ResultadoSimulacao & { dezenas: number[] } {
    return {
      dezenas,
      nomeLoteria: loteria!.nome,
      totalConcursos: draws.length,
      precoAposta: precoAtual(codigoLoteria),
      precoMinimo: draws.length > 0 ? precoMinimo : precoAtual(codigoLoteria),
      precoMaximo: draws.length > 0 ? precoMaximo : precoAtual(codigoLoteria),
      totalGasto,
      totalGanho: ganho,
      saldoFinal,
      retornoPct: totalGasto > 0 ? (ganho / totalGasto) * 100 : 0,
      porFaixa: Array.from(faixaMap.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([faixa, { descricao, qtd, ganhoTotal }]) => ({ faixa, descricao, qtd, ganhoTotal })),
      melhores: melhores.sort((a, b) => b.premio - a.premio).slice(0, 5),
      acertosEmFaixaAcumulada,
      grafico: [],
      // O comparador não calcula drawdown individual — campo vazio
      drawdown: {
        maiorSeca: 0,
        custoMaiorSeca: 0,
        maiorDrawdown: 0,
        concursoInicioSeca: null,
        concursoFimSeca: null,
      },
    };
  }

  return {
    jogoA: montarResultado(dezenasA, ganhoA, saldoA, faixaMapA, melhoresA, acumuladosA),
    jogoB: montarResultado(dezenasB, ganhoB, saldoB, faixaMapB, melhoresB, acumuladosB),
    graficoComparado,
  };
}
