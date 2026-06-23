export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Masthead from "@/components/Masthead";
import JogosListaClient from "@/components/conta/JogosListaClient";
import { createClient } from "@/lib/supabase/server";
import { formatarDezena } from "@/lib/format";

export const metadata: Metadata = {
  title: "Meus jogos — LotoAnalítica",
  robots: { index: false, follow: false },
};

export default async function ContaJogosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/entrar?next=/conta/jogos");

  const { data: jogos } = await supabase
    .from("user_games")
    .select("id, loteria, dezenas, label, ativo, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, plan_expires_at")
    .eq("id", user.id)
    .single();

  const isPremium =
    profile?.plan === "premium" &&
    (!profile.plan_expires_at || new Date(profile.plan_expires_at) > new Date());

  return (
    <>
      <Masthead />
      <main className="conta-page container">
        <div className="conta-header">
          <div>
            <Link href="/conta" className="conta-voltar">← Minha conta</Link>
            <h1 className="conta-titulo">Meus jogos</h1>
            <p className="conta-email">
              {jogos?.length ?? 0} jogo{jogos?.length !== 1 ? "s" : ""} salvos
            </p>
          </div>
          <Link href="/conta/jogos/novo" className="botao-gerar">
            + Adicionar jogo
          </Link>
        </div>

        {!isPremium && (jogos?.length ?? 0) > 0 && (
          <div className="conta-alerta-free">
            <p>
              Seus jogos estão salvos. Com o{" "}
              <Link href="/assinar" className="conta-alerta-free__link">Premium</Link>
              {" "}você recebe por e-mail o resultado de cada um após todo sorteio.
            </p>
          </div>
        )}

        {(jogos?.length ?? 0) === 0 ? (
          <div className="conta-jogos-vazio">
            <p>Você ainda não tem jogos salvos.</p>
            <p className="conta-jogos-dica">
              Salve suas combinações fixas e acompanhe o desempenho em cada sorteio.
            </p>
            <Link href="/conta/jogos/novo" className="botao-gerar">
              Salvar meu primeiro jogo →
            </Link>
          </div>
        ) : (
          <JogosListaClient
            jogos={(jogos ?? []).map(j => ({
              id: j.id,
              loteria: j.loteria,
              dezenas: j.dezenas as number[],
              label: j.label ?? null,
              ativo: j.ativo,
              criadoEm: new Date(j.created_at).toLocaleDateString("pt-BR", {
                day: "numeric", month: "short", year: "numeric",
              }),
            }))}
            isPremium={isPremium}
          />
        )}
      </main>
    </>
  );
}
