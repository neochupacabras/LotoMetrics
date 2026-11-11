// Regra de datas da renovação antecipada do Premium: pagar antes de vencer
// nunca pode perder dias, pelo Pix ou pelo cartão. O novo período só começa
// quando o atual termina. Funções puras, testadas em lib/renovacao.test.ts;
// usadas no checkout do Stripe (app/api/stripe/checkout/route.ts) e no
// webhook do Pix (app/api/mercadopago/webhook/route.ts).
//
// Casos:
// - Pix sobre Pix: soma a partir do fim do crédito atual (já era assim).
// - Cartão com crédito Pix ainda válido: a assinatura nasce em "trial" até o
//   fim do crédito, e a primeira cobrança só acontece quando ele acaba.
// - Pix com assinatura de cartão ativa: o Pix soma a partir do fim do período
//   já pago no cartão, e a próxima cobrança do Stripe é adiada para a nova
//   data (trial_end), sem proration.

const DIA_MS = 24 * 60 * 60 * 1000;

// O Stripe Checkout exige trial_end pelo menos 48 h no futuro. Uma folga de
// 1 h cobre o tempo entre criar a sessão e a pessoa concluir o pagamento.
export const TRIAL_MINIMO_CHECKOUT_MS = 49 * 60 * 60 * 1000;
export const DIAS_TRIAL_NOVO_ASSINANTE = 7;

function data(valor: string | Date | null | undefined): Date | null {
  if (!valor) return null;
  const d = valor instanceof Date ? valor : new Date(valor);
  return Number.isNaN(d.getTime()) ? null : d;
}

// Quando começa o período que está sendo pago agora: o mais tarde entre
// "agora", o fim do crédito gravado no perfil e o fim do período já pago no
// cartão.
export function inicioDoNovoPeriodo(
  agora: Date,
  ...fins: (string | Date | null | undefined)[]
): Date {
  let inicio = agora;
  for (const f of fins) {
    const d = data(f);
    if (d && d > inicio) inicio = d;
  }
  return inicio;
}

export function somarDias(base: Date, dias: number): Date {
  return new Date(base.getTime() + dias * DIA_MS);
}

// trial_end (segundos Unix) para o checkout do Stripe, ou null para seguir o
// fluxo normal (cobrança na hora, ou os 7 dias de teste de quem nunca
// assinou, via trial_period_days).
//
// Com crédito ainda válido, a primeira cobrança fica para o fim do crédito.
// Se o crédito acaba em menos de 49 h, o trial vai até o mínimo que o Stripe
// aceita: a pessoa ganha no máximo 2 dias, nunca perde. Quem ainda tem
// direito ao teste de 7 dias fica com o que terminar mais tarde (o teste não
// soma ao crédito).
export function trialEndDoCheckout(opcoes: {
  agora: Date;
  creditoAte: string | null | undefined;
  elegivelParaTrial: boolean;
}): number | null {
  const { agora } = opcoes;
  const credito = data(opcoes.creditoAte);
  if (!credito || credito <= agora) return null;

  const minimo = new Date(agora.getTime() + TRIAL_MINIMO_CHECKOUT_MS);
  const teste = opcoes.elegivelParaTrial ? somarDias(agora, DIAS_TRIAL_NOVO_ASSINANTE) : null;
  const fim = inicioDoNovoPeriodo(credito, minimo, teste);
  return Math.floor(fim.getTime() / 1000);
}

// Assinatura de cartão que vai cobrar de novo sozinha e, por isso, precisa
// ter a próxima cobrança adiada quando entra um Pix. Assinatura já marcada
// para cancelar, em atraso ou encerrada não é tocada.
export function assinaturaRenovaSozinha(sub: {
  status: string;
  cancel_at_period_end: boolean;
  cancel_at?: number | null;
}): boolean {
  return ["active", "trialing"].includes(sub.status) && !sub.cancel_at_period_end && !sub.cancel_at;
}
