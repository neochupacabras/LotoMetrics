import { DIAS_BOLAO_PRO } from "@/lib/bolao-limites";

// Planos do pagamento avulso via Pix (Mercado Pago) — mesmos preços dos
// planos de assinatura recorrente do Stripe (ver app/assinar/page.tsx), mas
// aqui cada pagamento aprovado só estende profiles.plan_expires_at em
// `periodDays` dias, sem criar nenhuma recorrência.

export type PlanoPix = "mensal" | "anual";

interface ConfigPlanoPix {
  label: string;
  amount: number; // em reais (BRL), formato decimal — ex: 14.90
  periodDays: number;
}

export const PLANOS_PIX: Record<PlanoPix, ConfigPlanoPix> = {
  mensal: { label: "Mensal", amount: 14.9, periodDays: 30 },
  anual: { label: "Anual", amount: 99, periodDays: 365 },
};

export function isPlanoPix(value: unknown): value is PlanoPix {
  return value === "mensal" || value === "anual";
}

// Bolão Pro: pagamento avulso por bolão (não é crédito Premium) — libera até
// 100 cotas e os avisos aos participantes daquele bolão por 30 dias. O
// período vem de bolao-limites (DIAS_BOLAO_PRO) pra UI, checkout e webhook
// nunca divergirem.
export const BOLAO_PRO_PIX = {
  label: "Bolão Pro",
  amount: 14.9,
  periodDays: DIAS_BOLAO_PRO,
};

// Valor de TESTE do Bolão Pro: permite validar o pagamento real com um valor
// baixo sem mexer no preço público. Só vale quando as DUAS condições batem:
// a env (só de servidor, nunca NEXT_PUBLIC) BOLAO_PRO_PIX_VALOR_TESTE está
// definida E quem paga é admin (profiles.role). Com a env ausente, inválida
// ou fora de 0,01 a 14,90, o preço é sempre o oficial.
export function valorBolaoProPix(
  role: string | null | undefined,
  valorTesteEnv: string | undefined
): number {
  if (role !== "admin" || !valorTesteEnv) return BOLAO_PRO_PIX.amount;
  const valor = Number(valorTesteEnv.replace(",", "."));
  if (!Number.isFinite(valor) || valor < 0.01 || valor > BOLAO_PRO_PIX.amount) {
    return BOLAO_PRO_PIX.amount;
  }
  return Math.round(valor * 100) / 100;
}
