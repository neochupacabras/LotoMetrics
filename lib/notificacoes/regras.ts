// Regras puras (sem I/O) do processador de notificações — separadas do
// orquestrador (lib/notificacoes/processar-concursos.ts) só pra poder
// testar sem banco. Ver tarefa 1.3 do plano de implementação.

export interface ConcursoAcumuladoResumo {
  numero: number;
  acumulado: boolean;
}

// Conta quantos concursos seguidos, terminando no mais recente, vieram
// acumulados — usado pra decidir o gatilho "sorteios_sem_ganhador" do
// alerta de acúmulo. `concursos` precisa vir ordenado do mais recente pro
// mais antigo (DESC por número).
export function contarSequenciaAcumulada(concursos: ConcursoAcumuladoResumo[]): number {
  let sequencia = 0;
  for (const c of concursos) {
    if (!c.acumulado) break;
    sequencia++;
  }
  return sequencia;
}

export interface PreferenciaAlerta {
  thresholdBrl: number | null;
  sorteiosSemGanhador: number | null;
}

// Decide se um alerta de acúmulo deve disparar pra essa preferência, dado
// o concurso que acabou de acumular. Qualquer um dos dois critérios
// configurados (valor OU nº de sorteios) já dispara — não precisa dos
// dois juntos.
export function deveAlertarAcumulo(
  pref: PreferenciaAlerta,
  valorEstimadoProximo: number | null,
  sequenciaAcumulada: number
): boolean {
  const bateValor =
    pref.thresholdBrl != null && valorEstimadoProximo != null && valorEstimadoProximo >= pref.thresholdBrl;
  const bateSequencia =
    pref.sorteiosSemGanhador != null && sequenciaAcumulada >= pref.sorteiosSemGanhador;
  return bateValor || bateSequencia;
}

// Chave de deduplicação de um lembrete de vencimento do Pix — inclui a
// própria data de expiração pra não colidir com o próximo ciclo de
// vencimento se a pessoa renovar e, meses depois, o Pix vencer de novo.
export function chavePixVencendo(planExpiresAt: string, diasAntes: 5 | 1): string {
  const data = planExpiresAt.slice(0, 10); // "AAAA-MM-DD"
  return `pix:${data}:${diasAntes}`;
}

// Quantos dias faltam (arredondado pra baixo) entre agora e a expiração.
export function diasAteExpirar(agora: Date, planExpiresAt: Date): number {
  const ms = planExpiresAt.getTime() - agora.getTime();
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}
