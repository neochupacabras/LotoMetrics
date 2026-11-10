import { ultimoValorSgs, type Taxas } from "./rendimento-premio";

// Taxas do Banco Central para a calculadora "quanto rende o prêmio", pela API
// pública do SGS (gratuita, sem chave). Cache de 1 dia pelo fetch do Next.
// Se a API falhar ou demorar, usa os valores de reserva abaixo, com a data
// deles na tela (fonte "reserva").
//
// Séries: 195 = rendimento da poupança no período (% a.m.; só responde com
// intervalo de datas), 4389 = CDI anualizado base 252 (% a.a.),
// 1178 = Selic anualizada base 252 (% a.a., taxa efetiva).

const RESERVA: Taxas = {
  poupancaMensal: 0.65,
  cdiAnual: 13.65,
  selicAnual: 13.65,
  data: "09/11/2026",
  fonte: "reserva",
};

function dataBr(d: Date): string {
  return `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${d.getUTCFullYear()}`;
}

async function serie(codigo: number, inicio: Date, fim: Date): Promise<unknown> {
  const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${codigo}/dados?formato=json&dataInicial=${dataBr(inicio)}&dataFinal=${dataBr(fim)}`;
  const resp = await fetch(url, { next: { revalidate: 86400 }, signal: AbortSignal.timeout(5000) });
  if (!resp.ok) throw new Error(`BCB ${codigo}: HTTP ${resp.status}`);
  return resp.json();
}

export async function getTaxasBcb(agora: Date = new Date()): Promise<Taxas> {
  const inicio = new Date(agora.getTime() - 45 * 864e5);
  try {
    const [poup, cdi, selic] = await Promise.all([serie(195, inicio, agora), serie(4389, inicio, agora), serie(1178, inicio, agora)]);
    const p = ultimoValorSgs(poup, agora);
    const c = ultimoValorSgs(cdi, agora);
    const s = ultimoValorSgs(selic, agora);
    if (!p || !c || !s) throw new Error("BCB: série vazia");
    // A data mostrada é a do CDI (diária); a da poupança é a do aniversário.
    return { poupancaMensal: p.valor, cdiAnual: c.valor, selicAnual: s.valor, data: c.data, fonte: "bcb" };
  } catch (err) {
    console.error("Taxas do BCB indisponíveis, usando reserva:", (err as Error).message);
    return RESERVA;
  }
}
