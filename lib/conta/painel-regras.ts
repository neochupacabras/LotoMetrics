// Regras puras do Painel (/conta) — sem banco nem next/headers, para poder
// testar (lib/conta/painel-regras.test.ts). Todas as datas tratam
// Brasília como UTC-3 fixo (sem horário de verão desde 2019), a mesma
// premissa de lib/calendario.ts.

import { LOTERIAS, preposicaoLoteria } from "@/lib/format";
import { abaAplicavel } from "@/lib/abas-loteria";
import type { CodigoLoteria } from "@/lib/types";

const TRES_HORAS = 3 * 60 * 60 * 1000;
const TOTAL_LOTERIAS = Object.keys(LOTERIAS).length;

function emBrasilia(instante: Date): Date {
  return new Date(instante.getTime() - TRES_HORAS);
}

export function saudacaoPorHora(hora: number): string {
  if (hora >= 5 && hora < 12) return "Bom dia";
  if (hora >= 12 && hora < 18) return "Boa tarde";
  return "Boa noite";
}

// Dia de calendário de um instante, no fuso de Brasília ("AAAA-MM-DD").
export function diaBrasilia(instante: Date): string {
  return emBrasilia(instante).toISOString().slice(0, 10);
}

export function horaBrasilia(instante: Date): string {
  return `${emBrasilia(instante).getUTCHours()}h`;
}

function juntar(itens: string[]): string {
  if (itens.length <= 1) return itens.join("");
  return `${itens.slice(0, -1).join(", ")} e ${itens[itens.length - 1]}`;
}

function comPreposicao(codigo: CodigoLoteria): string {
  return `${preposicaoLoteria(codigo).de} ${LOTERIAS[codigo].nome}`;
}

export interface ProximoSorteio {
  codigo: CodigoLoteria;
  instante: Date; // instante real (UTC) do próximo sorteio ainda por vir
}

// Linha contextual do cabeçalho do Painel. `proximos` traz o próximo
// sorteio AINDA POR VIR de cada loteria (lib/calendario.dataHoraProximoSorteio,
// que já prefere a data oficial da Caixa) — então "hoje" quer dizer "ainda
// hoje": um sorteio que já aconteceu hoje não entra.
export function linhaDoDia(proximos: ProximoSorteio[], agora: Date): string {
  const hoje = diaBrasilia(agora);
  const deHoje = proximos.filter((p) => diaBrasilia(p.instante) === hoje);

  if (deHoje.length > 0) {
    const horarios = [...new Set(deHoje.map((p) => horaBrasilia(p.instante)))];
    const quando = horarios.length === 1 ? `, às ${horarios[0]}` : "";
    if (deHoje.length === TOTAL_LOTERIAS) return `Hoje tem sorteio de todas as loterias${quando}.`;
    if (deHoje.length > 3) {
      const nomes = deHoje.map((p) => LOTERIAS[p.codigo].nome);
      return `Hoje tem ${deHoje.length} sorteios${quando}: ${juntar(nomes)}.`;
    }
    return `Hoje tem sorteio ${juntar(deHoje.map((p) => comPreposicao(p.codigo)))}${quando}.`;
  }

  const seguinte = [...proximos].sort((a, b) => a.instante.getTime() - b.instante.getTime())[0];
  if (!seguinte) return "";
  return `Hoje não há mais sorteios. O próximo é ${comPreposicao(seguinte.codigo)}, ${quandoSorteio(seguinte.instante, agora)}.`;
}

// "hoje, 21h" / "amanhã, 11h" / "qui. 12/11, 21h".
export function quandoSorteio(instante: Date, agora: Date): string {
  const alvo = emBrasilia(instante);
  const ref = emBrasilia(agora);
  const dia = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const diff = Math.round((dia(alvo) - dia(ref)) / 86_400_000);
  const hora = `${alvo.getUTCHours()}h`;
  if (diff === 0) return `hoje, ${hora}`;
  if (diff === 1) return `amanhã, ${hora}`;
  const semana = alvo.toLocaleDateString("pt-BR", { weekday: "short", timeZone: "UTC" });
  return `${semana} ${alvo.getUTCDate()}/${alvo.getUTCMonth() + 1}, ${hora}`;
}

// Ordem do módulo "Próximos sorteios": favoritas, depois as dos jogos
// salvos (mais jogadas primeiro), completando com as de maior procura até
// 3 — sem repetir e no máximo 4 (ou todas as favoritas, se forem mais).
const PADRAO: CodigoLoteria[] = ["megasena", "lotofacil", "quina"];
const MIN_LOTERIAS = 3;
const MAX_LOTERIAS = 4;

export function ordemLoteriasPainel(favoritas: CodigoLoteria[], doUsuario: CodigoLoteria[]): CodigoLoteria[] {
  const unicas = [...new Set([...favoritas, ...doUsuario, ...PADRAO])];
  const proprias = new Set([...favoritas, ...doUsuario]).size;
  const limite = Math.max(MIN_LOTERIAS, Math.min(proprias, Math.max(MAX_LOTERIAS, favoritas.length)));
  return unicas.slice(0, limite);
}

// Atalhos do módulo "Acesso rápido". Bolão não existe para Lotomania e
// Super Sete (lib/abas-loteria.ts) — nesse caso aponta para a Mega-Sena.
export function atalhosRapidos(loteria: CodigoLoteria) {
  const bolao = abaAplicavel(loteria, "bolao") ? loteria : "megasena";
  return [
    { href: `/${loteria}/conferidor`, titulo: "Conferir jogo", descricao: "Seus números contra todo o histórico" },
    { href: `/${loteria}/gerador`, titulo: "Gerar jogo", descricao: "Combinações com filtros estatísticos" },
    { href: `/${loteria}/simulador`, titulo: "Simulador", descricao: "Quanto um jogo teria ganho até hoje" },
    { href: `/${bolao}/bolao`, titulo: "Montar bolão", descricao: "Cotas, link e conferência para o grupo" },
  ];
}
