import pool from "@/lib/db";
import { createAdminClient } from "@/lib/supabase/server";
import { qtdSorteiosPorSemana } from "@/lib/calendario";

// Camada de leitura do Admin Control Center. Fase 1: só expõe métricas
// calculáveis hoje com os dados já existentes (ver docs/ADMIN_AUDIT.md,
// seção "Matriz de Métricas") — nada de números estimados ou fabricados.
// Dados de usuário/assinatura via service role (RLS existe para proteger
// contra a chave anônima do client, não contra o próprio servidor do
// Admin, que precisa ver todos os usuários). Dados de loteria via o pool
// já usado pelo resto do site (lib/db.ts).

export interface VisaoUsuarios {
  total: number;
  novos7d: number;
  novos30d: number;
  premiumAtivos: number;
  free: number;
  cancelamentos30d: number;
}

export async function getVisaoUsuarios(): Promise<VisaoUsuarios> {
  const supabase = createAdminClient();
  const agora = new Date();
  const seteDiasAtras = new Date(agora.getTime() - 7 * 86_400_000).toISOString();
  const trintaDiasAtras = new Date(agora.getTime() - 30 * 86_400_000).toISOString();
  const nowIso = agora.toISOString();

  const [totalRes, novos7dRes, novos30dRes, premiumRes, cancelamentosRes] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", seteDiasAtras),
    supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", trintaDiasAtras),
    // Premium "ativo" usa a mesma regra de lib/plano.ts (calcularIsPremium):
    // plan === 'premium' E (sem data de expiração OU expiração no futuro).
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("plan", "premium")
      .or(`plan_expires_at.is.null,plan_expires_at.gt.${nowIso}`),
    supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "canceled")
      .gte("canceled_at", trintaDiasAtras),
  ]);

  const total = totalRes.count ?? 0;
  const premiumAtivos = premiumRes.count ?? 0;

  return {
    total,
    novos7d: novos7dRes.count ?? 0,
    novos30d: novos30dRes.count ?? 0,
    premiumAtivos,
    free: total - premiumAtivos,
    cancelamentos30d: cancelamentosRes.count ?? 0,
  };
}

export type StatusFrescor = "healthy" | "warning" | "critical";

export interface FrescorLoteria {
  codigo: string;
  nome: string;
  ultimoConcurso: number | null;
  dataUltimoSorteio: string | null;
  diasDesde: number | null;
  status: StatusFrescor;
}

// Critério de saúde, documentado (não é um número mágico): cada loteria tem
// uma cadência esperada de sorteios/semana (lib/calendario.ts). Tolerância
// = 2x o intervalo médio esperado entre sorteios + 1 dia de folga (cobre
// fins de semana/feriados sem sorteio). "critical" a partir do dobro dessa
// tolerância. É um critério simples o suficiente para sinalizar uma loteria
// visivelmente atrasada — não tenta replicar o calendário exato dia a dia.
function statusFrescor(diasDesde: number, sorteiosPorSemana: number): StatusFrescor {
  const intervaloEsperadoDias = 7 / sorteiosPorSemana;
  const tolerancia = intervaloEsperadoDias * 2 + 1;
  if (diasDesde <= tolerancia) return "healthy";
  if (diasDesde <= tolerancia * 2) return "warning";
  return "critical";
}

// ── Fase 2: jobs e erros ────────────────────────────────────────────────────

export type StatusSaude = "healthy" | "warning" | "critical" | "unknown";

export interface SaudeJob {
  jobName: string;
  ultimaExecucao: string | null;
  ultimoStatus: string | null;
  horasDesde: number | null;
  status: StatusSaude;
}

// Tolerância documentada por job (horas) — folga generosa o suficiente pra
// cobrir fins de semana/feriados sem disparar alerta por atraso normal.
// "critical" a partir do dobro da tolerância, ou se a última execução
// registrada já terminou em falha.
const TOLERANCIA_HORAS_JOB: Record<string, number> = {
  cron_conferir: 72, // roda seg/qua/sex/sáb 22h
  cron_relatorio: 36 * 24, // mensal, dia 1 às 8h
  revalidar: 72, // disparado pelo importador + reforçado pelo cron da Vercel
  importador_resultados: 30, // GitHub Actions roda >=1x/dia (inclui rotina de segurança às 3h BRT)
};

