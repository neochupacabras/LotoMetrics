import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  // Instanciar dentro da função — evita erro no build quando a env não está disponível
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-05-27.dahlia",
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

      await supabase
        .from("profiles")
        .update({
          plan: isAtivo ? "premium" : "free",
          plan_expires_at: isAtivo ? periodoFim : null,
        })
        .eq("id", userId);

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
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id;

      if (!userId) break;

      await supabase
        .from("profiles")
        .update({ plan: "free", plan_expires_at: null })
        .eq("id", userId);

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

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
