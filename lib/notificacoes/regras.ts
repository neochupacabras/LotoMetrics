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

// Chave de deduplicação da newsletter semanal (Fase 3 adiantada,
// 28/09/2026) — o job só roda 1x/dia (piggyback no cron de segurança) e só
// envia de verdade às segundas-feiras, então a própria data já basta como
// chave semanal, sem precisar calcular número de semana ISO.
export function chaveNewsletterSemanal(data: Date): string {
  return `newsletter:${data.toISOString().slice(0, 10)}`;
}

export interface CandidatoAcumulado {
  codigo: string;
  acumulado: boolean;
  valorEstimadoProximo: number | null;
}

// Escolhe a loteria mais "noticiável" da semana pra ser o destaque da
// newsletter: a que está acumulada com o maior prêmio estimado. Sem
// nenhuma acumulada, cai pra codigoPadrao (a loteria mais popular do
// site).
export function escolherLoteriaDestaqueSemana(
  candidatos: CandidatoAcumulado[],
  codigoPadrao: string
): string {
  const acumuladas = candidatos.filter(
    (c) => c.acumulado && c.valorEstimadoProximo != null
  );
  if (acumuladas.length === 0) return codigoPadrao;

  return acumuladas.reduce((maior, atual) =>
    atual.valorEstimadoProximo! > maior.valorEstimadoProximo! ? atual : maior
  ).codigo;
}
