// Parte da renovação antecipada que fala com o Stripe (a regra de datas,
// pura, está em lib/renovacao.ts). Usada pelo webhook do Pix: quando entra
// um Pix de quem tem assinatura no cartão, o Pix soma a partir do fim do
// período já pago e a próxima cobrança do cartão é adiada para a nova data.
// Sem isso, o Stripe cobrava de novo no fim do período normal e a pessoa
// pagava os mesmos dias duas vezes. Sempre server-only.

import Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import { assinaturaRenovaSozinha } from "./renovacao";

function clienteStripe(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-06-24.dahlia" });
}

export interface AssinaturaQueRenova {
  id: string;
  fimDoPeriodo: Date | null;
}

// A assinatura de cartão desse usuário que ainda vai cobrar sozinha, se
// houver. Lê a lista da tabela `subscriptions` e confirma o estado no Stripe
// (status e cancelamento marcado podem ter mudado sem webhook ainda).
export async function buscarAssinaturaQueRenova(
  admin: SupabaseClient,
  userId: string
): Promise<AssinaturaQueRenova | null> {
  const { data: linhas } = await admin
    .from("subscriptions")
    .select("stripe_subscription_id")
    .eq("user_id", userId)
    .in("status", ["active", "trialing"]);
  if (!linhas?.length) return null;

  const stripe = clienteStripe();
  for (const { stripe_subscription_id: id } of linhas as { stripe_subscription_id: string }[]) {
    const sub = await stripe.subscriptions.retrieve(id);
    if (!assinaturaRenovaSozinha(sub)) continue;
    const fim = sub.trial_end ?? sub.items.data[0]?.current_period_end ?? null;
    return { id: sub.id, fimDoPeriodo: fim ? new Date(fim * 1000) : null };
  }
  return null;
}

// Adia a próxima cobrança para `novaData`. O trial_end no Stripe encerra o
// período atual (já pago) sem crédito nem cobrança (proration "none") e só
// volta a cobrar o período cheio em `novaData`. O webhook do Stripe recebe o
// customer.subscription.updated com current_period_end = novaData, e
// atualizarPlanoRespeitandoCredito nunca move a validade para trás.
export async function adiarProximaCobranca(subscriptionId: string, novaData: Date): Promise<void> {
  await clienteStripe().subscriptions.update(subscriptionId, {
    trial_end: Math.floor(novaData.getTime() / 1000),
    proration_behavior: "none",
  });
}
