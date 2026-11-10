"use server";

import Stripe from "stripe";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { BUCKET_BILHETES } from "@/lib/bolao-bilhete";
import { consumirLimite } from "@/lib/rate-limit";

// Texto que a pessoa precisa digitar na segunda confirmação. Conferido de
// novo aqui no servidor — a UI sozinha não basta para evitar exclusão por
// engano (ou uma chamada forjada à action).
const TEXTO_CONFIRMACAO = "EXCLUIR";

// Status de assinatura Stripe que ainda podem gerar cobrança.
const STATUS_COBRAVEIS: Stripe.Subscription.Status[] = [
  "active",
  "trialing",
  "past_due",
  "unpaid",
  "incomplete",
  "paused",
];

// ── Exclusão de conta (LGPD, art. 18, VI) ─────────────────────────────────────
// Ordem importa:
//   1. cancela assinaturas Stripe — se falhar, ABORTA (não pode sobrar uma
//      cobrança recorrente para uma conta que não existe mais);
//   2. remove as fotos de bilhetes dos bolões do usuário no storage (o
//      cascade do banco apaga as linhas, mas não os arquivos);
//   3. apaga o usuário em auth.users — o ON DELETE CASCADE leva profiles e
//      tudo que pende dele (jogos, alertas, chaves de API, bolões, push, Pix,
//      assinaturas). product_events/error_events ficam com user_id NULL.
// O cliente Stripe em si é mantido: guarda o histórico de cobrança, que é
// retenção exigida por lei (ver /privacidade, seção 6).
export async function excluirContaAction(
  confirmacao: string
): Promise<{ ok: false; erro: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, erro: "Sua sessão expirou. Entre de novo para continuar." };

  if (confirmacao.trim().toUpperCase() !== TEXTO_CONFIRMACAO) {
    return { ok: false, erro: `Digite ${TEXTO_CONFIRMACAO} para confirmar.` };
  }

  if (!(await consumirLimite(`excluir-conta:${user.id}`, 5, 3600))) {
    return { ok: false, erro: "Muitas tentativas. Aguarde alguns minutos." };
  }

  const admin = createAdminClient();

  // 1. Stripe
  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.stripe_customer_id) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: "2026-06-24.dahlia",
      });
      const subs = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        status: "all",
        limit: 100,
      });
      for (const sub of subs.data) {
        if (STATUS_COBRAVEIS.includes(sub.status)) {
          await stripe.subscriptions.cancel(sub.id);
        }
      }
    } catch (e) {
      console.error("excluirContaAction stripe:", e instanceof Error ? e.message : e);
      return {
        ok: false,
        erro: "Não conseguimos cancelar sua assinatura agora, então a conta não foi excluída. Tente de novo em alguns minutos.",
      };
    }
  }

  // 2. Fotos de bilhetes (best effort: arquivo órfão não impede a exclusão)
  const { data: boloes } = await admin.from("boloes").select("id").eq("owner_id", user.id);
  const idsBoloes = (boloes ?? []).map((b) => b.id);
  if (idsBoloes.length > 0) {
    const { data: fotos } = await admin
      .from("bolao_bilhetes")
      .select("storage_path")
      .in("bolao_id", idsBoloes);
    const caminhos = (fotos ?? []).map((f) => f.storage_path);
    if (caminhos.length > 0) {
      const { error } = await admin.storage.from(BUCKET_BILHETES).remove(caminhos);
      if (error) console.error("excluirContaAction storage:", error.message);
    }
  }

  // 3. Usuário (cascade no banco)
  const { error: erroExclusao } = await admin.auth.admin.deleteUser(user.id);
  if (erroExclusao) {
    console.error("excluirContaAction deleteUser:", erroExclusao.message);
    return { ok: false, erro: "Não foi possível excluir a conta. Tente novamente ou fale com a gente." };
  }

  // Limpa os cookies de sessão (o token já não vale nada, mas não deve sobrar).
  await supabase.auth.signOut().catch(() => {});
  revalidatePath("/", "layout");
  redirect("/conta-excluida");
}
