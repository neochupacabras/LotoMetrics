import pool from "@/lib/db";

// Camada mínima de telemetria (Fase 2 do Admin Control Center — ver
// docs/ADMIN_AUDIT.md). Três tabelas, três funções, sem fila/serviço
// externo. Toda gravação é best-effort: um erro aqui nunca deve derrubar a
// ferramenta/rota que está sendo instrumentada, por isso cada função
// engole a própria exceção e só loga no console.

export type ToolEventName =
  | "tool_view"
  | "tool_started"
  | "tool_completed"
  | "tool_failed"
  | "paywall_view";

export interface LogToolEventInput {
  eventName: ToolEventName;
  tool: string;
  lottery?: string | null;
  userId?: string | null;
  plan?: "free" | "premium" | null;
  success?: boolean | null;
  durationMs?: number | null;
  metadata?: Record<string, unknown> | null;
}

export async function logToolEvent(input: LogToolEventInput): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO product_events (event_name, tool, lottery, user_id, plan, success, duration_ms, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        input.eventName,
        input.tool,
        input.lottery ?? null,
        input.userId ?? null,
        input.plan ?? null,
        input.success ?? null,
        input.durationMs ?? null,
        input.metadata ? JSON.stringify(input.metadata) : null,
      ]
    );
  } catch (err) {
    console.error("logToolEvent falhou:", (err as Error).message);
  }
}

export type JobStatus = "success" | "failed" | "partial";

export interface LogJobRunInput {
  jobName: string;
  status: JobStatus;
  startedAt: Date;
  finishedAt?: Date;
  details?: Record<string, unknown> | null;
  error?: string | null;
}

export async function logJobRun(input: LogJobRunInput): Promise<void> {
  try {
    const finishedAt = input.finishedAt ?? new Date();
    const durationMs = finishedAt.getTime() - input.startedAt.getTime();
    await pool.query(
      `INSERT INTO job_runs (job_name, status, started_at, finished_at, duration_ms, details, error)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        input.jobName,
        input.status,
        input.startedAt,
        finishedAt,
        durationMs,
        input.details ? JSON.stringify(input.details) : null,
        input.error ?? null,
      ]
    );
  } catch (err) {
    console.error("logJobRun falhou:", (err as Error).message);
  }
}

export interface LogErrorInput {
  source: string;
  message: string;
  userId?: string | null;
  metadata?: Record<string, unknown> | null;
}

export async function logError(input: LogErrorInput): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO error_events (source, message, user_id, metadata) VALUES ($1, $2, $3, $4)`,
      [input.source, input.message, input.userId ?? null, input.metadata ? JSON.stringify(input.metadata) : null]
    );
  } catch (err) {
    console.error("logError falhou:", (err as Error).message);
  }
}
