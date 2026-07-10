export interface Calculadora {
  slug: string;
  titulo: string;
  subtitulo: string;
  emoji: string;
  cor: "pine" | "ochre" | "rust";
  categoria: "financeira" | "basica" | "data" | "geometria" | "probabilidade" | "loteria";
  descricao: string; // SEO
}

export const CALCULADORAS: Calculadora[] = [
  {
    slug: "porcentagem",
    titulo: "Porcentagem",
    subtitulo: "X% de Y, X é que % de Y, e variações de aumento/desconto",
    emoji: "🏷️",
    cor: "ochre",
    categoria: "basica",
    descricao: "Calculadora de porcentagem online: calcule X% de Y, descubra que porcentagem X representa de Y, e calcule aumentos e descontos percentuais.",
  },
  {
    slug: "juros-compostos",
    titulo: "Juros Compostos",
    subtitulo: "Monte final, taxa real, tempo necessário — com gráfico de evolução",
    emoji: "📈",
    cor: "pine",
    categoria: "financeira",
    descricao: "Calculadora de juros compostos: calcule montante final, taxa de juros ou prazo. Veja a evolução do investimento ou dívida ao longo do tempo com gráfico interativo.",
  },
  {
    slug: "regra-de-tres",
    titulo: "Regra de Três",
    subtitulo: "Direta e inversa — resolva qualquer proporção em segundos",
    emoji: "⚖️",
    cor: "rust",
    categoria: "basica",
    descricao: "Calculadora de regra de três simples direta e inversa. Digite três valores e descubra o quarto. Resultado instantâneo com explicação do raciocínio.",
  },
  {
    slug: "diferenca-datas",
    titulo: "Diferença entre Datas",
    subtitulo: "Quantos dias, semanas, meses e anos entre duas datas",
    emoji: "📅",
    cor: "pine",
    categoria: "data",
    descricao: "Calculadora de diferença entre datas: descubra quantos dias, semanas, meses e anos separam duas datas. Útil para prazo de contratos, idades e prazos.",
  },
  {
    slug: "combinacoes",
    titulo: "Combinações C(n,k)",
    subtitulo: "Quantas formas de escolher k itens de n — com tabela de casos",
    emoji: "🔢",
    cor: "ochre",
    categoria: "probabilidade",
    descricao: "Calculadora de combinações matemáticas C(n,k): descubra quantas formas existem de escolher k itens de um conjunto de n elementos, sem importar a ordem.",
  },
  {
    slug: "probabilidade-loteria",
    titulo: "Probabilidade de Loteria",
    subtitulo: "Chance exata de acertar qualquer faixa em qualquer loteria",
    emoji: "🎯",
    cor: "rust",
    categoria: "probabilidade",
    descricao: "Calculadora de probabilidade de loteria: descubra a chance exata de acertar qualquer faixa de prêmio em Lotofácil, Mega-Sena, Quina e mais 6 loterias.",
  },
  {
    slug: "area-perimetro",
    titulo: "Área e Perímetro",
    subtitulo: "Círculo, quadrado, retângulo e triângulo — com visualização",
    emoji: "📐",
    cor: "pine",
    categoria: "geometria",
    descricao: "Calculadora de área e perímetro de figuras geométricas: círculo, quadrado, retângulo e triângulo. Com fórmulas e visualização proporcional da figura.",
  },
  {
    slug: "parcelamento",
    titulo: "Parcelamento e Juros",
    subtitulo: "Descubra os juros embutidos em qualquer parcelamento",
    emoji: "💳",
    cor: "ochre",
    categoria: "financeira",
    descricao: "Calculadora de parcelamento: descubra a taxa de juros real embutida em qualquer parcelamento. Compare preço à vista com parcelado e veja o custo efetivo.",
  },
  {
    slug: "imc",
    titulo: "IMC — Índice de Massa Corporal",
    subtitulo: "Calcule seu IMC e veja em qual faixa você se encontra",
    emoji: "⚕️",
    cor: "rust",
    categoria: "basica",
    descricao: "Calculadora de IMC (Índice de Massa Corporal): insira peso e altura e descubra seu IMC com classificação da OMS. Com contexto e tabela de referência.",
  },
  {
    slug: "media-ponderada",
    titulo: "Média Ponderada",
    subtitulo: "Calcule a média com pesos diferentes para cada valor",
    emoji: "🎓",
    cor: "pine",
    categoria: "basica",
    descricao: "Calculadora de média ponderada: some valores com pesos diferentes, como notas com créditos ou produtos com quantidades. Resultado instantâneo com detalhamento.",
  },
  {
    slug: "custo-aposta-multipla",
    titulo: "Custo da Aposta Múltipla",
    subtitulo: "Quanto custa apostar em mais dezenas do que o mínimo",
    emoji: "🧾",
    cor: "rust",
    categoria: "loteria",
    descricao: "Calculadora de custo de aposta múltipla: descubra quantos jogos simples uma aposta com mais dezenas equivale e o valor total, para Lotofácil, Mega-Sena, Quina e outras loterias.",
  },
  {
    slug: "rateio-bolao",
    titulo: "Rateio de Bolão",
    subtitulo: "Divida um prêmio entre participantes com cotas iguais ou diferentes",
    emoji: "🤝",
    cor: "pine",
    categoria: "loteria",
    descricao: "Calculadora de rateio de bolão de loteria: informe o valor do prêmio e as cotas de cada participante para descobrir quanto cada um recebe.",
  },
  {
    slug: "valor-esperado-aposta",
    titulo: "Valor Esperado de uma Aposta",
    subtitulo: "Veja se, em média, uma aposta compensa o que custa",
    emoji: "⚖️",
    cor: "ochre",
    categoria: "probabilidade",
    descricao: "Calculadora de valor esperado: informe custo, prêmio e probabilidade de qualquer aposta e veja o retorno médio esperado por real gasto.",
  },
  {
    slug: "conversor-unidades",
    titulo: "Conversor de Unidades",
    subtitulo: "Comprimento, peso, volume e temperatura, tudo em um só lugar",
    emoji: "📏",
    cor: "pine",
    categoria: "basica",
    descricao: "Conversor de unidades online: converta comprimento, peso, volume e temperatura entre as principais unidades do sistema métrico e imperial.",
  },
];

export const CATEGORIAS_CALC = {
  financeira:   { label: "Financeira",    cor: "pine"  },
  basica:       { label: "Matemática",    cor: "ochre" },
  data:         { label: "Data e Tempo",  cor: "rust"  },
  geometria:    { label: "Geometria",     cor: "pine"  },
  probabilidade:{ label: "Probabilidade", cor: "rust"  },
  loteria:      { label: "Loteria",       cor: "rust"  },
} as const;

export function getCalculadora(slug: string): Calculadora | undefined {
  return CALCULADORAS.find(c => c.slug === slug);
}
