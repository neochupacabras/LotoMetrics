import { createClient } from "@/lib/supabase/server";

// Resumo da assinatura para o Painel e para /conta/assinatura — mesma regra
// nos dois lugares. O Premium pode vir de duas fontes que convivem
// (lib/plano.ts, atualizarPlanoRespeitandoCredito):
//  - Stripe (cartão, recorrente): vale a assinatura mais recente se ainda
//    estiver vigente; a data é current_period_end;
//  - Pix (crédito avulso): sem assinatura vigente, a data que vale é
//    profiles.plan_expires_at (premiumAte no contexto).

const STATUS_VIGENTES = ["active", "trialing", "past_due"];

const ROTULO_STATUS: Record<string, string> = {
  active: "Ativa",
  trialing: "Em teste",
  past_due: "Pagamento pendente",
  canceled: "Cancelada",
  incomplete: "Incompleta",
};

export interface ResumoAssinatura {
  origem: "stripe" | "pix" | null; // null = plano gratuito
  status: string; // rótulo pronto para exibir
  pendente: boolean; // past_due: pagamento do cartão falhou
  // Data relevante e o que ela significa.
  dataIso: string | null;
  rotuloData: "Próxima renovação" | "Acesso até" | null;
  temClienteStripe: boolean;
}

export async function carregarResumoAssinatura(
  userId: string,
  isPremium: boolean,
  premiumAte: string | null
): Promise<ResumoAssinatura> {
  const supabase = await createClient();
  const [{ data: profile }, { data: sub }] = await Promise.all([
    supabase.from("profiles").select("stripe_customer_id").eq("id", userId).single(),
    supabase
      .from("subscriptions")
      .select("status, current_period_end, canceled_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const temClienteStripe = !!profile?.stripe_customer_id;

  if (!isPremium) {
    return { origem: null, status: "Gratuito", pendente: false, dataIso: null, rotuloData: null, temClienteStripe };
  }

  if (sub && STATUS_VIGENTES.includes(sub.status)) {
    return {
      origem: "stripe",
      status: ROTULO_STATUS[sub.status] ?? sub.status,
      pendente: sub.status === "past_due",
      dataIso: sub.current_period_end ?? null,
      rotuloData: sub.current_period_end ? (sub.canceled_at ? "Acesso até" : "Próxima renovação") : null,
      temClienteStripe,
    };
  }

  return {
    origem: "pix",
    status: "Ativo",
    pendente: false,
    dataIso: premiumAte,
    rotuloData: premiumAte ? "Acesso até" : null,
    temClienteStripe,
  };
}
