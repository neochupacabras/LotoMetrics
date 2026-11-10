// Regras puras das páginas de recordes (/[loteria]/recordes e /recordes).
// Semana 5 do roadmap de growth: página de dados citável, para busca
// ("maior prêmio da lotofácil") e para a imprensa. Testado em
// lib/recordes-regras.test.ts; os dados vêm de lib/recordes.ts.
//
// Regras de honestidade: valores nominais (sem correção pela inflação), e a
// página diz até qual concurso os dados vão.

import { formatarMoedaCompacta } from "./resumo-concurso";
import { preposicaoLoteria } from "./format";

// Faixa principal: a faixa 1, e na Dupla Sena também a faixa 5 (a sena do
// 2º sorteio, ver FAIXAS_DUPLASENA_POR_SORTEIO em lib/probabilidades.ts).
export function faixasPrincipais(codigoLoteria: string): number[] {
  return codigoLoteria === "duplasena" ? [1, 5] : [1];
}

// Super Sete sorteia um algarismo por coluna: "dezena mais sorteada" e
// "maior atraso" não têm o mesmo sentido, então ficam de fora lá.
export function temRecordesDeDezenas(codigoLoteria: string): boolean {
  return codigoLoteria !== "supersete";
}

export interface SequenciaAcumulo {
  concursoInicio: number;
  concursoFim: number; // concurso que teve ganhador e encerrou a sequência
  duracao: number; // concursos do grupo, contando o que teve ganhador
  ganhadores: number;
  premio: number;
  dataInicio: string;
  dataFim: string;
}

export interface MaiorSequencia {
  concursosSemGanhador: number;
  primeiroSemGanhador: number;
  ultimoSemGanhador: number;
  concursoComGanhador: number;
  dataComGanhador: string;
  premio: number;
  ganhadores: number;
}

// A maior sequência de concursos seguidos sem ganhador na faixa 1 que já
// terminou (a em andamento não entra: ainda não é recorde fechado). Empate:
// a mais recente.
export function maiorSequenciaAcumulo(grupos: SequenciaAcumulo[]): MaiorSequencia | null {
  let melhor: SequenciaAcumulo | null = null;
  for (const g of grupos) {
    if (g.duracao < 2) continue; // sem nenhum concurso acumulado antes
    if (!melhor || g.duracao > melhor.duracao || (g.duracao === melhor.duracao && g.concursoFim > melhor.concursoFim)) {
      melhor = g;
    }
  }
  if (!melhor) return null;
  return {
    concursosSemGanhador: melhor.duracao - 1,
    primeiroSemGanhador: melhor.concursoInicio,
    ultimoSemGanhador: melhor.concursoFim - 1,
    concursoComGanhador: melhor.concursoFim,
    dataComGanhador: melhor.dataFim,
    premio: melhor.premio,
    ganhadores: melhor.ganhadores,
  };
}

function dataBr(iso: string): string {
  const [a, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${a}`;
}

export interface ResumoSeo {
  nomeLoteria: string;
  codigoLoteria: string;
  ultimoConcurso: number;
  maiorPremio: { numero: number; data: string; valor: number } | null;
}

// <title> e H1 com o dado vivo (mesma linha dos títulos da semana 1).
export function tituloRecordes(r: ResumoSeo): string {
  const { de } = preposicaoLoteria(r.codigoLoteria);
  return r.maiorPremio
    ? `Recordes ${de} ${r.nomeLoteria}: maior prêmio é de ${formatarMoedaCompacta(r.maiorPremio.valor)}`
    : `Recordes ${de} ${r.nomeLoteria}`;
}

export function descricaoRecordes(r: ResumoSeo): string {
  const { de } = preposicaoLoteria(r.codigoLoteria);
  const premio = r.maiorPremio
    ? `Maior prêmio por aposta ${de} ${r.nomeLoteria}: ${formatarMoedaCompacta(r.maiorPremio.valor)} no concurso ${r.maiorPremio.numero} (${dataBr(r.maiorPremio.data)}). `
    : "";
  return `${premio}Os 10 maiores prêmios, a maior sequência sem ganhador e os números mais sorteados, até o concurso ${r.ultimoConcurso}.`;
}
