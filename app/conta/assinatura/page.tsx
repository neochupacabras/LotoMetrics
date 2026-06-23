export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Masthead from "@/components/Masthead";
import { createClient } from "@/lib/supabase/server";
import PortalStripeButton from "@/components/conta/PortalStripeButton";

export const metadata: Metadata = {
  title: "Minha assinatura — LotoAnalítica",
  robots: { index: false, follow: false },
};

export default async function AssinaturaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/entrar?next=/conta/assinatura");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, plan_expires_at, stripe_customer_id")
    .eq("id", user.id)
    .single();

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("status, stripe_price_id, current_period_end, canceled_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const isPremium =
    profile?.plan === "premium" &&
    (!profile.plan_expires_at || new Date(profile.plan_expires_at) > new Date());

  const renovaEm = sub?.current_period_end
    ? new Date(sub.current_period_end).toLocaleDateString("pt-BR", {
        day: "numeric", month: "long", year: "numeric",
      })
    : null;

  const statusLabel: Record<string, string> = {
    active:    "Ativa",
    trialing:  "Em teste",
    past_due:  "Pagamento pendente",
    canceled:  "Cancelada",
    incomplete: "Incompleta",
  };

  return (
    <>
      <Masthead />
      <main className="conta-page container">
        <div className="conta-header">
          <div>
            <Link href="/conta" className="conta-voltar">← Minha conta</Link>
            <h1 className="conta-titulo">Minha assinatura</h1>
          </div>
        </div>

        {!isPremium ? (
          <div className="conta-jogos-vazio">
            <p>Você não tem uma assinatura Premium ativa.</p>
            <Link href="/assinar" className="botao-gerar" style={{ marginTop: 16, display: "inline-block" }}>
              Ver planos →
            </Link>
          </div>
        ) : (
          <div className="assinatura-card">
            <div className="assinatura-card__linha">
              <span className="assinatura-card__rotulo">Status</span>
              <span className="assinatura-card__valor assinatura-card__valor--destaque">
                ✦ {sub?.status ? statusLabel[sub.status] ?? sub.status : "Premium"}
              </span>
            </div>

            {renovaEm && (
              <div className="assinatura-card__linha">
                <span className="assinatura-card__rotulo">
                  {sub?.canceled_at ? "Acesso até" : "Próxima renovação"}
                </span>
                <span className="assinatura-card__valor">{renovaEm}</span>
              </div>
            )}

            <div className="assinatura-card__linha">
              <span className="assinatura-card__rotulo">E-mail</span>
              <span className="assinatura-card__valor">{user.email}</span>
            </div>

            <div className="assinatura-card__acoes">
              {profile?.stripe_customer_id && (
                <PortalStripeButton customerId={profile.stripe_customer_id} />
              )}
            </div>

            <p className="assinatura-card__nota">
              Para cancelar, trocar de plano ou atualizar o cartão, use o portal
              de gerenciamento acima. O acesso Premium permanece ativo até o fim
              do período já pago.
            </p>
          </div>
        )}
      </main>
    </>
  );
}
