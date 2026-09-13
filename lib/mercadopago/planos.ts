// Planos do pagamento avulso via Pix (Mercado Pago) — mesmos preços dos
// planos de assinatura recorrente do Stripe (ver app/assinar/page.tsx), mas
// aqui cada pagamento aprovado só estende profiles.plan_expires_at em
// `periodDays` dias, sem criar nenhuma recorrência.

export type PlanoPix = "mensal" | "semestral" | "anual";

interface ConfigPlanoPix {
  label: string;
  amount: number; // em reais (BRL), formato decimal — ex: 14.90
  periodDays: number;
}

export const PLANOS_PIX: Record<PlanoPix, ConfigPlanoPix> = {
  mensal: { label: "Mensal", amount: 14.9, periodDays: 30 },
  semestral: { label: "Semestral", amount: 79.9, periodDays: 180 },
  anual: { label: "Anual", amount: 129.9, periodDays: 365 },
};

export function isPlanoPix(value: unknown): value is PlanoPix {
  return value === "mensal" || value === "semestral" || value === "anual";
}
