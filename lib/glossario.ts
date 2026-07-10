export interface TermoGlossario {
  termo: string;
  slug: string; // usado como id de âncora
  definicao: string;
  saibaMais?: { href: string; label: string };
}

export const GLOSSARIO: TermoGlossario[] = [
  {
    termo: "Acumulado",
    slug: "acumulado",
    definicao:
      "Quando nenhum apostador acerta a faixa principal de premiação num concurso, o valor daquele prêmio passa para o concurso seguinte, somando-se ao novo prêmio. É por isso que os prêmios da Mega-Sena, por exemplo, às vezes chegam a centenas de milhões de reais.",
  },
  {
    termo: "Aposta múltipla (ou desdobrada)",
    slug: "aposta-multipla",
    definicao:
      "Aposta em que o apostador marca mais dezenas do que o mínimo exigido pelo jogo. Isso aumenta o número de combinações cobertas por um único bilhete — e, proporcionalmente, o custo da aposta — mas não muda a probabilidade de cada combinação individual sair.",
    saibaMais: { href: "/dicas/mais-dezenas-vale-a-pena", label: "Vale a pena apostar em mais dezenas?" },
  },
  {
    termo: "Atraso",
    slug: "atraso",
    definicao:
      "Número de concursos consecutivos em que uma dezena específica não foi sorteada. É uma medida puramente descritiva — não indica maior nem menor chance de a dezena sair no próximo concurso, já que cada sorteio é um evento independente dos anteriores.",
    saibaMais: { href: "/dicas/atraso", label: "Entenda o atraso das dezenas" },
  },
  {
    termo: "Bolão",
    slug: "bolao",
    definicao:
      "Aposta coletiva em que um grupo de pessoas divide o custo de um ou mais jogos e, em caso de prêmio, divide o valor ganho proporcionalmente às cotas de cada participante.",
  },
  {
    termo: "Ciclo",
    slug: "ciclo",
    definicao:
      "Sequência de concursos consecutivos até que todas as dezenas do jogo tenham saído pelo menos uma vez. Analisar ciclos é uma forma de visualizar a frequência das dezenas ao longo do tempo, sem que isso implique qualquer previsibilidade sobre o próximo sorteio.",
    saibaMais: { href: "/dicas/ciclos", label: "Como funcionam os ciclos" },
  },
  {
    termo: "Combinação",
    slug: "combinacao",
    definicao:
      "Em matemática, uma seleção de itens de um conjunto maior em que a ordem não importa. É o conceito central por trás do cálculo de quantos jogos diferentes existem numa loteria — por exemplo, C(25,15) para a Lotofácil.",
    saibaMais: { href: "/matematica/combinatoria", label: "Entenda combinatória" },
  },
  {
    termo: "Concurso",
    slug: "concurso",
    definicao:
      "Cada edição numerada de sorteio de uma loteria. Cada concurso é um evento independente dos demais — o resultado de um concurso não influencia o resultado do próximo.",
  },
  {
    termo: "Desvio padrão",
    slug: "desvio-padrao",
    definicao:
      "Medida estatística de quanto os valores de um conjunto de dados se afastam, em média, do valor central (a média). Usado para comparar o quanto a frequência de cada dezena varia em torno do esperado ao longo do histórico de uma loteria.",
    saibaMais: { href: "/matematica/desvio-padrao", label: "Entenda desvio padrão" },
  },
  {
    termo: "Dezena",
    slug: "dezena",
    definicao:
      "Cada um dos números que compõem o universo de uma loteria (por exemplo, de 1 a 25 na Lotofácil, ou de 1 a 60 na Mega-Sena) e que podem ser sorteados ou apostados.",
  },
  {
    termo: "Distribuição normal",
    slug: "distribuicao-normal",
    definicao:
      "A famosa 'curva em forma de sino', que descreve como muitos fenômenos naturais e estatísticos se distribuem em torno de uma média. A soma das dezenas sorteadas numa loteria, por exemplo, tende a seguir esse formato ao longo de muitos concursos.",
    saibaMais: { href: "/matematica/distribuicao-normal", label: "Entenda a distribuição normal" },
  },
  {
    termo: "Duque, terno, quadra, quina",
    slug: "duque-terno-quadra-quina",
    definicao:
      "Nomes tradicionais para faixas de premiação que exigem, respectivamente, 2, 3, 4 e 5 acertos — usados principalmente na Quina e na Mega-Sena. Cada faixa tem sua própria probabilidade e valor de prêmio.",
    saibaMais: { href: "/calculadoras/probabilidade-loteria", label: "Calcular probabilidades por faixa" },
  },
  {
    termo: "Duques e trincas (Lotofácil)",
    slug: "duques-trincas",
    definicao:
      "Pares (duques) e trios (trincas) de dezenas que aparecem juntos com mais ou menos frequência num histórico de sorteios. Como qualquer subconjunto de dezenas, sua frequência conjunta segue a mesma lógica combinatória do jogo como um todo.",
    saibaMais: { href: "/dicas/duques-trincas", label: "Duques e trincas na Lotofácil" },
  },
  {
    termo: "Fatorial",
    slug: "fatorial",
    definicao:
      "Notação matemática (representada por !) que multiplica um número por todos os inteiros positivos menores que ele. Por exemplo, 5! = 5×4×3×2×1 = 120. É a base do cálculo de combinações e permutações.",
    saibaMais: { href: "/matematica/fatorial", label: "Entenda fatorial" },
  },
  {
    termo: "Fechamento",
    slug: "fechamento",
    definicao:
      "Técnica de selecionar um conjunto de dezenas maior que o necessário e gerar múltiplos jogos que garantem, matematicamente, um determinado prêmio mínimo caso um certo número dessas dezenas seja sorteado. Reduz custo comparado a uma aposta múltipla direta, mas não aumenta a chance de acertar a faixa principal.",
    saibaMais: { href: "/dicas/fechamento", label: "Como funciona um fechamento" },
  },
  {
    termo: "Fibonacci (sequência de)",
    slug: "fibonacci",
    definicao:
      "Sequência numérica em que cada termo é a soma dos dois anteriores (1, 1, 2, 3, 5, 8, 13...). Aparece com frequência na natureza e é usada aqui como exemplo de padrão matemático — sem nenhuma relação causal com resultados de loteria.",
    saibaMais: { href: "/dicas/fibonacci", label: "Fibonacci e loteria" },
  },
  {
    termo: "Frequência",
    slug: "frequencia",
    definicao:
      "Quantidade de vezes que uma dezena específica foi sorteada ao longo do histórico de uma loteria. É a estatística descritiva mais básica — útil para curiosidade histórica, mas sem valor preditivo sobre sorteios futuros.",
    saibaMais: { href: "/dicas/frequencia", label: "Entenda frequência" },
  },
  {
    termo: "Garantia (em fechamento)",
    slug: "garantia",
    definicao:
      "No contexto de um fechamento, é o nível de prêmio que o conjunto de jogos garante matematicamente, dado que um número mínimo das dezenas escolhidas seja sorteado — por exemplo, uma 'garantia de 11 pontos se 13 das 15 dezenas saírem'.",
    saibaMais: { href: "/dicas/fechamento", label: "Como funciona um fechamento" },
  },
  {
    termo: "Independência de eventos",
    slug: "independencia-de-eventos",
    definicao:
      "Propriedade de dois eventos em que o resultado de um não afeta a probabilidade do outro. Cada sorteio de loteria é independente dos anteriores — por isso, dezenas 'atrasadas' não ficam mais prováveis de sair.",
    saibaMais: { href: "/matematica/numeros-aleatorios", label: "Aleatoriedade e independência" },
  },
  {
    termo: "Lei dos Grandes Números",
    slug: "lei-dos-grandes-numeros",
    definicao:
      "Princípio estatístico segundo o qual, quanto mais vezes um experimento aleatório é repetido, mais a frequência observada dos resultados se aproxima da probabilidade teórica. Explica por que, após milhares de concursos, a frequência de cada dezena converge para valores parecidos.",
    saibaMais: { href: "/matematica/lei-dos-grandes-numeros", label: "Entenda a Lei dos Grandes Números" },
  },
  {
    termo: "Matriz (de fechamento)",
    slug: "matriz",
    definicao:
      "Conjunto de dezenas maior que o necessário, escolhido como base para gerar os múltiplos jogos de um fechamento. Por exemplo, uma matriz de 18 dezenas na Lotofácil gera vários jogos de 15 dezenas cada.",
    saibaMais: { href: "/dicas/fechamento", label: "Como funciona um fechamento" },
  },
  {
    termo: "Moldura e centro",
    slug: "moldura-centro",
    definicao:
      "Forma de dividir o volante de apostas em duas regiões — a borda externa ('moldura') e o miolo ('centro') — para analisar se dezenas de uma região saem mais que as da outra. Estatisticamente, não há diferença esperada entre as regiões.",
    saibaMais: { href: "/dicas/moldura-centro", label: "Moldura vs. centro do volante" },
  },
  {
    termo: "Múltiplos de 3",
    slug: "multiplos-de-3",
    definicao:
      "Dezenas divisíveis por 3 (3, 6, 9, 12...). Analisar quantos múltiplos de 3 saem por concurso é outra forma de observar a composição das dezenas sorteadas — sem que isso ofereça vantagem preditiva.",
    saibaMais: { href: "/dicas/multiplos-de-3", label: "Múltiplos de 3 na loteria" },
  },
  {
    termo: "Par e ímpar",
    slug: "par-impar",
    definicao:
      "Classificação das dezenas sorteadas conforme sejam divisíveis por 2 (pares) ou não (ímpares). A proporção de pares e ímpares num sorteio segue a distribuição binomial esperada — jogos com 7-8 ou 8-7 são os mais comuns só porque são as combinações mais numerosas, não porque sejam 'mais prováveis' de serem escolhidas pelo sorteio.",
    saibaMais: { href: "/dicas/par-impar", label: "Par e ímpar na loteria" },
  },
  {
    termo: "Paradoxo do aniversário",
    slug: "paradoxo-do-aniversario",
    definicao:
      "Resultado contraintuitivo da probabilidade que mostra como coincidências (como duas pessoas fazendo aniversário no mesmo dia, ou dois sorteios com dezenas repetidas) são muito mais comuns do que a intuição sugere em grupos ou séries de tamanho moderado.",
    saibaMais: { href: "/matematica/paradoxo-aniversario", label: "Entenda o paradoxo do aniversário" },
  },
  {
    termo: "Prêmio principal (faixa principal)",
    slug: "premio-principal",
    definicao:
      "A faixa de premiação que exige o maior número de acertos possível num sorteio (por exemplo, 15 pontos na Lotofácil ou a sena na Mega-Sena) e que concentra o maior valor em prêmios.",
  },
  {
    termo: "Probabilidade",
    slug: "probabilidade",
    definicao:
      "Medida numérica, entre 0 e 1 (ou 0% e 100%), da chance de um evento específico acontecer. Na loteria, a probabilidade de cada combinação de dezenas é sempre a mesma, calculada por combinatória — nenhuma combinação é 'mais provável' que outra.",
    saibaMais: { href: "/matematica/probabilidade", label: "Entenda probabilidade" },
  },
  {
    termo: "Probabilidade condicional / Teorema de Bayes",
    slug: "probabilidade-condicional",
    definicao:
      "Probabilidade de um evento ocorrer dado que outro evento já aconteceu. O Teorema de Bayes formaliza como atualizar essa probabilidade à luz de nova informação — muito usado em diagnósticos médicos, mas que não se aplica a sorteios de loteria, pois eles não têm causa oculta a inferir.",
    saibaMais: { href: "/matematica/teorema-de-bayes", label: "Entenda o Teorema de Bayes" },
  },
  {
    termo: "Rateio",
    slug: "rateio",
    definicao:
      "Divisão do valor total de uma faixa de prêmio entre todos os apostadores que acertaram aquela faixa no mesmo concurso. Quanto mais ganhadores numa faixa, menor o valor recebido por cada um.",
  },
  {
    termo: "Regressão à média",
    slug: "regressao-a-media",
    definicao:
      "Fenômeno estatístico em que um resultado extremo tende a ser seguido por um resultado mais próximo da média — não porque algo mudou, mas porque parte do resultado extremo original era variação aleatória que não se repete com a mesma intensidade.",
    saibaMais: { href: "/matematica/regressao-media", label: "Entenda regressão à média" },
  },
  {
    termo: "Repetidas (dezenas)",
    slug: "repetidas",
    definicao:
      "Dezenas que saem em dois concursos consecutivos (ou, na Dupla Sena, nos dois sorteios do mesmo concurso). A quantidade esperada de repetições segue a distribuição hipergeométrica — nem alta demais, nem baixa demais.",
    saibaMais: { href: "/dicas/repetidas", label: "Dezenas repetidas entre concursos" },
  },
  {
    termo: "Retorno ao apostador (RTP)",
    slug: "retorno-ao-apostador",
    definicao:
      "Percentual da arrecadação total de uma loteria que retorna aos apostadores em forma de prêmios — o restante é destinado a impostos, programas sociais e custos operacionais definidos por lei. Ajuda a entender o valor esperado real de cada aposta.",
    saibaMais: { href: "/dicas/retorno-ao-apostador", label: "Como o retorno ao apostador funciona" },
  },
  {
    termo: "Sequência (dezenas consecutivas)",
    slug: "sequencia",
    definicao:
      "Duas ou mais dezenas sorteadas que são numericamente consecutivas (como 7, 8 e 9). É comum a crença de que sequências 'não saem' — mas combinatoriamente elas têm exatamente a mesma chance que qualquer outro conjunto de dezenas.",
    saibaMais: { href: "/dicas/sequencias", label: "Sequências de dezenas consecutivas" },
  },
  {
    termo: "Soma das dezenas",
    slug: "soma",
    definicao:
      "Resultado da adição de todas as dezenas sorteadas num concurso. A soma tende a seguir uma distribuição normal centrada num valor esperado, já que é muito mais provável obter uma soma intermediária do que uma soma muito baixa ou muito alta.",
    saibaMais: { href: "/dicas/soma", label: "A soma das dezenas sorteadas" },
  },
  {
    termo: "Valor esperado",
    slug: "valor-esperado",
    definicao:
      "Média ponderada de todos os resultados possíveis de um evento aleatório, considerando suas respectivas probabilidades. Para qualquer loteria, o valor esperado de uma aposta é sempre menor que o valor pago por ela — é assim que o jogo se sustenta financeiramente.",
    saibaMais: { href: "/matematica/valor-esperado", label: "Entenda valor esperado" },
  },
  {
    termo: "Viés cognitivo",
    slug: "vies-cognitivo",
    definicao:
      "Padrão sistemático de desvio no julgamento humano em relação ao raciocínio racional ou estatístico. Vários vieses (como a falácia do apostador ou a ilusão de padrão) influenciam como as pessoas interpretam resultados de loteria, mesmo sem nenhuma base matemática real.",
    saibaMais: { href: "/dicas/vieses-cognitivos", label: "Vieses cognitivos e loteria" },
  },
  {
    termo: "Viés de sobrevivência",
    slug: "vies-de-sobrevivencia",
    definicao:
      "Erro de raciocínio que ocorre ao tirar conclusões olhando só para os casos que 'sobreviveram' a um filtro (como histórias de ganhadores de loteria), ignorando a esmagadora maioria de casos que não sobreviveram e simplesmente não geram nenhuma história para contar.",
    saibaMais: { href: "/matematica/vies-sobrevivencia", label: "Entenda o viés de sobrevivência" },
  },
  {
    termo: "Volante",
    slug: "volante",
    definicao:
      "Nome do bilhete de papel (físico ou seu equivalente digital) usado para marcar as dezenas de uma aposta de loteria nas casas lotéricas ou aplicativos oficiais.",
  },
];

export function getGlossarioAgrupado(): { letra: string; termos: TermoGlossario[] }[] {
  const ordenado = [...GLOSSARIO].sort((a, b) =>
    a.termo.localeCompare(b.termo, "pt-BR", { sensitivity: "base" })
  );
  const grupos = new Map<string, TermoGlossario[]>();
  for (const t of ordenado) {
    const letra = t.termo.normalize("NFD").replace(/[\u0300-\u036f]/g, "")[0].toUpperCase();
    if (!grupos.has(letra)) grupos.set(letra, []);
    grupos.get(letra)!.push(t);
  }
  return Array.from(grupos.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([letra, termos]) => ({ letra, termos }));
}
