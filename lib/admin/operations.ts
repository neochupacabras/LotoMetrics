import pool from "@/lib/db";
import { createAdminClient } from "@/lib/supabase/server";
import type { Periodo } from "@/lib/admin/periodo";

// Fase 6 do Admin — Operations. Tudo aqui é derivado de dados já gravados
// nas Fases 2/4/5 (error_events, job_runs, product_events.duration_ms,
// api_keys) — nenhuma tabela nova, nenhuma instrumentação nova além de
// popular duration_ms nos pontos que já emitiam tool_completed/failed.

// ── Erros agrupados ─────────────────────────────────────────────────────────

export interface ErroAgrupado {
  source: string;
  ocorrencias: number;
  usuariosAfetados: number;
  primeiraOcorrencia: string;
  ultimaOcorrencia: string;
  ultimaMensagem: string;
}

export async function getErrosAgrupados(periodo: Periodo): Promise<ErroAgrupado[]> {
  const { rows } = await pool.query<{
    source: string;
    ocorrencias: string;
    usuarios_afetados: string;
    primeira: string | Date;
    ultima: string | Date;
    ultima_mensagem: string;
  }>(
    `SELECT
       source,
       count(*) AS ocorrencias,
       count(DISTINCT user_id) AS usuarios_afetados,
       min(created_at) AS primeira,
       max(created_at) AS ultima,
       (array_agg(message ORDER BY created_at DESC))[1] AS ultima_mensagem
     FROM error_events
     WHERE created_at >= $1 AND created_at < $2
     GROUP BY source
     ORDER BY ocorrencias DESC`,
    [periodo.from, periodo.to]
  );

  return rows.map((r) => ({
    source: r.source,
    ocorrencias: Number(r.ocorrencias),
    usuariosAfetados: Number(r.usuarios_afetados),
    primeiraOcorrencia: new Date(r.primeira).toISOString(),
    ultimaOcorrencia: new Date(r.ultima).toISOString(),
    ultimaMensagem: r.ultima_mensagem,
  }));
}

// ── Jobs: histórico completo + estatísticas ─────────────────────────────────

export interface EstatisticaJob {
  jobName: string;
  execucoes: number;
  sucessos: number;
  falhas: number;
  parciais: number;
  p50Ms: number | null;
  p95Ms: number | null;
}

export async function getEstatisticasJobs(periodo: Periodo): Promise<EstatisticaJob[]> {
  const { rows } = await pool.query<{
    job_name: string;
    execucoes: string;
    sucessos: string;
    falhas: string;
    parciais: string;
    p50: string | null;
    p95: string | null;
  }>(
    `SELECT
       job_name,
       count(*) AS execucoes,
       count(*) FILTER (WHERE status = 'success') AS sucessos,
       count(*) FILTER (WHERE status = 'failed') AS falhas,
       count(*) FILTER (WHERE status = 'partial') AS parciais,
       percentile_cont(0.5) WITHIN GROUP (ORDER BY duration_ms) AS p50,
       percentile_cont(0.95) WITHIN GROUP (ORDER BY duration_ms) AS p95
     FROM job_runs
     WHERE started_at >= $1 AND started_at < $2
     GROUP BY job_name
     ORDER BY job_name`,
    [periodo.from, periodo.to]
  );

  return rows.map((r) => ({
    jobName: r.job_name,
    execucoes: Number(r.execucoes),
    sucessos: Number(r.sucessos),
    falhas: Number(r.falhas),
    parciais: Number(r.parciais),
    p50Ms: r.p50 != null ? Math.round(Number(r.p50)) : null,
    p95Ms: r.p95 != null ? Math.round(Number(r.p95)) : null,
  }));
}

export interface JobRunDetalhe {
  jobName: string;
  status: string;
  startedAt: string;
  durationMs: number | null;
  details: unknown;
  error: string | null;
}

export async function getHistoricoJobs(periodo: Periodo, limite = 100): Promise<JobRunDetalhe[]> {
  const { rows } = await pool.query<{
    job_name: string;
    status: string;
    started_at: string | Date;
    duration_ms: number | null;
    details: unknown;
    error: string | null;
  }>(
    `SELECT job_name, status, started_at, duration_ms, details, error
     FROM job_runs
     WHERE started_at >= $1 AND started_at < $2
     ORDER BY started_at DESC
     LIMIT $3`,
    [periodo.from, periodo.to, limite]
  );
  return rows.map((r) => ({
    jobName: r.job_name,
    status: r.status,
    startedAt: (r.started_at instanceof Date ? r.started_at : new Date(r.started_at)).toISOString(),
    durationMs: r.duration_ms,
    details: r.details,
    error: r.error,
  }));
}

// ── Performance de ferramentas ───────────────────────────────────────────────

export interface PerformanceFerramenta {
  tool: string;
  execucoes: number;
  p50Ms: number | null;
  p95Ms: number | null;
  p99Ms: number | null;
}

