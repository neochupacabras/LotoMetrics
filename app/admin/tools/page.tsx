import Link from "next/link";
import { getUsoFerramentas } from "@/lib/admin/queries";
import { resolverPeriodo, ehPeriodoId, type PeriodoId } from "@/lib/admin/periodo";
import PeriodoNav from "@/components/admin/PeriodoNav";
import styles from "@/app/admin/admin.module.css";

export const dynamic = "force-dynamic";

export default async function AdminToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const periodoId: PeriodoId = ehPeriodoId(sp.period) ? sp.period : "30d";
  const periodo = resolverPeriodo(periodoId, sp.from, sp.to);

  const uso = await getUsoFerramentas(periodo);

  return (
    <>
      <h1 className={styles.pageTitle}>Ferramentas</h1>
      <p className={styles.pageSubtitle}>
        Uso das 16 ferramentas do site. Conclusão/falha e paywall só existem para as que têm gate de
        Premium — ver <Link href="/admin/funnels">/admin/funnels</Link> para o funil de monetização e{" "}
        <Link href="/admin/lotteries">/admin/lotteries</Link> para a saúde por loteria.
      </p>

      <div className={styles.periodoBar}>
        <span className={styles.sectionTitle} style={{ margin: 0 }}>
          Uso por ferramenta
        </span>
        <PeriodoNav periodo={periodo} basePath="/admin/tools" customFrom={sp.from} customTo={sp.to} />
      </div>
      <p className={styles.note}>
        Período: {periodo.label} ({periodo.from.toLocaleDateString("pt-BR")} – {periodo.to.toLocaleDateString("pt-BR")})
      </p>

      {uso.length === 0 ? (
        <p className={styles.note}>Nenhum evento registrado neste período.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Ferramenta</th>
              <th>Views</th>
              <th>Conclusões</th>
              <th>Falhas</th>
              <th>Taxa de falha</th>
              <th>Paywall</th>
            </tr>
          </thead>
          <tbody>
            {uso.map((u) => {
              const base = u.completions + u.failures;
              const taxaFalha = base > 0 ? (u.failures / base) * 100 : null;
              return (
                <tr key={u.tool}>
                  <td>{u.tool}</td>
                  <td className={styles.numCell}>{u.views}</td>
                  <td className={styles.numCell}>{u.completions}</td>
                  <td className={styles.numCell}>{u.failures}</td>
                  <td className={styles.numCell}>{taxaFalha != null ? `${taxaFalha.toFixed(1)}%` : "—"}</td>
                  <td className={styles.numCell}>{u.paywalls}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </>
  );
}
