import { createAdminClient } from "@/lib/supabase/server";
import { resolverPrecos } from "@/lib/admin/precos";
import type { Periodo } from "@/lib/admin/periodo";

// Fase 5 do Admin — MRR/ARR/churn calculados a partir de subscriptions +
// preço resolvido via Stripe (lib/admin/precos.ts). MRR só conta status
// 'active' — 'trialing' ainda não gerou nenhuma cobrança real (prática
// padrão de SaaS), por isso nunca entra na soma, só é contado à parte como
// "em trial".

export interface PlanoMrr {
  priceId: string;
  intervalo: string | null;
  assinantes: number;
  mrrCentavos: number;
}

export interface MrrAtual {
  mrrCentavos: number;
  arrCentavos: number;
  assinantesAtivos: number;
  assinantesTrial: number;
  assinantesNaoIdentificados: number;
  porPlano: PlanoMrr[];
}

export async function getMrrAtual(): Promise<MrrAtual> {
  const supabase = createAdminClient();

  const [{ data: ativos }, { count: trialCount }] = await Promise.all([
    supabase.from("subscriptions").select("stripe_price_id").eq("status", "active"),
    supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "trialing"),
  ]);

  const priceIds = (ativos ?? []).map((r) => r.stripe_price_id).filter((p): p is string => !!p);
  const mapaPrecos = await resolverPrecos(priceIds);

  const porPlanoMap = new Map<string, PlanoMrr>();
  let naoIdentificados = 0;
  for (const priceId of priceIds) {
    const info = mapaPrecos.get(priceId);
    if (!info) {
      naoIdentificados++;
      continue;
    }
    const entry = porPlanoMap.get(priceId) ?? { priceId, intervalo: info.intervalo, assinantes: 0, mrrCentavos: 0 };
    entry.assinantes++;
    entry.mrrCentavos += info.valorMensalizadoCentavos;
    porPlanoMap.set(priceId, entry);
  }

  const porPlano = Array.from(porPlanoMap.values()).sort((a, b) => b.mrrCentavos - a.mrrCentavos);
  const mrrCentavos = porPlano.reduce((s, p) => s + p.mrrCentavos, 0);

  return {
    mrrCentavos,
    arrCentavos: mrrCentavos * 12,
    assinantesAtivos: priceIds.length,
    assinantesTrial: trialCount ?? 0,
    assinantesNaoIdentificados: naoIdentificados,
    porPlano,
  };
}

export interface SaudePagamentos {
  pastDue: number;
  status: "healthy" | "warning";
}

// invoice.payment_failed marca status='past_due' sem derrubar o plano
// (carência intencional, ver docs/ADMIN_AUDIT.md seção 10) — mas isso
// significa que hoje nada no produto avisa visivelmente sobre pagamento
// pendente além de um texto genérico. Esta é a primeira visibilidade disso.
export async function getSaudePagamentos(): Promise<SaudePagamentos> {
  const supabase = createAdminClient();
  const { count } = await supabase
    .from("subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("status", "past_due");
  const pastDue = count ?? 0;
  return { pastDue, status: pastDue > 0 ? "warning" : "healthy" };
}

export interface ReceitaPeriodo {
  novasAssinaturas: number; // toda subscription criada no período, qualquer status (inclui trial)
  novasEmTrial: number;
  novaMrrCentavos: number; // só as que JÁ estão 'active' agora — trial não convertido não conta
  novaMrrNaoIdentificados: number;
  canceladas: number;
  mrrCanceladaCentavos: number;
  mrrCanceladaNaoIdentificados: number;
}

export async function getReceitaPeriodo(periodo: Periodo): Promise<ReceitaPeriodo> {
  const supabase = createAdminClient();
  const fromIso = periodo.from.toISOString();
  const toIso = periodo.to.toISOString();

  const [{ data: novasRaw }, { data: canceladasRaw }] = await Promise.all([
    supabase.from("subscriptions").select("stripe_price_id, status").gte("created_at", fromIso).lt("created_at", toIso),
    supabase
      .from("subscriptions")
      .select("stripe_price_id")
      .eq("status", "canceled")
      .gte("canceled_at", fromIso)
      .lt("canceled_at", toIso),
  ]);

  const novas = novasRaw ?? [];
  const canceladas = canceladasRaw ?? [];

  const ativasDoPeriodo = novas.filter((r) => r.status === "active");
  const trialDoPeriodo = novas.filter((r) => r.status === "trialing");

  const todosPriceIds = [
    ...ativasDoPeriodo.map((r) => r.stripe_price_id),
    ...canceladas.map((r) => r.stripe_price_id),
  ].filter((p): p is string => !!p);
  const mapaPrecos = await resolverPrecos(todosPriceIds);

  function somar(precoIds: (string | null)[]) {
    let total = 0;
    let naoId = 0;
    for (const priceId of precoIds) {
      const info = priceId ? mapaPrecos.get(priceId) : null;
      if (!info) {
        naoId++;
        continue;
      }
      total += info.valorMensalizadoCentavos;
    }
    return { total, naoId };
  }

  const novaMrr = somar(ativasDoPeriodo.map((r) => r.stripe_price_id));
  const mrrCancelada = somar(canceladas.map((r) => r.stripe_price_id));

  return {
    novasAssinaturas: novas.length,
    novasEmTrial: trialDoPeriodo.length,
    novaMrrCentavos: novaMrr.total,
    novaMrrNaoIdentificados: novaMrr.naoId,
    canceladas: canceladas.length,
    mrrCanceladaCentavos: mrrCancelada.total,
    mrrCanceladaNaoIdentificados: mrrCancelada.naoId,
  };
}
