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
  // Saldo cumulativo para o gráfico (amostrado: 1 ponto por concurso)
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
    porFaixa,
    melhores: melhoresOrdenados,
    grafico,
  };
}
