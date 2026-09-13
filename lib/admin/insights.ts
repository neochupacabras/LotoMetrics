import type { UsoFerramentaComparado, FrescorLoteria } from "@/lib/admin/queries";
import type { ReceitaPeriodo, MrrAtual } from "@/lib/admin/revenue";
import type { ResumoBusca } from "@/lib/admin/search-console";
import { formatarCentavos } from "@/lib/admin/precos";

// Fase 8 do Admin — Intelligence. Regras simples sobre dados já calculados
// em outras partes do Admin, NUNCA texto gerado por IA (audit, seção 47:
// "insights simples baseados em regras podem ser melhores, mais baratos e
// mais confiáveis"). Cada regra exige uma amostra mínima antes de falar em
// "%" — com a base de usuários atual do produto (dezenas, não milhares), a
// maioria das comparações percentuais é ruído estatístico, não sinal real.
// Forecasting foi deliberadamente NÃO implementado por este mesmo motivo —
// ver docs/KPI_DICTIONARY.md.

export interface Insight {
  texto: string;
  tipo: "positivo" | "negativo" | "neutro";
}

const AMOSTRA_MINIMA = 10;
const VARIACAO_RELEVANTE_PCT = 20;

export function insightsFerramentas(uso: UsoFerramentaComparado[]): Insight[] {
  const insights: Insight[] = [];
  if (uso.length === 0) return insights;

  const maisVista = [...uso].sort((a, b) => b.views - a.views)[0];
  if (maisVista.views > 0) {
    insights.push({ texto: `Ferramenta mais vista no período: "${maisVista.tool}" (${maisVista.views} views).`, tipo: "neutro" });
  }

  const comVolume = uso.filter((u) => u.completions + u.failures >= AMOSTRA_MINIMA);
  if (comVolume.length > 0) {
    const piorErro = [...comVolume].sort(
      (a, b) => b.failures / (b.completions + b.failures) - a.failures / (a.completions + a.failures)
    )[0];
    const taxa = (piorErro.failures / (piorErro.completions + piorErro.failures)) * 100;
    if (taxa > 5) {
      insights.push({
        texto: `"${piorErro.tool}" tem a maior taxa de falha entre as ferramentas com volume suficiente para comparar (${piorErro.completions + piorErro.failures} execuções): ${taxa.toFixed(1)}%.`,
        tipo: "negativo",
      });
    }
  }

  const comBase = uso.filter((u) => u.viewsAnterior >= AMOSTRA_MINIMA);
  if (comBase.length > 0) {
    const variacoes = comBase.map((u) => ({ u, pct: ((u.views - u.viewsAnterior) / u.viewsAnterior) * 100 }));
    const maior = variacoes.reduce((max, v) => (Math.abs(v.pct) > Math.abs(max.pct) ? v : max));
    if (Math.abs(maior.pct) >= VARIACAO_RELEVANTE_PCT) {
      insights.push({
        texto: `"${maior.u.tool}" teve ${maior.pct > 0 ? "alta" : "queda"} de ${Math.abs(maior.pct).toFixed(0)}% em views vs período anterior (${maior.u.viewsAnterior} → ${maior.u.views}).`,
        tipo: maior.pct > 0 ? "positivo" : "negativo",
      });
    }
  } else {
    insights.push({
      texto: `Volume de uso ainda baixo para comparar tendência entre períodos com confiança (nenhuma ferramenta com ≥${AMOSTRA_MINIMA} views no período anterior).`,
      tipo: "neutro",
    });
  }

  return insights;
}

export function insightsDados(frescor: FrescorLoteria[]): Insight[] {
  const insights: Insight[] = [];
  const criticos = frescor.filter((f) => f.status === "critical");
  // Só vira insight se for uma minoria com problema — se todas estão
  // críticas (ex.: banco local de dev incompleto), isso já é óbvio no
  // Platform Health, repetir aqui não agrega nada.
  if (criticos.length > 0 && criticos.length < frescor.length) {
    insights.push({
      texto: `${criticos.length} de ${frescor.length} loterias com dados desatualizados: ${criticos.map((f) => f.nome).join(", ")}.`,
      tipo: "negativo",
    });
  }
  return insights;
}

export function insightsReceita(receitaPeriodo: ReceitaPeriodo, mrr: MrrAtual): Insight[] {
  const insights: Insight[] = [];
  if (mrr.assinantesAtivos < AMOSTRA_MINIMA) {
    insights.push({
      texto: `Base de assinantes ainda pequena (${mrr.assinantesAtivos}) para insights de tendência de receita serem estatisticamente confiáveis.`,
      tipo: "neutro",
    });
    return insights;
  }
  const liquido = receitaPeriodo.novaMrrCentavos - receitaPeriodo.mrrCanceladaCentavos;
  if (liquido !== 0) {
    insights.push({
      texto: `MRR líquido no período: ${liquido > 0 ? "+" : ""}${formatarCentavos(liquido)} (${formatarCentavos(receitaPeriodo.novaMrrCentavos)} novo, ${formatarCentavos(receitaPeriodo.mrrCanceladaCentavos)} cancelado).`,
      tipo: liquido > 0 ? "positivo" : "negativo",
    });
  }
  return insights;
}

export function insightsAquisicao(atual: ResumoBusca | null, anterior: ResumoBusca | null): Insight[] {
  const insights: Insight[] = [];
  if (!atual || !anterior || anterior.clicks < AMOSTRA_MINIMA) return insights;
  const pct = ((atual.clicks - anterior.clicks) / anterior.clicks) * 100;
  if (Math.abs(pct) >= VARIACAO_RELEVANTE_PCT) {
    insights.push({
      texto: `Cliques orgânicos (Search Console) ${pct > 0 ? "cresceram" : "caíram"} ${Math.abs(pct).toFixed(0)}% vs período anterior (${anterior.clicks} → ${atual.clicks}).`,
      tipo: pct > 0 ? "positivo" : "negativo",
    });
  }
  return insights;
}
