import { createAdminClient, createClient } from "@/lib/supabase/server";
import { calcularIsPremium, descontarDias } from "@/lib/plano-premium";

export interface PlanoUsuario {
  logado: boolean;
  premium: boolean;
}

// Única fonte de verdade para "esse perfil é premium?" — antes essa mesma
// expressão estava duplicada em ~10 arquivos (rotas de API, cron jobs,
// páginas de /conta), com o risco real de alguma cópia ficar defasada se a
// regra mudasse. Vive em lib/plano-premium.ts (sem imports de servidor)
// pra também poder ser usada em Client Components; reexportada aqui pra
// não precisar mudar nenhum dos ~10 imports server-side existentes.
export { calcularIsPremium };

// Chame em Server Components para saber o plano do visitante atual.
// Nunca lança exceção — retorna { logado: false, premium: false } em caso de erro.
export async function getPlanoPremium(): Promise<PlanoUsuario> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { logado: false, premium: false };

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, plan_expires_at")
      .eq("id", user.id)
      .single();

    return { logado: true, premium: calcularIsPremium(profile) };
  } catch {
    return { logado: false, premium: false };
  }
}

// Aplica uma mudança de plano vinda do Stripe sem derrubar um crédito que
// já esteja gravado por outro caminho (hoje só o Pix — ver
// app/api/mercadopago/webhook/route.ts). Achado de consistência #1.6 da
// auditoria de 13/09/2026: o webhook do Stripe sobrescrevia
// plan_expires_at incondicionalmente em customer.subscription.deleted e em
// customer.subscription.updated (status inativo), então cancelar a
// assinatura de cartão apagava um Pix ainda válido pago à parte.
//
// Sempre server-only (usa o service role) — nunca chamar do client.
export async function atualizarPlanoRespeitandoCredito(
  userId: string,
  novo: { premium: boolean; expiraEm: string | null }
): Promise<void> {
  const admin = createAdminClient();
  const { data: atual } = await admin
    .from("profiles")
    .select("plan_expires_at")
    .eq("id", userId)
    .single();

  const expiraAtual = atual?.plan_expires_at ? new Date(atual.plan_expires_at) : null;

  if (novo.premium) {
    // Renovação/ativação: nunca move a expiração pra trás, seja qual for
    // a origem do valor mais alto (Pix pago à parte ou o próprio Stripe).
    const expiraNovo = novo.expiraEm ? new Date(novo.expiraEm) : null;
    const maior =
      !expiraAtual || (expiraNovo && expiraNovo > expiraAtual) ? expiraNovo : expiraAtual;
    await admin
      .from("profiles")
      .update({ plan: "premium", plan_expires_at: maior?.toISOString() ?? null })
      .eq("id", userId);
    return;
  }

  // Tentando rebaixar (cancelamento ou assinatura inativa do lado Stripe)
  // — só efetiva se não sobrar nenhum crédito ainda válido.
  if (expiraAtual && expiraAtual > new Date()) {
    return; // mantém premium: ainda há crédito válido (ex.: Pix)
  }
  await admin.from("profiles").update({ plan: "free", plan_expires_at: null }).eq("id", userId);
}

// Reembolso de um Pix de plano Premium já aprovado: desfaz o crédito que o
// pagamento somou em plan_expires_at (tira period_days). Se o que sobra já
// passou, o Premium só continua se houver assinatura Stripe ativa (vale até
// o fim do período dela); senão volta a free. Sempre server-only.
export async function revogarCreditoPix(userId: string, dias: number): Promise<void> {
  const admin = createAdminClient();
  const agora = new Date();

  const { data: perfil } = await admin
    .from("profiles")
    .select("plan_expires_at")
    .eq("id", userId)
    .single();

  const restante = descontarDias(perfil?.plan_expires_at, dias, agora);
  if (restante) {
    await admin.from("profiles").update({ plan_expires_at: restante.toISOString() }).eq("id", userId);
    return;
  }

  const { data: assinatura } = await admin
    .from("subscriptions")
    .select("current_period_end")
    .eq("user_id", userId)
    .in("status", ["active", "trialing"])
    .order("current_period_end", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (assinatura?.current_period_end && new Date(assinatura.current_period_end) > agora) {
    await admin
      .from("profiles")
      .update({ plan: "premium", plan_expires_at: assinatura.current_period_end })
      .eq("id", userId);
    return;
  }

  await admin.from("profiles").update({ plan: "free", plan_expires_at: null }).eq("id", userId);
}
