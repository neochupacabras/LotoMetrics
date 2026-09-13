import { NextResponse, after } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { atualizarPlanoRespeitandoCredito } from "@/lib/plano";
import { logError, logToolEvent } from "@/lib/telemetry";

export const runtime = "nodejs";

export async function POST(request: Request) {
  // Instanciar dentro da função — evita erro no build quando a env não está disponível
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-06-24.dahlia",
  });

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Assinatura ausente" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    after(() => logError({ source: "stripe_webhook", message: `Assinatura inválida: ${(err as Error).message}` }));
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id;

      if (!userId) {
        console.error("supabase_user_id ausente no metadata:", sub.id);
        after(() =>
          logError({
            source: "stripe_webhook",
            message: `supabase_user_id ausente no metadata da subscription ${sub.id}`,
          })
        );
        break;
      }

      const isAtivo = ["active", "trialing"].includes(sub.status);
      const item = sub.items.data[0];
      const periodoFim = item?.current_period_end
        ? new Date(item.current_period_end * 1000).toISOString()
        : null;
      const periodoInicio = item?.current_period_start
        ? new Date(item.current_period_start * 1000).toISOString()
        : null;

      // Nunca sobrescreve incondicionalmente — se o usuário também tiver
      // um crédito Pix ainda válido (mais no futuro que o que o Stripe diz
      // agora), essa validade é preservada nos dois sentidos.
      await atualizarPlanoRespeitandoCredito(userId, { premium: isAtivo, expiraEm: periodoFim });

      await supabase.from("subscriptions").upsert(
        {
          user_id: userId,
          stripe_subscription_id: sub.id,
          stripe_price_id: item?.price?.id ?? null,
          status: sub.status,
          current_period_start: periodoInicio,
          current_period_end: periodoFim,
          canceled_at: sub.canceled_at
            ? new Date(sub.canceled_at * 1000).toISOString()
            : null,
        },
        { onConflict: "stripe_subscription_id" }
      );

      // Só em "created" (não em "updated", que também dispara em renovação
      // e mudança de status) — marca o instante real de uma nova assinatura,
      // pra poder cruzar com checkout_started (mesmo user_id) e calcular
      // conversão real por ferramenta.
      if (event.type === "customer.subscription.created" && isAtivo) {
        after(() => logToolEvent({ eventName: "subscription_started", tool: null, userId, plan: "premium" }));
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id;

      if (!userId) break;

      // Idem: só rebaixa pra free se não sobrar crédito Pix válido.
      await atualizarPlanoRespeitandoCredito(userId, { premium: false, expiraEm: null });

      await supabase
        .from("subscriptions")
        .update({ status: "canceled", canceled_at: new Date().toISOString() })
        .eq("stripe_subscription_id", sub.id);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const parent = invoice.parent;
      const subRef =
        parent?.type === "subscription_details"
          ? parent.subscription_details?.subscription
          : null;
      const subId =
        typeof subRef === "string" ? subRef : (subRef as Stripe.Subscription | null)?.id ?? null;

      if (subId) {
        await supabase
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("stripe_subscription_id", subId);
      }
      break;
    }

    // Reembolso de cartão — sem tentar rebaixar automaticamente (um
    // reembolso parcial ou contestado não deveria derrubar o plano
    // sozinho), mas registrado como erro pra aparecer no /admin, porque
    // hoje isso é um ponto cego total (achado de consistência #1.6 da
    // auditoria de 13/09/2026: "se o Stripe processar um refund sem
    // cancelar a assinatura, o sistema local nunca fica sabendo").
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      after(() =>
        logError({
          source: "stripe_webhook",
          message: `Reembolso ${charge.refunded ? "total" : "parcial"} na charge ${charge.id} (customer ${charge.customer ?? "?"}): R$ ${(charge.amount_refunded / 100).toFixed(2)}. Revisar manualmente se o plano precisa ser ajustado.`,
        })
      );
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
