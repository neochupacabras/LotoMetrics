// Tabela de quantos jogos cada combinação (tamanho do pool × garantia)
// produz, usada pelo otimizador de bolão para responder instantaneamente
// a um orçamento sem rodar o algoritmo de fechamento reduzido a cada
// carregamento de página (rodar tudo de uma vez leva ~12s no total, o
// que é rápido para uma checagem pontual mas inviável a cada visita).
//
// IMPORTANTE: estes números são a saída real e já verificada de
// gerarFechamentoReduzido() para cada combinação permitida em
// fechamento-config.ts — não foram estimados. Validado: o total de
// jogos depende apenas do TAMANHO do pool, não de quais dezenas
// especificamente o compõem (mesmo pool de 18 dezenas com conteúdos
// diferentes gerou exatamente 164 jogos nos dois casos testados).
//
// Se fechamento.ts (o algoritmo) ou fechamento-config.ts (quais
// combinações são permitidas) mudarem, esta tabela precisa ser
// regenerada rodando gerarFechamentoReduzido(pool, qtdDezenasSorteadas, k)
// para cada combinação e atualizando os valores abaixo.

export interface OpcaoBolao {
  tamanhoPool: number;
  garantia: number;
  totalJogos: number;
}

export const OPCOES_BOLAO: Record<string, OpcaoBolao[]> = {
  lotofacil: [
    { tamanhoPool: 16, garantia: 11, totalJogos: 12 },
    { tamanhoPool: 16, garantia: 12, totalJogos: 13 },
    { tamanhoPool: 16, garantia: 13, totalJogos: 14 },
    { tamanhoPool: 16, garantia: 14, totalJogos: 15 },
    { tamanhoPool: 17, garantia: 11, totalJogos: 21 },
    { tamanhoPool: 17, garantia: 12, totalJogos: 28 },
    { tamanhoPool: 17, garantia: 13, totalJogos: 40 },
    { tamanhoPool: 17, garantia: 14, totalJogos: 64 },
    { tamanhoPool: 18, garantia: 11, totalJogos: 100 },
    { tamanhoPool: 18, garantia: 12, totalJogos: 164 },
    { tamanhoPool: 18, garantia: 13, totalJogos: 258 },
    { tamanhoPool: 18, garantia: 14, totalJogos: 453 },
    { tamanhoPool: 19, garantia: 11, totalJogos: 276 },
    { tamanhoPool: 19, garantia: 12, totalJogos: 473 },
    { tamanhoPool: 19, garantia: 13, totalJogos: 922 },
    { tamanhoPool: 19, garantia: 14, totalJogos: 1888 },
    { tamanhoPool: 20, garantia: 11, totalJogos: 721 },
    { tamanhoPool: 20, garantia: 12, totalJogos: 1490 },
  ],
  megasena: [
    { tamanhoPool: 7, garantia: 4, totalJogos: 5 },
    { tamanhoPool: 7, garantia: 5, totalJogos: 6 },
    { tamanhoPool: 8, garantia: 4, totalJogos: 7 },
    { tamanhoPool: 8, garantia: 5, totalJogos: 12 },
    { tamanhoPool: 9, garantia: 4, totalJogos: 17 },
    { tamanhoPool: 9, garantia: 5, totalJogos: 36 },
    { tamanhoPool: 10, garantia: 4, totalJogos: 27 },
    { tamanhoPool: 10, garantia: 5, totalJogos: 68 },
    { tamanhoPool: 11, garantia: 4, totalJogos: 44 },
    { tamanhoPool: 11, garantia: 5, totalJogos: 131 },
    { tamanhoPool: 12, garantia: 4, totalJogos: 71 },
    { tamanhoPool: 12, garantia: 5, totalJogos: 226 },
    { tamanhoPool: 13, garantia: 4, totalJogos: 100 },
    { tamanhoPool: 13, garantia: 5, totalJogos: 378 },
    { tamanhoPool: 14, garantia: 4, totalJogos: 145 },
    { tamanhoPool: 14, garantia: 5, totalJogos: 580 },
    { tamanhoPool: 15, garantia: 4, totalJogos: 206 },
    { tamanhoPool: 15, garantia: 5, totalJogos: 890 },
    { tamanhoPool: 16, garantia: 4, totalJogos: 266 },
    { tamanhoPool: 16, garantia: 5, totalJogos: 1420 },
  ],
  quina: [
    { tamanhoPool: 6, garantia: 2, totalJogos: 3 },
    { tamanhoPool: 6, garantia: 3, totalJogos: 4 },
    { tamanhoPool: 6, garantia: 4, totalJogos: 5 },
    { tamanhoPool: 7, garantia: 2, totalJogos: 3 },
    { tamanhoPool: 7, garantia: 3, totalJogos: 5 },
    { tamanhoPool: 7, garantia: 4, totalJogos: 9 },
    { tamanhoPool: 8, garantia: 2, totalJogos: 4 },
    { tamanhoPool: 8, garantia: 3, totalJogos: 9 },
    { tamanhoPool: 8, garantia: 4, totalJogos: 22 },
    { tamanhoPool: 9, garantia: 2, totalJogos: 5 },
    { tamanhoPool: 9, garantia: 3, totalJogos: 16 },
    { tamanhoPool: 9, garantia: 4, totalJogos: 39 },
    { tamanhoPool: 10, garantia: 2, totalJogos: 8 },
    { tamanhoPool: 10, garantia: 3, totalJogos: 24 },
    { tamanhoPool: 10, garantia: 4, totalJogos: 66 },
    { tamanhoPool: 11, garantia: 2, totalJogos: 9 },
    { tamanhoPool: 11, garantia: 3, totalJogos: 31 },
    { tamanhoPool: 11, garantia: 4, totalJogos: 110 },
    { tamanhoPool: 12, garantia: 2, totalJogos: 10 },
    { tamanhoPool: 12, garantia: 3, totalJogos: 40 },
    { tamanhoPool: 12, garantia: 4, totalJogos: 159 },
    { tamanhoPool: 13, garantia: 2, totalJogos: 14 },
    { tamanhoPool: 13, garantia: 3, totalJogos: 55 },
    { tamanhoPool: 13, garantia: 4, totalJogos: 236 },
    { tamanhoPool: 14, garantia: 2, totalJogos: 16 },
    { tamanhoPool: 14, garantia: 3, totalJogos: 69 },
    { tamanhoPool: 14, garantia: 4, totalJogos: 328 },
    { tamanhoPool: 15, garantia: 2, totalJogos: 19 },
    { tamanhoPool: 15, garantia: 3, totalJogos: 89 },
    { tamanhoPool: 15, garantia: 4, totalJogos: 443 },
    { tamanhoPool: 16, garantia: 2, totalJogos: 21 },
    { tamanhoPool: 16, garantia: 3, totalJogos: 112 },
    { tamanhoPool: 16, garantia: 4, totalJogos: 593 },
    { tamanhoPool: 17, garantia: 2, totalJogos: 24 },
    { tamanhoPool: 17, garantia: 3, totalJogos: 132 },
    { tamanhoPool: 17, garantia: 4, totalJogos: 786 },
  ],
  diadesorte: [
    { tamanhoPool: 8, garantia: 4, totalJogos: 5 },
    { tamanhoPool: 8, garantia: 5, totalJogos: 6 },
    { tamanhoPool: 8, garantia: 6, totalJogos: 7 },
    { tamanhoPool: 9, garantia: 4, totalJogos: 6 },
    { tamanhoPool: 9, garantia: 5, totalJogos: 9 },
    { tamanhoPool: 9, garantia: 6, totalJogos: 16 },
    { tamanhoPool: 10, garantia: 4, totalJogos: 13 },
    { tamanhoPool: 10, garantia: 5, totalJogos: 26 },
    { tamanhoPool: 10, garantia: 6, totalJogos: 53 },
    { tamanhoPool: 11, garantia: 4, totalJogos: 22 },
    { tamanhoPool: 11, garantia: 5, totalJogos: 45 },
    { tamanhoPool: 11, garantia: 6, totalJogos: 117 },
    { tamanhoPool: 12, garantia: 4, totalJogos: 33 },
    { tamanhoPool: 12, garantia: 5, totalJogos: 86 },
    { tamanhoPool: 12, garantia: 6, totalJogos: 237 },
    { tamanhoPool: 13, garantia: 4, totalJogos: 51 },
    { tamanhoPool: 13, garantia: 5, totalJogos: 144 },
    { tamanhoPool: 13, garantia: 6, totalJogos: 449 },
    { tamanhoPool: 14, garantia: 4, totalJogos: 75 },
    { tamanhoPool: 14, garantia: 5, totalJogos: 227 },
    { tamanhoPool: 14, garantia: 6, totalJogos: 775 },
    { tamanhoPool: 15, garantia: 4, totalJogos: 100 },
    { tamanhoPool: 15, garantia: 5, totalJogos: 347 },
    { tamanhoPool: 15, garantia: 6, totalJogos: 1468 },
  ],
  maismilionaria: [
    { tamanhoPool: 7, garantia: 4, totalJogos: 5 },
    { tamanhoPool: 7, garantia: 5, totalJogos: 6 },
    { tamanhoPool: 8, garantia: 4, totalJogos: 7 },
    { tamanhoPool: 8, garantia: 5, totalJogos: 12 },
    { tamanhoPool: 9, garantia: 4, totalJogos: 17 },
    { tamanhoPool: 9, garantia: 5, totalJogos: 36 },
    { tamanhoPool: 10, garantia: 4, totalJogos: 27 },
    { tamanhoPool: 10, garantia: 5, totalJogos: 68 },
    { tamanhoPool: 11, garantia: 4, totalJogos: 44 },
    { tamanhoPool: 11, garantia: 5, totalJogos: 131 },
    { tamanhoPool: 12, garantia: 4, totalJogos: 71 },
    { tamanhoPool: 12, garantia: 5, totalJogos: 226 },
    { tamanhoPool: 13, garantia: 4, totalJogos: 100 },
    { tamanhoPool: 13, garantia: 5, totalJogos: 378 },
    { tamanhoPool: 14, garantia: 4, totalJogos: 145 },
    { tamanhoPool: 14, garantia: 5, totalJogos: 580 },
    { tamanhoPool: 15, garantia: 4, totalJogos: 206 },
    { tamanhoPool: 15, garantia: 5, totalJogos: 890 },
    { tamanhoPool: 16, garantia: 4, totalJogos: 266 },
    { tamanhoPool: 16, garantia: 5, totalJogos: 1420 },
  ],
  timemania: [
    { tamanhoPool: 11, garantia: 3, totalJogos: 8 },
    { tamanhoPool: 11, garantia: 4, totalJogos: 22 },
    { tamanhoPool: 11, garantia: 5, totalJogos: 45 },
    { tamanhoPool: 11, garantia: 6, totalJogos: 117 },
    { tamanhoPool: 12, garantia: 3, totalJogos: 14 },
    { tamanhoPool: 12, garantia: 4, totalJogos: 33 },
    { tamanhoPool: 12, garantia: 5, totalJogos: 86 },
    { tamanhoPool: 12, garantia: 6, totalJogos: 237 },
    { tamanhoPool: 13, garantia: 3, totalJogos: 21 },
    { tamanhoPool: 13, garantia: 4, totalJogos: 51 },
    { tamanhoPool: 13, garantia: 5, totalJogos: 144 },
    { tamanhoPool: 13, garantia: 6, totalJogos: 449 },
    { tamanhoPool: 14, garantia: 3, totalJogos: 25 },
    { tamanhoPool: 14, garantia: 4, totalJogos: 75 },
    { tamanhoPool: 14, garantia: 5, totalJogos: 227 },
    { tamanhoPool: 14, garantia: 6, totalJogos: 775 },
    { tamanhoPool: 15, garantia: 3, totalJogos: 33 },
    { tamanhoPool: 15, garantia: 4, totalJogos: 100 },
    { tamanhoPool: 15, garantia: 5, totalJogos: 347 },
    { tamanhoPool: 15, garantia: 6, totalJogos: 1468 },
  ],
  duplasena: [
    { tamanhoPool: 7, garantia: 3, totalJogos: 4 },
    { tamanhoPool: 7, garantia: 4, totalJogos: 5 },
    { tamanhoPool: 7, garantia: 5, totalJogos: 6 },
    { tamanhoPool: 8, garantia: 3, totalJogos: 4 },
    { tamanhoPool: 8, garantia: 4, totalJogos: 7 },
    { tamanhoPool: 8, garantia: 5, totalJogos: 12 },
    { tamanhoPool: 9, garantia: 3, totalJogos: 7 },
    { tamanhoPool: 9, garantia: 4, totalJogos: 17 },
    { tamanhoPool: 9, garantia: 5, totalJogos: 36 },
    { tamanhoPool: 10, garantia: 3, totalJogos: 12 },
    { tamanhoPool: 10, garantia: 4, totalJogos: 27 },
    { tamanhoPool: 10, garantia: 5, totalJogos: 68 },
    { tamanhoPool: 11, garantia: 3, totalJogos: 17 },
    { tamanhoPool: 11, garantia: 4, totalJogos: 44 },
    { tamanhoPool: 11, garantia: 5, totalJogos: 131 },
    { tamanhoPool: 12, garantia: 3, totalJogos: 24 },
    { tamanhoPool: 12, garantia: 4, totalJogos: 71 },
    { tamanhoPool: 12, garantia: 5, totalJogos: 226 },
    { tamanhoPool: 13, garantia: 3, totalJogos: 31 },
    { tamanhoPool: 13, garantia: 4, totalJogos: 100 },
    { tamanhoPool: 13, garantia: 5, totalJogos: 378 },
    { tamanhoPool: 14, garantia: 3, totalJogos: 39 },
    { tamanhoPool: 14, garantia: 4, totalJogos: 145 },
    { tamanhoPool: 14, garantia: 5, totalJogos: 580 },
    { tamanhoPool: 15, garantia: 3, totalJogos: 52 },
    { tamanhoPool: 15, garantia: 4, totalJogos: 206 },
    { tamanhoPool: 15, garantia: 5, totalJogos: 890 },
    { tamanhoPool: 16, garantia: 3, totalJogos: 61 },
    { tamanhoPool: 16, garantia: 4, totalJogos: 266 },
    { tamanhoPool: 16, garantia: 5, totalJogos: 1420 },
  ],
};

