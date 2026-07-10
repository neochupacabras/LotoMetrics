import { CodigoLoteria } from "@/lib/types";
import { LOTERIAS } from "@/lib/format";

// dias: 0 = domingo, 1 = segunda, ... 6 = sábado
export interface AgendaLoteria {
  codigo: CodigoLoteria;
  dias: number[];
  horario: string; // horário de Brasília
  observacao?: string;
}

export const AGENDA: AgendaLoteria[] = [
  { codigo: "lotofacil",      dias: [1, 2, 3, 4, 5, 6], horario: "21h" },
  { codigo: "megasena",       dias: [2, 4, 6],          horario: "21h" },
  { codigo: "quina",          dias: [1, 2, 3, 4, 5, 6], horario: "21h" },
  { codigo: "lotomania",      dias: [1, 3, 5],          horario: "21h" },
  {
    codigo: "diadesorte",
    dias: [1, 2, 3, 4, 5, 6],
    horario: "21h",
    observacao: "Ampliado de 3 para 6 sorteios semanais a partir de 29/06/2026.",
  },
  {
    codigo: "maismilionaria",
    dias: [3, 6],
    horario: "21h",
    observacao: "Passou de 1 para 2 sorteios semanais (quarta e sábado). Confirmado na página oficial da +Milionária em loterias.caixa.gov.br.",
  },
  { codigo: "timemania",      dias: [2, 4, 6],          horario: "21h" },
  { codigo: "duplasena",      dias: [1, 3, 5],          horario: "21h" },
  { codigo: "supersete",      dias: [1, 3, 5],          horario: "21h" },
];

export const DIAS_SEMANA = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
export const DIAS_SEMANA_ABREV = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

/** Retorna a data/hora atual já ajustada para o fuso de Brasília (UTC-3), sem depender do TZ do servidor. */
export function agoraBrasilia(): Date {
  const agora = new Date();
  const utcMs = agora.getTime() + agora.getTimezoneOffset() * 60_000;
  return new Date(utcMs - 3 * 60 * 60_000);
}

/** Dado um código de loteria e uma data de referência, retorna a data do próximo sorteio (ou hoje, se ainda houver sorteio hoje). */
export function proximoSorteio(codigo: CodigoLoteria, referencia: Date): Date {
  const agenda = AGENDA.find((a) => a.codigo === codigo)!;
  const diaSemanaHoje = referencia.getDay();

  for (let i = 0; i <= 7; i++) {
    const diaCandidato = (diaSemanaHoje + i) % 7;
    if (agenda.dias.includes(diaCandidato)) {
      const data = new Date(referencia);
      data.setDate(data.getDate() + i);
      return data;
    }
  }
  return referencia; // nunca deve chegar aqui — toda loteria tem ao menos 1 dia de sorteio
}

export function getAgendaOrdenadaPorProximoSorteio(referencia: Date) {
  return AGENDA
    .map((a) => ({ ...a, proxima: proximoSorteio(a.codigo, referencia) }))
    .sort((a, b) => a.proxima.getTime() - b.proxima.getTime());
}

export function nomeLoteria(codigo: CodigoLoteria): string {
  return LOTERIAS[codigo].nome;
}
