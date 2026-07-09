export interface ArtigoMatematica {
  slug: string;
  titulo: string;
  subtitulo: string;
  emoji: string;
  cor: "pine" | "ochre" | "rust";
  nivel: "básico" | "intermediário";
  tempoLeitura: number;
  conceito: string; // nome técnico do conceito
  cotidiano: string; // gancho do cotidiano
}

export const ARTIGOS_MATEMATICA: ArtigoMatematica[] = [
  {
    slug: "combinatoria",
    titulo: "Combinatória",
    subtitulo: "Por que é impossível escolher roupa diferente todo dia por uma vida inteira",
    emoji: "🎽",
    cor: "pine",
    nivel: "básico",
    tempoLeitura: 8,
    conceito: "Combinações e permutações",
    cotidiano: "guarda-roupa, cardápio, senhas",
  },
  {
    slug: "probabilidade",
    titulo: "Probabilidade",
    subtitulo: "O que significa '50% de chance' — e por que isso não é o que parece",
    emoji: "🎲",
    cor: "ochre",
    nivel: "básico",
    tempoLeitura: 7,
    conceito: "Probabilidade clássica e frequentista",
    cotidiano: "moeda, dado, previsão do tempo",
  },
  {
    slug: "fatorial",
    titulo: "Fatorial",
    subtitulo: "O número que cresce mais rápido do que qualquer coisa que você já viu",
    emoji: "💥",
    cor: "rust",
    nivel: "básico",
    tempoLeitura: 6,
    conceito: "Fatorial e crescimento exponencial",
    cotidiano: "embaralhar baralho, senhas, filas",
  },
  {
    slug: "lei-dos-grandes-numeros",
    titulo: "Lei dos Grandes Números",
    subtitulo: "Por que o McDonald's sabe quantos hambúrgueres vender amanhã mas você não",
    emoji: "📊",
    cor: "pine",
    nivel: "básico",
    tempoLeitura: 7,
    conceito: "Lei dos Grandes Números e convergência",
    cotidiano: "produção industrial, seguro, pesquisa eleitoral",
  },
  {
    slug: "valor-esperado",
    titulo: "Valor Esperado",
    subtitulo: "A conta que toda empresa de seguro faz — e você provavelmente nunca fez",
    emoji: "⚖️",
    cor: "ochre",
    nivel: "intermediário",
    tempoLeitura: 8,
    conceito: "Esperança matemática",
    cotidiano: "seguro, investimento, loteria",
  },
  {
    slug: "media-moda-mediana",
    titulo: "Média, Moda e Mediana",
    subtitulo: "Por que a 'média salarial' pode ser completamente enganosa",
    emoji: "📏",
    cor: "rust",
    nivel: "básico",
    tempoLeitura: 6,
    conceito: "Medidas de tendência central",
    cotidiano: "salário, notas, temperatura",
  },
  {
    slug: "desvio-padrao",
    titulo: "Desvio Padrão",
    subtitulo: "O número que mede o quanto as coisas 'fogem do padrão' — e por que isso importa",
    emoji: "📉",
    cor: "pine",
    nivel: "intermediário",
    tempoLeitura: 8,
    conceito: "Variância e desvio padrão",
    cotidiano: "altura, temperatura, controle de qualidade",
  },
  {
    slug: "paradoxo-aniversario",
    titulo: "Paradoxo do Aniversário",
    subtitulo: "Em uma sala de 23 pessoas, é mais provável do que não ter dois aniversários iguais",
    emoji: "🎂",
    cor: "ochre",
    nivel: "intermediário",
    tempoLeitura: 7,
    conceito: "Probabilidade condicional e complementar",
    cotidiano: "turma de escola, time de futebol, sorteio",
  },
  {
    slug: "porcentagem",
    titulo: "Porcentagem",
    subtitulo: "Por que '50% de desconto sobre o preço com 100% de aumento' te devolve ao mesmo lugar",
    emoji: "🏷️",
    cor: "rust",
    nivel: "básico",
    tempoLeitura: 6,
    conceito: "Porcentagem, razão e proporção",
    cotidiano: "desconto, juros, inflação, imposto",
  },
  {
    slug: "distribuicao-normal",
    titulo: "Distribuição Normal",
    subtitulo: "A curva em forma de sino que governa altura, QI, erros de medição — e frequências de loteria",
    emoji: "🔔",
    cor: "pine",
    nivel: "intermediário",
    tempoLeitura: 9,
    conceito: "Distribuição gaussiana e teorema central do limite",
    cotidiano: "altura humana, notas de prova, erros industriais",
  },
];

export function getArtigoMatematica(slug: string): ArtigoMatematica | undefined {
  return ARTIGOS_MATEMATICA.find((a) => a.slug === slug);
}
