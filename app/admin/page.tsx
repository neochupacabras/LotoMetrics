import {
  getVisaoUsuarios,
  getFrescorLoterias,
  getSaudeJobs,
  getUltimosJobRuns,
  getSaudeErros,
  getUsoFerramentas30d,
  type StatusSaude,
} from "@/lib/admin/queries";
import styles from "./admin.module.css";

export const dynamic = "force-dynamic";

const LABEL_STATUS: Record<StatusSaude, string> = {
  healthy: "Saudável",
  warning: "Atenção",
  critical: "Crítico",
  unknown: "Sem dados ainda",
};

const DOT_CLASS: Record<StatusSaude, string> = {
  healthy: styles.dotHealthy,
  warning: styles.dotWarning,
  critical: styles.dotCritical,
  unknown: styles.dotUnknown,
};

const NOME_JOB: Record<string, string> = {
  cron_conferir: "Conferir jogos (e-mail)",
  cron_relatorio: "Relatório mensal",
  revalidar: "Revalidar cache",
  importador_resultados: "Importador de resultados",
};

function statusGeral(statuses: StatusSaude[]): StatusSaude {
  if (statuses.some((s) => s === "critical")) return "critical";
  if (statuses.some((s) => s === "warning")) return "warning";
  if (statuses.every((s) => s === "unknown")) return "unknown";
  return "healthy";
}

export default async function AdminOverviewPage() {
  const [usuarios, frescor, jobs, ultimosJobs, erros, usoFerramentas] = await Promise.all([
    getVisaoUsuarios(),
    getFrescorLoterias(),
    getSaudeJobs(),
    getUltimosJobRuns(8),
    getSaudeErros(),
    getUsoFerramentas30d(),
  ]);
  const dadosLoteriasStatus = statusGeral(frescor.map((f) => f.status));
  const jobsStatus = statusGeral(jobs.map((j) => j.status));

  return (
    <>
      <h1 className={styles.pageTitle}>Overview</h1>
      <p className={styles.pageSubtitle}>
        Fase 2 — telemetria. KPIs de usuários/dados calculáveis desde a Fase 1, jobs e erros
        instrumentados nesta fase. Ver <code>docs/ADMIN_AUDIT.md</code> para o roadmap completo.
      </p>

      <p className={styles.sectionTitle}>Platform Health</p>
      <div className={styles.healthGrid}>
        <HealthCell label="Usuários" status="healthy" />
        <HealthCell label="Dados das loterias" status={dadosLoteriasStatus} />
        <HealthCell label="Receita" status="unknown" nota="Aguarda Fase 5" />
        <HealthCell label="Jobs" status={jobsStatus} />
        <HealthCell label="Erros" status={erros.status} nota={`${erros.ultimas24h} nas últimas 24h`} />
        <HealthCell label="API" status="unknown" nota="Aguarda Fase 6" />
      </div>

      <p className={styles.sectionTitle}>KPIs executivos</p>
      <div className={styles.kpiGrid}>
        <Kpi label="Usuários totais" value={usuarios.total} />
        <Kpi label="Novos (7 dias)" value={usuarios.novos7d} />
        <Kpi label="Novos (30 dias)" value={usuarios.novos30d} />
        <Kpi label="Assinantes Premium" value={usuarios.premiumAtivos} />
        <Kpi label="Free" value={usuarios.free} />
        <Kpi label="Cancelamentos (30 dias)" value={usuarios.cancelamentos30d} />
      </div>

      <p className={styles.sectionTitle}>Frescor de dados por loteria</p>
      <p className={styles.note}>
        Status calculado a partir da cadência esperada de sorteios de cada loteria (lib/calendario.ts) — não
        é uma verificação exata dia a dia, serve para sinalizar atraso visível na importação.
      </p>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Loteria</th>
            <th>Último concurso</th>
            <th>Data do sorteio</th>
            <th>Dias desde</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {frescor.map((f) => (
            <tr key={f.codigo}>
              <td>{f.nome}</td>
              <td className={styles.numCell}>{f.ultimoConcurso ?? "—"}</td>
              <td className={styles.numCell}>
                {f.dataUltimoSorteio ? new Date(f.dataUltimoSorteio).toLocaleDateString("pt-BR") : "—"}
              </td>
              <td className={styles.numCell}>{f.diasDesde ?? "—"}</td>
              <td>
                <span className={`${styles.dot} ${DOT_CLASS[f.status]}`} style={{ display: "inline-block", marginRight: 6 }} />
                {LABEL_STATUS[f.status]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className={styles.sectionTitle}>Jobs recentes</p>
      <p className={styles.note}>
        Cron jobs da Vercel (conferir, relatório, revalidar) e o importador de resultados (GitHub
        Actions) — o processo mais crítico do produto e, antes desta fase, o único sem nenhuma
        visibilidade fora do log local. Tolerância de atraso documentada em lib/admin/queries.ts.
      </p>
      {ultimosJobs.length === 0 ? (
        <p className={styles.note}>
          Nenhuma execução registrada ainda — a instrumentação acabou de ser ligada. As próximas
          execuções dos crons e do importador vão aparecer aqui.
        </p>
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
            {ultimosJobs.map((j, i) => (
              <tr key={i}>
                <td>{NOME_JOB[j.jobName] ?? j.jobName}</td>
                <td className={styles.numCell}>{new Date(j.startedAt).toLocaleString("pt-BR")}</td>
                <td className={styles.numCell}>{j.durationMs != null ? `${(j.durationMs / 1000).toFixed(1)}s` : "—"}</td>
                <td>{j.status}</td>
                <td>{j.error ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className={styles.sectionTitle}>Uso de ferramentas (30 dias)</p>
      <p className={styles.note}>
        Instrumentado nesta fase só para as ferramentas com paywall (maior valor marginal — já
        tinham o ponto de checagem de plano centralizado). As demais 12 ferramentas entram nas
        próximas fases.
      </p>
      {usoFerramentas.length === 0 ? (
        <p className={styles.note}>Nenhum evento registrado ainda — normal logo após ligar a instrumentação.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Ferramenta</th>
              <th>Views</th>
              <th>Conclusões</th>
              <th>Falhas</th>
              <th>Paywall</th>
            </tr>
          </thead>
          <tbody>
            {usoFerramentas.map((u) => (
              <tr key={u.tool}>
                <td>{u.tool}</td>
                <td className={styles.numCell}>{u.views}</td>
                <td className={styles.numCell}>{u.completions}</td>
                <td className={styles.numCell}>{u.failures}</td>
                <td className={styles.numCell}>{u.paywalls}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

function HealthCell({
  label,
  status,
  nota,
}: {
  label: string;
  status: StatusSaude;
  nota?: string;
}) {
  const dotClass = DOT_CLASS[status];
  const texto = status === "unknown" ? nota ?? "Sem dados ainda" : nota ? `${LABEL_STATUS[status]} · ${nota}` : LABEL_STATUS[status];
  return (
    <div className={styles.healthCell}>
      <span className={`${styles.dot} ${dotClass}`} />
      <span>
        <span className={styles.healthLabel}>{label}</span>
        <span className={styles.healthStatus}>{texto}</span>
      </span>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className={styles.kpiCell}>
      <span className={styles.kpiValue}>{value.toLocaleString("pt-BR")}</span>
      <span className={styles.kpiLabel}>{label}</span>
    </div>
  );
}