export async function getSaudeJobs(): Promise<SaudeJob[]> {
  const jobNames = Object.keys(TOLERANCIA_HORAS_JOB);
  const { rows } = await pool.query<{
    job_name: string;
    status: string;
    finished_at: string | Date | null;
  }>(
    `SELECT DISTINCT ON (job_name) job_name, status, finished_at
     FROM job_runs
     WHERE job_name = ANY($1)
     ORDER BY job_name, started_at DESC`,
    [jobNames]
  );

  const porJob = new Map(rows.map((r) => [r.job_name, r]));
  const agora = Date.now();

  return jobNames.map((jobName): SaudeJob => {
    const r = porJob.get(jobName);
    if (!r || !r.finished_at) {
      return { jobName, ultimaExecucao: null, ultimoStatus: null, horasDesde: null, status: "unknown" };
    }
    const finishedAt = r.finished_at instanceof Date ? r.finished_at : new Date(r.finished_at);
    const horasDesde = (agora - finishedAt.getTime()) / 3_600_000;
    const tolerancia = TOLERANCIA_HORAS_JOB[jobName];

    let status: StatusSaude;
    if (r.status === "failed") status = "critical";
    else if (horasDesde > tolerancia * 2) status = "critical";
    else if (horasDesde > tolerancia || r.status === "partial") status = "warning";
    else status = "healthy";

    return {
      jobName,
      ultimaExecucao: finishedAt.toISOString(),
      ultimoStatus: r.status,
      horasDesde: Math.round(horasDesde * 10) / 10,
      status,
    };
  });
}

export interface JobRunResumo {
  jobName: string;
  status: string;
  startedAt: string;
  durationMs: number | null;
  error: string | null;
}

export async function getUltimosJobRuns(limite = 10): Promise<JobRunResumo[]> {
  const { rows } = await pool.query<{
    job_name: string;
    status: string;
    started_at: string | Date;
    duration_ms: number | null;
    error: string | null;
  }>(
    `SELECT job_name, status, started_at, duration_ms, error
     FROM job_runs ORDER BY started_at DESC LIMIT $1`,
    [limite]
  );
  return rows.map((r) => ({
    jobName: r.job_name,
    status: r.status,
    startedAt: (r.started_at instanceof Date ? r.started_at : new Date(r.started_at)).toISOString(),
    durationMs: r.duration_ms,
    error: r.error,
  }));
}

export async function getSaudeErros(): Promise<{ ultimas24h: number; status: StatusSaude }> {
  const { rows } = await pool.query<{ count: string }>(
    `SELECT count(*) FROM error_events WHERE created_at > now() - interval '24 hours'`
  );
  const ultimas24h = Number(rows[0]?.count ?? 0);
  // Limiar simples e documentado, não calibrado por histórico real ainda
  // (a tabela acabou de ser criada): até 5/24h = saudável, 6-20 = atenção,
  // acima = crítico. Revisar quando houver volume real pra comparar.
  const status: StatusSaude = ultimas24h > 20 ? "critical" : ultimas24h > 5 ? "warning" : "healthy";
  return { ultimas24h, status };
}

export interface UsoFerramenta {
  tool: string;
  views: number;
  completions: number;
  failures: number;
  paywalls: number;
}

export async function getUsoFerramentas30d(): Promise<UsoFerramenta[]> {
  const { rows } = await pool.query<{ tool: string; event_name: string; qtd: string }>(`
    SELECT tool, event_name, count(*) AS qtd
    FROM product_events
    WHERE tool IS NOT NULL AND created_at > now() - interval '30 days'
    GROUP BY tool, event_name
  `);
  const map = new Map<string, UsoFerramenta>();
  for (const r of rows) {
    const entry = map.get(r.tool) ?? { tool: r.tool, views: 0, completions: 0, failures: 0, paywalls: 0 };
    const qtd = Number(r.qtd);
    if (r.event_name === "tool_view") entry.views += qtd;
    if (r.event_name === "tool_completed") entry.completions += qtd;
    if (r.event_name === "tool_failed") entry.failures += qtd;
    if (r.event_name === "paywall_view") entry.paywalls += qtd;
    map.set(r.tool, entry);
  }
  return Array.from(map.values()).sort((a, b) => b.views + b.completions - (a.views + a.completions));
}

export async function getFrescorLoterias(): Promise<FrescorLoteria[]> {
  const { rows } = await pool.query<{
    codigo: string;
    nome: string;
    numero: number | null;
    data_sorteio: string | Date | null;
  }>(`
    SELECT l.codigo, l.nome, c.numero, c.data_sorteio
    FROM loteria l
    LEFT JOIN LATERAL (
      SELECT numero, data_sorteio
      FROM concurso
      WHERE loteria_id = l.id
      ORDER BY numero DESC
      LIMIT 1
    ) c ON true
    ORDER BY l.codigo;
  `);

  const agora = Date.now();

  return rows.map((r): FrescorLoteria => {
    if (!r.data_sorteio) {
      return {
        codigo: r.codigo,
        nome: r.nome,
        ultimoConcurso: null,
        dataUltimoSorteio: null,
        diasDesde: null,
        status: "critical",
      };
    }
    const dataSorteio = r.data_sorteio instanceof Date ? r.data_sorteio : new Date(r.data_sorteio);
    const diasDesde = Math.floor((agora - dataSorteio.getTime()) / 86_400_000);
    return {
      codigo: r.codigo,
      nome: r.nome,
      ultimoConcurso: r.numero,
      dataUltimoSorteio: dataSorteio.toISOString(),
      diasDesde,
      status: statusFrescor(diasDesde, qtdSorteiosPorSemana(r.codigo)),
    };
  });
}
