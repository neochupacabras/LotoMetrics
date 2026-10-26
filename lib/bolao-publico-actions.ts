"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { after } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { SLUG_BOLAO_REGEX } from "@/lib/bolao-publico";
import { logToolEvent } from "@/lib/telemetry";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Opt-in do participante pelo link público: ele escolhe o próprio nome na
// lista e informa o e-mail. Só preenche participante SEM e-mail — nunca
// sobrescreve — pra que ninguém troque o e-mail de outra pessoa do grupo.
// O e-mail nunca é devolvido à página pública.
export async function pedirAvisoBolaoAction(
  slug: string,
  participanteId: string,
  email: string
): Promise<{ ok: boolean; erro?: string }> {
  if (!SLUG_BOLAO_REGEX.test(slug)) return { ok: false, erro: "Bolão não encontrado." };
  const emailNormalizado = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(emailNormalizado) || emailNormalizado.length > 200) {
    return { ok: false, erro: "Digite um e-mail válido." };
  }

  const admin = createAdminClient();

  // Rate limit (migration 20261028000000): 5 tentativas por hora por IP e 30
  // por hora por bolão. A chave guarda só o hash do IP. Se o contador falhar,
  // deixa passar (melhor que bloquear gente legítima) e registra no console.
  const forwarded = (await headers()).get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || "desconhecido";
  const ipHash = createHash("sha256").update(ip).digest("hex").slice(0, 32);
  for (const [chave, max] of [
    [`bolao-optin:ip:${ipHash}`, 5],
    [`bolao-optin:slug:${slug}`, 30],
  ] as const) {
    const { data: permitido, error: erroRl } = await admin.rpc("consumir_rate_limit", {
      p_chave: chave,
      p_max: max,
      p_janela_segundos: 3600,
    });
    if (erroRl) {
      console.error("rate limit indisponível:", erroRl.message);
      break;
    }
    if (permitido === false) {
      return { ok: false, erro: "Muitas tentativas. Tente novamente mais tarde." };
    }
  }

  const { data: bolao } = await admin.from("boloes").select("id, loteria").eq("slug", slug).maybeSingle();
  if (!bolao) return { ok: false, erro: "Bolão não encontrado." };

  const { data: p } = await admin
    .from("bolao_participantes")
    .select("id, email")
    .eq("id", participanteId)
    .eq("bolao_id", bolao.id)
    .maybeSingle();
  if (!p) return { ok: false, erro: "Participante não encontrado." };
  if (p.email) {
    return { ok: false, erro: "Esse participante já cadastrou um e-mail. Fale com o organizador para alterar." };
  }

  const { error } = await admin
    .from("bolao_participantes")
    .update({ email: emailNormalizado, recebe_resultado: true })
    .eq("id", p.id)
    .is("email", null);
  if (error) return { ok: false, erro: "Não foi possível salvar. Tente novamente." };

  after(() =>
    logToolEvent({ eventName: "participant_email_added", tool: "bolao", lottery: bolao.loteria })
  );
  return { ok: true };
}
