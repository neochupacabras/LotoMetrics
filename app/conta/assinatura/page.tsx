export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PortalStripeButton from "@/components/conta/PortalStripeButton";
import { CabecalhoPagina } from "@/components/membros/MembrosShell";
import { formatarDataLonga, getContaContexto } from "@/lib/conta/contexto";

export const metadata: Metadata = {
  title: "Minha assinatura — LotoAnalítica",
  robots: { index: false, follow: false },
};

export default async function AssinaturaPage() {
  const contexto = await getContaContexto();
  if (!contexto) redirect("/entrar?next=/conta/assinatura");
  const { isPremium, userId, email, premiumAte } = contexto;

  const supabase = await createClient();
  const [{ data: profile }, { data: sub }] = await Promise.all([
    supabase.from("profiles").select("stripe_customer_id").eq("id", userId).single(),
    supabase
      .from("subscriptions")
      .select("status, stripe_price_id, current_period_end, canceled_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const renovaEm = sub?.current_period_end ? formatarDataLonga(sub.current_period_end) : null;

  const statusLabel: Record<string, string> = {
    active:    "Ativa",
    trialing:  "Em teste",
    past_due:  "Pagamento pendente",
    canceled:  "Cancelada",
    incomplete: "Incompleta",
  };

  // Stripe só conta quando a assinatura ainda está valendo. Sem ela, o
  // Premium vem de crédito avulso (Pix) e a data que vale é a do perfil —
  // antes esta página não mostrava vencimento nenhum para quem pagou por Pix.
  const stripeVigente = !!sub && ["active", "trialing", "past_due"].includes(sub.status);

  return (
    <>
      <CabecalhoPagina
        titulo="Assinatura"
        descricao="Seu plano, a validade do acesso e como gerenciar o pagamento."
      />

      {!isPremium ? (
        <div className="conta-jogos-vazio">
          <p>Você não tem uma assinatura Premium ativa.</p>
          <Link href="/assinar" className="m-botao" style={{ marginTop: 16 }}>
            Ver planos
          </Link>
        </div>
      ) : (
        <div className="assinatura-card">
          <div className="assinatura-card__linha">
            <span className="assinatura-card__rotulo">Status</span>
            <span className="assinatura-card__valor assinatura-card__valor--destaque">
              {stripeVigente ? statusLabel[sub.status] ?? sub.status : "Premium ativo"}
            </span>
          </div>

          <div className="assinatura-card__linha">
            <span className="assinatura-card__rotulo">Forma de pagamento</span>
            <span className="assinatura-card__valor">
              {stripeVigente ? "Cartão (renovação automática)" : "Pix (crédito avulso)"}
            </span>
          </div>

          {stripeVigente && renovaEm ? (
            <div className="assinatura-card__linha">
              <span className="assinatura-card__rotulo">
                {sub.canceled_at ? "Acesso até" : "Próxima renovação"}
              </span>
              <span className="assinatura-card__valor">{renovaEm}</span>
            </div>
          ) : premiumAte ? (
            <div className="assinatura-card__linha">
              <span className="assinatura-card__rotulo">Acesso até</span>
              <span className="assinatura-card__valor">{formatarDataLonga(premiumAte)}</span>
            </div>
          ) : null}

          <div className="assinatura-card__linha">
            <span className="assinatura-card__rotulo">E-mail</span>
            <span className="assinatura-card__valor">{email}</span>
          </div>

          <div className="assinatura-card__acoes">
            {profile?.stripe_customer_id && <PortalStripeButton />}
            {!stripeVigente && (
              <Link href="/assinar" className="m-botao m-botao--secundario">
                Renovar ou estender
              </Link>
            )}
          </div>

          <p className="assinatura-card__nota">
            {stripeVigente
              ? "Para cancelar, trocar de plano ou atualizar o cartão, use o portal de gerenciamento acima. O acesso Premium permanece ativo até o fim do período já pago."
              : "O Pix não renova sozinho: perto do vencimento, é só pagar um novo período — os dias são somados ao que ainda resta."}
          </p>
        </div>
      )}
    </>
  );
}
