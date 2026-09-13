import { getIntegridadeDados } from "@/lib/admin/operations";
import { getFrescorLoterias, type StatusFrescor } from "@/lib/admin/queries";
import styles from "@/app/admin/admin.module.css";

export const dynamic = "force-dynamic";

const LABEL_FRESCOR: Record<StatusFrescor, string> = {
  healthy: "Saudável",
  warning: "Atenção",
  critical: "Crítico",
};
const DOT_FRESCOR: Record<StatusFrescor, string> = {
  healthy: styles.dotHealthy,
  warning: styles.dotWarning,
  critical: styles.dotCritical,
};

export default async function AdminDataHealthPage() {
  const [integridade, frescor] = await Promise.all([getIntegridadeDados(), getFrescorLoterias()]);
  const frescorPorCodigo = new Map(frescor.map((f) => [f.codigo, f]));

  return (
    <>
      <h1 className={styles.pageTitle}>Data Health</h1>
      <p className={styles.pageSubtitle}>
        Frescor (a importação está em dia?) e integridade (os dados salvos fazem sentido?) dos
        concursos de cada loteria. Checagens estruturais simples — não valida a matemática
        combinatória de cada ferramenta (isso é uma auditoria separada, fora do escopo do Admin).
      </p>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Loteria</th>
            <th>Frescor</th>
            <th>Concursos salvos</th>
            <th>Intervalo</th>
            <th>Gaps</th>
            <th>Duplicados</th>
            <th>Dezenas nulas</th>
          </tr>
        </thead>
        <tbody>
          {integridade.map((i) => {
            const f = frescorPorCodigo.get(i.codigo);
            return (
              <tr key={i.codigo}>
                <td>{i.nome}</td>
                <td>
                  {f ? (
                    <>
                      <span
                        className={`${styles.dot} ${DOT_FRESCOR[f.status]}`}
                        style={{ display: "inline-block", marginRight: 6 }}
                      />
                      {LABEL_FRESCOR[f.status]}
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td className={styles.numCell}>{i.totalConcursos}</td>
                <td className={styles.numCell}>
                  {i.numeroMinimo != null ? `${i.numeroMinimo}–${i.numeroMaximo}` : "—"}
                </td>
                <td className={styles.numCell} style={i.gaps > 0 ? { color: "var(--rust)" } : undefined}>
                  {i.gaps}
                </td>
                <td className={styles.numCell} style={i.duplicados > 0 ? { color: "var(--rust)" } : undefined}>
                  {i.duplicados}
                </td>
                <td className={styles.numCell} style={i.dezenasNulas > 0 ? { color: "var(--rust)" } : undefined}>
                  {i.dezenasNulas}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p className={styles.note} style={{ marginTop: 16 }}>
        <strong>Gaps</strong>: números de concurso faltando entre o mínimo e o máximo salvos (ex.: se
        existem os concursos 1, 2 e 4, falta o 3 — 1 gap). <strong>Duplicados</strong>: mais de uma
        linha para o mesmo número de concurso — não deveria acontecer, há uma constraint
        UNIQUE(loteria_id, numero) no banco (0 esperado). <strong>Dezenas nulas</strong>: concurso
        salvo sem nenhuma dezena sorteada — indica falha de parsing do importador nesse concurso
        específico.
      </p>
    </>
  );
}
