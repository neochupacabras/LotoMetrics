import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { PLANOS_PIX, isPlanoPix } from "@/lib/mercadopago/planos";

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

  const { plano } = await request.json();
  if (!isPlanoPix(plano)) {
    return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
  }

  const configPlano = PLANOS_PIX[plano];
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lotoanalitica.com.br";

  // Instanciar dentro da função — evita erro no build quando a env não está disponível
  const mpClient = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });
  const payment = new Payment(mpClient);

  let result;
  try {
    result = await payment.create({
      body: {
        transaction_amount: configPlano.amount,
        description: `LotoAnalítica Premium — plano ${configPlano.label}`,
        payment_method_id: "pix",
        payer: { email: user.email },
        external_reference: user.id,
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
    plano,
    amount_cents: Math.round(configPlano.amount * 100),
    status: "pending",
    period_days: configPlano.periodDays,
  });

  if (insertError) {
    console.error("Erro ao salvar pix_payments:", insertError);
    return NextResponse.json({ error: "Não foi possível registrar o pagamento" }, { status: 500 });
  }

  return NextResponse.json({
    qrCode: transactionData.qr_code,
    qrCodeBase64: transactionData.qr_code_base64,
    paymentId: String(result.id),
  });
}
