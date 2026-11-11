// Pontuação de um concurso contra um jogo, usada pelo simulador histórico e
// pelo comparador (lib/simulador-actions.ts). Fica num módulo próprio, fora
// do arquivo "use server", para poder ser exportada e testada sem virar uma
// ação chamável pelo navegador.

import type { ConcessaoSimulacao } from "@/lib/queries";
import { FAIXAS_MILIONARIA, FAIXAS_DUPLASENA_POR_SORTEIO, faixaLotomania } from "@/lib/probabilidades";
import { contarColunasAcertadas } from "@/lib/classificacao";

export type ContextoPontuacao =
  | { tipo: "padrao"; mapaFaixas: Record<number, number> }
  | { tipo: "milionaria"; trevosSet: Set<number> }
  | { tipo: "supersete"; mapaFaixas: Record<number, number> }
  | { tipo: "duplasena" }
  | { tipo: "lotomania" };

// ── Pontuação de um concurso contra um jogo ────────────────────────────────────
// Isolado numa função pura pra não duplicar essa lógica entre simularHistorico
// e compararJogos (foi exatamente essa duplicação, com a tabela de faixas
// incompleta, que deixou a ferramenta quebrada pra 7 das 9 loterias).

export interface Pontuacao {
  faixa: number;
  premio: number;
  acumulado?: boolean; // faixa batida, mas sem ganhador no concurso (valor 0)
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
export function pontuarDraw(
  draw: ConcessaoSimulacao,
  jogo: number[],
  contexto: ContextoPontuacao
): Pontuacao[] {
  if (contexto.tipo === "lotomania") {
    const jogoSet = new Set(jogo);
    const acertos = draw.dezenas.filter((d) => jogoSet.has(d)).length;
    const faixa = faixaLotomania(acertos, draw.premios[7] !== undefined);
    const premio = faixa !== undefined ? (draw.premios[faixa] ?? 0) : 0;
    return faixa !== undefined && premio > 0
      ? [{ faixa, premio, acertosExibicao: acertos, descricao: `${acertos} acertos` }]
      : [];
  }
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
  if (faixa !== undefined && premio === 0 && faixa in draw.premios) {
    // Faixa registrada no concurso com valor 0 = ninguém acertou e ela acumulou.
    return [{ faixa, premio: 0, acumulado: true, acertosExibicao: acertos, descricao: `${acertos} acertos` }];
  }
  return premio > 0 ? [{ faixa, premio, acertosExibicao: acertos, descricao: `${acertos} acertos` }] : [];
}

