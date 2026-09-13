import Link from "next/link";
import { PERIODOS_PADRAO, type Periodo } from "@/lib/admin/periodo";
import styles from "@/app/admin/admin.module.css";

// Reutilizado em todas as páginas do Admin que aceitam ?period= (Overview,
// Ferramentas, Loterias, Funis) — mesmo componente, mesmo comportamento,
// só muda o basePath pra onde os links apontam.
export default function PeriodoNav({
  periodo,
  basePath,
  customFrom,
  customTo,
}: {
  periodo: Periodo;
  basePath: string;
  customFrom?: string;
  customTo?: string;
}) {
  return (
    <nav className={styles.periodoNav}>
      {PERIODOS_PADRAO.map((p) => (
        <Link
          key={p.id}
          href={`${basePath}?period=${p.id}`}
          className={p.id === periodo.id ? `${styles.periodoLink} ${styles.periodoLinkActive}` : styles.periodoLink}
        >
          {p.label}
        </Link>
      ))}
      <form action={basePath} method="get" className={styles.periodoCustomForm}>
        <input type="hidden" name="period" value="custom" />
        <input type="date" name="from" defaultValue={customFrom} aria-label="De" />
        <span>–</span>
        <input type="date" name="to" defaultValue={customTo} aria-label="Até" />
        <button type="submit" className={periodo.id === "custom" ? `${styles.periodoLink} ${styles.periodoLinkActive}` : styles.periodoLink}>
          Aplicar
        </button>
      </form>
    </nav>
  );
}
