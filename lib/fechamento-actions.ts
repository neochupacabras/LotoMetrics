"use server";

import { gerarFechamentoCompleto, gerarFechamentoReduzido } from "./fechamento";
import { FECHAMENTO_CONFIG } from "./fechamento-config";
import { getLoteriaPorCodigo } from "./queries";

export interface FechamentoActionResult {
  ok: boolean;
  erro?: string;
  tickets?: number[][];
  totalTickets?: number;
  pontosGarantidos?: number;
  garantiaVerificada?: boolean;
  tipo?: "completo" | "reduzido";
}

export async function calcularFechamentoAction(
  codigoLoteria: string,
  pool: number[],
  tipo: "completo" | "reduzido",
  k?: number
): Promise<FechamentoActionResult> {
  const loteria = await getLoteriaPorCodigo(codigoLoteria);
  if (!loteria) {
    return { ok: false, erro: "Loteria não encontrada." };
  }

  const config = FECHAMENTO_CONFIG[codigoLoteria];
  if (!config) {
    return { ok: false, erro: "Fechamentos não disponíveis para esta loteria." };
  }

  const poolUnico = Array.from(new Set(pool));
  if (poolUnico.length !== pool.length) {
    return { ok: false, erro: "Há dezenas repetidas na seleção." };
  }
  if (pool.some((d) => d < loteria.dezenaMin || d > loteria.dezenaMax)) {
    return { ok: false, erro: "Há uma dezena fora da faixa válida desta loteria." };
  }
  if (pool.length < config.poolMin || pool.length > config.poolMax) {
    return {
      ok: false,
      erro: `Selecione entre ${config.poolMin} e ${config.poolMax} dezenas para gerar um fechamento.`,
    };
  }

  if (tipo === "completo") {
    const resultado = gerarFechamentoCompleto(pool, loteria.qtdDezenasSorteadas);
    return {
      ok: true,
      tickets: resultado.tickets,
      totalTickets: resultado.totalTickets,
      pontosGarantidos: resultado.pontosGarantidos,
      garantiaVerificada: resultado.garantiaVerificada,
      tipo,
    };
  }

  const ksPermitidos = config.getKsPermitidos(pool.length);
  if (!k || !ksPermitidos.includes(k)) {
    return {
      ok: false,
      erro: `Para ${pool.length} dezenas, as garantias disponíveis são: ${ksPermitidos.join(", ")} pontos.`,
    };
  }

  const resultado = gerarFechamentoReduzido(pool, loteria.qtdDezenasSorteadas, k);

  // Portão de segurança: a garantia só é entregue ao usuário se a
  // verificação por força bruta confirmou matematicamente que vale para
  // TODOS os casos possíveis. Isso nunca deveria falhar dado o conjunto
  // de parâmetros permitidos acima (foi testado), mas o sistema se
  // recusa a afirmar uma garantia não verificada de qualquer forma.
  if (!resultado.garantiaVerificada) {
    return {
      ok: false,
      erro:
        "Não foi possível confirmar matematicamente a garantia para esses parâmetros. Tente o fechamento completo, que é sempre garantido por definição.",
    };
  }

  return {
    ok: true,
    tickets: resultado.tickets,
    totalTickets: resultado.totalTickets,
    pontosGarantidos: resultado.pontosGarantidos,
    garantiaVerificada: resultado.garantiaVerificada,
    tipo,
  };
}
