"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { logToolEvent } from "@/lib/telemetry";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { calcularIsPremium } from "@/lib/plano-premium";
import { getLoteriaPorCodigo, getUltimoConcurso } from "@/lib/queries";
import { OPCOES_BOLAO } from "@/lib/bolao-opcoes";
import {
  bolaoEhPro,
  podeAdicionarParticipante,
  podeCriarBolao,
  podeDefinirCotas,
} from "@/lib/bolao-limites";

// Todas as escritas do bolão passam por aqui: autenticam com a sessão do
// usuário, mas gravam com o service role depois de checar dono e limites —
// o client do usuário só tem SELECT nas tabelas (ver migration
// 20261027000000_boloes.sql), então nada disso pode ser burlado pela chave
// pública. Todo UPDATE/DELETE filtra por owner_id vindo da sessão.

type Resultado<T = object> = ({ ok: true } & T) | { ok: false; erro: string; motivo?: string };

const SLUG_ALFABETO = "abcdefghjkmnpqrstuvwxyz23456789"; // sem 0/o/1/l/i
function gerarSlug(): string {
  const bytes = randomBytes(10);
  return Array.from(bytes, (b) => SLUG_ALFABETO[b % SLUG_ALFABETO.length]).join("");
}

async function usuarioAtual() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, plan_expires_at")
    .eq("id", user.id)
    .single();
  return { id: user.id, premium: calcularIsPremium(profile) };
}

export interface CriarBolaoInput {
  codigoLoteria: string;
  titulo: string;
  alvo: "proximo" | "virada" | "numero";
  concursoAlvo?: number | null;
  poolDezenas: number[];
  garantia: number;
  precoApostaCents: number;
  qtdCotas: number;
  tickets: number[][];
}

export async function criarBolaoAction(
  input: CriarBolaoInput
): Promise<Resultado<{ id: string }>> {
  const u = await usuarioAtual();
  if (!u) return { ok: false, erro: "Faça login para salvar o bolão." };

  const titulo = input.titulo.trim();
  if (titulo.length < 1 || titulo.length > 80) {
    return { ok: false, erro: "Dê um nome ao bolão (até 80 caracteres)." };
  }
  if (!Number.isInteger(input.qtdCotas) || input.qtdCotas < 1) {
    return { ok: false, erro: "Informe a quantidade de cotas." };
  }
  if (!Number.isInteger(input.precoApostaCents) || input.precoApostaCents <= 0) {
    return { ok: false, erro: "Preço da aposta inválido." };
  }

  // O plano de fechamento precisa existir na tabela pré-verificada e os
  // jogos precisam bater com ele — o client só informa o que o servidor
  // já sabe validar.
  const pool = Array.from(new Set(input.poolDezenas));
  const opcao = OPCOES_BOLAO[input.codigoLoteria]?.find(
    (o) => o.tamanhoPool === pool.length && o.garantia === input.garantia
  );
  if (!opcao || pool.length !== input.poolDezenas.length) {
    return { ok: false, erro: "Plano de bolão inválido." };
  }
  const loteria = await getLoteriaPorCodigo(input.codigoLoteria);
  if (!loteria) return { ok: false, erro: "Loteria não encontrada." };
  if (pool.some((d) => !Number.isInteger(d) || d < loteria.dezenaMin || d > loteria.dezenaMax)) {
    return { ok: false, erro: "Dezenas fora do intervalo da loteria." };
  }
  const poolSet = new Set(pool);
  const ticketsValidos =
    input.tickets.length === opcao.totalJogos &&
    input.tickets.every(
      (t) => t.length > 0 && new Set(t).size === t.length && t.every((d) => poolSet.has(d))
    );
  if (!ticketsValidos) return { ok: false, erro: "Os jogos não correspondem ao plano escolhido." };

  const admin = createAdminClient();

  const { count: ativos } = await admin
    .from("boloes")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", u.id)
    .neq("status", "conferido");
  const limite = podeCriarBolao(u.premium, ativos ?? 0, input.qtdCotas);
  if (!limite.ok) return { ok: false, erro: limite.erro!, motivo: limite.motivo };

  let concursoAlvo: number | null = null;
  if (input.alvo === "proximo") {
    const ultimo = await getUltimoConcurso(loteria.id);
    concursoAlvo = ultimo ? ultimo.numero + 1 : null;
  } else if (input.alvo === "numero") {
    if (!input.concursoAlvo || !Number.isInteger(input.concursoAlvo) || input.concursoAlvo < 1) {
      return { ok: false, erro: "Número de concurso inválido." };
    }
    concursoAlvo = input.concursoAlvo;
  }

  const custoTotalCents = opcao.totalJogos * input.precoApostaCents;
  const valorCotaCents = Math.ceil(custoTotalCents / input.qtdCotas);

  let bolaoId: string | null = null;
  for (let tentativa = 0; tentativa < 3 && !bolaoId; tentativa++) {
    const { data, error } = await admin
      .from("boloes")
      .insert({
        owner_id: u.id,
        slug: gerarSlug(),
        titulo,
        loteria: input.codigoLoteria,
        alvo: input.alvo,
        concurso_alvo: concursoAlvo,
        pool_dezenas: pool.sort((a, b) => a - b),
        tamanho_pool: pool.length,
        garantia: input.garantia,
        preco_aposta_cents: input.precoApostaCents,
        valor_cota_cents: valorCotaCents,
        qtd_cotas: input.qtdCotas,
      })
      .select("id")
      .single();
    if (data) bolaoId = data.id;
    else if (error?.code !== "23505") {
      console.error("criarBolaoAction:", error?.message);
      return { ok: false, erro: "Não foi possível salvar o bolão. Tente novamente." };
    }
  }
  if (!bolaoId) return { ok: false, erro: "Não foi possível salvar o bolão. Tente novamente." };

  const { error: errJogos } = await admin.from("bolao_jogos").insert(
    input.tickets.map((dezenas, i) => ({
      bolao_id: bolaoId,
      ordem: i + 1,
      dezenas: [...dezenas].sort((a, b) => a - b),
    }))
  );
  if (errJogos) {
    console.error("criarBolaoAction jogos:", errJogos.message);
    await admin.from("boloes").delete().eq("id", bolaoId).eq("owner_id", u.id);
    return { ok: false, erro: "Não foi possível salvar os jogos do bolão." };
  }

  after(() =>
    logToolEvent({
      eventName: "bolao_created",
      tool: "bolao",
      lottery: input.codigoLoteria,
      userId: u.id,
      plan: u.premium ? "premium" : "free",
      metadata: { qtd_cotas: input.qtdCotas, alvo: input.alvo },
    })
  );
  revalidatePath("/conta/boloes");
  return { ok: true, id: bolaoId };
}

