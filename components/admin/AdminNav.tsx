import Link from "next/link";
import styles from "@/app/admin/admin.module.css";

// Sitemap completo proposto em docs/ADMIN_AUDIT.md (seção 15). Só "Overview"
// existe de fato nesta fase — as demais aparecem desabilitadas para dar
// orientação de para onde o Admin vai crescer, sem fingir que já existem.
const GRUPOS: { titulo: string; itens: { label: string; href?: string }[] }[] = [
  { titulo: "Geral", itens: [{ label: "Overview", href: "/admin" }] },
  {
    titulo: "Produto",
    itens: [
      { label: "Ferramentas" },
      { label: "Loterias" },
      { label: "Funis" },
    ],
  },
  {
    titulo: "Receita",
    itens: [{ label: "Assinaturas" }, { label: "Pagamentos" }],
  },
  {
    titulo: "Operações",
    itens: [{ label: "Erros" }, { label: "Performance" }, { label: "Jobs" }, { label: "API" }],
  },
];

export default function AdminNav({ email }: { email: string | null }) {
  return (
    <aside className={styles.sidebar}>
      <p className={styles.brand}>LotoAnalítica</p>
      <p className={styles.brandSub}>Admin · {email ?? "—"}</p>

      <nav>
        {GRUPOS.map((grupo) => (
          <div className={styles.navGroup} key={grupo.titulo}>
            <p className={styles.navGroupTitle}>{grupo.titulo}</p>
            <ul className={styles.nav}>
              {grupo.itens.map((item) => (
                <li key={item.label}>
                  {item.href ? (
                    <Link href={item.href} className={`${styles.navItem} ${styles.navItemActive}`}>
                      {item.label}
                    </Link>
                  ) : (
                    <span className={`${styles.navItem} ${styles.navItemDisabled}`} title="Ainda não implementado">
                      {item.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <Link href="/" className={styles.backLink}>
        ← Voltar ao site
      </Link>
    </aside>
  );
}
