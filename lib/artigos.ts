export interface Artigo {
  slug: string;
  titulo: string;
  resumo: string;
}

export const ARTIGOS: Artigo[] = [
  {
    slug: "frequencia",
    titulo: "Frequência: por que números \"quentes\" e \"frios\" são o mesmo número",
    resumo:
      "A variação natural entre as dezenas mais e menos sorteadas é exatamente o que a estatística prevê pra um sorteio honesto — não evidência de viés.",
  },
  {
    slug: "atraso",
    titulo: "Atraso: o que é e por que não prevê nada",
    resumo:
      "Por que um número que não sai há 50 concursos não está \"devendo\" sair — e o que a falácia do apostador tem a ver com isso.",
  },
  {
    slug: "ciclos",
    titulo: "Ciclos: quanto tempo leva pra todas as dezenas saírem",
    resumo:
      "O problema do colecionador de figurinhas explica por que um ciclo da Lotofácil dura, em média, menos de 5 concursos — e o da Mega-Sena, mais de 45.",
  },
  {
    slug: "sequencias",
    titulo: "Sequências: por que números seguidos são mais comuns do que parecem",
    resumo:
      "87% dos sorteios da Lotofácil têm pelo menos 4 dezenas seguidas. Contraintuitivo, mas é a combinatória, calculada com exatidão.",
  },
  {
    slug: "par-impar",
    titulo: "Distribuição par/ímpar: por que 7-8 é mais comum que 0-15",
    resumo:
      "Toda combinação específica tem a mesma chance — mas nem toda distribuição par/ímpar tem o mesmo número de combinações possíveis. Com os números reais.",
  },
  {
    slug: "primos",
    titulo: "Números primos: quantos saem por concurso, em média",
    resumo:
      "Com 9 primos disponíveis entre 1 e 25, a média esperada por sorteio é 5,4 — um número fixo que não muda com o histórico.",
  },
  {
    slug: "soma",
    titulo: "Soma das dezenas: o efeito sino que ninguém escolhe",
    resumo:
      "Por que somas próximas de 195 (Lotofácil) ou 183 (Mega-Sena) são as mais comuns — e por que isso não é sorte, é contagem.",
  },
  {
    slug: "fibonacci",
    titulo: "Números de Fibonacci: a sequência mais famosa da matemática, na loteria",
    resumo:
      "Só 7 das 25 dezenas da Lotofácil pertencem à sequência de Fibonacci — isso já basta pra explicar toda a estatística sozinho.",
  },
  {
    slug: "multiplos-de-3",
    titulo: "Múltiplos de 3: a mesma lógica dos primos, com outro filtro",
    resumo:
      "8 das 25 dezenas da Lotofácil são múltiplas de 3 — o suficiente pra calcular exatamente quantas saem por concurso, em média.",
  },
  {
    slug: "repetidas",
    titulo: "Repetidas: quantas dezenas se repetem de um concurso pro outro",
    resumo:
      "Em média, 9 das 15 dezenas de um concurso já tinham saído no concurso anterior — e isso também não é coincidência, é matemática.",
  },
  {
    slug: "moldura-centro",
    titulo: "Moldura e centro: o volante também é uma grade de números",
    resumo:
      "Olhar o volante como uma grade 5×5 (Lotofácil) revela outra distribuição combinatória — com a borda quase sempre dominando o centro.",
  },
  {
    slug: "linhas-colunas",
    titulo: "Linhas e colunas: a mesma grade, sob outro corte",
    resumo:
      "Cada linha ou coluna do volante tem só 5 dezenas — a distribuição de quantas saem por sorteio segue exatamente o esperado.",
  },
  {
    slug: "duques-trincas",
    titulo: "Duques e trincas: pares que saem juntos não estão \"combinando\"",
    resumo:
      "Toda dupla específica de dezenas tem 35% de chance de sair junta em algum concurso — isso por si só explica por que algumas duplas parecem \"favoritas\".",
  },
  {
    slug: "fechamento",
    titulo: "Fechamento: a matemática real por trás da técnica",
    resumo:
      "Fechamento não prevê números — garante cobertura. Veja a diferença com um exemplo pequeno que dá pra conferir na mão.",
  },
];
