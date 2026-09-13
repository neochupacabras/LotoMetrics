import { NextResponse } from "next/server";
import { logJobRun } from "@/lib/telemetry";
import { processarConcursosNovos, type OpcoesProcessamento } from "@/lib/notificacoes/processar-concursos";
import { verificarPixVencendo } from "@/lib/notificacoes/pix-vencendo";

// Compartilhado por app/api/cron/conferir (rede de segurança, roda 1x/dia)
// e app/api/eventos/concursos-novos (disparado pelo importador.py logo
// depois de uma importação com concurso novo — tarefa 1.4 do plano de
// implementação). Os dois fazem exatamente a mesma coisa; a idempotência
// de notificacoes_enviadas garante que rodar os dois no mesmo dia não
// duplica e-mail nenhum.

function autorizado(request: Request, secret: string | undefined): boolean {
  const auth = request.headers.get("authorization");
  return !!secret && auth === `Bearer ${secret}`;
}

// Modos de segurança pra liberar o envio real aos poucos:
//   NOTIFICACOES_DRY_RUN=1            → nunca envia de verdade, só relata.
//   NOTIFICACOES_SOMENTE_PARA=a@b,c@d → só envia de verdade pra esses e-mails.
// Query string (?dryRun=1, ?somenteEmails=a@b) sobrescreve a env var, útil
// pra testar manualmente sem mudar a configuração do ambiente.
function resolverOpcoes(request: Request): OpcoesProcessamento {
  const url = new URL(request.url);
  const dryRunQuery = url.searchParams.get("dryRun");
  const dryRun = dryRunQuery !== null ? dryRunQuery === "1" : process.env.NOTIFICACOES_DRY_RUN === "1";

  const somenteQuery = url.searchParams.get("somenteEmails");
  const somenteLista = somenteQuery ?? process.env.NOTIFICACOES_SOMENTE_PARA;
  const somenteEmails = somenteLista
    ? new Set(somenteLista.split(",").map((e) => e.trim()).filter(Boolean))
    : undefined;

  // Só pra teste manual (curl) — nunca configurado por env var em produção.
  const janelaHorasQuery = url.searchParams.get("janelaHoras");
  const janelaHoras = janelaHorasQuery ? Number(janelaHorasQuery) : undefined;

  return { dryRun, somenteEmails, janelaHoras };
}

export async function handleProcessarConcursos(
  request: Request,
  jobName: string,
  secret: string | undefined,
  // Lembrete de vencimento do Pix (tarefa 2.5) não é ligado a concurso —
  // roda só no cron diário de segurança, nunca no disparo por evento do
  // importador (evita checar isso várias vezes no mesmo dia).
  opts: { incluirPixVencendo?: boolean } = {}
): Promise<NextResponse> {
  if (!autorizado(request, secret)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const startedAt = new Date();
  const opcoes = resolverOpcoes(request);

  try {
    const resumo = await processarConcursosNovos(opcoes);
    const detalhesPix = opts.incluirPixVencendo ? await verificarPixVencendo(opcoes) : [];
    const detalhes = [...resumo.detalhes, ...detalhesPix];
    const emailsEnviados = resumo.emailsEnviados + detalhesPix.filter((d) => d.status === "enviado").length;
    const emailsFalhos = resumo.emailsFalhos + detalhesPix.filter((d) => d.status === "falhou").length;
    const emailsSimulados = resumo.emailsSimulados + detalhesPix.filter((d) => d.status === "simulado").length;

    await logJobRun({
      jobName,
      status: emailsFalhos > 0 ? "partial" : "success",
      startedAt,
      details: {
        dryRun: opcoes.dryRun,
        somenteEmails: opcoes.somenteEmails ? Array.from(opcoes.somenteEmails) : undefined,
        concursosProcessados: resumo.concursosProcessados,
        emailsEnviados,
        emailsFalhos,
        emailsSimulados,
        detalhes,
      },
      error:
        emailsFalhos > 0
          ? detalhes.filter((d) => d.status === "falhou").map((d) => `${d.email}: ${d.erro}`).join("; ")
          : null,
    });
    return NextResponse.json({
      ok: true,
      concursosProcessados: resumo.concursosProcessados,
      emailsEnviados,
      emailsFalhos,
      emailsSimulados,
      detalhes,
    });
  } catch (err) {
    await logJobRun({ jobName, status: "failed", startedAt, error: (err as Error).message });
    return NextResponse.json({ error: "Erro ao processar concursos" }, { status: 500 });
  }
}
