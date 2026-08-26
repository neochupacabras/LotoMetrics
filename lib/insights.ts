// Comparações do mundo real pra dar escala humana a uma contagem de dias
// (usado na página de Atraso das tabelas estatísticas). A lista é
// percorrida da maior pra menor referência, e usamos a última cujo
// limite seja menor ou igual à quantidade de dias.
const REFERENCIAS_TEMPO: { dias: number; texto: string }[] = [
  { dias: 1, texto: "menos de um dia" },
  { dias: 3, texto: "um fim de semana prolongado" },
  { dias: 7, texto: "uma semana inteira" },
  { dias: 14, texto: "duas semanas — um ciclo de férias curtas" },
  { dias: 21, texto: "três semanas, quase uma quarentena" },
  { dias: 30, texto: "um mês cheio" },
  { dias: 40, texto: "mais tempo que a Quaresma inteira" },
  { dias: 60, texto: "dois meses — as férias escolares de verão" },
  { dias: 90, texto: "um trimestre completo" },
  { dias: 120, texto: "quatro meses seguidos" },
  { dias: 180, texto: "meio ano" },
  { dias: 270, texto: "quase o tempo de uma gestação humana" },
  { dias: 365, texto: "um ano-calendário inteiro" },
  { dias: 730, texto: "dois anos completos" },
];

export function compararTempoComMundoReal(dias: number): string {
  let escolhida = REFERENCIAS_TEMPO[0];
  for (const ref of REFERENCIAS_TEMPO) {
    if (dias >= ref.dias) escolhida = ref;
    else break;
  }
  return escolhida.texto;
}

/**
 * Converte uma contagem de "concursos sem sair" em uma estimativa de dias
 * corridos, usando quantos sorteios por semana aquela loteria tem. É uma
 * aproximação (assume ritmo constante), suficiente pra dar escala humana
 * ao número — não uma data exata.
 */
export function estimarDiasCorridos(concursosSemSair: number, sorteiosPorSemana: number): number {
  if (sorteiosPorSemana <= 0) return 0;
  return Math.round((concursosSemSair * 7) / sorteiosPorSemana);
}
