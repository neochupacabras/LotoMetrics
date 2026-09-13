import { getResumoBusca, getTopQueries, getTopPages, periodoEfetivoGsc } from "@/lib/admin/search-console";
import { resolverPeriodo, ehPeriodoId, type PeriodoId } from "@/lib/admin/periodo";
import PeriodoNav from "@/components/admin/PeriodoNav";
import styles from "@/app/admin/admin.module.css";

export const dynamic = "force-dynamic";

export default async function AdminAcquisitionPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const periodoId: PeriodoId = ehPeriodoId(sp.period) ? sp.period : "30d";
  const periodo = resolverPeriodo(periodoId, sp.from, sp.to);
  const efetivo = periodoEfetivoGsc(periodo.from, periodo.to);

  const [resumo, topQueries, topPages] = await Promise.all([
    getResumoBusca(periodo.from, periodo.to),
    getTopQueries(periodo.from, periodo.to, 20),
    getTopPages(periodo.from, periodo.to, 20),
  ]);

  const indisponivel = resumo === null;

  return (
    <>
      <h1 className={styles.pageTitle}>Acquisition</h1>
      <p className={styles.pageSubtitle}>
        Busca orgânica via API do Google Search Console (<code>sc-domain:lotoanalitica.com.br</code>).
        Tráfego por origem (direto/social/referral) e landing pages não aparecem aqui — isso viria do
        Vercel Analytics, que não escreve no banco do produto (achado da auditoria). Ver
        docs/KPI_DICTIONARY.md.
      </p>

      {indisponivel && (
        <p className={styles.note} style={{ borderLeftColor: "var(--rust)" }}>
          ⚠ UNAVAILABLE — não foi possível consultar o Search Console. Verifique as variáveis
          <code> GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL</code>, <code>GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY</code> e{" "}
          <code>GOOGLE_SEARCH_CONSOLE_SITE_URL</code>, e se a conta de serviço tem acesso à propriedade
          no Search Console (Configurações → Usuários e permissões). Ver logs do servidor para o erro
          específico.
        </p>
      )}

      <div className={styles.periodoBar}>
        <span className={styles.sectionTitle} style={{ margin: 0 }}>
          Busca orgânica
        </span>
        <PeriodoNav periodo={periodo} basePath="/admin/acquisition" customFrom={sp.from} customTo={sp.to} />
      </div>
      <p className={styles.note}>
        Período selecionado: {periodo.label} ({periodo.from.toLocaleDateString("pt-BR")} –{" "}
        {periodo.to.toLocaleDateString("pt-BR")}). O Search Console tem ~3 dias de atraso nos dados
        mais recentes — período efetivamente consultado: {new Date(`${efetivo.startDate}T00:00:00`).toLocaleDateString("pt-BR")}{" "}
        – {new Date(`${efetivo.endDate}T00:00:00`).toLocaleDateString("pt-BR")}.
      </p>

      {resumo && (
        <div className={styles.kpiGrid}>
          <Kpi label="Cliques" value={resumo.clicks} />
          <Kpi label="Impressões" value={resumo.impressions} />
          <Kpi label="CTR" valorTexto={`${(resumo.ctr * 100).toFixed(2)}%`} />
          <Kpi label="Posição média" valorTexto={resumo.position.toFixed(1)} />
        </div>
      )}

      <p className={styles.sectionTitle}>Principais buscas (queries)</p>
      {!topQueries || topQueries.length === 0 ? (
        <p className={styles.note}>{indisponivel ? "—" : "Nenhum dado no período."}</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Query</th>
              <th>Cliques</th>
              <th>Impressões</th>
              <th>CTR</th>
              <th>Posição média</th>
            </tr>
          </thead>
          <tbody>
            {topQueries.map((q, i) => (
              <tr key={i}>
                <td>{q.chave}</td>
                <td className={styles.numCell}>{q.clicks}</td>
                <td className={styles.numCell}>{q.impressions}</td>
                <td className={styles.numCell}>{(q.ctr * 100).toFixed(2)}%</td>
                <td className={styles.numCell}>{q.position.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className={styles.sectionTitle}>Páginas mais acessadas (busca orgânica)</p>
      {!topPages || topPages.length === 0 ? (
        <p className={styles.note}>{indisponivel ? "—" : "Nenhum dado no período."}</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Página</th>
              <th>Cliques</th>
              <th>Impressões</th>
              <th>CTR</th>
              <th>Posição média</th>
            </tr>
          </thead>
          <tbody>
            {topPages.map((p, i) => (
              <tr key={i}>
                <td style={{ maxWidth: 360, wordBreak: "break-all", fontSize: "0.82rem" }}>{p.chave}</td>
                <td className={styles.numCell}>{p.clicks}</td>
                <td className={styles.numCell}>{p.impressions}</td>
                <td className={styles.numCell}>{(p.ctr * 100).toFixed(2)}%</td>
                <td className={styles.numCell}>{p.position.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

function Kpi({ label, value, valorTexto }: { label: string; value?: number; valorTexto?: string }) {
  return (
    <div className={styles.kpiCell}>
      <span className={styles.kpiValue}>{valorTexto ?? value?.toLocaleString("pt-BR")}</span>
      <span className={styles.kpiLabel}>{label}</span>
    </div>
  );
}
