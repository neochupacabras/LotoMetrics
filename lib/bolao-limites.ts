import { descontarDias } from "./plano-premium";

// Regras puras de limite do bolão (grátis × Pro) — sem imports de servidor,
// pra poder ser testada e usada tanto nas Server Actions quanto na UI.
//
// Grátis: 1 bolão ativo, até 10 cotas, e-mail do resultado só pro organizador.
// Pro (R$ 14,90 por bolão via Pix, ou conta Premium): até 100 cotas, aviso
// pros participantes com e-mail e sem anúncios. Ver plano da Fase 3.

export const LIMITE_COTAS_GRATIS = 10;
export const LIMITE_COTAS_PRO = 100;
export const LIMITE_BOLOES_ATIVOS_GRATIS = 1;
export const DIAS_BOLAO_PRO = 30;

export interface BolaoParaPlano {
  pro_ate?: string | null;
}

// Bolão é Pro se o dono tem Premium ou se o próprio bolão tem o Pix de
// Bolão Pro ainda válido.
export function bolaoEhPro(
  bolao: BolaoParaPlano | null | undefined,
  donoPremium: boolean,
  agora: Date = new Date()
): boolean {
  if (donoPremium) return true;
  return !!bolao?.pro_ate && new Date(bolao.pro_ate) > agora;
}

export function limiteCotas(ehPro: boolean): number {
  return ehPro ? LIMITE_COTAS_PRO : LIMITE_COTAS_GRATIS;
}

export type MotivoBloqueio = "cotas" | "boloes_ativos";

export interface ResultadoLimite {
  ok: boolean;
  motivo?: MotivoBloqueio;
  erro?: string;
}

// Criar um bolão: o plano grátis tem 1 ativo (aberto ou fechado, ainda sem
// resultado) e até 10 cotas. Premium não tem limite de bolões ativos.
export function podeCriarBolao(
  donoPremium: boolean,
  boloesAtivos: number,
  qtdCotas: number
): ResultadoLimite {
  if (!donoPremium && boloesAtivos >= LIMITE_BOLOES_ATIVOS_GRATIS) {
    return {
      ok: false,
      motivo: "boloes_ativos",
      erro: "No plano grátis você pode ter 1 bolão ativo por vez. Conclua o atual ou assine o Premium.",
    };
  }
  const limite = limiteCotas(donoPremium);
  if (qtdCotas > limite) {
    return {
      ok: false,
      motivo: "cotas",
      erro: `O plano grátis começa com até ${LIMITE_COTAS_GRATIS} cotas. Salve com ${LIMITE_COTAS_GRATIS} ou menos e libere até ${LIMITE_COTAS_PRO} depois, no bolão, com o Bolão Pro (Pix).`,
    };
  }
  return { ok: true };
}

// Alterar a quantidade de cotas ou adicionar participante: respeita o
// limite do plano e nunca deixa as cotas dos participantes passarem do total.
export function podeDefinirCotas(
  ehPro: boolean,
  qtdCotas: number,
  cotasJaAtribuidas: number
): ResultadoLimite {
  if (qtdCotas > limiteCotas(ehPro)) {
    return {
      ok: false,
      motivo: "cotas",
      erro: `O plano grátis permite até ${LIMITE_COTAS_GRATIS} cotas. Libere até ${LIMITE_COTAS_PRO} com o Bolão Pro.`,
    };
  }
  if (qtdCotas < cotasJaAtribuidas) {
    return {
      ok: false,
      erro: `Já há ${cotasJaAtribuidas} cotas atribuídas a participantes — o total não pode ser menor.`,
    };
  }
  return { ok: true };
}

export function podeAdicionarParticipante(
  qtdCotas: number,
  cotasJaAtribuidas: number,
  cotasNovas: number
): ResultadoLimite {
  if (cotasJaAtribuidas + cotasNovas > qtdCotas) {
    const livres = Math.max(0, qtdCotas - cotasJaAtribuidas);
    return {
      ok: false,
      erro:
        livres === 0
          ? "Todas as cotas já foram atribuídas."
          : `Só restam ${livres} cota${livres === 1 ? "" : "s"} livres.`,
    };
  }
  return { ok: true };
}

// Valor de cota sugerido: custo total dividido pelas cotas, arredondado pra
// cima ao centavo — nunca deixa o grupo no prejuízo por arredondamento.
export function valorCotaSugeridoCents(custoTotalCents: number, qtdCotas: number): number {
  if (qtdCotas <= 0) return custoTotalCents;
  return Math.ceil(custoTotalCents / qtdCotas);
}

// Nova validade do Bolão Pro depois de um pagamento: soma os dias à maior
// entre a validade atual e agora — pagar de novo antes de vencer estende,
// pagar depois de vencido recomeça de agora (mesma regra do crédito Pix).
export function calcularProAte(
  proAteAtual: string | null | undefined,
  agora: Date,
  dias: number
): Date {
  const atual = proAteAtual ? new Date(proAteAtual) : agora;
  const base = atual > agora ? atual : agora;
  return new Date(base.getTime() + dias * 24 * 60 * 60 * 1000);
}

// Desfaz o crédito de um pagamento (reembolso): tira os dias do pro_ate. Se
// o que sobra já passou, o bolão volta a free (null). Com dois pagamentos
// empilhados, reembolsar um deixa o outro valendo.
export function revogarProAte(
  proAteAtual: string | null | undefined,
  dias: number,
  agora: Date
): Date | null {
  return descontarDias(proAteAtual, dias, agora);
}

// Concurso-alvo de "próximo sorteio". As apostas da Caixa fecham às 19h
// (Brasília) do dia do sorteio: depois disso, o "próximo" de verdade é o
// seguinte ao que está agendado. `dataProximo` é data_proximo_concurso do
// último concurso importado (AAAA-MM-DD). Se ela já passou (importador
// atrasado), não dá pra saber quantos sorteios ficaram pra trás: devolve
// ultimo + 1.
export const HORA_FECHAMENTO_APOSTAS = 19;

export function proximoConcursoAlvo(
  ultimoNumero: number,
  dataProximo: string | null | undefined,
  agora: Date
): number {
  if (!dataProximo) return ultimoNumero + 1;
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(agora);
  const get = (t: string) => partes.find((p) => p.type === t)?.value ?? "";
  const hoje = `${get("year")}-${get("month")}-${get("day")}`;
  const hora = Number(get("hour"));
  const dia = dataProximo.slice(0, 10);
  if (dia === hoje && hora >= HORA_FECHAMENTO_APOSTAS) return ultimoNumero + 2;
  return ultimoNumero + 1;
}
