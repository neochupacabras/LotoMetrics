import { getUsoApi } from "@/lib/admin/operations";
import styles from "@/app/admin/admin.module.css";

export const dynamic = "force-dynamic";

export default async function AdminApiPage() {
  const uso = await getUsoApi();

  return (
    <>
      <h1 className={styles.pageTitle}>API</h1>
      <p className={styles.pageSubtitle}>
        Consumo da API pública (<code>/api/v1/*</code>), feature Premium com até 3 chaves ativas por
        usuário e 1000 requisições/mês por chave. <code>api_keys</code> guarda um contador agregado
        mensal, não um log por requisição — não é possível ver aqui quais endpoints específicos foram
        chamados ou de onde (isso exigiria um evento <code>api_request</code> por chamada, não
        implementado — ver docs/KPI_DICTIONARY.md).
      </p>

      <div className={styles.kpiGrid}>
        <Kpi label="Chaves ativas" value={uso.chavesAtivas} />
        <Kpi label="Requisições este mês (soma)" value={uso.requestsMesTotal} />
      </div>

      <p className={styles.sectionTitle}>Chaves ativas</p>
      {uso.chaves.length === 0 ? (
        <p className={styles.note}>Nenhuma chave de API ativa no momento.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Label</th>
              <th>Prefixo</th>
              <th>Requisições/mês</th>
              <th>Limite</th>
              <th>Uso</th>
              <th>Mês de referência</th>
              <th>Último uso</th>
            </tr>
          </thead>
          <tbody>
            {uso.chaves.map((c, i) => {
              const pctUso = c.limiteMes > 0 ? (c.requestsMes / c.limiteMes) * 100 : 0;
              return (
                <tr key={i}>
                  <td>{c.label ?? "—"}</td>
                  <td className={styles.numCell}>{c.keyPrefix}…</td>
                  <td className={styles.numCell}>{c.requestsMes}</td>
                  <td className={styles.numCell}>{c.limiteMes}</td>
                  <td className={styles.numCell} style={pctUso >= 90 ? { color: "var(--rust)" } : pctUso >= 70 ? { color: "var(--ochre)" } : undefined}>
                    {pctUso.toFixed(0)}%
                  </td>
                  <td className={styles.numCell}>{c.mesReferencia ?? "—"}</td>
                  <td className={styles.numCell}>{c.lastUsedAt ? new Date(c.lastUsedAt).toLocaleString("pt-BR") : "Nunca usada"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </>
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
