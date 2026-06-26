// Índice de Equilíbrio — pontua um jogo de 0 a 100 baseado em quanto
// cada característica estatística se alinha com o histórico real de sorteios.
//
// IMPORTANTE: pontuação alta NÃO aumenta a probabilidade de premiação.
// Cada sorteio é um evento aleatório independente. O índice apenas descreve
// o quão típico é um jogo em relação ao padrão histórico observado.

import {
  getSoma, getParesImpares, getSequencias,
  getPrimosDistribuicao, getFibonacciDistribuicao,
  getMultiplos3Distribuicao, getMolduraCentro,
} from "@/lib/estatisticas";
import { classificarJogo } from "@/lib/classificacao";
import { getLoteriaPorCodigo } from "@/lib/queries";

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface MetricaEquilibrio {
  nome: string;
  valor: number;            // valor do jogo nessa métrica
  descricao: string;        // ex: "8 pares de 15 dezenas"
  score: number;            // 0-100: quão típico é esse valor
  percentilHistorico: number; // % dos concursos com resultado igual ou próximo
  peso: number;             // peso na composição da nota final
}

export interface ResultadoEquilibrio {
  nota: number;             // 0-100, nota final ponderada
  classificacao: "atipico" | "razoavel" | "equilibrado" | "tipico";
  descricaoClassificacao: string;
  cor: string;              // cor para o gauge
  metricas: MetricaEquilibrio[];
  totalConcursosHistorico: number;
}

// ── Pesos por loteria ─────────────────────────────────────────────────────────
// Soma tem peso maior por ser a métrica mais correlacionada com a tipicidade

