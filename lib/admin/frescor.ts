export type StatusFrescor = "healthy" | "warning" | "critical";

// Critério de frescor de cada loteria no /admin.
//
// 1) Com a data do próximo sorteio informada pela Caixa (concurso.data_proximo_concurso):
//    o concurso deve estar no banco até o meio-dia (horário de Brasília) do dia
//    seguinte ao sorteio, que é às 20h-21h. Depois disso é "warning"; passadas
//    mais 48h, "critical". Assim uma pausa anunciada (ex.: a Quina parou de 19/11
//    a 29/11/2026 para a Quina Friday) não alerta, e um resultado que não chegou
//    alerta já no dia seguinte.
// 2) Sem essa data: cadência esperada (lib/calendario.ts). Tolerância = 2x o
//    intervalo médio entre sorteios + 1 dia; "critical" a partir do dobro.
const HORAS_ATE_PRAZO = 24 + 12 + 3; // meio-dia BRT (UTC-3) do dia seguinte, a partir da 0h UTC do dia do sorteio
const HORAS_ATE_CRITICO = 48;

export function prazoImportacao(proximoSorteio: string): Date {
  return new Date(Date.parse(`${proximoSorteio}T00:00:00Z`) + HORAS_ATE_PRAZO * 3_600_000);
}

export function avaliarFrescor(params: {
  diasDesde: number;
  sorteiosPorSemana: number;
  proximoSorteio: string | null; // YYYY-MM-DD
  agora: number;
}): StatusFrescor {
  const { diasDesde, sorteiosPorSemana, proximoSorteio, agora } = params;

  if (proximoSorteio) {
    const prazo = prazoImportacao(proximoSorteio).getTime();
    if (agora <= prazo) return "healthy";
    if (agora <= prazo + HORAS_ATE_CRITICO * 3_600_000) return "warning";
    return "critical";
  }

  const intervaloEsperadoDias = 7 / sorteiosPorSemana;
  const tolerancia = intervaloEsperadoDias * 2 + 1;
  if (diasDesde <= tolerancia) return "healthy";
  if (diasDesde <= tolerancia * 2) return "warning";
  return "critical";
}
