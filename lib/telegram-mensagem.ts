// Mensagem do canal do Telegram com o resultado de cada concurso novo
// (semana 5 do roadmap de growth). Função pura, testada em
// lib/telegram-mensagem.test.ts; o envio fica em lib/notificacoes/telegram-canal.ts.
//
// Formato HTML do Telegram (só <b>, <i>, <a>; o resto é escapado). A
// manchete é a mesma do resumo da página do concurso (lib/resumo-concurso.ts),
// e o link leva UTM para o visit_landing contar as visitas vindas do canal.

import type { Concurso } from "./types";
import { montarResumoConcurso } from "./resumo-concurso";

const DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

function escapar(texto: string): string {
  return texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function dataCurta(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const dia = String(d.getUTCDate()).padStart(2, "0");
  const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${DIAS[d.getUTCDay()]}, ${dia}/${mes}`;
}

const dz = (n: number) => String(n).padStart(2, "0");

export interface EntradaMensagem {
  codigoLoteria: string;
  nomeLoteria: string;
  concurso: Concurso;
  siteUrl: string;
}

export function montarMensagemTelegram(e: EntradaMensagem): string {
  const { concurso: c, codigoLoteria } = e;
  const superSete = codigoLoteria === "supersete";
  const { manchete } = montarResumoConcurso({
    codigoLoteria,
    nomeLoteria: e.nomeLoteria,
    concurso: c,
    contexto: null,
    pares: 0,
    impares: 0,
    percentualParImpar: null,
    soma: 0,
    percentualSoma: null,
  });

  const linhas: string[] = [];
  linhas.push(`<b>${escapar(manchete)}</b>`);
  const quando = dataCurta(c.dataSorteio);
  if (quando) linhas.push(`<i>Sorteio de ${quando}</i>`);
  linhas.push("");

  const dezenas = superSete ? c.dezenas.join(" · ") : c.dezenas.map(dz).join(" · ");
  linhas.push(codigoLoteria === "duplasena" ? `1º sorteio: <b>${dezenas}</b>` : `<b>${dezenas}</b>`);
  if (codigoLoteria === "duplasena" && c.dezenasSegundoSorteio?.length) {
    linhas.push(`2º sorteio: <b>${c.dezenasSegundoSorteio.map(dz).join(" · ")}</b>`);
  }
  if (c.trevos?.length) linhas.push(`Trevos: <b>${c.trevos.join(" · ")}</b>`);
  if (c.mesSorte) {
    const rotulo = codigoLoteria === "timemania" ? "Time do Coração" : "Mês da Sorte";
    linhas.push(`${rotulo}: <b>${escapar(c.mesSorte)}</b>`);
  }

  const url = `${e.siteUrl}/${codigoLoteria}/resultados/${c.numero}?utm_source=telegram&utm_medium=canal`;
  linhas.push("");
  linhas.push(`<a href="${url}">Premiação completa e análise do concurso</a>`);
  return linhas.join("\n");
}

// Chave de idempotência de um concurso no canal (job_runs.details.chave).
export function chaveTelegram(codigoLoteria: string, numero: number): string {
  return `${codigoLoteria}:${numero}`;
}
