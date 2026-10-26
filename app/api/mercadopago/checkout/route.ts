import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { after } from "next/server";
import { PLANOS_PIX, BOLAO_PRO_PIX, isPlanoPix } from "@/lib/mercadopago/planos";
import { calcularIsPremium } from "@/lib/plano-premium";
import { logToolEvent } from "@/lib/telemetry";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  if (!user.email) {
    return NextResponse.json({ error: "Conta sem e-mail cadastrado" }, { status: 400 });
  }

  const { plano, produto, bolaoId } = await request.json();
  const ehBolaoPro = produto === "bolao_pro";

  if (ehBolaoPro) {
    // Bolão Pro: o servidor confere que o bolão é DESTE usuário e ainda não
    // foi conferido — o client só informa o id, nunca o valor.
    if (typeof bolaoId !== "string") {
      return NextResponse.json({ error: "Bolão inválido" }, { status: 400 });
    }
    const adminCheck = createAdminClient();
    const { data: bolao } = await adminCheck
      .from("boloes")
      .select("id, status")
      .eq("id", bolaoId)
      .eq("owner_id", user.id)
      .maybeSingle();
    if (!bolao) return NextResponse.json({ error: "Bolão não encontrado" }, { status: 404 });
    if (bolao.status === "conferido") {
      return NextResponse.json({ error: "Este bolão já foi conferido" }, { status: 400 });
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, plan_expires_at")
      .eq("id", user.id)
      .single();
    if (calcularIsPremium(profile)) {
      return NextResponse.json({ error: "Sua conta Premium já inclui o Bolão Pro" }, { status: 400 });
    }
  } else if (!isPlanoPix(plano)) {
    return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
  }

  const configPlano = ehBolaoPro ? BOLAO_PRO_PIX : PLANOS_PIX[plano as keyof typeof PLANOS_PIX];
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lotoanalitica.com.br";

  // Instanciar dentro da função — evita erro no build quando a env não está disponível
  const mpClient = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });
  const payment = new Payment(mpClient);

  let result;
  try {
    result = await payment.create({
      body: {
        transaction_amount: configPlano.amount,
        description: ehBolaoPro ? "LotoAnalítica — Bolão Pro" : `LotoAnalítica Premium — plano ${configPlano.label}`,
        payment_method_id: "pix",
        payer: { email: user.email },
        // Bolão Pro: "bolao_pro:<id do bolão>" só pra rastreio no painel do
        // MP — a regra de crédito sempre vem de pix_payments (produto/ref_id).
        external_reference: ehBolaoPro ? `bolao_pro:${bolaoId}` : user.id,
        notification_url: `${baseUrl}/api/mercadopago/webhook`,
      },
      requestOptions: { idempotencyKey: randomUUID() },
    });
  } catch (err) {
    console.error("Erro ao criar pagamento Pix no Mercado Pago:", err);
    return NextResponse.json({ error: "Não foi possível iniciar o pagamento Pix" }, { status: 502 });
  }

  const transactionData = result.point_of_interaction?.transaction_data;

  if (!result.id || !transactionData?.qr_code || !transactionData?.qr_code_base64) {
    console.error("Resposta do Mercado Pago sem dados de QR code Pix:", result);
    return NextResponse.json({ error: "Pagamento criado sem QR code" }, { status: 502 });
  }

  // Grava a linha "pending" com o service role — a policy de RLS de
  // pix_payments só permite SELECT (auth.uid() = user_id) ao usuário, então a
  // criação/atualização dessa tabela é sempre feita pelo lado do servidor.
  const admin = createAdminClient();
  const { error: insertError } = await admin.from("pix_payments").insert({
    user_id: user.id,
    mp_payment_id: String(result.id),
    ...(ehBolaoPro ? { produto: "bolao_pro", ref_id: bolaoId, plano: null } : { plano }),
    amount_cents: Math.round(configPlano.amount * 100),
    status: "pending",
    period_days: configPlano.periodDays,
  });

  if (insertError) {
    console.error("Erro ao salvar pix_payments:", insertError);
    return NextResponse.json({ error: "Não foi possível registrar o pagamento" }, { status: 500 });
  }

  if (ehBolaoPro) {
    after(() =>
      logToolEvent({
        eventName: "checkout_started",
        tool: "bolao_pro",
        userId: user.id,
        metadata: { produto: "bolao_pro" },
      })
    );
  }

  return NextResponse.json({
    qrCode: transactionData.qr_code,
    qrCodeBase64: transactionData.qr_code_base64,
    paymentId: String(result.id),
  });
}
