// Fechamentos garantidos.
//
// Conceito: o apostador escolhe um "pool" de b dezenas (b > tamanho mínimo
// do jogo, ex: 18 na Lotofácil). Em vez de apostar todas as combinações
// possíveis desse pool (caro), geramos um conjunto menor de jogos que
// ainda GARANTE matematicamente: se pelo menos k das dezenas sorteadas
// estiverem dentro do pool escolhido, pelo menos um dos jogos gerados vai
// acertar pelo menos k pontos.
//
// Importante: a garantia é CONDICIONAL. Ela não aumenta a chance de as
// suas dezenas serem sorteadas — só garante que, SE o necessário sair,
// você não "desperdiça" esse acerto por causa de como os números foram
// distribuídos entre os jogos.
//
// Toda construção aqui é verificada por força bruta antes de ser
// considerada válida (ver `verificarGarantia`). Nada é rotulado como
// garantido sem essa checagem ter passado.

export interface ResultadoFechamento {
  tickets: number[][];
  totalTickets: number;
  poolTamanho: number;
  tamanhoJogo: number;
  pontosGarantidos: number;
  garantiaVerificada: boolean;
}

function combinacoes<T>(itens: T[], k: number): T[][] {
  const resultado: T[][] = [];
  const atual: T[] = [];
  function backtrack(inicio: number) {
    if (atual.length === k) {
      resultado.push([...atual]);
      return;
    }
    for (let i = inicio; i < itens.length; i++) {
      atual.push(itens[i]);
      backtrack(i + 1);
      atual.pop();
    }
  }
  backtrack(0);
  return resultado;
}

function maskDeIndices(indices: number[]): number {
  let mask = 0;
  for (const i of indices) mask |= 1 << i;
  return mask;
}

// ------------------------------------------------------------------
// Fechamento COMPLETO: todas as combinações de `tamanhoJogo` dentro do
// pool. Garante o ponto máximo (m) se todas as m dezenas sorteadas
// estiverem no pool — correto por definição (não precisa de verificação
// extra, é a enumeração completa).
// ------------------------------------------------------------------
export function gerarFechamentoCompleto(
  pool: number[],
  tamanhoJogo: number
): ResultadoFechamento {
  const poolOrdenado = [...pool].sort((a, b) => a - b);
  const tickets = combinacoes(poolOrdenado, tamanhoJogo);
  return {
    tickets,
    totalTickets: tickets.length,
    poolTamanho: pool.length,
    tamanhoJogo,
    pontosGarantidos: tamanhoJogo,
    garantiaVerificada: true,
  };
}

// ------------------------------------------------------------------
// Fechamento REDUZIDO: construção gulosa (greedy set-cover) + verificação
// por força bruta. Pode gerar menos jogos que o completo, garantindo uma
// faixa de pontos menor que o máximo (k < tamanhoJogo).
// ------------------------------------------------------------------
export function gerarFechamentoReduzido(
  pool: number[],
  tamanhoJogo: number,
  k: number
): ResultadoFechamento {
  const poolOrdenado = [...pool].sort((a, b) => a - b);
  const b = poolOrdenado.length;
  const indicesLocais = poolOrdenado.map((_, i) => i);

  // Todos os k-subconjuntos (em índices locais) que precisam ser cobertos.
  const todosKSubsets = combinacoes(indicesLocais, k);
  const uncovered = new Map<number, number[]>(); // mask -> indices
  for (const sub of todosKSubsets) {
    uncovered.set(maskDeIndices(sub), sub);
  }

  const ticketsIndices: number[][] = [];
  const LIMITE_AMOSTRA_FREQUENCIA = 3000;

  while (uncovered.size > 0) {
    // Semente: primeiro k-subconjunto ainda descoberto.
    const [, semente] = uncovered.entries().next().value as [number, number[]];
    const ticketSet = new Set<number>(semente);

    // Frequência de cada índice restante entre os k-subconjuntos ainda
    // descobertos — heurística para completar o ticket priorizando
    // índices que ajudam a cobrir mais coisas de uma vez. Quando o
    // conjunto de descobertos é grande, usa uma amostra em vez de
    // escanear tudo — o resultado final continua 100% correto de
    // qualquer forma (é só uma heurística de escolha, a cobertura real é
    // recalculada e a garantia é sempre verificada por força bruta no
    // final), só muda quantos jogos saem no total.
    const frequencia = new Map<number, number>();
    let contados = 0;
    for (const sub of uncovered.values()) {
      if (contados >= LIMITE_AMOSTRA_FREQUENCIA) break;
      for (const idx of sub) {
        if (!ticketSet.has(idx)) {
          frequencia.set(idx, (frequencia.get(idx) ?? 0) + 1);
        }
      }
      contados++;
    }

    const restantesOrdenados = indicesLocais
      .filter((i) => !ticketSet.has(i))
      .sort((a, c) => (frequencia.get(c) ?? 0) - (frequencia.get(a) ?? 0));

    for (const idx of restantesOrdenados) {
      if (ticketSet.size >= tamanhoJogo) break;
      ticketSet.add(idx);
    }

    const ticketFinal = Array.from(ticketSet);
    ticketsIndices.push(ticketFinal);

    // Remove de `uncovered` todo k-subconjunto contido neste ticket.
    const subsetsDoTicket = combinacoes(ticketFinal, k);
    for (const sub of subsetsDoTicket) {
      uncovered.delete(maskDeIndices(sub));
    }
  }

  const tickets = ticketsIndices.map((indices) =>
    indices.map((i) => poolOrdenado[i]).sort((a, c) => a - c)
  );

  const garantiaVerificada = verificarGarantia(poolOrdenado, tickets, tamanhoJogo, k);

  return {
    tickets,
    totalTickets: tickets.length,
    poolTamanho: pool.length,
    tamanhoJogo,
    pontosGarantidos: k,
    garantiaVerificada,
  };
}

// ------------------------------------------------------------------
// Verificação por força bruta: para TODO k-subconjunto do pool, confere
// se existe pelo menos um ticket que o contém inteiramente. Só retorna
// true se a garantia vale para os 100% dos casos possíveis — não é uma
// amostragem, é exaustivo.
// ------------------------------------------------------------------
export function verificarGarantia(
  pool: number[],
  tickets: number[][],
  tamanhoJogo: number,
  k: number
): boolean {
  const poolOrdenado = [...pool].sort((a, b) => a - b);
  const indiceDe = new Map<number, number>(poolOrdenado.map((d, i) => [d, i]));

  const ticketMasks = tickets.map((t) =>
    t.reduce((mask, d) => mask | (1 << (indiceDe.get(d) ?? -1)), 0)
  );

  const indicesLocais = poolOrdenado.map((_, i) => i);
  const todosKSubsets = combinacoes(indicesLocais, k);

  for (const sub of todosKSubsets) {
    const subMask = maskDeIndices(sub);
    const coberto = ticketMasks.some((tm) => (tm & subMask) === subMask);
    if (!coberto) return false;
  }
  return true;
}
