import type { Metadata } from "next";
export const dynamic = "force-dynamic";

import Link from "next/link";
import Masthead from "@/components/Masthead";
import TelemetriaBeacon from "@/components/TelemetriaBeacon";
import { createClient } from "@/lib/supabase/server";
import CheckoutButton from "@/components/auth/CheckoutButton";
import PixCheckoutButton from "@/components/auth/PixCheckoutButton";
import { BOLAO_PRO_PIX, type PlanoPix } from "@/lib/mercadopago/planos";
import "./assinar-perfil.css";

export const metadata: Metadata = {
  title: "Assinar Premium — LotoAnalítica",
  description: "Acesse todas as ferramentas avançadas do LotoAnalítica sem anúncios.",
};

// O semestral deixou de ser vendido a novos clientes (quem já assina continua
// renovando normalmente pelo Stripe). Anual a R$99 é o plano em destaque.
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
    id: "anual",
    label: "Anual",
    preco: "R$\u00a099,00",
    periodo: "/ano",
    stripePrice: process.env.NEXT_PUBLIC_STRIPE_PRICE_ANUAL ?? "",
    destaque: true,
    economia: "Equivale a R$8,25/mês — economize 45%",
  },
];

const BENEFICIOS = [
  "Rastreamento automático dos seus jogos após cada sorteio",
  "Alertas de acúmulo por e-mail personalizáveis",
  "Heatmap com todos os períodos comparáveis",
  "Gerador avançado com todos os filtros combinados",
  "Conferidor ilimitado com histórico salvo",
  "Simulador histórico com todo o acervo",
  "Carteira do apostador — saldo real dos seus jogos salvos",
  "Exportação do histórico completo em CSV",
  "Relatório mensal em PDF com seus resultados",
  "Sem anúncios em nenhuma página",
  "Acesso antecipado a novas ferramentas",
];

// O /assinar tem dois perfis (?perfil=): quem aposta sozinho e quem organiza
// bolão de grupo. Os PLANOS e o checkout são os mesmos; muda a promessa, a
// ordem dos benefícios e, pro organizador, o aviso do Bolão Pro avulso.
// Tudo listado aqui existe de verdade (ver lib/bolao-limites.ts).
type Perfil = "apostador" | "organizador";

const BENEFICIOS_ORGANIZADOR = [
  "Bolão Pro em todos os seus bolões: até 100 cotas cada",
  "Vários bolões ativos ao mesmo tempo (no grátis é 1 por vez)",
  "Aviso do resultado por e-mail para os participantes que pedirem",
  "Foto do bilhete como comprovante, com conferência dos jogos",
  "Página pública do bolão sem anúncios",
  "Conferência e rateio por cota automáticos depois do sorteio",
  "Tudo do Premium: rastreamento dos seus jogos, alertas de acúmulo e sem anúncios no site",
];

function perfilDaUrl(valor: string | undefined): Perfil {
  return valor === "organizador" ? "organizador" : "apostador";
}

export default async function AssinarPage({
  searchParams,
}: {
  searchParams: Promise<{ perfil?: string }>;
}) {
  const perfil = perfilDaUrl((await searchParams).perfil);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Trial de 7 dias só pra quem nunca assinou antes — quem não está logado
  // ainda não tem como ter usado, então mostramos a oferta por padrão.
  let elegivelParaTrial = true;
  if (user) {
    const { data: assinaturaAnterior } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();
    elegivelParaTrial = !assinaturaAnterior;
  }

  return (
    <>
      <TelemetriaBeacon eventName="pricing_view" tool="assinar" metadata={{ perfil }} />
      <Masthead />
      <main className="assinar-page">
        <div className="container">
          <nav className="assinar-perfis" aria-label="Perfil">
            <Link
              href="/assinar?perfil=apostador"
              className={`assinar-perfil-tab ${perfil === "apostador" ? "assinar-perfil-tab--ativo" : ""}`}
              aria-current={perfil === "apostador" ? "page" : undefined}
            >
              Sou apostador
            </Link>
            <Link
              href="/assinar?perfil=organizador"
              className={`assinar-perfil-tab ${perfil === "organizador" ? "assinar-perfil-tab--ativo" : ""}`}
              aria-current={perfil === "organizador" ? "page" : undefined}
            >
              Organizo bolão
            </Link>
          </nav>

          <div className="assinar-hero">
            <p className="eyebrow">LotoAnalítica Premium</p>
            <h1 className="assinar-titulo">
              {perfil === "organizador" ? (
                <>
                  Bolão do grupo,<br />sem dor de cabeça.
                </>
              ) : (
                <>
                  Todas as ferramentas,<br />sem anúncios.
                </>
              )}
            </h1>
            <p className="assinar-subtitulo">
              {elegivelParaTrial
                ? "7 dias grátis para testar. Cancele quando quiser, sem taxa de adesão."
                : "Cancele quando quiser. Sem taxa de adesão."}
            </p>
          </div>

          {perfil === "organizador" && (
            <section className="assinar-avulso">
              <h2 className="assinar-avulso__titulo">Só precisa de um bolão? Bolão Pro avulso</h2>
              <p className="assinar-avulso__texto">
                R$&nbsp;{BOLAO_PRO_PIX.amount.toFixed(2).replace(".", ",")} por bolão, por {BOLAO_PRO_PIX.periodDays} dias,
                pago por Pix dentro do próprio bolão — sem assinatura. Monte o bolão grátis e libere o Pro quando
                precisar de mais de 10 cotas, dos avisos por e-mail ou da foto do bilhete.
              </p>
              <div className="assinar-avulso__acoes">
                <Link href="/megasena/bolao" className="botao-gerar">Montar um bolão →</Link>
                <Link href="/conta/boloes" className="botao-copiar">Meus bolões</Link>
              </div>
              <p className="assinar-avulso__texto">
                Organiza bolões com frequência? O Premium abaixo inclui o Bolão Pro em todos eles.
              </p>
            </section>
          )}

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
                {elegivelParaTrial && (
                  <p className="assinar-plano-economia">
                    7 dias grátis, depois {plano.preco}{plano.periodo}
                  </p>
                )}
                <CheckoutButton
                  priceId={plano.stripePrice}
                  userId={user?.id}
                  destaque={plano.destaque}
                  trial={elegivelParaTrial}
                />
                <PixCheckoutButton plano={plano.id as PlanoPix} userId={user?.id} />
              </div>
            ))}
          </div>

          {/* ── Benefícios ────────────────────────────────────────────── */}
          <section className="assinar-beneficios">
            <h2 className="assinar-beneficios-titulo">O que está incluído</h2>
            <ul className="assinar-beneficios-lista">
              {(perfil === "organizador" ? BENEFICIOS_ORGANIZADOR : BENEFICIOS).map((b) => (
                <li key={b} className="assinar-beneficio-item">
                  <span className="assinar-check">✓</span>
                  {b}
                </li>
              ))}
            </ul>
          </section>

          <p className="assinar-nota">
            Pagamento seguro via Stripe. Aceitamos cartão de crédito e débito.
            {elegivelParaTrial && " O cartão só é cobrado após os 7 dias de teste — cancele antes disso e não paga nada."}
            {" "}Também aceitamos Pix via Mercado Pago — o acesso Premium é liberado assim que o pagamento é confirmado.
            {" "}Ao assinar, você concorda com nossos{" "}
            <Link href="/termos" className="assinar-link">Termos de uso</Link> e{" "}
            <Link href="/privacidade" className="assinar-link">Política de Privacidade</Link>.
          </p>
        </div>
      </main>
    </>
  );
}
