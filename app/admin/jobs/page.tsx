import { getEstatisticasJobs, getHistoricoJobs } from "@/lib/admin/operations";
import { resolverPeriodo, ehPeriodoId, type PeriodoId } from "@/lib/admin/periodo";
import PeriodoNav from "@/components/admin/PeriodoNav";
import styles from "@/app/admin/admin.module.css";

export const dynamic = "force-dynamic";

const NOME_JOB: Record<string, string> = {
  cron_conferir: "Conferir jogos (e-mail)",
  cron_relatorio: "Relatório mensal",
  revalidar: "Revalidar cache",
  importador_resultados: "Importador de resultados",
};

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const periodoId: PeriodoId = ehPeriodoId(sp.period) ? sp.period : "30d";
  const periodo = resolverPeriodo(periodoId, sp.from, sp.to);

  const [stats, historico] = await Promise.all([getEstatisticasJobs(periodo), getHistoricoJobs(periodo, 100)]);

  return (
    <>
      <h1 className={styles.pageTitle}>Jobs</h1>
      <p className={styles.pageSubtitle}>
        Cron jobs da Vercel (conferir, relatório, revalidar) e o importador de resultados (GitHub
        Actions) — o processo mais crítico do produto. Ver critério de saúde em
        docs/KPI_DICTIONARY.md.
      </p>

      <div className={styles.periodoBar}>
        <span className={styles.sectionTitle} style={{ margin: 0 }}>
          Estatísticas por job
        </span>
        <PeriodoNav periodo={periodo} basePath="/admin/jobs" customFrom={sp.from} customTo={sp.to} />
      </div>
      <p className={styles.note}>
        Período: {periodo.label} ({periodo.from.toLocaleDateString("pt-BR")} – {periodo.to.toLocaleDateString("pt-BR")})
      </p>

      {stats.length === 0 ? (
        <p className={styles.note}>Nenhuma execução registrada neste período.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Job</th>
              <th>Execuções</th>
              <th>Sucessos</th>
              <th>Falhas</th>
              <th>Parciais</th>
              <th>p50</th>
              <th>p95</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s) => (
              <tr key={s.jobName}>
                <td>{NOME_JOB[s.jobName] ?? s.jobName}</td>
                <td className={styles.numCell}>{s.execucoes}</td>
                <td className={styles.numCell}>{s.sucessos}</td>
                <td className={styles.numCell}>{s.falhas}</td>
                <td className={styles.numCell}>{s.parciais}</td>
                <td className={styles.numCell}>{s.p50Ms != null ? `${(s.p50Ms / 1000).toFixed(1)}s` : "—"}</td>
                <td className={styles.numCell}>{s.p95Ms != null ? `${(s.p95Ms / 1000).toFixed(1)}s` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className={styles.sectionTitle}>Histórico de execuções</p>
      {historico.length === 0 ? (
        <p className={styles.note}>Nenhuma execução registrada neste período.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Job</th>
              <th>Iniciado em</th>
              <th>Duração</th>
              <th>Status</th>
              <th>Erro</th>
            </tr>
          </thead>
          <tbody>
            {historico.map((j, i) => (
              <tr key={i}>
                <td>{NOME_JOB[j.jobName] ?? j.jobName}</td>
                <td className={styles.numCell}>{new Date(j.startedAt).toLocaleString("pt-BR")}</td>
                <td className={styles.numCell}>{j.durationMs != null ? `${(j.durationMs / 1000).toFixed(1)}s` : "—"}</td>
                <td>{j.status}</td>
                <td style={{ maxWidth: 280, fontSize: "0.8rem" }}>{j.error ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
