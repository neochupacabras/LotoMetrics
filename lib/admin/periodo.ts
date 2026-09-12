import { agoraBrasilia } from "@/lib/calendario";

// Períodos do Overview do Admin (seção 10 do audit). "hoje", "mes_atual" e
// "mes_anterior" usam agoraBrasilia() — o mesmo helper de fuso horário já
// usado pelo resto do site (lib/calendario.ts) — em vez de reinventar
// tratamento de timezone aqui. Períodos de janela fixa (7d/30d/90d) não
// dependem de fuso, são só "agora menos N dias".

export type PeriodoId = "hoje" | "7d" | "30d" | "90d" | "mes_atual" | "mes_anterior" | "custom";

export const PERIODOS_PADRAO: { id: PeriodoId; label: string }[] = [
  { id: "hoje", label: "Hoje" },
  { id: "7d", label: "7 dias" },
  { id: "30d", label: "30 dias" },
  { id: "90d", label: "90 dias" },
  { id: "mes_atual", label: "Este mês" },
  { id: "mes_anterior", label: "Mês anterior" },
];

export interface Periodo {
  id: PeriodoId;
  label: string;
  from: Date;
  to: Date;
  fromAnterior: Date;
  toAnterior: Date;
}

function inicioDoDia(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function inicioDoMes(d: Date, deltaMeses = 0): Date {
  return new Date(d.getFullYear(), d.getMonth() + deltaMeses, 1);
}

export function resolverPeriodo(id: PeriodoId, customFrom?: string, customTo?: string): Periodo {
  const agora = agoraBrasilia();
  const label = PERIODOS_PADRAO.find((p) => p.id === id)?.label ?? "Personalizado";

  switch (id) {
    case "hoje": {
      const from = inicioDoDia(agora);
      const to = agora;
      const duracaoMs = to.getTime() - from.getTime();
      return { id, label, from, to, fromAnterior: new Date(from.getTime() - duracaoMs), toAnterior: from };
    }
    case "7d":
    case "30d":
    case "90d": {
      const dias = { "7d": 7, "30d": 30, "90d": 90 }[id];
      const to = agora;
      const from = new Date(to.getTime() - dias * 86_400_000);
      return { id, label, from, to, fromAnterior: new Date(from.getTime() - dias * 86_400_000), toAnterior: from };
    }
    case "mes_atual": {
      const from = inicioDoMes(agora);
      const to = agora;
      return { id, label, from, to, fromAnterior: inicioDoMes(agora, -1), toAnterior: from };
    }
    case "mes_anterior": {
      const from = inicioDoMes(agora, -1);
      const to = inicioDoMes(agora);
      return { id, label, from, to, fromAnterior: inicioDoMes(agora, -2), toAnterior: from };
    }
    case "custom": {
      const from = customFrom ? new Date(`${customFrom}T00:00:00`) : new Date(agora.getTime() - 30 * 86_400_000);
      const to = customTo ? new Date(`${customTo}T23:59:59`) : agora;
      const duracaoMs = Math.max(to.getTime() - from.getTime(), 1);
      return { id, label: "Personalizado", from, to, fromAnterior: new Date(from.getTime() - duracaoMs), toAnterior: from };
    }
  }
}

export function ehPeriodoId(valor: string | undefined): valor is PeriodoId {
  return !!valor && ["hoje", "7d", "30d", "90d", "mes_atual", "mes_anterior", "custom"].includes(valor);
}

// Variação percentual entre dois valores — null quando não dá pra calcular
// de forma honesta (ex.: base zero), pra UI mostrar "novo" em vez de um
// percentual sem sentido matemático (divisão por zero).
export function variacaoPct(atual: number, anterior: number): number | null {
  if (anterior === 0) return atual === 0 ? 0 : null;
  return ((atual - anterior) / anterior) * 100;
}
