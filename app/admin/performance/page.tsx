import { getPerformanceFerramentas, getEstatisticasJobs } from "@/lib/admin/operations";
import { resolverPeriodo, ehPeriodoId, type PeriodoId } from "@/lib/admin/periodo";
import PeriodoNav from "@/components/admin/PeriodoNav";
import styles from "@/app/admin/admin.module.css";

export const dynamic = "force-dynamic";

function fmtMs(ms: number | null): string {
  if (ms == null) return "—";
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`;
}

export default async function AdminPerformancePage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const periodoId: PeriodoId = ehPeriodoId(sp.period) ? sp.period : "30d";
  const periodo = resolverPeriodo(periodoId, sp.from, sp.to);

  const [ferramentas, jobs] = await Promise.all([getPerformanceFerramentas(periodo), getEstatisticasJobs(periodo)]);

  return (
    <>
      <h1 className={styles.pageTitle}>Performance</h1>
      <p className={styles.pageSubtitle}>
        Tempo de execução no servidor. Web Vitals (LCP/INP/CLS) não aparecem aqui — o Vercel Speed
        Insights já mede isso no cliente, mas não escreve no banco do produto; trazer isso pra cá
        exigiria instrumentação nova (um beacon client-side + tabela própria), não implementada ainda.
      </p>

      <div className={styles.periodoBar}>
        <span className={styles.sectionTitle} style={{ margin: 0 }}>
          Duração por ferramenta
        </span>
        <PeriodoNav periodo={periodo} basePath="/admin/performance" customFrom={sp.from} customTo={sp.to} />
      </div>
      <p className={styles.note}>
        Período: {periodo.label} ({periodo.from.toLocaleDateString("pt-BR")} – {periodo.to.toLocaleDateString("pt-BR")}
        ). Só ferramentas que gravam <code>duration_ms</code> aparecem — hoje: Conferidor, Simulador,
        Comparador de jogos, Conferidor por foto (OCR). As demais 12 ferramentas não medem tempo de
        execução ainda.
      </p>

      {ferramentas.length === 0 ? (
        <p className={styles.note}>Nenhuma execução com duração registrada neste período.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Ferramenta</th>
              <th>Execuções</th>
              <th>p50</th>
              <th>p95</th>
              <th>p99</th>
            </tr>
          </thead>
          <tbody>
            {ferramentas.map((f) => (
              <tr key={f.tool}>
                <td>{f.tool}</td>
                <td className={styles.numCell}>{f.execucoes}</td>
                <td className={styles.numCell}>{fmtMs(f.p50Ms)}</td>
                <td className={styles.numCell}>{fmtMs(f.p95Ms)}</td>
                <td className={styles.numCell}>{fmtMs(f.p99Ms)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className={styles.sectionTitle}>Duração dos jobs</p>
      {jobs.length === 0 ? (
        <p className={styles.note}>Nenhuma execução registrada neste período.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Job</th>
              <th>Execuções</th>
              <th>p50</th>
              <th>p95</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.jobName}>
                <td>{j.jobName}</td>
                <td className={styles.numCell}>{j.execucoes}</td>
                <td className={styles.numCell}>{fmtMs(j.p50Ms)}</td>
                <td className={styles.numCell}>{fmtMs(j.p95Ms)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
