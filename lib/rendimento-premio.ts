// Calculadora "quanto rende o prêmio" (semana 5 do roadmap de growth, gancho
// da Mega da Virada: "quanto rende 1 bilhão na poupança"). Regras puras,
// testadas em lib/rendimento-premio.test.ts; as taxas vêm do Banco Central
// (lib/taxas-bcb.ts).
//
// É uma estimativa com as taxas de hoje, não recomendação de investimento:
// as taxas mudam, e o rendimento real depende do produto, do prazo e da
// instituição.

export const ALIQUOTA_IR_PREMIO = 0.3; // retido na fonte pela Caixa
// IR regressivo de renda fixa para quem deixa o dinheiro aplicado mais de
// 2 anos (prazos menores pagam 22,5% a 17,5%).
export const ALIQUOTA_IR_LONGO_PRAZO = 0.15;
// Taxa de custódia da B3 no Tesouro Direto (0,20% ao ano sobre o valor).
export const CUSTODIA_TESOURO = 0.002;
// Garantia do FGC por CPF e por instituição, em CDB.
export const LIMITE_FGC = 250_000;

export interface Taxas {
  poupancaMensal: number; // % ao mês (série 195)
  cdiAnual: number; // % ao ano (série 4389)
  selicAnual: number; // % ao ano, efetiva (série 1178)
  data: string; // dd/mm/aaaa da taxa mais recente usada
  fonte: "bcb" | "reserva";
}

export interface LinhaRendimento {
  id: "poupanca" | "tesouro-selic" | "cdb";
  nome: string;
  mensal: number;
  anual: number;
  nota: string;
}

export interface Rendimentos {
  liquido: number;
  impostoPremio: number;
  linhas: LinhaRendimento[];
}

const mensalDeAnual = (anualPct: number) => Math.pow(1 + anualPct / 100, 1 / 12) - 1;

export function calcularRendimentos(valor: number, valorBruto: boolean, taxas: Taxas): Rendimentos {
  const v = Number.isFinite(valor) && valor > 0 ? valor : 0;
  const impostoPremio = valorBruto ? v * ALIQUOTA_IR_PREMIO : 0;
  const liquido = v - impostoPremio;

  // Poupança: rendimento do mês já é líquido (isenta de IR).
  const poupMes = liquido * (taxas.poupancaMensal / 100);
  const poupAno = liquido * (Math.pow(1 + taxas.poupancaMensal / 100, 12) - 1);

  // Tesouro Selic: Selic menos a custódia, e IR de 15% sobre o ganho.
  const selicLiquidaAnual = Math.max(0, taxas.selicAnual - CUSTODIA_TESOURO * 100);
  const tesMes = liquido * mensalDeAnual(selicLiquidaAnual) * (1 - ALIQUOTA_IR_LONGO_PRAZO);
  const tesAno = liquido * (selicLiquidaAnual / 100) * (1 - ALIQUOTA_IR_LONGO_PRAZO);

  // CDB a 100% do CDI, IR de 15% sobre o ganho.
  const cdbMes = liquido * mensalDeAnual(taxas.cdiAnual) * (1 - ALIQUOTA_IR_LONGO_PRAZO);
  const cdbAno = liquido * (taxas.cdiAnual / 100) * (1 - ALIQUOTA_IR_LONGO_PRAZO);

  return {
    liquido,
    impostoPremio,
    linhas: [
      { id: "poupanca", nome: "Poupança", mensal: poupMes, anual: poupAno, nota: "Isenta de imposto de renda." },
      {
        id: "tesouro-selic",
        nome: "Tesouro Selic",
        mensal: tesMes,
        anual: tesAno,
        nota: "Já descontados 15% de IR (aplicação por mais de 2 anos) e a custódia da B3 de 0,20% ao ano.",
      },
      {
        id: "cdb",
        nome: "CDB a 100% do CDI",
        mensal: cdbMes,
        anual: cdbAno,
        nota: `Já descontados 15% de IR. O FGC só garante até ${LIMITE_FGC.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })} por CPF e por instituição.`,
      },
    ],
  };
}

// Lê o valor digitado ("1.000.000", "1000000,50", "R$ 2 000 000").
export function lerValor(texto: string): number {
  const limpo = texto.replace(/[^\d,]/g, "").replace(",", ".");
  const n = parseFloat(limpo);
  return Number.isFinite(n) ? n : 0;
}

// Resposta da API SGS do Banco Central: [{ data: "dd/mm/aaaa", valor: "13.65" }, ...]
// em ordem que nem sempre é cronológica e, na meta Selic, com datas futuras.
// Devolve o registro mais recente até `hoje`.
export function ultimoValorSgs(
  serie: unknown,
  hoje: Date
): { valor: number; data: string } | null {
  if (!Array.isArray(serie)) return null;
  let melhor: { valor: number; data: string; t: number } | null = null;
  for (const item of serie) {
    const data = typeof item?.data === "string" ? item.data : "";
    const m = data.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    const valor = Number(item?.valor);
    if (!m || !Number.isFinite(valor)) continue;
    const t = Date.UTC(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
    if (t > hoje.getTime()) continue;
    if (!melhor || t > melhor.t) melhor = { valor, data, t };
  }
  return melhor ? { valor: melhor.valor, data: melhor.data } : null;
}
