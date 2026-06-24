import type { Metadata } from "next";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import Masthead from "@/components/Masthead";
import AlertasForm from "@/components/conta/AlertasForm";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth-actions";

export const metadata: Metadata = {
  title: "Minha conta — LotoAnalítica",
  robots: { index: false, follow: false },
};

function formatarDezena(n: number) {
  return String(n).padStart(2, "0");
}

export default async function ContaPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/entrar?next=/conta");

  const { checkout } = await searchParams;

  const [profileRes, jogosRes, alertasRes] = await Promise.all([
    supabase.from("profiles").select("display_name, plan, plan_expires_at, stripe_customer_id").eq("id", user.id).single(),
    supabase.from("user_games").select("id, loteria, dezenas, label, ativo").eq("user_id", user.id).eq("ativo", true).order("created_at", { ascending: false }).limit(3),
    supabase.from("alert_preferences").select("loteria, threshold_brl, sorteios_sem_ganhador, ativo").eq("user_id", user.id),
  ]);

  const profile = profileRes.data;
  const jogos = jogosRes.data ?? [];
  const alertas = alertasRes.data ?? [];

  const isPremium =
    profile?.plan === "premium" &&
    (!profile.plan_expires_at || new Date(profile.plan_expires_at) > new Date());

  const expiresAt = profile?.plan_expires_at
    ? new Date(profile.plan_expires_at).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <>
      <Masthead />
      <main className="conta-page container">

        {checkout === "sucesso" && (
          <div className="conta-checkout-sucesso">
            ✦ Assinatura confirmada! Bem-vindo ao Premium.
          </div>
        )}

        <div className="conta-header">
          <div>
            <h1 className="conta-titulo">
              Olá, {profile?.display_name ?? user.email?.split("@")[0]}
            </h1>
            <p className="conta-email">{user.email}</p>
          </div>
          <form action={signOut}>
            <button type="submit" className="conta-sair-btn">Sair</button>
          </form>
        </div>

        {/* ── Plano ──────────────────────────────────────────────────── */}
        <section className="conta-secao">
          <h2 className="conta-secao-titulo">Seu plano</h2>
          <div className={`conta-plano-card ${isPremium ? "conta-plano-card--premium" : ""}`}>
            <div>
              <p className="conta-plano-nome">{isPremium ? "✦ Premium" : "Gratuito"}</p>
              {isPremium && expiresAt && <p className="conta-plano-validade">Válido até {expiresAt}</p>}
              {!isPremium && <p className="conta-plano-desc">Salve jogos e receba alertas — sempre grátis.</p>}
            </div>
            {!isPremium && <Link href="/assinar" className="botao-gerar conta-upgrade-btn">Assinar Premium →</Link>}
            {isPremium && <Link href="/conta/assinatura" className="conta-link-gerenciar">Gerenciar assinatura →</Link>}
          </div>
        </section>

        {/* ── API de dados ─────────────────────────────────────────── */}
        {isPremium && (
          <section className="conta-secao">
            <div className="conta-secao-header">
              <h2 className="conta-secao-titulo">API de dados</h2>
              <Link href="/conta/api" className="conta-link-acao">
                Gerenciar chaves →
              </Link>
            </div>
            <p className="conta-alertas-desc">
              Acesse resultados e estatísticas processadas via REST API com autenticação por chave.
              1.000 requisições/mês incluídas no plano Premium.
            </p>
          </section>
        )}

        {/* ── Jogos salvos ──────────────────────────────────────────── */}
        <section className="conta-secao">
          <div className="conta-secao-header">
            <h2 className="conta-secao-titulo">Jogos salvos</h2>
            <Link href="/conta/jogos" className="conta-link-acao">
              Ver todos →
            </Link>
          </div>

          {jogos.length === 0 ? (
            <div className="conta-jogos-vazio">
              <p>Você ainda não tem jogos salvos.</p>
              <p className="conta-jogos-dica">
                {isPremium
                  ? "Salve seus jogos fixos e receba o resultado por e-mail após cada sorteio."
                  : "Salve seus jogos fixos para acompanhar o desempenho histórico."}
              </p>
              <Link href="/conta/jogos/novo" className="botao-gerar">
                Salvar meu primeiro jogo →
              </Link>
            </div>
          ) : (
            <>
              <div className="conta-jogos-preview">
                {jogos.map(j => (
                  <div key={j.id} className="conta-jogo-preview">
                    <span className="conta-jogo-preview__loteria">
                      {j.loteria === "lotofacil" ? "LF" : "MS"}
                    </span>
                    <span className="conta-jogo-preview__dezenas">
                      {(j.dezenas as number[]).map(d => formatarDezena(d)).join(" · ")}
                    </span>
                    {j.label && <span className="conta-jogo-preview__label">"{j.label}"</span>}
                  </div>
                ))}
              </div>
              <Link href="/conta/jogos" className="conta-link-acao" style={{ marginTop: 12, display: "inline-block" }}>
                Gerenciar todos os jogos →
              </Link>
            </>
          )}
        </section>

        {/* ── Alertas de acúmulo ────────────────────────────────────── */}
        <section className="conta-secao">
          <h2 className="conta-secao-titulo">Alertas de acúmulo</h2>
          <p className="conta-alertas-desc">
            Receba um e-mail quando o prêmio acumulado ultrapassar o valor que você definir.
          </p>
          <AlertasForm alertasExistentes={alertas} />
        </section>

        {/* ── Premium teaser ────────────────────────────────────────── */}
        {!isPremium && (
          <section className="conta-secao conta-secao--premium-teaser">
            <h2 className="conta-secao-titulo">Com o Premium você também tem</h2>
            <ul className="conta-premium-lista">
              <li>Rastreamento automático — resultado de cada jogo por e-mail após todo sorteio</li>
              <li>Heatmap com todos os períodos comparáveis</li>
              <li>Gerador avançado com todos os filtros combinados</li>
              <li>Conferidor ilimitado</li>
              <li>Simulador no histórico completo + comparador de dois jogos</li>
              <li>Sem anúncios em nenhuma página</li>
            </ul>
            <Link href="/assinar" className="botao-gerar">Ver planos e assinar →</Link>
          </section>
        )}
      </main>
    </>
  );
}
