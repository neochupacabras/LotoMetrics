import { getFunilMonetizacao } from "@/lib/admin/queries";
import { resolverPeriodo, ehPeriodoId, type PeriodoId } from "@/lib/admin/periodo";
import PeriodoNav from "@/components/admin/PeriodoNav";
import styles from "@/app/admin/admin.module.css";

export const dynamic = "force-dynamic";

function pct(num: number, den: number): string {
  return den > 0 ? `${((num / den) * 100).toFixed(1)}%` : "—";
}

export default async function AdminFunnelsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const periodoId: PeriodoId = ehPeriodoId(sp.period) ? sp.period : "30d";
  const periodo = resolverPeriodo(periodoId, sp.from, sp.to);

  const funil = await getFunilMonetizacao(periodo);

  return (
    <>
      <h1 className={styles.pageTitle}>Funis</h1>
      <p className={styles.pageSubtitle}>
        Monetização: paywall → checkout → assinatura, atribuído por última ferramenta vista antes do
        checkout (last touch). Aquisição e ativação ainda não aparecem aqui — ver nota abaixo.
      </p>

      <div className={styles.periodoBar}>
        <span className={styles.sectionTitle} style={{ margin: 0 }}>
          Funil de monetização por ferramenta
        </span>
        <PeriodoNav periodo={periodo} basePath="/admin/funnels" customFrom={sp.from} customTo={sp.to} />
      </div>
      <p className={styles.note}>
        Período: {periodo.label} ({periodo.from.toLocaleDateString("pt-BR")} – {periodo.to.toLocaleDateString("pt-BR")}
        ). Atribuição: checkout_started usa o tool_view/paywall_view mais recente do usuário nos 7 dias
        anteriores; subscription_started usa o checkout_started mais recente do mesmo usuário. Não é
        atribuição multi-touch — é o mínimo defensável com os dados que existem hoje.
      </p>

      {funil.length === 0 ? (
        <p className={styles.note}>Nenhum evento de paywall/checkout registrado neste período.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Ferramenta</th>
              <th>Paywall views</th>
              <th>Checkouts iniciados</th>
              <th>Assinaturas</th>
              <th>Paywall → Checkout</th>
              <th>Checkout → Assinatura</th>
            </tr>
          </thead>
          <tbody>
            {funil.map((f) => (
              <tr key={f.tool}>
                <td>{f.tool}</td>
                <td className={styles.numCell}>{f.paywallViews}</td>
                <td className={styles.numCell}>{f.checkoutsIniciados}</td>
                <td className={styles.numCell}>{f.assinaturas}</td>
                <td className={styles.numCell}>{pct(f.checkoutsIniciados, f.paywallViews)}</td>
                <td className={styles.numCell}>{pct(f.assinaturas, f.checkoutsIniciados)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className={styles.sectionTitle} style={{ marginTop: 32 }}>
        Aquisição e ativação
      </p>
      <p className={styles.note}>
        Não implementado ainda. Um funil de aquisição (visita → tool_view → cadastro) ou de ativação
        (cadastro → primeira ferramenta → segunda sessão → retorno) exige eventos que não existem
        hoje — não há <code>signup_started</code>, nem um evento de sessão/login, nem pageview
        anônimo persistido (o Vercel Analytics existe, mas não escreve no banco do produto). Ver
        docs/KPI_DICTIONARY.md, seção &quot;Métricas ainda não implementadas&quot;.
      </p>
    </>
  );
}
