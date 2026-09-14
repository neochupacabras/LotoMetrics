import type { JogoCarteira } from "@/lib/carteira";

// Lógica pura da retrospectiva "Meu ano na loteria" (Fase 3 adiantada,
// 28/09/2026, terceiro e último item escolhido pelo usuário) — separada
// de calcularCarteira() só pra poder testar sem banco, mesmo padrão de
// lib/notificacoes/regras.ts.

export interface LoteriaMaisJogada {
  codigoLoteria: string;
  nomeLoteria: string;
  quantidadeJogos: number;
}

// Loteria com mais jogos rastreados no período — empate resolvido por
// quem acumulou mais concursos acompanhados no total.
export function loteriaMaisJogada(jogos: JogoCarteira[]): LoteriaMaisJogada | null {
  if (jogos.length === 0) return null;

  const porLoteria = new Map<string, { nomeLoteria: string; quantidadeJogos: number; concursos: number }>();
  for (const j of jogos) {
    const entrada = porLoteria.get(j.loteria) ?? { nomeLoteria: j.nomeLoteria, quantidadeJogos: 0, concursos: 0 };
    entrada.quantidadeJogos++;
    entrada.concursos += j.concursosAcompanhados;
    porLoteria.set(j.loteria, entrada);
  }

  let melhorCodigo = "";
  let melhorDados = { nomeLoteria: "", quantidadeJogos: -1, concursos: -1 };
  for (const [codigoLoteria, dados] of porLoteria) {
    const ganha =
      dados.quantidadeJogos > melhorDados.quantidadeJogos ||
      (dados.quantidadeJogos === melhorDados.quantidadeJogos && dados.concursos > melhorDados.concursos);
    if (ganha) {
      melhorCodigo = codigoLoteria;
      melhorDados = dados;
    }
  }

  return { codigoLoteria: melhorCodigo, nomeLoteria: melhorDados.nomeLoteria, quantidadeJogos: melhorDados.quantidadeJogos };
}

// Jogo com o maior ganho individual do período — null se nenhum jogo
// teve prêmio (ou se todos são não-calculáveis, como a +Milionária).
export function maiorPremioIndividual(jogos: JogoCarteira[]): JogoCarteira | null {
  const comGanho = jogos.filter((j): j is JogoCarteira & { ganho: number } => j.ganho !== null && j.ganho > 0);
  if (comGanho.length === 0) return null;
  return comGanho.reduce((maior, atual) => (atual.ganho > maior.ganho ? atual : maior));
}

// Intervalo ISO (inclusive nas duas pontas) do ano informado, no fuso
// UTC — mesma convenção de gastoMesAtual em lib/carteira.ts. Passar
// `ate` corta o intervalo em "hoje" pra um ano ainda em andamento (a
// retrospectiva é enviada em dezembro, cobrindo o ano até então).
export function intervaloDoAno(ano: number, ate?: Date): { inicio: string; fim: string } {
  const inicio = new Date(Date.UTC(ano, 0, 1)).toISOString();
  const fimDoAno = new Date(Date.UTC(ano, 11, 31, 23, 59, 59, 999));
  const fim = ate && ate < fimDoAno ? ate.toISOString() : fimDoAno.toISOString();
  return { inicio, fim };
}
