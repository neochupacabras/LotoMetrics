import Stripe from "stripe";

// Fase 5 do Admin (docs/ADMIN_AUDIT.md): calcular MRR/ARR exige saber o
// VALOR de cada stripe_price_id, que `subscriptions` não guarda (achado da
// auditoria) e os preços reais (NEXT_PUBLIC_STRIPE_PRICE_*) só existem como
// segredo no ambiente da Vercel — não numa tabela local nem em nenhum
// arquivo deste repo. Em vez de manter uma tabela de referência que
// precisaria ser sincronizada manualmente toda vez que um preço mudar,
// resolve cada price_id sob demanda direto na API do Stripe (a mesma
// credencial que checkout/webhook já usam) e guarda em cache de processo —
// só existem 3 preços hoje, então isso é upar poucas chamadas, não uma
// dependência pesada em tempo real por tela.
//
// Se a API do Stripe falhar, o preço fica "não identificado" — nunca
// silenciosamente contado como R$ 0 (isso inflaria falsamente uma queda de
// MRR).

export interface InfoPreco {
  priceId: string;
  valorCentavos: number;
  moeda: string;
  intervalo: string; // "day" | "week" | "month" | "year"
  intervalCount: number;
  valorMensalizadoCentavos: number;
}

const cache = new Map<string, InfoPreco | null>();

function mesesEquivalentes(intervalo: string, intervalCount: number): number {
  switch (intervalo) {
    case "year":
      return 12 * intervalCount;
    case "month":
      return intervalCount;
    case "week":
      return (intervalCount * 7) / 30.44;
    case "day":
      return intervalCount / 30.44;
    default:
      return intervalCount;
  }
}

export async function getInfoPreco(priceId: string): Promise<InfoPreco | null> {
  if (cache.has(priceId)) return cache.get(priceId) ?? null;

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-06-24.dahlia" });
    const price = await stripe.prices.retrieve(priceId);
    if (price.unit_amount == null || !price.recurring) {
      cache.set(priceId, null);
      return null;
    }
    const meses = mesesEquivalentes(price.recurring.interval, price.recurring.interval_count);
    const info: InfoPreco = {
      priceId,
      valorCentavos: price.unit_amount,
      moeda: price.currency,
      intervalo: price.recurring.interval,
      intervalCount: price.recurring.interval_count,
      valorMensalizadoCentavos: Math.round(price.unit_amount / meses),
    };
    cache.set(priceId, info);
    return info;
  } catch (err) {
    console.error("getInfoPreco falhou para", priceId, (err as Error).message);
    cache.set(priceId, null);
    return null;
  }
}

export async function resolverPrecos(priceIds: string[]): Promise<Map<string, InfoPreco | null>> {
  const unicos = Array.from(new Set(priceIds));
  const resolvidos = await Promise.all(unicos.map((id) => getInfoPreco(id)));
  return new Map(unicos.map((id, i) => [id, resolvidos[i]]));
}

export function formatarCentavos(centavos: number, moeda = "brl"): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: moeda.toUpperCase() }).format(centavos / 100);
}
