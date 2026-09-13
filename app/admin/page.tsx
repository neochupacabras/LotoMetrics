import Link from "next/link";
import {
  getKpisExecutivos,
  getFrescorLoterias,
  getSaudeJobs,
  getUltimosJobRuns,
  getSaudeErros,
  getUsoFerramentasComparado,
  type KpiComparado,
  type StatusSaude,
} from "@/lib/admin/queries";
import { resolverPeriodo, ehPeriodoId, type PeriodoId } from "@/lib/admin/periodo";
import { getMrrAtual, getSaudePagamentos, getReceitaPeriodo } from "@/lib/admin/revenue";
import { formatarCentavos } from "@/lib/admin/precos";
import { insightsFerramentas, insightsDados, insightsReceita, type Insight } from "@/lib/admin/insights";
import PeriodoNav from "@/components/admin/PeriodoNav";
import styles from "./admin.module.css";

export const dynamic = "force-dynamic";

const LABEL_STATUS: Record<StatusSaude, string> = {
  healthy: "Saudável",
  warning: "Atenção",
  critical: "Crítico",
  unknown: "Sem dados ainda",
};

const DOT_CLASS: Record<StatusSaude, string> = {
  healthy: styles.dotHealthy,
  warning: styles.dotWarning,
  critical: styles.dotCritical,
  unknown: styles.dotUnknown,
};

const NOME_JOB: Record<string, string> = {
  cron_conferir: "Conferir jogos (e-mail)",
  cron_relatorio: "Relatório mensal",
  revalidar: "Revalidar cache",
  importador_resultados: "Importador de resultados",
};

function statusGeral(statuses: StatusSaude[]): StatusSaude {
  if (statuses.some((s) => s === "critical")) return "critical";
  if (statuses.some((s) => s === "warning")) return "warning";
  if (statuses.every((s) => s === "unknown")) return "unknown";
  return "healthy";
}

interface Alerta {
  texto: string;
  nivel: "warning" | "critical";
}

// Regras simples e documentadas (seção 31 do audit) — só sinaliza o que dá
// pra justificar com dado real hoje: job travado/falhando, loteria com
// dados atrasados, ou volume de erro acima do limiar já usado no Platform
// Health. Nada de limiar arbitrário novo só pra preencher a seção.
function montarAlertas(
  jobs: Awaited<ReturnType<typeof getSaudeJobs>>,
  frescor: Awaited<ReturnType<typeof getFrescorLoterias>>,
  erros: Awaited<ReturnType<typeof getSaudeErros>>
): Alerta[] {
  const alertas: Alerta[] = [];

  for (const j of jobs) {
    if (j.status === "critical") {
      alertas.push({
        texto:
          j.ultimoStatus === "failed"
            ? `Job "${NOME_JOB[j.jobName] ?? j.jobName}" falhou na última execução.`
            : `Job "${NOME_JOB[j.jobName] ?? j.jobName}" está atrasado (${j.horasDesde}h desde a última execução).`,
        nivel: "critical",
      });
    } else if (j.status === "warning") {
      alertas.push({ texto: `Job "${NOME_JOB[j.jobName] ?? j.jobName}" está próximo do limite de atraso.`, nivel: "warning" });
    }
  }

  for (const f of frescor) {
    if (f.status === "critical") {
      alertas.push({
        texto: f.diasDesde == null
          ? `Nenhum concurso de ${f.nome} encontrado no banco.`
          : `Dados de ${f.nome} desatualizados há ${f.diasDesde} dias.`,
        nivel: "critical",
      });
    } else if (f.status === "warning") {
      alertas.push({ texto: `Dados de ${f.nome} começando a atrasar (${f.diasDesde} dias).`, nivel: "warning" });
    }
  }

  if (erros.status === "critical") {
    alertas.push({ texto: `${erros.ultimas24h} erros registrados nas últimas 24h.`, nivel: "critical" });
  } else if (erros.status === "warning") {
    alertas.push({ texto: `${erros.ultimas24h} erros registrados nas últimas 24h — acima do normal.`, nivel: "warning" });
  }

  return alertas;
}

function montarAlertaPagamentos(pagamentos: Awaited<ReturnType<typeof getSaudePagamentos>>): Alerta[] {
  if (pagamentos.pastDue === 0) return [];
  return [{ texto: `${pagamentos.pastDue} assinatura(s) com pagamento em atraso (past_due).`, nivel: "warning" }];
}

