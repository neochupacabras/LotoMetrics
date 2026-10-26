import { NextResponse, after } from "next/server";
import crypto from "node:crypto";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createAdminClient } from "@/lib/supabase/server";
import { logError, logToolEvent } from "@/lib/telemetry";
import { calcularProAte, revogarProAte } from "@/lib/bolao-limites";
import { revogarCreditoPix } from "@/lib/plano";

export const runtime = "nodejs";

// Status finais do MP que refletimos em pix_payments quando NÃO aprovado.
// (approved é tratado à parte, com a lógica de aplicar o crédito.)
const STATUS_FINAIS_NAO_APROVADOS = new Set(["rejected", "cancelled", "refunded"]);

export async function POST(request: Request) {
  const rawBody = await request.text();

  const signatureHeader = request.headers.get("x-signature") ?? "";
  const requestId = request.headers.get("x-request-id") ?? "";

  const parts = Object.fromEntries(
    signatureHeader
      .split(",")
      .map((p) => p.split("=").map((s) => s.trim()))
  ) as { ts?: string; v1?: string };

  let body: { data?: { id?: string | number }; type?: string };
  try {
    body = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    return NextResponse.json({ error: "Corpo inválido" }, { status: 400 });
  }

  const dataId = body?.data?.id;

  if (!parts.ts || !parts.v1 || !dataId || !requestId) {
    return NextResponse.json({ error: "Cabeçalhos de assinatura ausentes" }, { status: 400 });
  }

  // Assinatura HMAC-SHA256 do Mercado Pago: canonical string
  // "id:{data.id};request-id:{x-request-id};ts:{ts};" — ver skill mp-webhooks.
  const canonical = `id:${dataId};request-id:${requestId};ts:${parts.ts};`;
  const expected = crypto
    .createHmac("sha256", process.env.MERCADOPAGO_WEBHOOK_SECRET!)
    .update(canonical)
    .digest("hex");

  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(parts.v1);
  const validSignature =
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

  if (!validSignature) {
    console.error("Webhook Mercado Pago: assinatura inválida");
    after(() => logError({ source: "mercadopago_webhook", message: "Assinatura inválida" }));
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });
  }

  // Só processamos notificações de pagamento (Payments API) — Pix não usa a
  // Orders API, então ignoramos outros tópicos (merchant_order, etc).
  if (body.type && body.type !== "payment") {
    return NextResponse.json({ received: true });
  }

  // Nunca confiar no corpo da notificação: busca o pagamento na API do MP
  // usando data.id para obter o status autoritativo.
  const mpClient = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });
  const paymentClient = new Payment(mpClient);

  let mpPayment;
  try {
    mpPayment = await paymentClient.get({ id: dataId });
  } catch (err) {
    console.error("Erro ao buscar pagamento no Mercado Pago:", err);
    after(() =>
      logError({
        source: "mercadopago_webhook",
        message: `Erro ao buscar pagamento ${dataId}: ${(err as Error).message}`,
      })
    );
    return NextResponse.json({ error: "Erro ao consultar pagamento" }, { status: 502 });
  }

  if (!mpPayment.id) {
    return NextResponse.json({ received: true });
  }

  const mpPaymentId = String(mpPayment.id);
  const supabase = createAdminClient();

  if (mpPayment.status === "approved") {
    const { data: pixPayment } = await supabase
      .from("pix_payments")
      .select("id, user_id, status, period_days, produto, ref_id")
      .eq("mp_payment_id", mpPaymentId)
      .maybeSingle();

    if (!pixPayment) {
      console.error("pix_payments não encontrado para mp_payment_id:", mpPaymentId);
      after(() =>
        logError({
          source: "mercadopago_webhook",
          message: `pix_payments ausente para payment ${mpPaymentId}`,
        })
      );
    } else if (pixPayment.produto === "bolao_pro") {
      // Bolão Pro: estende boloes.pro_ate do bolão em ref_id. A idempotência
      // é por "reivindicação" atômica — só quem muda status pra approved
      // (WHERE status <> 'approved') aplica o crédito, então duas
      // notificações simultâneas do mesmo pagamento nunca somam 2x.
      const agoraPro = new Date();
      const { data: reivindicado } = await supabase
        .from("pix_payments")
        .update({ status: "approved", applied_at: agoraPro.toISOString() })
        .eq("id", pixPayment.id)
        .neq("status", "approved")
        .select("id");

      if (reivindicado && reivindicado.length > 0 && pixPayment.ref_id) {
        const { data: bolao } = await supabase
          .from("boloes")
          .select("pro_ate")
          .eq("id", pixPayment.ref_id)
          .maybeSingle();
        if (!bolao) {
          after(() =>
            logError({
              source: "mercadopago_webhook",
              message: `Bolão ${pixPayment.ref_id} não existe mais (payment ${mpPaymentId})`,
            })
          );
        } else {
          const proAte = calcularProAte(bolao.pro_ate, agoraPro, pixPayment.period_days);
          await supabase.from("boloes").update({ pro_ate: proAte.toISOString() }).eq("id", pixPayment.ref_id);
        }
        after(() =>
          logToolEvent({
            eventName: "pix_payment_approved",
            tool: "bolao_pro",
            userId: pixPayment.user_id,
            metadata: { produto: "bolao_pro" },
          })
        );
      }
    } else if (pixPayment.status !== "approved") {
      // Idempotência: se já estava approved, não reaplica o crédito.
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan_expires_at")
        .eq("id", pixPayment.user_id)
        .single();

      const now = new Date();
      const expiraAtual = profile?.plan_expires_at ? new Date(profile.plan_expires_at) : now;
      const base = expiraAtual > now ? expiraAtual : now;
      const novaExpiracao = new Date(base.getTime() + pixPayment.period_days * 24 * 60 * 60 * 1000);

      await supabase
        .from("profiles")
        .update({ plan: "premium", plan_expires_at: novaExpiracao.toISOString() })
        .eq("id", pixPayment.user_id);

      await supabase
        .from("pix_payments")
        .update({ status: "approved", applied_at: now.toISOString() })
        .eq("id", pixPayment.id);

      after(() =>
        logToolEvent({
          eventName: "pix_payment_approved",
          tool: null,
          userId: pixPayment.user_id,
          plan: "premium",
        })
      );
    }
  } else if (STATUS_FINAIS_NAO_APROVADOS.has(mpPayment.status ?? "")) {
    // Reembolso de um pagamento já aprovado: devolve o crédito (Bolão Pro:
    // tira os dias do pro_ate; plano Premium: tira de plan_expires_at). A
    // reivindicação é atômica (só quem muda approved -> refunded revoga)
    // pra um reenvio da notificação nunca tirar 2x.
    if (mpPayment.status === "refunded") {
      const { data: revogado } = await supabase
        .from("pix_payments")
        .update({ status: "refunded" })
        .eq("mp_payment_id", mpPaymentId)
        .eq("status", "approved")
        .select("id, user_id, produto, ref_id, period_days");

      const pagamento = revogado?.[0];
      if (pagamento?.produto === "bolao_pro" && pagamento.ref_id) {
        const { data: bolao } = await supabase
          .from("boloes")
          .select("pro_ate")
          .eq("id", pagamento.ref_id)
          .maybeSingle();
        if (bolao) {
          const novo = revogarProAte(bolao.pro_ate, pagamento.period_days, new Date());
          await supabase
            .from("boloes")
            .update({ pro_ate: novo ? novo.toISOString() : null })
            .eq("id", pagamento.ref_id);
        }
        after(() =>
          logError({
            source: "mercadopago_webhook",
            message: `Bolão Pro revogado por reembolso (payment ${mpPaymentId}, bolão ${pagamento.ref_id})`,
          })
        );
      } else if (pagamento?.produto === "plano") {
        await revogarCreditoPix(pagamento.user_id, pagamento.period_days);
        after(() =>
          logError({
            source: "mercadopago_webhook",
            message: `Crédito Premium revogado por reembolso (payment ${mpPaymentId}, usuário ${pagamento.user_id})`,
          })
        );
      }
    }

    await supabase
      .from("pix_payments")
      .update({ status: mpPayment.status as string })
      .eq("mp_payment_id", mpPaymentId)
      .neq("status", mpPayment.status as string);
  }

  return NextResponse.json({ received: true });
}
