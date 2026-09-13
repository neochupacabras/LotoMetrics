import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// Endpoint de polling do modal de Pix — consulta só pix_payments.status no
// Supabase (não chama a API do Mercado Pago de novo). O status autoritativo
// é sempre escrito pelo webhook (app/api/mercadopago/webhook/route.ts).
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  const { paymentId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("pix_payments")
    .select("status")
    .eq("mp_payment_id", paymentId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Erro ao consultar status do pagamento Pix:", error);
    return NextResponse.json({ error: "Erro ao consultar pagamento" }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Pagamento não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ status: data.status });
}