// Loterias com fechamento pré-computado disponível para o otimizador de
// bolão. Ausente para Lotomania (aposta fixa de 50 dezenas) e Super Sete
// (mecânica de colunas) — nenhuma das duas se encaixa no modelo de
// fechamento "escolha mais dezenas que o mínimo" (ver lib/fechamento-config.ts).
export function temOpcoesBolao(codigoLoteria: string): boolean {
  return codigoLoteria in OPCOES_BOLAO;
}

export interface PlanoBolao extends OpcaoBolao {
  custoTotal: number;
}

// Dado um orçamento e preço por jogo, retorna os planos que cabem,
// ordenados do melhor para o pior (maior garantia primeiro; entre
// garantias iguais, maior pool primeiro — mais cobertura pelo mesmo
// nível de garantia).
export function planosViaveis(
  codigoLoteria: string,
  orcamento: number,
  precoAposta: number
): PlanoBolao[] {
  const opcoes = OPCOES_BOLAO[codigoLoteria] ?? [];
  if (precoAposta <= 0) return [];
  const jogosMax = Math.floor(orcamento / precoAposta);

  return opcoes
    .filter((o) => o.totalJogos <= jogosMax)
    .map((o) => ({ ...o, custoTotal: Math.round(o.totalJogos * precoAposta * 100) / 100 }))
    .sort((a, b) => b.garantia - a.garantia || b.tamanhoPool - a.tamanhoPool);
}
