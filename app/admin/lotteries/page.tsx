import { getMatrizFerramentaLoteria, type CelulaMatriz, type StatusMatriz } from "@/lib/admin/queries";
import { resolverPeriodo, ehPeriodoId, type PeriodoId } from "@/lib/admin/periodo";
import { FERRAMENTAS_CONHECIDAS } from "@/lib/telemetry";
import { LOTERIAS } from "@/lib/format";
import PeriodoNav from "@/components/admin/PeriodoNav";
import styles from "@/app/admin/admin.module.css";

export const dynamic = "force-dynamic";

const LABEL_STATUS: Record<StatusMatriz, string> = {
  healthy: "Saudável",
  warning: "Atenção",
  critical: "Crítico",
  unsupported: "Não se aplica",
  sem_dados: "Sem dados no período",
};

const DOT_CLASS: Record<StatusMatriz, string> = {
  healthy: styles.dotHealthy,
  warning: styles.dotWarning,
  critical: styles.dotCritical,
  unsupported: styles.dotUnsupported,
  sem_dados: styles.dotUnknown,
};

export default async function AdminLotteriesPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const periodoId: PeriodoId = ehPeriodoId(sp.period) ? sp.period : "30d";
  const periodo = resolverPeriodo(periodoId, sp.from, sp.to);

  const celulas = await getMatrizFerramentaLoteria(periodo);
  const porChave = new Map(celulas.map((c) => [`${c.tool}::${c.lottery}`, c]));
  const codigosLoteria = Object.keys(LOTERIAS);

  return (
    <>
      <h1 className={styles.pageTitle}>Loterias</h1>
      <p className={styles.pageSubtitle}>
        Matriz ferramenta × loteria. &quot;Não se aplica&quot; vem da configuração real do produto
        (lib/abas-loteria.ts) — não é um problema. Critério de saúde documentado em lib/admin/queries.ts.
      </p>

      <div className={styles.periodoBar}>
        <span className={styles.sectionTitle} style={{ margin: 0 }}>
          Saúde por combinação
        </span>
        <PeriodoNav periodo={periodo} basePath="/admin/lotteries" customFrom={sp.from} customTo={sp.to} />
      </div>
      <p className={styles.note}>
        Período: {periodo.label} ({periodo.from.toLocaleDateString("pt-BR")} – {periodo.to.toLocaleDateString("pt-BR")})
      </p>

      <div className={styles.matrixScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Ferramenta</th>
              {codigosLoteria.map((codigo) => (
                <th key={codigo} className={styles.matrixHeaderCell}>
                  {LOTERIAS[codigo as keyof typeof LOTERIAS].nome}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FERRAMENTAS_CONHECIDAS.map((tool) => (
              <tr key={tool}>
                <td>{tool}</td>
                {codigosLoteria.map((codigo) => {
                  const c: CelulaMatriz | undefined = porChave.get(`${tool}::${codigo}`);
                  const status = c?.status ?? "sem_dados";
                  const titulo =
                    status === "unsupported"
                      ? "Não se aplica a esta loteria"
                      : status === "sem_dados"
                      ? "Sem eventos no período"
                      : `${LABEL_STATUS[status]} — ${c?.views ?? 0} views, ${c?.failures ?? 0} falhas`;
                  return (
                    <td key={codigo} className={styles.matrixCell} title={titulo}>
                      <span className={`${styles.dot} ${DOT_CLASS[status]}`} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className={styles.note} style={{ marginTop: 16 }}>
        Legenda: <span className={`${styles.dot} ${styles.dotHealthy}`} /> saudável ·{" "}
        <span className={`${styles.dot} ${styles.dotWarning}`} /> atenção ·{" "}
        <span className={`${styles.dot} ${styles.dotCritical}`} /> crítico ·{" "}
        <span className={`${styles.dot} ${styles.dotUnknown}`} /> sem dados ·{" "}
        <span className={`${styles.dot} ${styles.dotUnsupported}`} /> não se aplica
      </p>
    </>
  );
}
