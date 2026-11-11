// Preço da aposta simples por período, para custear corretamente simulações
// sobre o histórico. Antes, o simulador cobrava o preço atual em todos os
// concursos desde 2003, contra prêmios nominais da época — o retorno médio
// mostrado no histórico completo da Lotofácil caía de ~40% para ~25%
// (auditoria da Lotofácil, LF-04; docs/auditorias/lotofacil).
//
// Lotofácil: o prêmio fixo de 11 acertos sempre foi exatamente 2 × o preço
// da aposta, e muda nos mesmos concursos em que o preço muda. As eras abaixo
// saem dessa série (dados oficiais da Caixa no banco). As quatro mais
// recentes foram confirmadas por notícias dos reajustes; as três primeiras
// são só deduzidas da série de prêmios.
//
// Loterias sem tabela aqui usam o preço atual (PARAMS_LOTERIA) em todo o
// histórico, como antes.

import { PARAMS_LOTERIA } from "./probabilidades";

export interface EraPreco {
  aPartirDoConcurso: number;
  preco: number;
  fonte: "confirmado" | "deduzido";
}

export const ERAS_PRECO: Partial<Record<string, EraPreco[]>> = {
  lotofacil: [
    { aPartirDoConcurso: 1, preco: 1.0, fonte: "deduzido" },
    { aPartirDoConcurso: 460, preco: 1.25, fonte: "deduzido" },
    { aPartirDoConcurso: 1054, preco: 1.5, fonte: "deduzido" },
    { aPartirDoConcurso: 1213, preco: 2.0, fonte: "confirmado" }, // vendas a partir de 23/05/2015
    { aPartirDoConcurso: 1889, preco: 2.5, fonte: "confirmado" }, // 11/11/2019
    { aPartirDoConcurso: 2801, preco: 3.0, fonte: "confirmado" }, // 30/04/2023
    { aPartirDoConcurso: 3439, preco: 3.5, fonte: "confirmado" }, // 09/07/2025
  ],
};

export function precoAtual(codigoLoteria: string): number {
  const params = (PARAMS_LOTERIA as Record<string, { precoAposta: number }>)[codigoLoteria];
  return params?.precoAposta ?? 3.5;
}

// Preço da aposta simples vigente no concurso informado.
export function precoApostaNoConcurso(codigoLoteria: string, numeroConcurso: number): number {
  const eras = ERAS_PRECO[codigoLoteria];
  if (!eras) return precoAtual(codigoLoteria);
  let preco = eras[0].preco;
  for (const era of eras) {
    if (numeroConcurso >= era.aPartirDoConcurso) preco = era.preco;
  }
  return preco;
}
