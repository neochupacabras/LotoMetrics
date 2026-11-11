import { createClient } from "@/lib/supabase/server";

// Resumo da assinatura para o Painel e para /conta/assinatura — mesma regra
// nos dois lugares. O Premium pode vir de duas fontes que convivem
// (lib/plano.ts, atualizarPlanoRespeitandoCredito):
//  - Stripe (cartão, recorrente): vale a assinatura mais recente se ainda
//    estiver vigente; a data é current_period_end;
//  - Pix (crédito avulso): sem assinatura vigente, a data que vale é
//    profiles.plan_expires_at (premiumAte no contexto).
//
// Tudo lido com o client da sessão: subscriptions e pix_payments têm RLS
// "dono lê as próprias linhas" e escrita só por service role
// (20261029000000_least_privilege_tabelas_legadas.sql).

const STATUS_VIGENTES = ["active", "trialing", "past_due"];

const ROTULO_STATUS: Record<string, string> = {
  active: "Ativa",
  trialing: "Em teste",
  past_due: "Pagamento pendente",
  canceled: "Cancelada",
  incomplete: "Incompleta",
};

const ROTULO_STATUS_PIX: Record<string, string> = {
  pending: "Aguardando pagamento",
  approved: "Aprovado",
  rejected: "Recusado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

export type Periodicidade = "mensal" | "anual";

export interface PagamentoPix {
  id: string;
  criadoEm: string;
  descricao: string; // "Premium anual", "Bolão Pro"
  valorCents: number;
  status: string; // rótulo pronto
  aprovado: boolean;
}

export interface ResumoAssinatura {
  origem: "stripe" | "pix" | null; // null = plano gratuito
  status: string; // rótulo pronto para exibir
  pendente: boolean; // past_due: pagamento do cartão falhou
  // Data relevante e o que ela significa.
  dataIso: string | null;
  rotuloData: "Próxima renovação" | "Acesso até" | null;
  temClienteStripe: boolean;
  periodicidade: Periodicidade | null;
  // Primeiro pagamento confirmado (assinatura Stripe criada ou Pix de plano
  // aprovado). null se não houver registro.
  assinanteDesde: string | null;
  // Plano gratuito que já foi Premium: quando o acesso terminou.
  premiumTerminouEm: string | null;
  pagamentosPix: PagamentoPix[];
}

// O price do Stripe diz se é mensal ou anual (as mesmas envs usadas no
// checkout — app/api/stripe/checkout/route.ts).
function periodicidadeStripe(priceId: string | null | undefined): Periodicidade | null {
  if (!priceId) return null;
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_MENSAL) return "mensal";
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ANUAL) return "anual";
  return null;
}

function descricaoPix(produto: string | null, plano: string | null): string {
  if (produto === "bolao_pro") return "Bolão Pro";
  if (plano === "anual") return "Premium anual";
  if (plano === "semestral") return "Premium semestral";
  if (plano === "mensal") return "Premium mensal";
  return "Premium";
}

export async function carregarResumoAssinatura(
  userId: string,
  isPremium: boolean,
  premiumAte: string | null
): Promise<ResumoAssinatura> {
  const supabase = await createClient();
  const [{ data: profile }, { data: subs }, { data: pix }] = await Promise.all([
    supabase.from("profiles").select("stripe_customer_id, plan_expires_at").eq("id", userId).single(),
    supabase
      .from("subscriptions")
      .select("status, stripe_price_id, current_period_end, canceled_at, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("pix_payments")
      .select("id, produto, plano, amount_cents, status, created_at, applied_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(12),
  ]);

  const sub = subs?.[0];
  const pagamentos = pix ?? [];
  const temClienteStripe = !!profile?.stripe_customer_id;

  const pagamentosPix: PagamentoPix[] = pagamentos.map((p) => ({
    id: p.id,
    criadoEm: p.created_at,
    descricao: descricaoPix(p.produto, p.plano),
    valorCents: p.amount_cents,
    status: ROTULO_STATUS_PIX[p.status] ?? p.status,
    aprovado: p.status === "approved",
  }));

  const inicios = [
    ...(subs ?? []).map((s) => s.created_at as string),
    ...pagamentos
      .filter((p) => p.status === "approved" && p.produto !== "bolao_pro")
      .map((p) => (p.applied_at ?? p.created_at) as string),
  ].sort();
  const assinanteDesde = inicios[0] ?? null;

  const ultimoPixPlano = pagamentos.find((p) => p.status === "approved" && p.produto !== "bolao_pro");

  if (!isPremium) {
    // Já foi Premium e venceu? (plan_expires_at no passado.)
    const expirou = profile?.plan_expires_at && new Date(profile.plan_expires_at) <= new Date();
    return {
      origem: null,
      status: "Gratuito",
      pendente: false,
      dataIso: null,
      rotuloData: null,
      temClienteStripe,
      periodicidade: null,
      assinanteDesde: null,
      premiumTerminouEm: expirou ? profile.plan_expires_at : null,
      pagamentosPix,
    };
  }

  if (sub && STATUS_VIGENTES.includes(sub.status)) {
    return {
      origem: "stripe",
      status: ROTULO_STATUS[sub.status] ?? sub.status,
      pendente: sub.status === "past_due",
      dataIso: sub.current_period_end ?? null,
      rotuloData: sub.current_period_end ? (sub.canceled_at ? "Acesso até" : "Próxima renovação") : null,
      temClienteStripe,
      periodicidade: periodicidadeStripe(sub.stripe_price_id),
      assinanteDesde,
      premiumTerminouEm: null,
      pagamentosPix,
    };
  }

  return {
    origem: "pix",
    status: "Ativo",
    pendente: false,
    dataIso: premiumAte,
    rotuloData: premiumAte ? "Acesso até" : null,
    temClienteStripe,
    periodicidade: ultimoPixPlano?.plano === "anual" ? "anual" : ultimoPixPlano?.plano === "mensal" ? "mensal" : null,
    assinanteDesde,
    premiumTerminouEm: null,
    pagamentosPix,
  };
}
