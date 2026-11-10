// Regras de plano do simulador "eu teria ganho", decididas no servidor.
//
// Fica fora de lib/simulador-actions.ts porque um arquivo "use server" só
// pode exportar funções async — e estas precisam ser puras pra teste.

// Free simula só os últimos N concursos; Premium, o histórico completo.
export const LIMITE_HISTORICO_FREE = 100;

// null = histórico completo. O limite NUNCA vem do navegador: o cliente
// pode chamar a server action com qualquer argumento, então a única fonte
// de verdade é o plano lido da sessão (getPlanoPremium).
export function limiteHistoricoPorPlano(premium: boolean): number | null {
  return premium ? null : LIMITE_HISTORICO_FREE;
}

// Recorta a lista (em ordem cronológica) pros últimos `limite` concursos.
export function recortarHistorico<T>(draws: T[], limite: number | null): T[] {
  return limite === null ? draws : draws.slice(-limite);
}

// Comparador de dois jogos é recurso só Premium.
export const ERRO_COMPARADOR_PREMIUM = "O comparador de jogos é exclusivo do plano Premium.";
