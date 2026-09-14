import { createAdminClient } from "@/lib/supabase/server";
import { chavePixVencendo, diasAteExpirar } from "@/lib/notificacoes/regras";
import { emailPixVencendo } from "@/lib/email-templates";
import { enviarEmail } from "@/lib/notificacoes/enviar";
import { urlDescadastro } from "@/lib/notificacoes/unsubscribe";
import pool from "@/lib/db";
import type { OpcoesProcessamento, DetalheEnvio } from "@/lib/notificacoes/processar-concursos";

// Tarefa 2.5 do plano de implementação (21/09/2026): lembrete de
// vencimento pro Premium pago via Pix, que — ao contrário da assinatura
// por cartão — não renova sozinho (achado da auditoria: sem isso, o
// acesso simplesmente para de funcionar sem aviso nenhum). Roda 1x/dia
// junto do cron de segurança (app/api/cron/conferir), não a cada evento
// de concurso novo — não é uma notificação ligada a sorteio.

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lotoanalitica.com.br";
const DIAS_DE_AVISO: readonly (5 | 1)[] = [5, 1];

interface PerfilExpirando {
  id: string;
  email: string | null;
  display_name: string | null;
  plan_expires_at: string;
  receber_emails: boolean;
}

export async function verificarPixVencendo(opcoes: OpcoesProcessamento): Promise<DetalheEnvio[]> {
  const admin = createAdminClient();
  const agora = new Date();
  // Janela pequena e fixa: cobre os dois avisos (5 e 1 dia) com folga —
  // qualquer perfil Premium expirando nos próximos 6 dias é candidato;
  // diasAteExpirar() decide se é exatamente um dos dois gatilhos.
  const limite = new Date(agora.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString();

  const { data: candidatos } = await admin
    .from("profiles")
    .select("id, email, display_name, plan_expires_at, receber_emails")
    .eq("plan", "premium")
    .not("plan_expires_at", "is", null)
    .lte("plan_expires_at", limite)
    .returns<PerfilExpirando[]>();

  if (!candidatos || candidatos.length === 0) return [];

  // Só quem NÃO tem assinatura Stripe ativa/em teste — essas renovam
  // sozinhas e não precisam de lembrete (achado #1.6: plan_expires_at
  // vindo do Stripe some ao cancelar; se ainda está no futuro aqui e não
  // há assinatura ativa, o crédito só pode ser do Pix).
  const ids = candidatos.map((c) => c.id);
  const { rows: comAssinaturaAtiva } = await pool.query<{ user_id: string }>(
    `SELECT DISTINCT s.user_id::text FROM subscriptions s
     WHERE s.user_id = ANY($1::uuid[]) AND s.status IN ('active', 'trialing')`,
    [ids]
  );
  const idsComStripeAtivo = new Set(comAssinaturaAtiva.map((r) => r.user_id));

  const detalhes: DetalheEnvio[] = [];

  for (const perfil of candidatos) {
    if (idsComStripeAtivo.has(perfil.id)) continue;
    if (!perfil.email || perfil.receber_emails === false) continue;

    const dias = diasAteExpirar(agora, new Date(perfil.plan_expires_at));
    if (!DIAS_DE_AVISO.includes(dias as 5 | 1)) continue;
    const diasAviso = dias as (typeof DIAS_DE_AVISO)[number];

    const base: Omit<DetalheEnvio, "status" | "erro"> = {
      email: perfil.email,
      tipo: "pix_vencendo",
      loteria: null,
      concurso: null,
    };

    if (opcoes.somenteEmails && !opcoes.somenteEmails.has(perfil.email)) {
      detalhes.push({ ...base, status: "pulado_filtro" });
      continue;
    }
    if (opcoes.dryRun) {
      detalhes.push({ ...base, status: "simulado" });
      continue;
    }

    const chave = chavePixVencendo(perfil.plan_expires_at, diasAviso);
    const { rows } = await pool.query<{ id: number }>(
      `INSERT INTO notificacoes_enviadas (user_id, tipo, chave)
       VALUES ($1, 'pix_vencendo', $2)
       ON CONFLICT (user_id, tipo, chave) DO NOTHING
       RETURNING id`,
      [perfil.id, chave]
    );
    const notificacaoId = rows[0]?.id;
    if (!notificacaoId) {
      detalhes.push({ ...base, status: "pulado_dedup" });
      continue;
    }

    const nomeUsuario = perfil.display_name ?? perfil.email.split("@")[0];
    const resultado = await enviarEmail({
      to: perfil.email,
      subject: diasAviso <= 1 ? "Seu acesso Premium vence amanhã" : `Seu acesso Premium vence em ${diasAviso} dias`,
      html: emailPixVencendo(
        nomeUsuario,
        diasAviso,
        perfil.plan_expires_at,
        `${BASE_URL}/assinar`,
        urlDescadastro(perfil.id, BASE_URL)
      ),
    });

    if (!resultado.ok) {
      await pool.query(
        `UPDATE notificacoes_enviadas SET status = 'falhou', erro = $2 WHERE id = $1`,
        [notificacaoId, resultado.erro ?? "erro desconhecido"]
      );
      detalhes.push({ ...base, status: "falhou", erro: resultado.erro });
    } else {
      detalhes.push({ ...base, status: "enviado" });
    }
  }

  return detalhes;
}
