// Limites de pool e de garantia oferecidos por loteria — calibrados
// empiricamente (ver testes de performance): cada combinação aqui foi
// medida e roda em tempo aceitável, com economia real de jogos frente ao
// fechamento completo. Combinações fora desse alcance (ex: Lotofácil
// pool=20 garantindo 14 pontos) foram excluídas de propósito: ficam
// lentas demais e deixam de economizar jogos o suficiente para valer a
// pena frente ao fechamento completo.

export interface ConfigFechamento {
  poolMin: number;
  poolMax: number;
  getKsPermitidos: (tamanhoPool: number) => number[];
}

export const FECHAMENTO_CONFIG: Record<string, ConfigFechamento> = {
  lotofacil: {
    poolMin: 16,
    poolMax: 20,
    getKsPermitidos: (tamanhoPool) => (tamanhoPool >= 20 ? [11, 12] : [11, 12, 13, 14]),
  },
  megasena: {
    poolMin: 7,
    poolMax: 16,
    getKsPermitidos: () => [4, 5],
  },
};