// Só alerta com base mínima de assinantes — com poucos assinantes, 1
// cancelamento já derruba o MRR líquido a zero ou negativo sem ser sinal de
// problema real (ver AMOSTRA_MINIMA em lib/admin/insights.ts, mesmo raciocínio).
function montarAlertaReceita(
  receitaPeriodo: Awaited<ReturnType<typeof getReceitaPeriodo>>,
  mrr: Awaited<ReturnType<typeof getMrrAtual>>
): Alerta[] {
  if (mrr.assinantesAtivos < 10) return [];
  const liquido = receitaPeriodo.novaMrrCentavos - receitaPeriodo.mrrCanceladaCentavos;
  if (liquido < 0) {
    return [{ texto: `MRR líquido negativo no período (${formatarCentavos(liquido)}) — mais cancelamento que assinatura nova em valor.`, nivel: "warning" }];
  }
  return [];
}

export default async function AdminOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const periodoId: PeriodoId = ehPeriodoId(sp.period) ? sp.period : "30d";
  const periodo = resolverPeriodo(periodoId, sp.from, sp.to);

  const [kpis, frescor, jobs, ultimosJobs, erros, usoFerramentas, mrr, pagamentos, receitaPeriodo] = await Promise.all([
    getKpisExecutivos(periodo),
    getFrescorLoterias(),
    getSaudeJobs(),
    getUltimosJobRuns(8),
    getSaudeErros(),
    getUsoFerramentasComparado(periodo),
    getMrrAtual(),
    getSaudePagamentos(),
    getReceitaPeriodo(periodo),
  ]);
  const dadosLoteriasStatus = statusGeral(frescor.map((f) => f.status));
  const jobsStatus = statusGeral(jobs.map((j) => j.status));
  const alertas = [
    ...montarAlertas(jobs, frescor, erros),
    ...montarAlertaPagamentos(pagamentos),
    ...montarAlertaReceita(receitaPeriodo, mrr),
  ];
  const insights: Insight[] = [
    ...insightsFerramentas(usoFerramentas),
    ...insightsDados(frescor),
    ...insightsReceita(receitaPeriodo, mrr),
  ];

  return (
    <>
      <h1 className={styles.pageTitle}>Overview</h1>
      <p className={styles.pageSubtitle}>
        Fase 3 — KPIs com comparação de período. Ver <code>docs/ADMIN_AUDIT.md</code> e{" "}
        <code>docs/KPI_DICTIONARY.md</code> para definições formais.
      </p>

      <p className={styles.sectionTitle}>Precisa atenção</p>
      {alertas.length === 0 ? (
        <p className={styles.note}>Nenhum problema detectado pelas regras atuais.</p>
      ) : (
        <ul className={styles.alertList}>
          {alertas.map((a, i) => (
            <li key={i} className={a.nivel === "critical" ? styles.alertCritical : styles.alertWarning}>
              {a.texto}
            </li>
          ))}
        </ul>
      )}

      <p className={styles.sectionTitle}>Insights</p>
      <p className={styles.note}>
        Gerados por regra sobre dados já calculados nas outras seções — nunca texto de IA. Cada regra
        exige um volume mínimo de eventos antes de falar em variação percentual, pra não confundir
        ruído estatístico com sinal real (a base de usuários do produto ainda é pequena). Sem
        previsão/forecasting — ver docs/KPI_DICTIONARY.md sobre por quê.
      </p>
      {insights.length === 0 ? (
        <p className={styles.note}>Nenhum insight com dado suficiente neste período.</p>
      ) : (
        <ul className={styles.alertList}>
          {insights.map((ins, i) => (
            <li
              key={i}
              className={ins.tipo === "negativo" ? styles.alertWarning : ins.tipo === "positivo" ? styles.insightPositivo : undefined}
            >
              {ins.texto}
            </li>
          ))}
        </ul>
      )}

      <p className={styles.sectionTitle}>Platform Health</p>
      <div className={styles.healthGrid}>
        <HealthCell label="Usuários" status="healthy" />
        <HealthCell label="Dados das loterias" status={dadosLoteriasStatus} />
        <HealthCell
          label="Receita"
          status={pagamentos.status}
          nota={pagamentos.pastDue === 0 ? "Pagamentos em dia" : `${pagamentos.pastDue} em atraso`}
        />
        <HealthCell label="Jobs" status={jobsStatus} />
        <HealthCell label="Erros" status={erros.status} nota={`${erros.ultimas24h} nas últimas 24h`} />
        <HealthCell label="API" status="unknown" nota="Uso em /admin/api — sem métrica de erro/latência" />
      </div>

      <div className={styles.periodoBar}>
        <span className={styles.sectionTitle} style={{ margin: 0 }}>
          KPIs executivos
        </span>
        <PeriodoNav periodo={periodo} basePath="/admin" customFrom={sp.from} customTo={sp.to} />
      </div>
      <p className={styles.note}>
        Período: {periodo.label} ({periodo.from.toLocaleDateString("pt-BR")} – {periodo.to.toLocaleDateString("pt-BR")}
        ), comparado ao período imediatamente anterior de mesma duração.
      </p>
      <div className={styles.kpiGrid}>
        <Kpi label="Usuários totais" value={kpis.usuariosTotais} />
        <KpiComparadoCell label="Novos usuários" dado={kpis.novosUsuarios} />
        <Kpi label="Assinantes Premium" value={kpis.premiumAtivos} />
        <Kpi label="Free" value={kpis.free} />
        <KpiTexto label="MRR" valor={formatarCentavos(mrr.mrrCentavos)} />
        <KpiTexto label="ARR" valor={formatarCentavos(mrr.arrCentavos)} />
        <KpiComparadoCell label="Cancelamentos" dado={kpis.cancelamentos} invertido />
        <KpiComparadoCell label="Execuções de ferramentas*" dado={kpis.execucoesFerramentas} />
        <KpiTaxaErro dado={kpis.taxaErroFerramentas} />
        <KpiComparadoCell label="Erros" dado={kpis.erros} invertido />
      </div>
      <p className={styles.note}>
        MRR/ARR são snapshot de agora (não do período selecionado) — detalhamento por plano e
        movimentação (novo/cancelado) em <Link href="/admin/revenue">/admin/revenue</Link>.
        {mrr.assinantesNaoIdentificados > 0 && (
          <> ⚠ {mrr.assinantesNaoIdentificados} assinante(s) com preço não resolvido pela API do Stripe — não somado(s) acima.</>
        )}
      </p>
      <p className={styles.note}>
        *Só as ferramentas com paywall estão instrumentadas até agora (gerador, simulador,
        conferidor, OCR, exportação CSV, relatório PDF) — não é o total das 16 ferramentas do site.
      </p>

      <p className={styles.sectionTitle}>Frescor de dados por loteria</p>
      <p className={styles.note}>
        Status calculado a partir da cadência esperada de sorteios de cada loteria (lib/calendario.ts) — não
        é uma verificação exata dia a dia, serve para sinalizar atraso visível na importação. Checagens
        de integridade (gaps, duplicados) em <Link href="/admin/data-health">/admin/data-health</Link>.
      </p>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Loteria</th>
            <th>Último concurso</th>
            <th>Data do sorteio</th>
            <th>Dias desde</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {frescor.map((f) => (
            <tr key={f.codigo}>
              <td>{f.nome}</td>
              <td className={styles.numCell}>{f.ultimoConcurso ?? "—"}</td>
              <td className={styles.numCell}>
                {f.dataUltimoSorteio ? new Date(f.dataUltimoSorteio).toLocaleDateString("pt-BR") : "—"}
              </td>
              <td className={styles.numCell}>{f.diasDesde ?? "—"}</td>
              <td>
                <span className={`${styles.dot} ${DOT_CLASS[f.status]}`} style={{ display: "inline-block", marginRight: 6 }} />
                {LABEL_STATUS[f.status]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className={styles.sectionTitle}>Jobs recentes</p>
      <p className={styles.note}>
        Últimas 8 execuções — histórico completo, estatísticas e p50/p95 de duração em{" "}
        <Link href="/admin/jobs">/admin/jobs</Link>. Tolerância de atraso documentada em
        docs/KPI_DICTIONARY.md.
      </p>
      {ultimosJobs.length === 0 ? (
        <p className={styles.note}>
          Nenhuma execução registrada ainda — a instrumentação acabou de ser ligada. As próximas
          execuções dos crons e do importador vão aparecer aqui.
        </p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Job</th>
              <th>Iniciado em</th>
              <th>Duração</th>
              <th>Status</th>
              <th>Erro</th>
            </tr>
          </thead>
          <tbody>
            {ultimosJobs.map((j, i) => (
              <tr key={i}>
                <td>{NOME_JOB[j.jobName] ?? j.jobName}</td>
                <td className={styles.numCell}>{new Date(j.startedAt).toLocaleString("pt-BR")}</td>
                <td className={styles.numCell}>{j.durationMs != null ? `${(j.durationMs / 1000).toFixed(1)}s` : "—"}</td>
                <td>{j.status}</td>
                <td>{j.error ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className={styles.sectionTitle}>Uso de ferramentas</p>
      <p className={styles.note}>
        As 16 ferramentas já emitem <code>tool_view</code>; conclusão/falha e paywall só nas que
        têm gate de Premium (ver <code>docs/KPI_DICTIONARY.md</code>). Tabela completa e matriz por
        loteria em <Link href="/admin/tools">/admin/tools</Link> e <Link href="/admin/lotteries">/admin/lotteries</Link>.
      </p>
      {usoFerramentas.length === 0 ? (
        <p className={styles.note}>Nenhum evento registrado ainda — normal logo após ligar a instrumentação.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Ferramenta</th>
              <th>Views</th>
              <th>Conclusões</th>
              <th>Falhas</th>
              <th>Paywall</th>
            </tr>
          </thead>
          <tbody>
            {usoFerramentas.map((u) => (
              <tr key={u.tool}>
                <td>{u.tool}</td>
                <td className={styles.numCell}>{u.views}</td>
                <td className={styles.numCell}>{u.completions}</td>
                <td className={styles.numCell}>{u.failures}</td>
                <td className={styles.numCell}>{u.paywalls}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

function HealthCell({
  label,
  status,
  nota,
}: {
  label: string;
  status: StatusSaude;
  nota?: string;
}) {
  const dotClass = DOT_CLASS[status];
  const texto = status === "unknown" ? nota ?? "Sem dados ainda" : nota ? `${LABEL_STATUS[status]} · ${nota}` : LABEL_STATUS[status];
  return (
    <div className={styles.healthCell}>
      <span className={`${styles.dot} ${dotClass}`} />
      <span>
        <span className={styles.healthLabel}>{label}</span>
        <span className={styles.healthStatus}>{texto}</span>
      </span>
    </div>
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

function KpiTexto({ label, valor }: { label: string; valor: string }) {
  return (
    <div className={styles.kpiCell}>
      <span className={styles.kpiValue}>{valor}</span>
      <span className={styles.kpiLabel}>{label}</span>
    </div>
  );
}

// invertido=true pra métricas onde "subir" é ruim (cancelamentos, erros) —
// inverte só a cor do indicador, não o sinal do número exibido.
function KpiComparadoCell({ label, dado, invertido }: { label: string; dado: KpiComparado; invertido?: boolean }) {
  const subiu = dado.variacaoPct != null && dado.variacaoPct > 0;
  const desceu = dado.variacaoPct != null && dado.variacaoPct < 0;
  const positivo = invertido ? desceu : subiu;
  const negativo = invertido ? subiu : desceu;
  return (
    <div className={styles.kpiCell}>
      <span className={styles.kpiValue}>{dado.atual.toLocaleString("pt-BR")}</span>
      <span className={styles.kpiLabel}>{label}</span>
      {dado.variacaoPct == null ? (
        <span className={styles.kpiTrendNeutral}>sem período anterior p/ comparar</span>
      ) : (
        <span className={positivo ? styles.kpiTrendUp : negativo ? styles.kpiTrendDown : styles.kpiTrendNeutral}>
          {dado.variacaoPct > 0 ? "↑" : dado.variacaoPct < 0 ? "↓" : "→"} {Math.abs(dado.variacaoPct).toFixed(1)}% vs período anterior
        </span>
      )}
    </div>
  );
}

function KpiTaxaErro({ dado }: { dado: { atual: number | null; anterior: number | null } }) {
  return (
    <div className={styles.kpiCell}>
      <span className={styles.kpiValue}>{dado.atual != null ? `${dado.atual.toFixed(1)}%` : "—"}</span>
      <span className={styles.kpiLabel}>Taxa de erro (ferramentas)*</span>
      <span className={styles.kpiTrendNeutral}>
        {dado.atual == null
          ? "sem execuções no período"
          : dado.anterior != null
          ? `período anterior: ${dado.anterior.toFixed(1)}%`
          : "sem período anterior p/ comparar"}
      </span>
    </div>
  );
}
