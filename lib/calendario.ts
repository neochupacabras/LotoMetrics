import { CodigoLoteria } from "@/lib/types";
import { LOTERIAS } from "@/lib/format";

// dias: 0 = domingo, 1 = segunda, ... 6 = sábado
export interface JanelaSorteio {
  dias: number[];
  horario: string; // horário de Brasília
}

// Uma loteria pode ter mais de uma janela de sorteio com horários
// diferentes — ex.: segunda a sexta às 21h, mas domingo às 11h (ver
// observação abaixo sobre a mudança de 19/07/2026).
export interface AgendaLoteria {
  codigo: CodigoLoteria;
  sorteios: JanelaSorteio[];
  observacao?: string;
}

// A partir de 19/07/2026, a Caixa moveu o sorteio de sábado para domingo às
// 11h em Lotofácil, Mega-Sena, Quina, Dia de Sorte, +Milionária e Timemania
// (sorteios de segunda a sexta continuam às 21h, sem mudança). Lotomania,
// Dupla Sena e Super Sete não sorteavam aos sábados e não foram afetadas.
// Fonte: https://olhardigital.com.br/2026/07/17/internet-e-redes-sociais/caixa-muda-sorteios-das-loterias-e-leva-concursos-de-sabado-para-domingo-em-2026
const OBSERVACAO_MUDANCA_DOMINGO =
  "Sorteio de sábado passou para domingo às 11h a partir de 19/07/2026.";

export const AGENDA: AgendaLoteria[] = [
  {
    codigo: "lotofacil",
    sorteios: [{ dias: [1, 2, 3, 4, 5], horario: "21h" }, { dias: [0], horario: "11h" }],
    observacao: OBSERVACAO_MUDANCA_DOMINGO,
  },
  {
    codigo: "megasena",
    sorteios: [{ dias: [2, 4], horario: "21h" }, { dias: [0], horario: "11h" }],
    observacao: OBSERVACAO_MUDANCA_DOMINGO,
  },
  {
    codigo: "quina",
    sorteios: [{ dias: [1, 2, 3, 4, 5], horario: "21h" }, { dias: [0], horario: "11h" }],
    observacao: OBSERVACAO_MUDANCA_DOMINGO,
  },
  { codigo: "lotomania", sorteios: [{ dias: [1, 3, 5], horario: "21h" }] },
  {
    codigo: "diadesorte",
    sorteios: [{ dias: [1, 2, 3, 4, 5], horario: "21h" }, { dias: [0], horario: "11h" }],
    observacao: `Ampliado de 3 para 6 sorteios semanais em 29/06/2026. ${OBSERVACAO_MUDANCA_DOMINGO}`,
  },
  {
    codigo: "maismilionaria",
    sorteios: [{ dias: [3], horario: "21h" }, { dias: [0], horario: "11h" }],
    observacao: `Passou de 1 para 2 sorteios semanais (quarta e sábado, depois domingo). ${OBSERVACAO_MUDANCA_DOMINGO}`,
  },
  {
    codigo: "timemania",
    sorteios: [{ dias: [2, 4], horario: "21h" }, { dias: [0], horario: "11h" }],
    observacao: OBSERVACAO_MUDANCA_DOMINGO,
  },
  { codigo: "duplasena", sorteios: [{ dias: [1, 3, 5], horario: "21h" }] },
  { codigo: "supersete", sorteios: [{ dias: [1, 3, 5], horario: "21h" }] },
];

export const DIAS_SEMANA = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
export const DIAS_SEMANA_ABREV = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

/** Retorna a data/hora atual já ajustada para o fuso de Brasília (UTC-3), sem depender do TZ do servidor. */
export function agoraBrasilia(): Date {
  const agora = new Date();
  const utcMs = agora.getTime() + agora.getTimezoneOffset() * 60_000;
  return new Date(utcMs - 3 * 60 * 60_000);
}

function todosOsDias(agenda: AgendaLoteria): number[] {
  return agenda.sorteios.flatMap((j) => j.dias);
}

/** A janela de sorteio (dias + horário) que cobre um dia da semana específico. */
function janelaParaDia(agenda: AgendaLoteria, diaSemana: number): JanelaSorteio {
  return agenda.sorteios.find((j) => j.dias.includes(diaSemana)) ?? agenda.sorteios[0];
}

