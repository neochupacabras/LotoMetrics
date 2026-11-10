// Rascunho do bolão montado por quem ainda não tem conta. Fica no
// localStorage (e não no sessionStorage, como antes) porque o cadastro
// confirma o e-mail num link que abre em OUTRA aba: com sessionStorage o
// organizador novo voltava para um montador vazio e perdia o bolão — o maior
// vazamento do funil (roadmap de growth, semana 3). Expira em 24 h para não
// ressuscitar um bolão esquecido dias depois.

export interface RascunhoBolao {
  orcamento: string;
  preco: string;
  participantes: string;
  tamanhoPool: number;
  garantia: number;
  selecionadas: number[];
  origem: string | null;
}

const VALIDADE_MS = 24 * 60 * 60 * 1000;

export function chaveRascunho(codigoLoteria: string) {
  return `la_bolao_rascunho_${codigoLoteria}`;
}

export function serializarRascunho(r: RascunhoBolao, agora: number): string {
  return JSON.stringify({ ...r, salvoEm: agora });
}

// null = não há rascunho, está vencido ou corrompido.
export function lerRascunho(bruto: string | null, agora: number): RascunhoBolao | null {
  if (!bruto) return null;
  try {
    const r = JSON.parse(bruto);
    if (typeof r?.salvoEm !== "number" || agora - r.salvoEm > VALIDADE_MS) return null;
    if (
      typeof r.orcamento !== "string" ||
      typeof r.preco !== "string" ||
      !Number.isInteger(r.tamanhoPool) ||
      !Number.isInteger(r.garantia) ||
      !Array.isArray(r.selecionadas) ||
      !r.selecionadas.every((d: unknown) => Number.isInteger(d))
    ) {
      return null;
    }
    return {
      orcamento: r.orcamento,
      preco: r.preco,
      participantes: typeof r.participantes === "string" ? r.participantes : "",
      tamanhoPool: r.tamanhoPool,
      garantia: r.garantia,
      selecionadas: r.selecionadas,
      origem: typeof r.origem === "string" ? r.origem : null,
    };
  } catch {
    return null;
  }
}
