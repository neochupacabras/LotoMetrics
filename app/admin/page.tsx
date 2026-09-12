import { getVisaoUsuarios, getFrescorLoterias, type StatusFrescor } from "@/lib/admin/queries";
import styles from "./admin.module.css";

export const dynamic = "force-dynamic";

const LABEL_STATUS: Record<StatusFrescor, string> = {
  healthy: "Saudável",
  warning: "Atenção",
  critical: "Crítico",
};

const DOT_CLASS: Record<StatusFrescor, string> = {
  healthy: styles.dotHealthy,
  warning: styles.dotWarning,
  critical: styles.dotCritical,
};

function statusGeral(statuses: StatusFrescor[]): StatusFrescor {
  if (statuses.some((s) => s === "critical")) return "critical";
  if (statuses.some((s) => s === "warning")) return "warning";
  return "healthy";
}

export default async function AdminOverviewPage() {
  const [usuarios, frescor] = await Promise.all([getVisaoUsuarios(), getFrescorLoterias()]);
  const dadosLoteriasStatus = statusGeral(frescor.map((f) => f.status));

  return (
    <>
      <h1 className={styles.pageTitle}>Overview</h1>
      <p className={styles.pageSubtitle}>
        Fase 1 — fundamentos. Só métricas calculáveis hoje sem instrumentação nova. Ver{" "}
        <code>docs/ADMIN_AUDIT.md</code> para o roadmap completo.
      </p>

      <p className={styles.sectionTitle}>Platform Health</p>
      <div className={styles.healthGrid}>
        <HealthCell label="Usuários" status="healthy" />
        <HealthCell label="Dados das loterias" status={dadosLoteriasStatus} />
        <HealthCell label="Receita" status="unknown" nota="Aguarda Fase 5" />
        <HealthCell label="Jobs" status="unknown" nota="Aguarda Fase 2" />
        <HealthCell label="Erros" status="unknown" nota="Aguarda Fase 2" />
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
    </>
  );
}

function HealthCell({
  label,
  status,
  nota,
}: {
  label: string;
  status: StatusFrescor | "unknown";
  nota?: string;
}) {
  const dotClass = status === "unknown" ? styles.dotUnknown : DOT_CLASS[status];
  const texto = status === "unknown" ? nota ?? "Não instrumentado" : LABEL_STATUS[status];
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
