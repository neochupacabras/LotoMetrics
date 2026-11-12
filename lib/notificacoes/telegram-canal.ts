import pool from "@/lib/db";
import { buscarConcursoPorNumero, getLoteriaPorCodigo } from "@/lib/queries";
import { NOME_LOTERIA } from "@/lib/seo";
import { logJobRun } from "@/lib/telemetry";
import { chaveTelegram, montarMensagemTelegram } from "@/lib/telegram-mensagem";

// Canal público do Telegram com o resultado de cada concurso novo (semana 5
// do roadmap de growth). Chamado por lib/notificacoes/handler-http.ts no
// disparo do importador e no cron diário, com os concursos da janela.
//
// Variáveis (só em produção, na Vercel): TELEGRAM_BOT_TOKEN e TELEGRAM_CANAL
// ("@usuario_do_canal" ou o id numérico). Fora de produção nada é publicado.
//
// Idempotência sem tabela nova: cada publicação deixa uma linha em job_runs
// (job "telegram_canal", details.chave = "loteria:numero"). Antes de publicar,
// procura um sucesso com a mesma chave nos últimos 7 dias. Falha fica como
// "failed" e o próximo disparo (o cron do dia seguinte) tenta de novo.

const JOB = "telegram_canal";
const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://lotoanalitica.com.br").replace(/\/$/, "");

export interface DetalheTelegram {
  chave: string;
  status: "publicado" | "falhou" | "ja_publicado" | "simulado" | "sem_config";
  erro?: string;
}

export function telegramConfigurado(): boolean {
  return !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CANAL);
}

async function jaPublicado(chave: string): Promise<boolean> {
  const { rows } = await pool.query(
    `SELECT 1 FROM job_runs
     WHERE job_name = $1 AND status = 'success' AND details->>'chave' = $2
       AND started_at > now() - interval '7 days'
     LIMIT 1`,
    [JOB, chave]
  );
  return rows.length > 0;
}

async function enviarAoCanal(texto: string): Promise<{ ok: boolean; erro?: string }> {
  try {
    const resp = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CANAL,
        text: texto,
        parse_mode: "HTML",
        // A prévia do link mostra o card com as dezenas (opengraph-image do concurso).
        link_preview_options: { is_disabled: false, prefer_large_media: true },
      }),
      signal: AbortSignal.timeout(8000),
    });
    const json = (await resp.json().catch(() => ({}))) as { ok?: boolean; description?: string };
    // Nunca devolve a URL (ela contém o token).
    return json.ok ? { ok: true } : { ok: false, erro: `Telegram ${resp.status}: ${json.description ?? "sem descrição"}`.slice(0, 300) };
  } catch (err) {
    return { ok: false, erro: (err as Error).name === "TimeoutError" ? "Telegram: tempo esgotado" : "Telegram: falha de rede" };
  }
}

export async function publicarResultadosNoCanal(
  concursos: { loteria: string; numero: number }[],
  opcoes: { dryRun: boolean }
): Promise<DetalheTelegram[]> {
  const detalhes: DetalheTelegram[] = [];
  const publicarDeVerdade = !opcoes.dryRun && process.env.VERCEL_ENV === "production";
  if (publicarDeVerdade && !telegramConfigurado()) {
    return concursos.map((c) => ({ chave: chaveTelegram(c.loteria, c.numero), status: "sem_config" }));
  }

  const ordenados = [...concursos].sort((a, b) => a.loteria.localeCompare(b.loteria) || a.numero - b.numero);
  for (const { loteria, numero } of ordenados) {
    const chave = chaveTelegram(loteria, numero);
    if (await jaPublicado(chave)) {
      detalhes.push({ chave, status: "ja_publicado" });
      continue;
    }
    const info = await getLoteriaPorCodigo(loteria);
    const concurso = info ? await buscarConcursoPorNumero(info.id, numero) : null;
    if (!info || !concurso) continue;

    const texto = montarMensagemTelegram({
      codigoLoteria: loteria,
      nomeLoteria: NOME_LOTERIA[loteria] ?? info.nome,
      concurso,
      siteUrl: BASE_URL,
    });

    if (!publicarDeVerdade) {
      detalhes.push({ chave, status: "simulado" });
      continue;
    }

    const inicio = new Date();
    const r = await enviarAoCanal(texto);
    await logJobRun({
      jobName: JOB,
      status: r.ok ? "success" : "failed",
      startedAt: inicio,
      details: { chave, loteria, numero },
      error: r.erro ?? null,
    });
    detalhes.push({ chave, status: r.ok ? "publicado" : "falhou", erro: r.erro });
  }
  return detalhes;
}
