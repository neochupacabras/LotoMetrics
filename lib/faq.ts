export interface PerguntaFAQ {
  pergunta: string;
  resposta: string;
  saibaMais?: { href: string; label: string };
}

export interface CategoriaFAQ {
  categoria: string;
  perguntas: PerguntaFAQ[];
}

export const FAQ: CategoriaFAQ[] = [
  {
    categoria: "Como apostar",
    perguntas: [
      {
        pergunta: "Qual é a idade mínima para apostar?",
        resposta:
          "18 anos completos, tanto para apostas presenciais em casas lotéricas quanto para apostas pela internet (site ou aplicativo Loterias Caixa). A exigência vale igualmente para brasileiros e estrangeiros — nesse caso, com CPF válido.",
      },
      {
        pergunta: "Dá para apostar pela internet?",
        resposta:
          "Sim. O Portal Loterias Caixa e o aplicativo Loterias Caixa permitem apostar em todas as loterias oficiais sem sair de casa, com pagamento por cartão, Pix ou Mercado Pago. Atualmente não há valor mínimo por transação, mas o valor máximo é de R$ 500 por operação.",
      },
      {
        pergunta: "O que é 'Surpresinha'?",
        resposta:
          "É a opção de deixar o sistema escolher as dezenas da sua aposta aleatoriamente, em vez de marcá-las manualmente no volante. Matematicamente, não faz diferença nenhuma: uma combinação escolhida pelo sistema tem exatamente a mesma probabilidade que uma escolhida à mão.",
      },
      {
        pergunta: "O que é 'Teimosinha'?",
        resposta:
          "É a opção de repetir automaticamente a mesma aposta por vários concursos seguidos, sem precisar refazer o jogo toda vez. Útil pra quem sempre aposta nas mesmas dezenas, mas não muda a probabilidade de cada concurso individual.",
      },
      {
        pergunta: "Estrangeiros podem apostar nas loterias da Caixa?",
        resposta:
          "Podem, desde que tenham 18 anos ou mais e um CPF válido — o mesmo requisito exigido de brasileiros. Quem mora fora do Brasil deve verificar se a legislação do próprio país permite esse tipo de aposta internacional.",
      },
    ],
  },
  {
    categoria: "Prêmios e resgate",
    perguntas: [
      {
        pergunta: "Quanto tempo tenho para resgatar um prêmio?",
        resposta:
          "90 dias corridos, contados a partir da data do sorteio — esse prazo é o mesmo para todas as loterias da Caixa e é fixado por lei, sem possibilidade de prorrogação.",
      },
      {
        pergunta: "O que acontece se eu perder o prazo de resgate?",
        resposta:
          "O valor do prêmio não fica retido em nenhuma conta à sua espera — ele é repassado integralmente ao Fundo de Financiamento Estudantil (FIES). Depois de vencido o prazo de 90 dias, o direito ao prêmio é perdido definitivamente.",
      },
      {
        pergunta: "Onde eu resgato o prêmio?",
        resposta:
          "Prêmios de valor mais baixo (a faixa de isenção de imposto de renda, hoje em torno de R$ 2.400 — confirme o valor atualizado no site da Caixa) podem ser resgatados em qualquer casa lotérica credenciada. Prêmios acima desse valor só podem ser resgatados em agências da Caixa Econômica Federal, mediante apresentação do comprovante da aposta e documento de identidade com CPF.",
      },
      {
        pergunta: "Prêmio de loteria paga imposto de renda?",
        resposta:
          "Sim, para valores acima da faixa de isenção. A alíquota de 30% é retida na fonte pela própria Caixa antes do pagamento — ou seja, o valor que você recebe já é líquido, sem necessidade de declarar ou pagar imposto adicional depois. O imposto incide sobre o valor do prêmio, não sobre o valor gasto na aposta.",
      },
      {
        pergunta: "Quanto tempo demora para receber um prêmio grande?",
        resposta:
          "Prêmios acima de R$ 10 mil levam, no mínimo, 2 dias úteis a partir da apresentação dos documentos numa agência da Caixa — esse prazo existe por motivos de segurança e logística financeira, e pode ser um pouco maior dependendo do valor.",
      },
      {
        pergunta: "O que acontece se ninguém acertar a faixa principal?",
        resposta:
          "O prêmio acumula e é somado ao prêmio do próximo concurso daquela mesma loteria — é por isso que valores como os da Mega-Sena às vezes chegam a centenas de milhões de reais.",
        saibaMais: { href: "/glossario#acumulado", label: "Ver definição de acumulado no glossário" },
      },
      {
        pergunta: "Posso manter sigilo se eu ganhar?",
        resposta:
          "O comprovante de aposta premiado é considerado um título 'ao portador' — ou seja, tecnicamente pertence a quem estiver com o bilhete em mãos. Para maior segurança, o ganhador pode (e deve) escrever nome completo e CPF no verso do comprovante, tornando-o nominal. A Caixa não divulga a identidade do ganhador por iniciativa própria.",
      },
    ],
  },
  {
    categoria: "Bolão",
    perguntas: [
      {
        pergunta: "O que é um bolão oficial?",
        resposta:
          "É um bolão registrado formalmente numa casa lotérica, em que cada participante recebe um comprovante individual da própria cota — o que facilita a comprovação em caso de prêmio e evita disputas entre os participantes.",
      },
      {
        pergunta: "Um bolão informal (entre amigos, sem registro) tem alguma proteção?",
        resposta:
          "Não tem a mesma proteção formal de um bolão registrado. Como o bilhete é ao portador, quem estiver de posse dele pode reivindicar o prêmio sozinho — por isso vale combinar por escrito, antes do sorteio, como o grupo vai dividir eventual prêmio e quem guarda o comprovante original.",
      },
      {
        pergunta: "Como o prêmio é dividido entre os participantes de um bolão?",
        resposta:
          "Proporcionalmente ao número de cotas de cada participante. Num bolão oficial, isso é feito automaticamente pela Caixa a partir do registro de cada cota; num bolão informal, a divisão depende do combinado entre o grupo.",
        saibaMais: { href: "/glossario#bolao", label: "Ver definição de bolão no glossário" },
      },
    ],
  },
  {
    categoria: "Sobre as loterias",
    perguntas: [
      {
        pergunta: "Todas as loterias têm as mesmas regras de prêmio e resgate?",
        resposta:
          "As regras de resgate (prazo de 90 dias, faixas de valor por canal de pagamento, tributação) são as mesmas para todas as loterias da Caixa. Já as regras específicas de cada jogo — quantas dezenas sorteia, faixas de premiação, preço da aposta — variam de loteria para loteria.",
      },
      {
        pergunta: "Por que às vezes o prêmio de uma loteria chega perto de um bilhão de reais?",
        resposta:
          "Isso acontece quando o prêmio acumula por muitos concursos seguidos sem que ninguém acerte a faixa principal — cada concurso sem ganhador soma o valor não pago ao prêmio do próximo. Concursos especiais como a Mega da Virada também reúnem uma arrecadação muito maior que a de um concurso comum, o que ajuda a inflar o valor do prêmio.",
      },
      {
        pergunta: "Dá para prever quais números vão sair no próximo sorteio?",
        resposta:
          "Não. Cada sorteio é um evento aleatório e independente dos anteriores — não existe padrão, fórmula ou método capaz de prever o resultado. Qualquer site ou pessoa que afirme o contrário está enganando você.",
        saibaMais: { href: "/matematica/numeros-aleatorios", label: "Entenda aleatoriedade de verdade" },
      },
      {
        pergunta: "Números 'atrasados' têm mais chance de sair no próximo concurso?",
        resposta:
          "Não. Esse é um erro de raciocínio conhecido como falácia do apostador: como os sorteios são independentes entre si, o fato de uma dezena não sair há muitos concursos não muda, em nada, a probabilidade dela sair no próximo.",
        saibaMais: { href: "/dicas/atraso", label: "Entenda o atraso das dezenas" },
      },
    ],
  },
  {
    categoria: "Sobre a LotoAnalítica",
    perguntas: [
      {
        pergunta: "O que é a LotoAnalítica?",
        resposta:
          "Uma plataforma de estatísticas, ferramentas e conteúdo educacional sobre as loterias da Caixa. Reunimos resultados oficiais, tabelas históricas, calculadoras e artigos explicando a matemática por trás dos jogos — sem vender nenhum método ou fórmula milagrosa.",
      },
      {
        pergunta: "As ferramentas do site aumentam minha chance de ganhar?",
        resposta:
          "Não. Nenhuma ferramenta estatística, gerador de jogos ou fechamento consegue aumentar a probabilidade de acerto de uma aposta de loteria — os sorteios são aleatórios e cada combinação de dezenas tem sempre a mesma chance. As ferramentas ajudam a organizar e visualizar informação, não a prever resultados.",
      },
      {
        pergunta: "De onde vêm os resultados e dados do site?",
        resposta:
          "Dos resultados oficiais divulgados pela Caixa Econômica Federal para cada concurso. As tabelas e análises são calculadas a partir desse histórico oficial.",
      },
      {
        pergunta: "É preciso pagar para usar o site?",
        resposta:
          "As principais ferramentas e conteúdos são gratuitos. Existe um plano Premium opcional com recursos adicionais — mas nenhuma funcionalidade paga oferece qualquer vantagem preditiva sobre os sorteios.",
      },
    ],
  },
];
