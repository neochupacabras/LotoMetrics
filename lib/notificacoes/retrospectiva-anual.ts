import { createAdminClient } from "@/lib/supabase/server";
import { calcularIsPremium } from "@/lib/plano";
import { calcularCarteira, type JogoSalvoBasico } from "@/lib/carteira";
import { intervaloDoAno, loteriaMaisJogada, maiorPremioIndividual } from "@/lib/retrospectiva";
import { emailMeuAnoNaLoteria } from "@/lib/email-templates";
import { enviarEmail } from "@/lib/notificacoes/enviar";
import { urlDescadastro } from "@/lib/notificacoes/unsubscribe";
import pool from "@/lib/db";
import type { OpcoesProcessamento, DetalheEnvio } from "@/lib/notificacoes/processar-concursos";

// Retrospectiva anual "Meu ano na loteria" (Fase 3 adiantada, 28/09/2026,
// terceiro e último item escolhido pelo usuário) — resumo do ano pra
// assinantes Premium com jogos salvos, no espírito de um "wrapped": total
// gasto/ganho simulado, loteria mais jogada e o maior prêmio do ano. Roda
// junto do cron de segurança (app/api/cron/conferir), mesmo padrão do
// pix_vencendo e da newsletter semanal: o plano Hobby da Vercel limita o
// número de crons, então o job só segue adiante em dezembro — nos outros
// meses o handler chama esta função e ela não faz nada.

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lotoanalitica.com.br";

interface JogoComPerfilRetrospectiva {
  id: number;
  user_id: string;
  loteria: string;
  dezenas: number[];
  label: string | null;
  ativo: boolean;
  created_at: string;
  profiles: {
    plan: string | null;
    plan_expires_at: string | null;
    email: string | null;
    display_name: string | null;
    receber_emails: boolean;
  };
}

export async function enviarRetrospectivasAnuais(
  opcoes: OpcoesProcessamento & { forcarRetrospectiva?: boolean }
): Promise<DetalheEnvio[]> {
  const agora = new Date();
  // Só roda em dezembro — `forcarRetrospectiva` existe só pra teste
  // manual (curl), igual `forcarNewsletter` na newsletter semanal.
  if (agora.getUTCMonth() !== 11 && !opcoes.forcarRetrospectiva) return [];

  const ano = agora.getUTCFullYear();
  const admin = createAdminClient();
  const { data: jogos } = await admin
    .from("user_games")
    .select(
      "id, user_id, loteria, dezenas, label, ativo, created_at, profiles!inner(plan, plan_expires_at, email, display_name, receber_emails)"
    )
    .eq("ativo", true)
    .returns<JogoComPerfilRetrospectiva[]>();

  if (!jogos || jogos.length === 0) return [];

  const porUsuario = new Map<
    string,
    { perfil: JogoComPerfilRetrospectiva["profiles"]; jogos: JogoSalvoBasico[] }
  >();
  for (const jogo of jogos) {
    if (!calcularIsPremium(jogo.profiles)) continue;
    if (jogo.profiles.receber_emails === false || !jogo.profiles.email) continue;

    const entrada = porUsuario.get(jogo.user_id) ?? { perfil: jogo.profiles, jogos: [] };
    entrada.jogos.push({
      id: jogo.id,
      loteria: jogo.loteria,
      dezenas: jogo.dezenas,
      label: jogo.label,
      ativo: jogo.ativo,
      createdAt: jogo.created_at,
    });
    porUsuario.set(jogo.user_id, entrada);
  }

  const chave = `retrospectiva:${ano}`;
  const intervaloDatas = intervaloDoAno(ano, agora);
  const detalhes: DetalheEnvio[] = [];

  for (const [userId, { perfil, jogos: jogosSalvos }] of porUsuario) {
    const email = perfil.email!;
    const base: Omit<DetalheEnvio, "status" | "erro"> = {
      email,
      tipo: "retrospectiva_anual",
      loteria: null,
      concurso: null,
    };

    if (opcoes.somenteEmails && !opcoes.somenteEmails.has(email)) {
      detalhes.push({ ...base, status: "pulado_filtro" });
      continue;
    }

    const carteira = await calcularCarteira(jogosSalvos, { intervaloDatas });
    const totalConcursos = carteira.jogos.reduce((s, j) => s + j.concursosAcompanhados, 0);
    if (totalConcursos === 0) {
      // Nada pra mostrar ainda esse ano (ex.: jogo salvo há poucos dias) —
      // não vale mandar uma retrospectiva vazia.
      detalhes.push({ ...base, status: "pulado_filtro" });
      continue;
    }

    if (opcoes.dryRun) {
      detalhes.push({ ...base, status: "simulado" });
      continue;
    }

    const { rows } = await pool.query<{ id: number }>(
      `INSERT INTO notificacoes_enviadas (user_id, tipo, chave)
       VALUES ($1, 'retrospectiva_anual', $2)
       ON CONFLICT (user_id, tipo, chave) DO NOTHING
       RETURNING id`,
      [userId, chave]
    );
    const notificacaoId = rows[0]?.id;
    if (!notificacaoId) {
      detalhes.push({ ...base, status: "pulado_dedup" });
      continue;
    }

    const destaqueLoteria = loteriaMaisJogada(carteira.jogos);
    const destaquePremio = maiorPremioIndividual(carteira.jogos);
    const nomeUsuario = perfil.display_name ?? email.split("@")[0];

    const resultado = await enviarEmail({
      to: email,
      subject: `Seu ano de ${ano} na loteria — LotoAnalítica`,
      html: emailMeuAnoNaLoteria(
        nomeUsuario,
        ano,
        carteira.totalGasto,
        carteira.totalGanho,
        carteira.saldoGeral,
        destaqueLoteria
          ? { nome: destaqueLoteria.nomeLoteria, quantidadeJogos: destaqueLoteria.quantidadeJogos }
          : null,
        destaquePremio
          ? {
              valor: destaquePremio.ganho ?? 0,
              dezenas: destaquePremio.dezenas.map((d) => String(d).padStart(2, "0")).join(" "),
            }
          : null,
        `${BASE_URL}/conta/meu-ano`,
        urlDescadastro(userId, BASE_URL)
      ),
    });

    if (!resultado.ok) {
      await pool.query(`UPDATE notificacoes_enviadas SET status = 'falhou', erro = $2 WHERE id = $1`, [
        notificacaoId,
        resultado.erro ?? "erro desconhecido",
      ]);
      detalhes.push({ ...base, status: "falhou", erro: resultado.erro });
    } else {
      detalhes.push({ ...base, status: "enviado" });
    }
  }

  return detalhes;
}
