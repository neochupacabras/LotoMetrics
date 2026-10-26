export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Masthead from "@/components/Masthead";
import BolaoEditorClient from "@/components/conta/BolaoEditorClient";
import { createClient } from "@/lib/supabase/server";
import { calcularIsPremium } from "@/lib/plano-premium";
import { bolaoEhPro } from "@/lib/bolao-limites";
import { NOME_LOTERIA } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Bolão — LotoAnalítica",
  robots: { index: false, follow: false },
};

export default async function ContaBolaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/entrar?next=/conta/boloes/${id}`);

  // RLS (política "Dono lê os próprios bolões") já garante que só o dono vê.
  const { data: bolao } = await supabase
    .from("boloes")
    .select("*")
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!bolao) notFound();

  const [{ data: jogos }, { data: participantes }, { data: profile }] = await Promise.all([
    supabase.from("bolao_jogos").select("ordem, dezenas").eq("bolao_id", id).order("ordem"),
    supabase
      .from("bolao_participantes")
      .select("id, nome, cotas, pago_em")
      .eq("bolao_id", id)
      .order("criado_em"),
    supabase.from("profiles").select("plan, plan_expires_at").eq("id", user.id).single(),
  ]);

  const premium = calcularIsPremium(profile);
  const ehPro = bolaoEhPro(bolao, premium);

  return (
    <>
      <Masthead />
      <main className="conta-page container">
        <Link href="/conta/boloes" className="conta-voltar">← Meus bolões</Link>
        <BolaoEditorClient
          bolao={{
            id: bolao.id,
            slug: bolao.slug,
            titulo: bolao.titulo,
            loteria: bolao.loteria,
            nomeLoteria: NOME_LOTERIA[bolao.loteria] ?? bolao.loteria,
            alvo: bolao.alvo,
            concursoAlvo: bolao.concurso_alvo,
            poolDezenas: bolao.pool_dezenas as number[],
            garantia: bolao.garantia,
            precoApostaCents: bolao.preco_aposta_cents,
            valorCotaCents: bolao.valor_cota_cents,
            qtdCotas: bolao.qtd_cotas,
            status: bolao.status,
          }}
          jogos={(jogos ?? []).map((j) => j.dezenas as number[])}
          participantes={(participantes ?? []).map((p) => ({
            id: p.id,
            nome: p.nome,
            cotas: p.cotas,
            pago: !!p.pago_em,
          }))}
          ehPro={ehPro}
          premium={premium}
          proAte={bolao.pro_ate}
          userId={user.id}
        />
      </main>
    </>
  );
}