const PESOS: Record<string, Record<string, number>> = {
  lotofacil: {
    soma: 0.25, pares: 0.20, sequencias: 0.15,
    primos: 0.10, fibonacci: 0.10, multiplos3: 0.10, moldura: 0.10,
  },
  megasena: {
    soma: 0.30, pares: 0.25, sequencias: 0.15,
    primos: 0.10, fibonacci: 0.10, multiplos3: 0.10, moldura: 0.00,
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

// Dado um valor e uma distribuição histórica (valor → percentual),
// retorna o percentual de concursos com aquele valor exato.
function percentualExato(
  valor: number,
  distribuicao: { quantidade: number; percentual: number }[]
): number {
  const entrada = distribuicao.find(d => d.quantidade === valor);
  return entrada?.percentual ?? 0;
}

// Dado um valor e o histograma de soma (faixas), retorna o percentual
// de concursos cuja soma caiu na mesma faixa.
function percentualFaixaSoma(
  valor: number,
  histograma: { faixaInicio: number; faixaFim: number; ocorrencias: number }[],
  total: number
): number {
  const faixa = histograma.find(h => valor >= h.faixaInicio && valor <= h.faixaFim);
  if (!faixa || total === 0) return 0;
  return (faixa.ocorrencias / total) * 100;
}

// Converte percentual histórico em score 0-100.
// A relação é linear, mas com teto: percentuais muito altos (ex: 20%) já
// indicam um valor muito comum e recebem score máximo.
function percentualParaScore(percentual: number): number {
  // Normaliza para 0-100, considerando que >12% já é "muito comum"
  return Math.min(100, Math.round((percentual / 12) * 100));
}

function classificar(nota: number): {
  classificacao: ResultadoEquilibrio["classificacao"];
  descricao: string;
  cor: string;
} {
  if (nota >= 75) return {
    classificacao: "tipico",
    descricao: "Jogo muito típico — características dentro do padrão mais comum do histórico",
    cor: "#166534",
  };
  if (nota >= 55) return {
    classificacao: "equilibrado",
    descricao: "Jogo equilibrado — a maioria das características está dentro da faixa histórica normal",
    cor: "#1e4b3c",
  };
  if (nota >= 35) return {
    classificacao: "razoavel",
    descricao: "Jogo com algumas características fora do padrão mais frequente",
    cor: "#b9802c",
  };
  return {
    classificacao: "atipico",
    descricao: "Jogo atípico — características raramente observadas no histórico de sorteios",
    cor: "#8e3a2a",
  };
}

// ── Função principal ──────────────────────────────────────────────────────────

export async function calcularEquilibrio(
  codigoLoteria: string,
  dezenas: number[]
): Promise<ResultadoEquilibrio | { erro: string }> {
  const loteria = await getLoteriaPorCodigo(codigoLoteria);
  if (!loteria) return { erro: "Loteria não encontrada." };

  const analise = classificarJogo(dezenas, codigoLoteria);

  // Buscar todas as distribuições históricas em paralelo
  const [
    { estatisticas: statsSoma, histograma: histSoma },
    distPares,
    { distribuicao: distSeq },
    distPrimos,
    distFibs,
    distMult3,
    { distribuicao: distMoldura },
  ] = await Promise.all([
    getSoma(loteria.id),
    getParesImpares(loteria.id),
    getSequencias(loteria.id),
    getPrimosDistribuicao(loteria.id),
    getFibonacciDistribuicao(loteria.id),
    getMultiplos3Distribuicao(loteria.id),
    getMolduraCentro(loteria.id),
  ]);

  const totalConcursos = distPares.reduce((s, p) => s + p.ocorrencias, 0);
  const pesos = PESOS[codigoLoteria] ?? PESOS.lotofacil;

  // ── Calcular score de cada métrica ────────────────────────────────────────

  // 1. Soma
  const pctSoma = percentualFaixaSoma(analise.soma, histSoma, totalConcursos);
  const scoreSoma = percentualParaScore(pctSoma);

  // 2. Pares
  const pctPares = distPares.find(p => p.pares === analise.pares)?.percentual ?? 0;
  const scorePares = percentualParaScore(pctPares);

  // 3. Sequências (usa maior sequência consecutiva)
  const pctSeq = percentualExato(analise.maiorSequencia ?? 0,
    distSeq.map(s => ({ quantidade: s.maiorSequencia, percentual: s.percentual }))
  );
  const scoreSeq = percentualParaScore(pctSeq);

  // 4. Primos
  const pctPrimos = percentualExato(analise.primos, distPrimos);
  const scorePrimos = percentualParaScore(pctPrimos);

  // 5. Fibonacci
  const pctFibs = percentualExato(analise.fibonacci, distFibs);
  const scoreFibs = percentualParaScore(pctFibs);

  // 6. Múltiplos de 3
  const pctMult3 = percentualExato(analise.multiplos3, distMult3);
  const scoreMult3 = percentualParaScore(pctMult3);

  // 7. Moldura/centro
  let scoreMoldura = 50; // default se não há dados
  let pctMoldura = 0;
  if (codigoLoteria === "lotofacil" && distMoldura.length > 0) {
    const entrada = distMoldura.find(
      m => m.qtdMoldura === analise.moldura && m.qtdCentro === analise.centro
    );
    pctMoldura = entrada?.percentual ?? 0;
    scoreMoldura = percentualParaScore(pctMoldura);
  }

  // ── Nota final ponderada ──────────────────────────────────────────────────
  const scoresPonderados = [
    { key: "soma",      score: scoreSoma,    peso: pesos.soma },
    { key: "pares",     score: scorePares,   peso: pesos.pares },
    { key: "sequencias",score: scoreSeq,     peso: pesos.sequencias },
    { key: "primos",    score: scorePrimos,  peso: pesos.primos },
    { key: "fibonacci", score: scoreFibs,    peso: pesos.fibonacci },
    { key: "multiplos3",score: scoreMult3,   peso: pesos.multiplos3 },
    { key: "moldura",   score: scoreMoldura, peso: pesos.moldura },
  ];

  const nota = Math.round(
    scoresPonderados.reduce((acc, s) => acc + s.score * s.peso, 0)
  );

  // ── Montar métricas detalhadas ────────────────────────────────────────────
  const qtd = dezenas.length;
  const metricas: MetricaEquilibrio[] = [
    {
      nome: "Soma total",
      valor: analise.soma,
      descricao: `Soma das dezenas: ${analise.soma}`,
      score: scoreSoma,
      percentilHistorico: pctSoma,
      peso: pesos.soma,
    },
    {
      nome: "Pares e ímpares",
      valor: analise.pares,
      descricao: `${analise.pares} par${analise.pares !== 1 ? "es" : ""} e ${analise.impares} ímpar${analise.impares !== 1 ? "es" : ""} de ${qtd} dezenas`,
      score: scorePares,
      percentilHistorico: pctPares,
      peso: pesos.pares,
    },
    {
      nome: "Sequência máxima",
      valor: analise.maiorSequencia ?? 0,
      descricao: `Maior sequência consecutiva: ${analise.maiorSequencia ?? 0} número${(analise.maiorSequencia ?? 0) !== 1 ? "s" : ""}`,
      score: scoreSeq,
      percentilHistorico: pctSeq,
      peso: pesos.sequencias,
    },
    {
      nome: "Números primos",
      valor: analise.primos,
      descricao: `${analise.primos} número${analise.primos !== 1 ? "s" : ""} primo${analise.primos !== 1 ? "s" : ""} de ${qtd}`,
      score: scorePrimos,
      percentilHistorico: pctPrimos,
      peso: pesos.primos,
    },
    {
      nome: "Fibonacci",
      valor: analise.fibonacci,
      descricao: `${analise.fibonacci} número${analise.fibonacci !== 1 ? "s" : ""} de Fibonacci de ${qtd}`,
      score: scoreFibs,
      percentilHistorico: pctFibs,
      peso: pesos.fibonacci,
    },
    {
      nome: "Múltiplos de 3",
      valor: analise.multiplos3,
      descricao: `${analise.multiplos3} múltiplo${analise.multiplos3 !== 1 ? "s" : ""} de 3 de ${qtd}`,
      score: scoreMult3,
      percentilHistorico: pctMult3,
      peso: pesos.multiplos3,
    },
  ];

  if (codigoLoteria === "lotofacil") {
    metricas.push({
      nome: "Moldura e centro",
      valor: analise.moldura,
      descricao: `${analise.moldura} na moldura, ${analise.centro} no centro`,
      score: scoreMoldura,
      percentilHistorico: pctMoldura,
      peso: pesos.moldura,
    });
  }

  const { classificacao, descricao, cor } = classificar(nota);

  return {
    nota,
    classificacao,
    descricaoClassificacao: descricao,
    cor,
    metricas,
    totalConcursosHistorico: totalConcursos,
  };
}
