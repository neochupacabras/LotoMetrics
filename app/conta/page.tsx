import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Masthead from "@/components/Masthead";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth-actions";

export const metadata: Metadata = {
  title: "Minha conta — LotoAnalítica",
  robots: { index: false, follow: false },
};

export default async function ContaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/entrar?next=/conta");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, plan, plan_expires_at")
    .eq("id", user.id)
    .single();

  const isPremium =
    profile?.plan === "premium" &&
    (!profile.plan_expires_at || new Date(profile.plan_expires_at) > new Date());

  const expiresAt = profile?.plan_expires_at
    ? new Date(profile.plan_expires_at).toLocaleDateString("pt-BR", {
        day: "numeric", month: "long", year: "numeric",
      })
    : null;

  return (
    <>
      <Masthead />
      <main className="conta-page container">
        <div className="conta-header">
          <div>
            <h1 className="conta-titulo">
              Olá, {profile?.display_name ?? user.email?.split("@")[0]}
            </h1>
            <p className="conta-email">{user.email}</p>
          </div>
          <form action={signOut}>
            <button type="submit" className="conta-sair-btn">
              Sair
            </button>
          </form>
        </div>

        {/* ── Plano atual ─────────────────────────────────────────────── */}
        <section className="conta-secao">
          <h2 className="conta-secao-titulo">Seu plano</h2>
          <div className={`conta-plano-card ${isPremium ? "conta-plano-card--premium" : ""}`}>
            <div>
              <p className="conta-plano-nome">
                {isPremium ? "✦ Premium" : "Gratuito"}
              </p>
              {isPremium && expiresAt && (
                <p className="conta-plano-validade">Válido até {expiresAt}</p>
              )}
              {!isPremium && (
                <p className="conta-plano-desc">
                  Salve jogos e receba alertas — sempre grátis.
                </p>
              )}
            </div>
            {!isPremium && (
              <Link href="/assinar" className="botao-gerar conta-upgrade-btn">
                Assinar Premium →
              </Link>
            )}
            {isPremium && (
              <Link href="/conta/assinatura" className="conta-link-gerenciar">
                Gerenciar assinatura →
              </Link>
            )}
          </div>
        </section>

        {/* ── Jogos salvos ─────────────────────────────────────────────── */}
        <section className="conta-secao">
          <div className="conta-secao-header">
            <h2 className="conta-secao-titulo">Jogos salvos</h2>
            <Link href="/conta/jogos/novo" className="conta-link-acao">
              + Adicionar jogo
            </Link>
          </div>
          <div className="conta-jogos-vazio">
            <p>Você ainda não tem jogos salvos.</p>
            <p className="conta-jogos-dica">
              Salve seus jogos fixos e saiba automaticamente após cada sorteio quantos acertos você teve.
            </p>
            <Link href="/conta/jogos/novo" className="botao-gerar">
              Salvar meu primeiro jogo →
            </Link>
          </div>
        </section>

        {/* ── O que está por vir (premium) ─────────────────────────────── */}
        {!isPremium && (
          <section className="conta-secao conta-secao--premium-teaser">
            <h2 className="conta-secao-titulo">Com o Premium você também tem</h2>
            <ul className="conta-premium-lista">
              <li>Rastreamento automático dos seus jogos após cada sorteio</li>
              <li>Alertas de acúmulo por e-mail quando o prêmio superar o valor que você definir</li>
              <li>Heatmap com todos os períodos comparáveis</li>
              <li>Gerador avançado com todos os filtros combinados</li>
              <li>Conferidor ilimitado com histórico salvo</li>
              <li>Relatório mensal em PDF com seus resultados</li>
              <li>Sem anúncios em nenhuma página</li>
            </ul>
            <Link href="/assinar" className="botao-gerar">
              Ver planos e assinar →
            </Link>
          </section>
        )}
      </main>
    </>
  );
}
