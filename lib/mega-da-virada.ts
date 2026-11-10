import { binomial } from "./probabilidades";
import type { PremiacaoFaixa } from "./types";

// Hub /mega-da-virada (roadmap de growth, semana 2 — docs/growth/
// GROWTH_ROADMAP_90_DAYS.md). Tudo aqui é puro (sem banco) para ser testável;
// a busca das edições fica em getEdicoesVirada (lib/queries.ts).

// Concurso de cada edição já sorteada. Lista explícita porque a data sozinha
// não basta: houve concursos comuns em 31/12 antes de a Virada existir (1998,
// 1999, 2005, 2008), e a edição de 2025 foi sorteada na manhã de 01/01/2026
// (o sorteio de 31/12 atrasou). Edições de 2026 em diante são reconhecidas
// pela data em getEdicoesVirada — esta lista só precisa cobrir o passado.
export const CONCURSOS_VIRADA: Readonly<Record<number, number>> = {
  2009: 1140,
  2010: 1245,
  2011: 1350,
  2012: 1455,
  2013: 1560,
  2014: 1665,
  2015: 1775,
  2016: 1890,
  2017: 2000,
  2018: 2110,
  2019: 2220,
  2020: 2330,
  2021: 2440,
  2022: 2550,
  2023: 2670,
  2024: 2810,
  2025: 2955,
};

// Preço da aposta simples (6 dezenas) da Mega-Sena desde julho de 2025.
// Conferir a cada reajuste da Caixa.
export const PRECO_APOSTA_SIMPLES = 6;

const TOTAL_COMBINACOES = binomial(60, 6); // 50.063.860

export interface EdicaoVirada {
  ano: number;
  numero: number;
  dataSorteio: string; // ISO
  dezenas: number[];
  valorArrecadado: number | null;
  premiacoes: PremiacaoFaixa[];
}

// Ano da edição a partir da data do sorteio: 01/01 conta como a Virada do
// ano anterior (caso da edição de 2025).
export function anoDaEdicao(dataSorteioIso: string): number {
  const d = new Date(dataSorteioIso);
  const ano = d.getUTCFullYear();
  return d.getUTCMonth() === 0 ? ano - 1 : ano;
}

// Dias corridos até 31/12 do ano de `agora` (data no fuso de Brasília, como
// devolvida por agoraBrasilia()). 0 = é hoje.
export function diasAteVirada(agora: Date): { ano: number; dias: number } {
  const ano = agora.getFullYear();
  const hoje = Date.UTC(ano, agora.getMonth(), agora.getDate());
  const virada = Date.UTC(ano, 11, 31);
  return { ano, dias: Math.round((virada - hoje) / 86_400_000) };
}

// Época em que a Virada domina as buscas: novembro, dezembro e a primeira
// semana de janeiro (quem procura o resultado depois do sorteio).
export function emTemporadaDaVirada(agora: Date): boolean {
  const mes = agora.getMonth();
  return mes === 10 || mes === 11 || (mes === 0 && agora.getDate() <= 7);
}

export interface ResumoEdicao {
  ganhadoresSena: number;
  premioPorGanhador: number; // 0 se ninguém acertou
  premioTotalSena: number;
  ganhadoresQuina: number;
  ganhadoresQuadra: number;
}

export function resumirEdicao(e: EdicaoVirada): ResumoEdicao {
  const faixa = (n: number) => e.premiacoes.find((p) => p.faixa === n);
  const sena = faixa(1);
  const ganhadoresSena = sena?.qtdGanhadores ?? 0;
  const premioPorGanhador = ganhadoresSena > 0 ? sena?.valorPremio ?? 0 : 0;
  return {
    ganhadoresSena,
    premioPorGanhador,
    premioTotalSena: ganhadoresSena * premioPorGanhador,
    ganhadoresQuina: faixa(2)?.qtdGanhadores ?? 0,
    ganhadoresQuadra: faixa(3)?.qtdGanhadores ?? 0,
  };
}

// Quantas vezes cada dezena saiu nas Viradas. Mais frequente primeiro;
// empate pela dezena menor. Dezenas que nunca saíram entram com 0.
export function frequenciaNaVirada(edicoes: EdicaoVirada[]): { dezena: number; vezes: number }[] {
  const contagem = new Map<number, number>();
  for (let d = 1; d <= 60; d++) contagem.set(d, 0);
  for (const e of edicoes) for (const d of e.dezenas) contagem.set(d, (contagem.get(d) ?? 0) + 1);
  return [...contagem.entries()]
    .map(([dezena, vezes]) => ({ dezena, vezes }))
    .sort((a, b) => b.vezes - a.vezes || a.dezena - b.dezena);
}

export interface Destaques {
  maiorPremioTotal: EdicaoVirada | null;
  maiorPremioIndividual: EdicaoVirada | null;
  maisGanhadores: EdicaoVirada | null;
  totalGanhadoresSena: number;
}

export function destaquesVirada(edicoes: EdicaoVirada[]): Destaques {
  let maiorPremioTotal: EdicaoVirada | null = null;
  let maiorPremioIndividual: EdicaoVirada | null = null;
  let maisGanhadores: EdicaoVirada | null = null;
  let totalGanhadoresSena = 0;
  for (const e of edicoes) {
    const r = resumirEdicao(e);
    totalGanhadoresSena += r.ganhadoresSena;
    if (!maiorPremioTotal || r.premioTotalSena > resumirEdicao(maiorPremioTotal).premioTotalSena) maiorPremioTotal = e;
    if (!maiorPremioIndividual || r.premioPorGanhador > resumirEdicao(maiorPremioIndividual).premioPorGanhador)
      maiorPremioIndividual = e;
    if (!maisGanhadores || r.ganhadoresSena > resumirEdicao(maisGanhadores).ganhadoresSena) maisGanhadores = e;
  }
  return { maiorPremioTotal, maiorPremioIndividual, maisGanhadores, totalGanhadoresSena };
}

export interface LinhaAposta {
  dezenas: number;
  jogos: number; // apostas simples equivalentes
  preco: number;
  umEm: number; // chance de acertar a sena: 1 em N
}

// Preço e chance da sena por quantidade de dezenas marcadas (6 a 20).
export function tabelaApostas(quantidades: number[] = [6, 7, 8, 9, 10, 12, 15, 20]): LinhaAposta[] {
  return quantidades.map((k) => {
    const jogos = binomial(k, 6);
    return {
      dezenas: k,
      jogos,
      preco: jogos * PRECO_APOSTA_SIMPLES,
      umEm: Math.round(TOTAL_COMBINACOES / jogos),
    };
  });
}