// Garante que o bolão é do usuário logado e devolve o necessário pros limites.
async function bolaoDoUsuario(bolaoId: string) {
  const u = await usuarioAtual();
  if (!u) return { ok: false as const, erro: "Não autenticado." };
  const admin = createAdminClient();
  const { data: bolao } = await admin
    .from("boloes")
    .select("id, qtd_cotas, status, pro_ate")
    .eq("id", bolaoId)
    .eq("owner_id", u.id)
    .single();
  if (!bolao) return { ok: false as const, erro: "Bolão não encontrado." };
  return { ok: true as const, u, admin, bolao };
}

async function cotasAtribuidas(
  admin: ReturnType<typeof createAdminClient>,
  bolaoId: string,
  ignorarParticipanteId?: string
): Promise<number> {
  const { data } = await admin
    .from("bolao_participantes")
    .select("id, cotas")
    .eq("bolao_id", bolaoId);
  return (data ?? [])
    .filter((p) => p.id !== ignorarParticipanteId)
    .reduce((s, p) => s + p.cotas, 0);
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function adicionarParticipanteAction(
  bolaoId: string,
  nome: string,
  cotas: number,
  email?: string
): Promise<Resultado> {
  const ctx = await bolaoDoUsuario(bolaoId);
  if (!ctx.ok) return { ok: false, erro: ctx.erro };
  const { admin, bolao } = ctx;

  const nomeLimpo = nome.trim();
  if (nomeLimpo.length < 1 || nomeLimpo.length > 60) {
    return { ok: false, erro: "Informe o nome do participante (até 60 caracteres)." };
  }
  if (!Number.isInteger(cotas) || cotas < 1) return { ok: false, erro: "Cotas inválidas." };
  const emailLimpo = email?.trim().toLowerCase() || null;
  if (emailLimpo && !EMAIL_REGEX.test(emailLimpo)) return { ok: false, erro: "E-mail inválido." };

  const limite = podeAdicionarParticipante(
    bolao.qtd_cotas,
    await cotasAtribuidas(admin, bolaoId),
    cotas
  );
  if (!limite.ok) return { ok: false, erro: limite.erro! };

  const { error } = await admin.from("bolao_participantes").insert({
    bolao_id: bolaoId,
    nome: nomeLimpo,
    cotas,
    // Quem o organizador cadastra com e-mail só recebe aviso se o próprio
    // participante pedir (página pública) — aqui o e-mail fica guardado sem
    // consentimento de envio.
    email: emailLimpo,
    recebe_resultado: false,
  });
  if (error) return { ok: false, erro: "Não foi possível adicionar o participante." };

  revalidatePath(`/conta/boloes/${bolaoId}`);
  return { ok: true };
}

export async function alternarPagoAction(
  bolaoId: string,
  participanteId: string
): Promise<Resultado> {
  const ctx = await bolaoDoUsuario(bolaoId);
  if (!ctx.ok) return { ok: false, erro: ctx.erro };
  const { admin } = ctx;

  const { data: p } = await admin
    .from("bolao_participantes")
    .select("pago_em")
    .eq("id", participanteId)
    .eq("bolao_id", bolaoId)
    .single();
  if (!p) return { ok: false, erro: "Participante não encontrado." };

  const { error } = await admin
    .from("bolao_participantes")
    .update({ pago_em: p.pago_em ? null : new Date().toISOString() })
    .eq("id", participanteId)
    .eq("bolao_id", bolaoId);
  if (error) return { ok: false, erro: "Não foi possível atualizar o pagamento." };

  revalidatePath(`/conta/boloes/${bolaoId}`);
  return { ok: true };
}

export async function removerParticipanteAction(
  bolaoId: string,
  participanteId: string
): Promise<Resultado> {
  const ctx = await bolaoDoUsuario(bolaoId);
  if (!ctx.ok) return { ok: false, erro: ctx.erro };

  const { error } = await ctx.admin
    .from("bolao_participantes")
    .delete()
    .eq("id", participanteId)
    .eq("bolao_id", bolaoId);
  if (error) return { ok: false, erro: "Não foi possível remover o participante." };

  revalidatePath(`/conta/boloes/${bolaoId}`);
  return { ok: true };
}

export async function atualizarBolaoAction(
  bolaoId: string,
  campos: { titulo?: string; qtdCotas?: number; status?: "aberto" | "fechado" }
): Promise<Resultado> {
  const ctx = await bolaoDoUsuario(bolaoId);
  if (!ctx.ok) return { ok: false, erro: ctx.erro };
  const { u, admin, bolao } = ctx;

  if (bolao.status === "conferido") return { ok: false, erro: "Este bolão já foi conferido." };

  const update: Record<string, unknown> = {};

  if (campos.titulo !== undefined) {
    const t = campos.titulo.trim();
    if (t.length < 1 || t.length > 80) return { ok: false, erro: "Nome inválido." };
    update.titulo = t;
  }

  if (campos.qtdCotas !== undefined) {
    if (!Number.isInteger(campos.qtdCotas) || campos.qtdCotas < 1) {
      return { ok: false, erro: "Quantidade de cotas inválida." };
    }
    const limite = podeDefinirCotas(
      bolaoEhPro(bolao, u.premium),
      campos.qtdCotas,
      await cotasAtribuidas(admin, bolaoId)
    );
    if (!limite.ok) return { ok: false, erro: limite.erro!, motivo: limite.motivo };
    update.qtd_cotas = campos.qtdCotas;
    // Recalcula o valor da cota pro novo total (custo dos jogos não muda).
    const { count } = await admin
      .from("bolao_jogos")
      .select("id", { count: "exact", head: true })
      .eq("bolao_id", bolaoId);
    const { data: preco } = await admin
      .from("boloes")
      .select("preco_aposta_cents")
      .eq("id", bolaoId)
      .single();
    if (count && preco) {
      update.valor_cota_cents = Math.ceil((count * preco.preco_aposta_cents) / campos.qtdCotas);
    }
  }

  if (campos.status !== undefined) update.status = campos.status;

  if (Object.keys(update).length === 0) return { ok: true };

  const { error } = await admin
    .from("boloes")
    .update(update)
    .eq("id", bolaoId)
    .eq("owner_id", u.id);
  if (error) return { ok: false, erro: "Não foi possível atualizar o bolão." };

  revalidatePath("/conta/boloes");
  revalidatePath(`/conta/boloes/${bolaoId}`);
  return { ok: true };
}

export async function excluirBolaoAction(bolaoId: string): Promise<Resultado> {
  const ctx = await bolaoDoUsuario(bolaoId);
  if (!ctx.ok) return { ok: false, erro: ctx.erro };

  const { error } = await ctx.admin
    .from("boloes")
    .delete()
    .eq("id", bolaoId)
    .eq("owner_id", ctx.u.id);
  if (error) return { ok: false, erro: "Não foi possível excluir o bolão." };

  revalidatePath("/conta/boloes");
  return { ok: true };
}