// Só as ferramentas que já emitem duration_ms (conferidor, simulador,
// comparador de jogos, OCR) aparecem aqui — as demais completions/views não
// medem tempo de execução ainda.
export async function getPerformanceFerramentas(periodo: Periodo): Promise<PerformanceFerramenta[]> {
  const { rows } = await pool.query<{
    tool: string;
    execucoes: string;
    p50: string | null;
    p95: string | null;
    p99: string | null;
  }>(
    `SELECT
       tool,
       count(*) AS execucoes,
       percentile_cont(0.5) WITHIN GROUP (ORDER BY duration_ms) AS p50,
       percentile_cont(0.95) WITHIN GROUP (ORDER BY duration_ms) AS p95,
       percentile_cont(0.99) WITHIN GROUP (ORDER BY duration_ms) AS p99
     FROM product_events
     WHERE duration_ms IS NOT NULL AND tool IS NOT NULL
       AND created_at >= $1 AND created_at < $2
     GROUP BY tool
     ORDER BY p95 DESC NULLS LAST`,
    [periodo.from, periodo.to]
  );

  return rows.map((r) => ({
    tool: r.tool,
    execucoes: Number(r.execucoes),
    p50Ms: r.p50 != null ? Math.round(Number(r.p50)) : null,
    p95Ms: r.p95 != null ? Math.round(Number(r.p95)) : null,
    p99Ms: r.p99 != null ? Math.round(Number(r.p99)) : null,
  }));
}

// ── Saúde/integridade dos dados de loteria ───────────────────────────────────

export interface IntegridadeLoteria {
  codigo: string;
  nome: string;
  totalConcursos: number;
  numeroMinimo: number | null;
  numeroMaximo: number | null;
  gaps: number; // concursos "faltando" entre o mínimo e o máximo salvos
  duplicados: number; // não deveria existir (UNIQUE(loteria_id, numero)) — 0 esperado
  dezenasNulas: number; // concursos sem array de dezenas
}

export async function getIntegridadeDados(): Promise<IntegridadeLoteria[]> {
  const { rows } = await pool.query<{
    codigo: string;
    nome: string;
    total: string;
    minimo: number | null;
    maximo: number | null;
    distintos: string;
    duplicados: string;
    dezenas_nulas: string;
  }>(`
    SELECT
      l.codigo,
      l.nome,
      count(c.id) AS total,
      min(c.numero) AS minimo,
      max(c.numero) AS maximo,
      count(DISTINCT c.numero) AS distintos,
      count(c.id) - count(DISTINCT c.numero) AS duplicados,
      count(*) FILTER (WHERE c.id IS NOT NULL AND (c.dezenas IS NULL OR cardinality(c.dezenas) = 0)) AS dezenas_nulas
    FROM loteria l
    LEFT JOIN concurso c ON c.loteria_id = l.id
    GROUP BY l.codigo, l.nome
    ORDER BY l.codigo
  `);

  return rows.map((r) => {
    const total = Number(r.total);
    const minimo = r.minimo;
    const maximo = r.maximo;
    // gaps = quantos números inteiros faltam entre o mínimo e o máximo salvos.
    // Ex.: se só existem concursos 1, 2, 4 (faltando o 3), min=1 max=4,
    // esperados=4, salvos distintos=3 -> 1 gap.
    const esperados = minimo != null && maximo != null ? maximo - minimo + 1 : 0;
    const distintos = Number(r.distintos);
    const gaps = Math.max(0, esperados - distintos);
    return {
      codigo: r.codigo,
      nome: r.nome,
      totalConcursos: total,
      numeroMinimo: minimo,
      numeroMaximo: maximo,
      gaps,
      duplicados: Number(r.duplicados),
      dezenasNulas: Number(r.dezenas_nulas),
    };
  });
}

// ── Uso da API pública ────────────────────────────────────────────────────────

export interface ChaveApi {
  label: string | null;
  keyPrefix: string;
  ativo: boolean;
  requestsMes: number;
  limiteMes: number;
  mesReferencia: string | null;
  lastUsedAt: string | null;
}

export interface UsoApi {
  chavesAtivas: number;
  requestsMesTotal: number;
  chaves: ChaveApi[];
}

export async function getUsoApi(): Promise<UsoApi> {
  const supabase = createAdminClient();
  const { data, count } = await supabase
    .from("api_keys")
    .select("label, key_prefix, ativo, requests_mes, limite_mes, mes_referencia, last_used_at", { count: "exact" })
    .eq("ativo", true)
    .order("requests_mes", { ascending: false });

  const chaves: ChaveApi[] = (data ?? []).map((r) => ({
    label: r.label,
    keyPrefix: r.key_prefix,
    ativo: r.ativo,
    requestsMes: r.requests_mes ?? 0,
    limiteMes: r.limite_mes ?? 1000,
    mesReferencia: r.mes_referencia,
    lastUsedAt: r.last_used_at,
  }));

  return {
    chavesAtivas: count ?? chaves.length,
    requestsMesTotal: chaves.reduce((s, c) => s + c.requestsMes, 0),
    chaves,
  };
}