/** Dado um código de loteria e uma data de referência, retorna a data do próximo sorteio (ou hoje, se ainda houver sorteio hoje). */
export function proximoSorteio(codigo: CodigoLoteria, referencia: Date): Date {
  const agenda = AGENDA.find((a) => a.codigo === codigo)!;
  const dias = todosOsDias(agenda);
  const diaSemanaHoje = referencia.getDay();

  for (let i = 0; i <= 7; i++) {
    const diaCandidato = (diaSemanaHoje + i) % 7;
    if (dias.includes(diaCandidato)) {
      const data = new Date(referencia);
      data.setDate(data.getDate() + i);
      return data;
    }
  }
  return referencia; // nunca deve chegar aqui — toda loteria tem ao menos 1 dia de sorteio
}

// Instante exato (UTC real) do próximo sorteio — não só o dia, a hora
// também. Usado pela contagem regressiva de "sorteio ao vivo": o cliente
// compara isso com `new Date()` local dele, então precisa ser um instante
// absoluto e correto, não um horário "de Brasília" solto.
//
// Itera dia a dia (em vez de reaproveitar `proximoSorteio`) porque aqui
// importa também a HORA: se já passou do horário de hoje (ex.: checando às
// 22h num dia que sorteia às 21h), tem que pular pro próximo dia válido —
// `proximoSorteio` só olha o dia da semana, sem essa checagem. A comparação
// usa `Date.now()` (instante real, absoluto) em vez de `referencia.getTime()`
// porque `referencia` normalmente vem de `agoraBrasilia()`, que devolve um
// Date deslocado (época real − 3h) só pra extrair corretamente o dia/mês/ano
// de Brasília — comparar `.getTime()` dele com um instante absoluto de
// `Date.UTC(...)` daria uma defasagem de 3h.
export function dataHoraProximoSorteio(codigo: CodigoLoteria, referencia: Date): Date {
  const agenda = AGENDA.find((a) => a.codigo === codigo)!;
  const agoraReal = Date.now();
  for (let i = 0; i <= 8; i++) {
    const dia = new Date(referencia);
    dia.setDate(dia.getDate() + i);
    const janela = agenda.sorteios.find((j) => j.dias.includes(dia.getDay()));
    if (!janela) continue;
    const hora = Number(janela.horario.match(/\d+/)?.[0] ?? 21);
    // `dia` já representa a data de calendário em Brasília (ver agoraBrasilia).
    // Brasília é sempre UTC-3 (sem horário de verão), então a hora do
    // sorteio em UTC é sempre hora+3 no mesmo dia.
    const instante = new Date(Date.UTC(dia.getFullYear(), dia.getMonth(), dia.getDate(), hora + 3, 0, 0));
    if (instante.getTime() > agoraReal) return instante;
  }
  return referencia;
}

export function getAgendaOrdenadaPorProximoSorteio(referencia: Date) {
  return AGENDA
    .map((a) => {
      const proxima = proximoSorteio(a.codigo, referencia);
      const horario = janelaParaDia(a, proxima.getDay()).horario;
      return { ...a, proxima, horario };
    })
    .sort((a, b) => a.proxima.getTime() - b.proxima.getTime());
}

/** Quantos sorteios por semana uma loteria tem, somando todas as janelas — usado
 *  para converter "1 em X" em uma escala de tempo real (Probabilidades, Atraso). */
export function qtdSorteiosPorSemana(codigo: string): number {
  const agenda = AGENDA.find((a) => a.codigo === codigo);
  if (!agenda) return 3;
  return todosOsDias(agenda).length;
}

/** Descrição textual de todas as janelas de sorteio de uma loteria, ex.:
 *  "Seg/Ter/Qua/Qui/Sex às 21h e Dom às 11h". */
export function descricaoAgenda(codigo: string): string {
  const agenda = AGENDA.find((a) => a.codigo === codigo);
  if (!agenda) return "";
  return agenda.sorteios
    .map((j) => `${j.dias.map((d) => DIAS_SEMANA_ABREV[d]).join("/")} às ${j.horario}`)
    .join(" e ");
}

export function nomeLoteria(codigo: CodigoLoteria): string {
  return LOTERIAS[codigo].nome;
}
