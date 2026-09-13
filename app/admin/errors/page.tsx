import { getErrosAgrupados } from "@/lib/admin/operations";
import { resolverPeriodo, ehPeriodoId, type PeriodoId } from "@/lib/admin/periodo";
import PeriodoNav from "@/components/admin/PeriodoNav";
import styles from "@/app/admin/admin.module.css";

export const dynamic = "force-dynamic";

export default async function AdminErrorsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const periodoId: PeriodoId = ehPeriodoId(sp.period) ? sp.period : "30d";
  const periodo = resolverPeriodo(periodoId, sp.from, sp.to);

  const erros = await getErrosAgrupados(periodo);

  return (
    <>
      <h1 className={styles.pageTitle}>Erros</h1>
      <p className={styles.pageSubtitle}>
        Agrupado por origem (<code>source</code>), não por ocorrência individual. Cobertura parcial —
        só os pontos já instrumentados emitem aqui (webhook do Stripe, OCR, salvar jogo, criar/revogar
        chave de API). A maioria dos <code>console.error</code> do projeto ainda não escreve nesta
        tabela. Ver docs/KPI_DICTIONARY.md.
      </p>

      <div className={styles.periodoBar}>
        <span className={styles.sectionTitle} style={{ margin: 0 }}>
          Erros por origem
        </span>
        <PeriodoNav periodo={periodo} basePath="/admin/errors" customFrom={sp.from} customTo={sp.to} />
      </div>
      <p className={styles.note}>
        Período: {periodo.label} ({periodo.from.toLocaleDateString("pt-BR")} – {periodo.to.toLocaleDateString("pt-BR")})
      </p>

      {erros.length === 0 ? (
        <p className={styles.note}>Nenhum erro registrado neste período (nos pontos instrumentados).</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Origem</th>
              <th>Ocorrências</th>
              <th>Usuários afetados</th>
              <th>Primeira vez</th>
              <th>Última vez</th>
              <th>Última mensagem</th>
            </tr>
          </thead>
          <tbody>
            {erros.map((e) => (
              <tr key={e.source}>
                <td>{e.source}</td>
                <td className={styles.numCell}>{e.ocorrencias}</td>
                <td className={styles.numCell}>{e.usuariosAfetados}</td>
                <td className={styles.numCell}>{new Date(e.primeiraOcorrencia).toLocaleString("pt-BR")}</td>
                <td className={styles.numCell}>{new Date(e.ultimaOcorrencia).toLocaleString("pt-BR")}</td>
                <td style={{ maxWidth: 320, fontSize: "0.8rem" }}>{e.ultimaMensagem}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
