import { NextResponse, after } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import pool from "@/lib/db";
import { logToolEvent } from "@/lib/telemetry";

export async function POST(request: Request) {
  // Instanciar dentro da função — evita erro no build quando a env não está disponível
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-06-24.dahlia",
  });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { priceId } = await request.json();
  if (!priceId) {
    return NextResponse.json({ error: "priceId ausente" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, display_name")
    .eq("id", user.id)
    .single();

  let customerId = profile?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email!,
      name: profile?.display_name ?? undefined,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;

    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lotoanalitica.com.br";

  // Trial de 7 dias só pra quem nunca teve uma assinatura antes — o Stripe
  // não bloqueia trial repetido sozinho, então a checagem de elegibilidade
  // é nossa: qualquer linha em `subscriptions` (mesmo cancelada) já usou.
  const { data: assinaturaAnterior } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  const elegivelParaTrial = !assinaturaAnterior;

  // Atribuição de conversão (seção 17 do audit): o Referer do próprio POST
  // pra /api/stripe/checkout sempre seria "/assinar" (único lugar de onde o
  // botão de checkout é chamado) — não diz nada sobre qual ferramenta levou
  // o usuário até ali. Em vez disso, usa o último tool_view/paywall_view
  // desse usuário como "última ferramenta antes do checkout" (last touch).
  const ultimoToqueAntes = await pool.query<{ tool: string | null; lottery: string | null }>(
    `SELECT tool, lottery FROM product_events
     WHERE user_id = $1 AND event_name IN ('paywall_view', 'tool_view')
       AND created_at > now() - interval '7 days'
     ORDER BY created_at DESC LIMIT 1`,
    [user.id]
  );
  const atribuicao = ultimoToqueAntes.rows[0] ?? { tool: null, lottery: null };
  after(() =>
    logToolEvent({
      eventName: "checkout_started",
      tool: atribuicao.tool ?? "desconhecido",
      lottery: atribuicao.lottery,
      userId: user.id,
      plan: "free",
    })
  );

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/conta?checkout=sucesso`,
    cancel_url: `${baseUrl}/assinar`,
    subscription_data: {
      metadata: { supabase_user_id: user.id },
      ...(elegivelParaTrial ? { trial_period_days: 7 } : {}),
    },
    allow_promotion_codes: true,
    locale: "pt-BR",
  });

  return NextResponse.json({ url: session.url });
}
