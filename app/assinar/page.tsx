import type { Metadata } from "next";
import Link from "next/link";
import Masthead from "@/components/Masthead";
import { createClient } from "@/lib/supabase/server";
import CheckoutButton from "@/components/auth/CheckoutButton";

export const metadata: Metadata = {
  title: "Assinar Premium — LotoAnalítica",
  description: "Acesse todas as ferramentas avançadas do LotoAnalítica sem anúncios.",
};

const PLANOS = [
  {
    id: "mensal",
    label: "Mensal",
    preco: "R$\u00a014,90",
    periodo: "/mês",
    stripePrice: process.env.NEXT_PUBLIC_STRIPE_PRICE_MENSAL ?? "",
    destaque: false,
    economia: null,
  },
  {
    id: "semestral",
    label: "Semestral",
    preco: "R$\u00a079,90",
    periodo: "/semestre",
    stripePrice: process.env.NEXT_PUBLIC_STRIPE_PRICE_SEMESTRAL ?? "",
    destaque: true,
    economia: "Equivale a R$13,32/mês — economize 11%",
  },
  {
    id: "anual",
    label: "Anual",
    preco: "R$\u00a0129,90",
    periodo: "/ano",
    stripePrice: process.env.NEXT_PUBLIC_STRIPE_PRICE_ANUAL ?? "",
    destaque: false,
    economia: "Equivale a R$10,83/mês — economize 27%",
  },
];

const BENEFICIOS = [
  "Rastreamento automático dos seus jogos após cada sorteio",
  "Alertas de acúmulo por e-mail personalizáveis",
  "Heatmap com todos os períodos comparáveis",
  "Gerador avançado com todos os filtros combinados",
  "Conferidor ilimitado com histórico salvo",
  "Simulador histórico com todo o acervo",
  "Relatório mensal em PDF com seus resultados",
  "Sem anúncios em nenhuma página",
  "Acesso antecipado a novas ferramentas",
];

export default async function AssinarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <>
      <Masthead />
      <main className="assinar-page">
        <div className="container">
          <div className="assinar-hero">
            <p className="eyebrow">LotoAnalítica Premium</p>
            <h1 className="assinar-titulo">
              Todas as ferramentas,<br />sem anúncios.
            </h1>
            <p className="assinar-subtitulo">
              Cancele quando quiser. Sem taxa de adesão.
            </p>
          </div>

          {/* ── Planos ────────────────────────────────────────────────── */}
          <div className="assinar-planos">
            {PLANOS.map((plano) => (
              <div
                key={plano.id}
                className={`assinar-plano-card ${plano.destaque ? "assinar-plano-card--destaque" : ""}`}
              >
                {plano.destaque && (
                  <span className="assinar-plano-badge">Mais popular</span>
                )}
                <p className="assinar-plano-label">{plano.label}</p>
                <p className="assinar-plano-preco">
                  {plano.preco}
                  <span className="assinar-plano-periodo">{plano.periodo}</span>
                </p>
                {plano.economia && (
                  <p className="assinar-plano-economia">{plano.economia}</p>
                )}
                <CheckoutButton
                  priceId={plano.stripePrice}
                  userId={user?.id}
                  destaque={plano.destaque}
                />
              </div>
            ))}
          </div>

          {/* ── Benefícios ────────────────────────────────────────────── */}
          <section className="assinar-beneficios">
            <h2 className="assinar-beneficios-titulo">O que está incluído</h2>
            <ul className="assinar-beneficios-lista">
              {BENEFICIOS.map((b) => (
                <li key={b} className="assinar-beneficio-item">
                  <span className="assinar-check">✓</span>
                  {b}
                </li>
              ))}
            </ul>
          </section>

          <p className="assinar-nota">
            Pagamento seguro via Stripe. Aceitamos cartão de crédito e débito.
            Ao assinar, você concorda com nossos{" "}
            <Link href="/termos" className="assinar-link">Termos de uso</Link>.
          </p>
        </div>
      </main>
    </>
  );
}
