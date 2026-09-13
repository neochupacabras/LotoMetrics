import { getMrrAtual, getSaudePagamentos, getReceitaPeriodo } from "@/lib/admin/revenue";
import { formatarCentavos } from "@/lib/admin/precos";
import { resolverPeriodo, ehPeriodoId, type PeriodoId } from "@/lib/admin/periodo";
import PeriodoNav from "@/components/admin/PeriodoNav";
import styles from "@/app/admin/admin.module.css";

export const dynamic = "force-dynamic";

const NOME_INTERVALO: Record<string, string> = {
  month: "Mensal",
  year: "Anual",
  week: "Semanal",
  day: "Diário",
};

export default async function AdminRevenuePage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const periodoId: PeriodoId = ehPeriodoId(sp.period) ? sp.period : "30d";
  const periodo = resolverPeriodo(periodoId, sp.from, sp.to);

  const [mrr, pagamentos, receitaPeriodo] = await Promise.all([
    getMrrAtual(),
    getSaudePagamentos(),
    getReceitaPeriodo(periodo),
  ]);

  const mrrLiquidoPeriodo = receitaPeriodo.novaMrrCentavos - receitaPeriodo.mrrCanceladaCentavos;

  return (
    <>
      <h1 className={styles.pageTitle}>Revenue</h1>
      <p className={styles.pageSubtitle}>
        MRR calculado agora (não estimado) resolvendo o valor de cada assinatura ativa direto na API
        do Stripe — <code>subscriptions</code> guarda o <code>stripe_price_id</code>, não o valor. Ver
        docs/KPI_DICTIONARY.md para a definição completa e as limitações.
      </p>

      <p className={styles.sectionTitle}>Platform Health — Pagamentos</p>
      <div className={styles.healthGrid}>
        <HealthCell
          label="Pagamentos"
          status={pagamentos.status}
          nota={pagamentos.pastDue === 0 ? "Nenhum em atraso" : `${pagamentos.pastDue} em atraso (past_due)`}
        />
      </div>

      <p className={styles.sectionTitle}>MRR / ARR (agora)</p>
      <div className={styles.kpiGrid}>
        <Kpi label="MRR" valor={formatarCentavos(mrr.mrrCentavos)} />
        <Kpi label="ARR" valor={formatarCentavos(mrr.arrCentavos)} />
        <Kpi label="Assinantes ativos" valor={String(mrr.assinantesAtivos)} />
        <Kpi label="Em trial (não conta no MRR)" valor={String(mrr.assinantesTrial)} />
      </div>
      {mrr.assinantesNaoIdentificados > 0 && (
        <p className={styles.note}>
          ⚠ {mrr.assinantesNaoIdentificados} assinatura(s) ativa(s) com preço não resolvido pela API do
          Stripe (falha de rede ou price_id inválido) — não estão somadas no MRR acima. Ver logs do
          servidor para o price_id específico.
        </p>
      )}

      <p className={styles.sectionTitle}>MRR por plano</p>
      {mrr.porPlano.length === 0 ? (
        <p className={styles.note}>Nenhuma assinatura ativa agora.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Periodicidade</th>
              <th>Price ID</th>
              <th>Assinantes</th>
              <th>MRR</th>
              <th>% do MRR total</th>
            </tr>
          </thead>
          <tbody>
            {mrr.porPlano.map((p) => (
              <tr key={p.priceId}>
                <td>{NOME_INTERVALO[p.intervalo ?? ""] ?? p.intervalo ?? "—"}</td>
                <td className={styles.numCell} style={{ fontSize: "0.76rem" }}>
                  {p.priceId}
                </td>
                <td className={styles.numCell}>{p.assinantes}</td>
                <td className={styles.numCell}>{formatarCentavos(p.mrrCentavos)}</td>
                <td className={styles.numCell}>
                  {mrr.mrrCentavos > 0 ? `${((p.mrrCentavos / mrr.mrrCentavos) * 100).toFixed(1)}%` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className={styles.periodoBar}>
        <span className={styles.sectionTitle} style={{ margin: 0 }}>
          Movimentação de MRR no período
        </span>
        <PeriodoNav periodo={periodo} basePath="/admin/revenue" customFrom={sp.from} customTo={sp.to} />
      </div>
      <p className={styles.note}>
        Período: {periodo.label} ({periodo.from.toLocaleDateString("pt-BR")} – {periodo.to.toLocaleDateString("pt-BR")}
        ). Novo MRR conta só assinaturas já <code>active</code> agora (trial ainda não convertido não
        entra) — se um trial iniciado no período converter depois, ele aparece aqui só quando a
        página for recarregada após a conversão.
      </p>
      <div className={styles.kpiGrid}>
        <Kpi label="Novas assinaturas iniciadas" valor={String(receitaPeriodo.novasAssinaturas)} />
        <Kpi label="— das quais em trial" valor={String(receitaPeriodo.novasEmTrial)} />
        <Kpi label="Novo MRR" valor={formatarCentavos(receitaPeriodo.novaMrrCentavos)} />
        <Kpi label="Cancelamentos" valor={String(receitaPeriodo.canceladas)} />
        <Kpi label="MRR cancelado" valor={formatarCentavos(receitaPeriodo.mrrCanceladaCentavos)} />
        <Kpi
          label="MRR líquido no período"
          valor={`${mrrLiquidoPeriodo >= 0 ? "+" : ""}${formatarCentavos(mrrLiquidoPeriodo)}`}
        />
      </div>
      {(receitaPeriodo.novaMrrNaoIdentificados > 0 || receitaPeriodo.mrrCanceladaNaoIdentificados > 0) && (
        <p className={styles.note}>
          ⚠ {receitaPeriodo.novaMrrNaoIdentificados} nova(s) e {receitaPeriodo.mrrCanceladaNaoIdentificados}{" "}
          cancelamento(s) com preço não resolvido — não somados acima.
        </p>
      )}

      <p className={styles.sectionTitle}>Outras fontes de receita</p>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Fonte</th>
            <th>Status</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Assinaturas Premium</td>
            <td>REAL</td>
            <td className={styles.numCell}>{formatarCentavos(mrr.mrrCentavos)}/mês</td>
          </tr>
          <tr>
            <td>Google AdSense</td>
            <td>UNAVAILABLE</td>
            <td className={styles.numCell}>
              Sem integração com a API do AdSense — receita real existe (achado da auditoria), mas só
              é visível no painel do Google.
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

function HealthCell({ label, status, nota }: { label: string; status: "healthy" | "warning"; nota?: string }) {
  const dotClass = status === "healthy" ? styles.dotHealthy : styles.dotWarning;
  return (
    <div className={styles.healthCell}>
      <span className={`${styles.dot} ${dotClass}`} />
      <span>
        <span className={styles.healthLabel}>{label}</span>
        <span className={styles.healthStatus}>{nota}</span>
      </span>
    </div>
  );
}

function Kpi({ label, valor }: { label: string; valor: string }) {
  return (
    <div className={styles.kpiCell}>
      <span className={styles.kpiValue}>{valor}</span>
      <span className={styles.kpiLabel}>{label}</span>
    </div>
  );
}
