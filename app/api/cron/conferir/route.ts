import { handleProcessarConcursos } from "@/lib/notificacoes/handler-http";

export const runtime = "nodejs";
export const maxDuration = 60;

// Rede de segurança: roda 1x/dia (ver vercel.json) e reprocessa a janela
// das últimas 48h — se app/api/eventos/concursos-novos (disparado pelo
// importador logo após uma importação nova) falhar por qualquer motivo,
// este cron ainda pega o concurso no dia seguinte. A idempotência de
// notificacoes_enviadas garante que os dois nunca duplicam um e-mail.
//
// Reescrito na Fase 1 do plano de implementação (13/09/2026) — a versão
// anterior tentava embutir auth_user:user_id(email) a partir de
// user_games, algo que o PostgREST não resolve; a consulta falhava
// silenciosamente e nenhum e-mail de resultado ou alerta jamais foi
// enviado (achado crítico #2 da auditoria). Ver lib/notificacoes/*.
export async function GET(request: Request) {
  return handleProcessarConcursos(request, "cron_conferir", process.env.CRON_SECRET, {
    incluirPixVencendo: true,
  });
}
