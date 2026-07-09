export interface CategoriaTabela {
  slug: string;
  titulo: string;
  descricao: string;
}

// As 13 categorias previstas na especificação original do projeto.
export const CATEGORIAS: CategoriaTabela[] = [
  {
    slug: "frequencia",
    titulo: "Frequência",
    descricao: "Quantas vezes cada dezena já foi sorteada no histórico completo.",
  },
  {
    slug: "atraso",
    titulo: "Atraso",
    descricao:
      "Há quantos concursos cada dezena não é sorteada, e o maior atraso já registrado para ela.",
  },
  {
    slug: "ciclos",
    titulo: "Ciclo das dezenas",
    descricao:
      "Acompanhamento de quando todas as dezenas completam um ciclo (saem ao menos uma vez desde o início dele).",
  },
  {
    slug: "sequencias",
    titulo: "Sequências",
    descricao:
      "Maiores sequências de dezenas consecutivas dentro de um sorteio, e dezenas que mais se repetem em concursos seguidos.",
  },
  {
    slug: "pares-impares",
    titulo: "Pares e ímpares",
    descricao: "Distribuição histórica da proporção de dezenas pares e ímpares por concurso.",
  },
  {
    slug: "primos",
    titulo: "Números primos",
    descricao: "Frequência de números primos entre as dezenas sorteadas.",
  },
  {
    slug: "soma",
    titulo: "Soma das dezenas",
    descricao: "Distribuição estatística da soma total das dezenas sorteadas por concurso.",
  },
  {
    slug: "fibonacci",
    titulo: "Números de Fibonacci",
    descricao: "Frequência de dezenas pertencentes à sequência de Fibonacci.",
  },
  {
    slug: "multiplos-de-3",
    titulo: "Múltiplos de 3",
    descricao: "Frequência de dezenas múltiplas de 3 sorteadas.",
  },
  {
    slug: "repetidas",
    titulo: "Repetidas do concurso anterior",
    descricao: "Quantas dezenas se repetem em relação ao sorteio imediatamente anterior.",
  },
  {
    slug: "moldura-centro",
    titulo: "Moldura e centro",
    descricao:
      "Distribuição das dezenas sorteadas considerando a posição delas no volante (borda vs. centro).",
  },
  {
    slug: "linhas-colunas",
    titulo: "Linhas e colunas",
    descricao: "Distribuição das dezenas sorteadas por linha e por coluna do volante.",
  },
  {
    slug: "duques-trincas",
    titulo: "Duques e trincas",
    descricao: "Pares e trios de dezenas que mais saem juntos no mesmo sorteio.",
  },
];

export function getCategoriaPorSlug(slug: string): CategoriaTabela | undefined {
  return CATEGORIAS.find((c) => c.slug === slug);
}

// ── Categorias disponíveis por loteria ────────────────────────────────────────
//
// Critérios de exclusão:
//  moldura-centro  → requer volante 2D regular; excluído para Super Sete e Lotomania
//  linhas-colunas  → idem
//  ciclos          → sem sentido para Super Sete (valores 0-9 completam ciclo a cada poucos concursos)
//  repetidas       → sem sentido para Super Sete (dezenas repetidas dentro do mesmo sorteio)
//  duques-trincas  → sem sentido para Super Sete (pares de posições ≠ pares de valores)
//  multiplos-de-3  → zero=0 não é múltiplo de 3 por convenção; mantido para Lotomania pois 0 é excluído

const CATEGORIAS_EXCLUIDAS: Record<string, string[]> = {
  supersete:  ["moldura-centro", "linhas-colunas", "ciclos", "repetidas", "duques-trincas"],
  lotomania:  ["moldura-centro", "linhas-colunas"],
};

export function getCategoriasParaLoteria(codigoLoteria: string): CategoriaTabela[] {
  const excluidas = CATEGORIAS_EXCLUIDAS[codigoLoteria] ?? [];
  if (excluidas.length === 0) return CATEGORIAS;
  return CATEGORIAS.filter((c) => !excluidas.includes(c.slug));
}
