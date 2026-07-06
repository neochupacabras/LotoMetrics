export interface Analise {
  slug: string;
  titulo: string;
  resumo: string;
  data: string; // ISO date string YYYY-MM-DD
  categoria: "lotofacil" | "megasena" | "ambas" | "educativo";
  tempoLeitura: number; // minutos
  corpo: string; // HTML/JSX como string — renderizado via dangerouslySetInnerHTML
}

export const ANALISES: Analise[] = [
  {
    slug: "lotofacil-3720-dezenas-mais-frequentes-2026",
    titulo: "Lotofácil: as dezenas mais e menos frequentes no primeiro semestre de 2026",
    resumo:
      "Dos 180 concursos realizados entre janeiro e junho de 2026, quais dezenas saíram mais — e o que a diferença entre elas diz (e não diz) sobre o próximo sorteio.",
    data: "2026-07-01",
    categoria: "lotofacil",
    tempoLeitura: 5,
    corpo: `
      <p>
        Os primeiros seis meses de 2026 somaram aproximadamente 180 concursos da
        Lotofácil, do concurso 3.541 ao 3.720. É um volume suficiente para observar
        algumas tendências de frequência de curto prazo — mas, como sempre, a
        interpretação correta importa mais do que os números brutos.
      </p>

      <h2>As dezenas que mais saíram no semestre</h2>
      <p>
        Nos 180 concursos do período, cada dezena saiu, em média, 108 vezes (180 × 0,60,
        já que 60% das 25 dezenas saem por concurso). A variação esperada ao redor dessa
        média, calculada pelo desvio padrão binomial, é de aproximadamente ±7 concursos
        — ou seja, qualquer dezena com frequência entre 101 e 115 está exatamente onde
        a estatística espera que esteja.
      </p>
      <p>
        No período analisado, as dezenas 10, 20 e 22 lideraram o ranking de frequência,
        com aparições acima de 114 no semestre. Na outra ponta, as dezenas 16 e 25
        ficaram abaixo de 102 aparições. Toda essa variação está dentro do intervalo
        de ±7 que a combinatória prevê — não há nenhuma dezena fora do esperado.
      </p>

      <h2>O que isso não significa</h2>
      <p>
        A tentação é usar esse ranking para o próximo jogo: incluir as "mais frequentes"
        ou apostar que as "menos frequentes" vão compensar. Nenhuma das duas abordagens
        tem base matemática. Cada concurso é independente dos anteriores — a dezena 16,
        por ter saído menos no semestre, não tem nenhuma probabilidade extra de sair no
        próximo concurso. Sua chance continua sendo exatamente 60%, a mesma de qualquer
        outra dezena.
      </p>
      <p>
        A variação observada é o resultado esperado de um processo aleatório ao longo
        de 180 tentativas. Se rodarmos novamente os próximos 180 concursos, um ranking
        diferente vai emergir — com outras dezenas na liderança, sem nenhuma relação
        com o ranking atual.
      </p>

      <h2>O que o heatmap mostra</h2>
      <p>
        Para visualizar essa distribuição concurso a concurso, o
        <a href="/lotofacil/heatmap">heatmap do volante</a> colore cada dezena
        pela sua frequência no período selecionado. Assinantes Premium podem comparar
        o período "últimos 100 concursos" com "todo o histórico" e observar que as
        dezenas "mais quentes" mudam completamente — o que ilustra visualmente que
        frequência de curto prazo é ruído, não sinal.
      </p>

      <h2>Conclusão</h2>
      <p>
        O ranking de frequência do primeiro semestre de 2026 é um retrato fiel do que
        aconteceu nesses 180 concursos. Não é um mapa do que vai acontecer no próximo.
        Use a <a href="/lotofacil/tabelas/frequencia">tabela de frequência</a> para
        curiosidade histórica — não como base de estratégia.
      </p>
    `,
  },
  {
    slug: "megasena-acumulos-longos-historico",
    titulo: "Mega-Sena: os acúmulos mais longos da história e o que eles têm em comum",
    resumo:
      "Em mais de 3.000 concursos, a Mega-Sena já teve sequências de acúmulo de 30, 40 e até mais concursos. O que os dados históricos revelam — e o que eles não provam.",
    data: "2026-06-24",
    categoria: "megasena",
    tempoLeitura: 6,
    corpo: `
      <p>
        Com probabilidade de 1 em 50.063.860 de acertar a sena, é completamente esperado
        que a Mega-Sena fique muitos concursos sem ganhador. Mas algumas sequências de
        acúmulo na história foram especialmente longas — e vale olhar para elas com
        dados reais.
      </p>

      <h2>A distribuição esperada de acúmulos</h2>
      <p>
        A chance de nenhum apostador acertar a sena em um único concurso depende do
        volume de apostas. Em concursos normais (sem acúmulo), com aproximadamente
        80 milhões de apostas, a probabilidade de zero ganhadores fica em torno de 20%.
        Isso significa que, em média, 1 em cada 5 concursos acumula — e sequências
        de 5, 10 ou 15 concursos sem ganhador são eventos esperados no longo prazo.
      </p>
      <p>
        Os maiores acúmulos da história da Mega-Sena ultrapassaram os 20 concursos
        consecutivos sem ganhador. Esses eventos são raros mas não surpreendentes:
        a probabilidade de uma sequência de 20 acúmulos consecutivos, dado que cada
        concurso tem ~20% de chance de acumular, é de aproximadamente 1,1% — ou seja,
        em 3.000+ concursos, esperaríamos que isso acontecesse algumas vezes.
      </p>

      <h2>O que os acúmulos longos têm em comum</h2>
      <p>
        Analisando os dados históricos disponíveis na
        <a href="/megasena/acumulos">linha do tempo de acúmulos</a>, os maiores acúmulos
        em número de concursos ocorreram predominantemente em períodos com menor volume
        de apostas — especialmente nas primeiras décadas da Mega-Sena, antes da
        popularização das apostas online. Com menos apostas por concurso, a probabilidade
        de nenhum bilhete acertar as 6 dezenas é maior.
      </p>
      <p>
        Nos últimos anos, com o volume de apostas digitais crescendo significativamente,
        a frequência de acúmulos muito longos diminuiu — não porque os sorteios mudaram,
        mas porque mais apostas por concurso reduzem a chance de zero ganhadores.
      </p>

      <h2>Acúmulo longo significa que "vai sair logo"?</h2>
      <p>
        Não. Esse é um dos exemplos mais clássicos da falácia do apostador: depois de
        muitos concursos sem ganhador, a intuição diz que o prêmio "está prestes a
        ser ganho". Mas cada concurso é independente — a chance de haver um ganhador
        no próximo concurso não aumenta com o tamanho do acúmulo.
      </p>
      <p>
        O que de fato aumenta com o acúmulo é o valor do prêmio (que atrai mais
        apostadores) e, consequentemente, a probabilidade de haver um ganhador — mas
        por causa do maior volume de apostas, não porque o sorteio tem "memória".
      </p>

      <h2>Os prêmios pagos ao final dos maiores acúmulos</h2>
      <p>
        Prêmios recordes da Mega-Sena foram quase sempre pagos no final de sequências
        longas de acúmulo — não surpreendentemente, já que cada concurso sem ganhador
        adiciona ao fundo. O maior prêmio pago em concurso regular ultrapassou R$500
        milhões, resultado de uma sequência de acúmulos combinada com alta arrecadação
        por ser período de forte publicidade.
      </p>
      <p>
        O histórico completo com todos os acúmulos, sua duração e os prêmios finais
        está na <a href="/megasena/acumulos">linha do tempo da Mega-Sena</a>.
      </p>
    `,
  },
  {
    slug: "lotofacil-vs-megasena-qual-tem-maior-retorno",
    titulo: "Lotofácil vs Mega-Sena: qual tem maior retorno esperado por aposta?",
    resumo:
      "Comparação honesta entre as duas principais loterias: probabilidades, retorno ao apostador, frequência de prêmios e o que cada uma oferece de diferente.",
    data: "2026-06-17",
    categoria: "ambas",
    tempoLeitura: 7,
    corpo: `
      <p>
        A pergunta aparece muito: entre Lotofácil e Mega-Sena, qual é a "melhor" para
        jogar? A resposta depende do que você entende por "melhor" — e, matematicamente,
        as duas loterias oferecem propostas muito diferentes.
      </p>

      <h2>Probabilidades: ordem de magnitude diferente</h2>
      <p>
        A diferença mais fundamental está na chance de ganhar a faixa principal:
      </p>
      <ul>
        <li><strong>Lotofácil (15 acertos):</strong> 1 em 3.268.760</li>
        <li><strong>Mega-Sena (6 acertos):</strong> 1 em 50.063.860</li>
      </ul>
      <p>
        A Mega-Sena é aproximadamente 15 vezes mais difícil de acertar na faixa
        principal. Isso reflete diretamente o universo de combinações: na Lotofácil,
        você escolhe 15 de 25 dezenas (C(25,15) = 3.268.760); na Mega-Sena, 6 de 60
        (C(60,6) = 50.063.860).
      </p>

      <h2>Retorno ao apostador: quase igual</h2>
      <p>
        Apesar das probabilidades diferentes, o percentual destinado a prêmios é
        praticamente idêntico:
      </p>
      <ul>
        <li><strong>Lotofácil:</strong> 43,35% da arrecadação vai a prêmios</li>
        <li><strong>Mega-Sena:</strong> 43,79% da arrecadação vai a prêmios</li>
      </ul>
      <p>
        Isso significa que, em termos de retorno esperado por real apostado, as duas
        loterias são praticamente equivalentes. Para cada R$100 apostados, espera-se
        receber ~R$43 de volta em prêmios brutos — independente de qual loteria você
        escolher.
      </p>

      <h2>Frequência de prêmios: enorme diferença</h2>
      <p>
        A Lotofácil paga prêmios em faixas menores com muito mais frequência. Com 25
        dezenas e 15 sorteadas por concurso (60% do total), as chances de prêmios
        intermediários são:
      </p>
      <ul>
        <li>14 acertos: 1 em 4.655</li>
        <li>13 acertos: 1 em 334</li>
        <li>12 acertos: 1 em 52</li>
        <li>11 acertos: 1 em 11</li>
      </ul>
      <p>
        Na Mega-Sena, mesmo a quina (5 acertos) tem probabilidade de 1 em 154.518 —
        ordens de magnitude mais rara que qualquer faixa intermediária da Lotofácil.
        Isso significa que quem joga Lotofácil regularmente vai ganhar alguma coisa
        (mesmo que pequeno) com muito mais frequência.
      </p>

      <h2>Prêmio máximo: enorme diferença na direção oposta</h2>
      <p>
        A Mega-Sena paga prêmios principais muito maiores por dois motivos: maior
        volume de apostas por concurso (bilhões de reais em arrecadação por semana)
        e acúmulos mais longos e frequentes. O prêmio principal da Mega-Sena pode
        chegar a centenas de milhões ou até bilhões de reais em concursos especiais.
      </p>
      <p>
        Na Lotofácil, o prêmio principal raramente ultrapassa R$5 milhões em concursos
        normais — e o volume de ganhadores da faixa principal tende a ser alto (muitas
        dezenas ou centenas de ganhadores por concurso), o que reduz o valor por ganhador.
      </p>

      <h2>Qual escolher?</h2>
      <p>
        Do ponto de vista matemático, as duas têm o mesmo retorno esperado por real
        apostado. A escolha é sobre o perfil de risco:
      </p>
      <ul>
        <li>
          <strong>Lotofácil:</strong> prêmio menor, ganhos intermediários mais
          frequentes, mais sorteios por semana (segunda, quarta e sábado). Ideal para
          quem gosta de ver resultado com mais regularidade.
        </li>
        <li>
          <strong>Mega-Sena:</strong> prêmio potencialmente gigantesco, chances de
          qualquer ganho muito menores, menos sorteios (terça, quinta e sábado). Ideal
          para quem está jogando pela fantasia do prêmio transformador.
        </li>
      </ul>
      <p>
        A página de <a href="/lotofacil/probabilidades">probabilidades da Lotofácil</a>
        e de <a href="/megasena/probabilidades">probabilidades da Mega-Sena</a> mostram
        a tabela completa de chances por faixa para qualquer quantidade de dezenas apostadas.
      </p>
    `,
  },
  {
    slug: "como-conferir-jogo-historico-completo",
    titulo: "Como conferir seu jogo em todo o histórico da Lotofácil — guia passo a passo",
    resumo:
      "O conferidor do LotoAnalítica mostra a pontuação de qualquer jogo em todos os concursos já sorteados. Veja como usar e o que esperar do resultado.",
    data: "2026-06-10",
    categoria: "lotofacil",
    tempoLeitura: 4,
    corpo: `
      <p>
        Uma das ferramentas mais úteis para entender o desempenho real de um jogo é
        o conferidor histórico. Em vez de verificar um concurso por vez, ele analisa
        o jogo contra todo o histórico de uma vez — e mostra, sem filtro, o resultado
        honesto.
      </p>

      <h2>Como acessar</h2>
      <p>
        Vá para <a href="/lotofacil/conferidor">Lotofácil → Conferidor</a> (ou
        <a href="/megasena/conferidor">Mega-Sena → Conferidor</a>). Na tela inicial,
        selecione as dezenas do seu jogo clicando no volante ou digitando os números.
        Com o jogo montado, clique em "Conferir histórico".
      </p>

      <h2>O que o resultado mostra</h2>
      <p>
        Para cada concurso do histórico (ou os últimos 100, na versão gratuita), o
        conferidor exibe:
      </p>
      <ul>
        <li>O número do concurso e a data do sorteio</li>
        <li>Quantas dezenas do seu jogo coincidiram com o resultado</li>
        <li>Se essa pontuação corresponde a alguma faixa premiada</li>
        <li>O valor que teria sido ganho naquele concurso</li>
      </ul>
      <p>
        No final, um resumo mostra o total gasto (custo de todas as apostas no período),
        o total ganho em prêmios brutos e o saldo final — que, para a grande maioria
        dos jogos, é negativo.
      </p>

      <h2>O que esperar do resultado</h2>
      <p>
        Para um jogo típico de 15 dezenas da Lotofácil conferido contra os 3.720+
        concursos do histórico completo, espere:
      </p>
      <ul>
        <li>
          <strong>Custo total:</strong> em torno de R$13.000 (3.720 concursos × R$3,50)
        </li>
        <li>
          <strong>Concursos com 15 acertos:</strong> provavelmente zero, ou raramente 1
          (probabilidade de 1 em 3.268.760 por concurso)
        </li>
        <li>
          <strong>Concursos com 14 acertos:</strong> provavelmente 0 a 1
        </li>
        <li>
          <strong>Concursos com 13 acertos:</strong> em torno de 10 a 15
        </li>
        <li>
          <strong>Concursos com 12 acertos:</strong> em torno de 60 a 90
        </li>
        <li>
          <strong>Concursos com 11 acertos:</strong> em torno de 280 a 380
        </li>
      </ul>
      <p>
        O total de prêmios brutos somados raramente ultrapassa 40-45% do total gasto
        — exatamente o retorno ao apostador de 43,35% que a Caixa destina a prêmios.
      </p>

      <h2>Para que serve essa informação</h2>
      <p>
        O conferidor é especialmente útil para combater o viés de confirmação: a
        tendência de lembrar dos concursos em que o jogo "quase ganhou" e esquecer
        dos que ficaram longe. Ver o histórico completo, sem filtro, dá uma perspectiva
        honesta do desempenho real de qualquer combinação.
      </p>
      <p>
        Usuários Premium podem conferir múltiplos jogos simultaneamente e usar o histórico
        completo — o que permite comparar o desempenho de diferentes estratégias lado a
        lado com dados reais.
      </p>
    `,
  },
  {
    slug: "quiz-verdade-ou-mito-loteria-explicado",
    titulo: "As 5 crenças mais comuns sobre loteria que a matemática derruba",
    resumo:
      "Números que não saem há muito tempo têm mais chance? Jogar sempre o mesmo jogo aumenta a probabilidade? Veja o que a matemática diz sobre as crenças mais populares.",
    data: "2026-06-03",
    categoria: "educativo",
    tempoLeitura: 5,
    corpo: `
      <p>
        O quiz <a href="/quiz">Verdade ou Mito?</a> deste site reúne 22 afirmações sobre
        loteria para você testar seus conhecimentos. Mas algumas dessas crenças são tão
        comuns que merecem uma explicação mais detalhada. Aqui estão as 5 mais frequentes.
      </p>

      <h2>1. "Um número que não sai há muito tempo está 'devendo' sair"</h2>
      <p>
        <strong>Mito.</strong> Cada sorteio é completamente independente dos anteriores.
        O mecanismo de sorteio — esferas físicas ou gerador eletrônico certificado —
        não tem nenhuma memória de quantas vezes cada dezena já saiu. A probabilidade de
        uma dezena específica sair no próximo concurso da Lotofácil é sempre 60%,
        independente do seu histórico de atraso.
      </p>
      <p>
        Esse raciocínio tem nome: <em>falácia do apostador</em>. Funciona igualmente
        mal para jogar moedas, rolar dados ou qualquer outro evento aleatório independente.
        Veja o artigo completo sobre <a href="/dicas/atraso">atraso</a>.
      </p>

      <h2>2. "Jogar os mesmos números todo concurso aumenta a chance com o tempo"</h2>
      <p>
        <strong>Mito.</strong> A chance de uma combinação específica sair em qualquer
        concurso individual é sempre 1 em 3.268.760 (Lotofácil) ou 1 em 50.063.860
        (Mega-Sena). Essa probabilidade não se "acumula" com o tempo — jogar o mesmo
        jogo por 100 concursos não muda nada na chance do 101º concurso.
      </p>
      <p>
        O que aumenta com mais concursos jogados é apenas o número de tentativas —
        e consequentemente o dinheiro gasto. A probabilidade por real apostado continua
        igual.
      </p>

      <h2>3. "Sequências como 1,2,3,4,5 nunca são sorteadas"</h2>
      <p>
        <strong>Mito.</strong> A combinação 1,2,3,4,5,6 (Mega-Sena) ou qualquer outra
        sequência "óbvia" tem exatamente a mesma probabilidade de ser sorteada que
        qualquer outra combinação específica: 1 em 50.063.860. O sorteio não reconhece
        padrões — as esferas não sabem que aqueles números formam uma sequência bonita.
      </p>
      <p>
        Dito isso, jogar uma sequência muito conhecida tem uma desvantagem real: muita
        gente joga as mesmas sequências óbvias, então se ela sair, o prêmio vai ser
        dividido entre muitos ganhadores. Veja o artigo sobre
        <a href="/dicas/numeros-populares">números populares</a>.
      </p>

      <h2>4. "O gerador de números aleatórios da Caixa é viciado"</h2>
      <p>
        <strong>Mito (sem evidência).</strong> Os geradores eletrônicos usados pela Caixa
        são certificados por laboratórios independentes e auditados regularmente. Qualquer
        alegação de fraude precisaria de evidência estatística — como uma discrepância
        sistemática entre as frequências observadas e as esperadas. Essa discrepância
        não existe nos dados históricos: a distribuição de frequências de todas as
        dezenas está dentro do intervalo esperado por pura aleatoriedade.
      </p>
      <p>
        A tabela de <a href="/lotofacil/tabelas/frequencia">frequência da Lotofácil</a>
        permite verificar isso: a variação entre a dezena mais e menos frequente está
        dentro de 2 desvios padrões do esperado — exatamente o que um sorteio honesto
        produziria.
      </p>

      <h2>5. "Usar os números mais frequentes do histórico aumenta a chance"</h2>
      <p>
        <strong>Mito.</strong> A frequência histórica de uma dezena não prevê sua
        probabilidade no próximo sorteio. Cada sorteio é independente — a dezena mais
        frequente do histórico tem exatamente a mesma chance de sair no próximo concurso
        que a menos frequente: 60% na Lotofácil, 10% na Mega-Sena.
      </p>
      <p>
        Para entender por que a variação de frequência observada no histórico é
        matematicamente esperada e não indica viés, veja o artigo sobre
        <a href="/dicas/frequencia">frequência</a>.
      </p>
    `,
  },
  {
    slug: "fechamento-quando-vale-usar",
    titulo: "Fechamento de dezenas: quando vale usar e quando não vale",
    resumo:
      "O fechamento organiza bilhetes de forma eficiente — mas tem custos altos e uma premissa fundamental que muita gente esquece. Veja em quais situações faz mais sentido.",
    data: "2026-05-27",
    categoria: "lotofacil",
    tempoLeitura: 6,
    corpo: `
      <p>
        O fechamento de dezenas é uma das técnicas mais populares entre apostadores
        frequentes da Lotofácil — e também uma das mais mal compreendidas. Este artigo
        não vai explicar o que é fechamento (para isso, veja o
        <a href="/dicas/fechamento">artigo completo</a>), mas vai discutir quando usar
        e quando não vale o custo.
      </p>

      <h2>A premissa que tudo depende</h2>
      <p>
        O fechamento garante: "se as dezenas sorteadas estiverem dentro do meu pool,
        pelo menos um bilhete vai capturar uma boa pontuação." Essa garantia é real
        e matematicamente verificável.
      </p>
      <p>
        Mas note a condicional: <em>se</em> as dezenas sorteadas estiverem dentro do
        seu pool. O fechamento não faz nada para aumentar a probabilidade de isso
        acontecer. Se você escolheu mal o pool — se as 15 dezenas sorteadas ficaram
        fora das 18 que você escolheu —, nenhum bilhete seu ganha, independente do
        sistema de fechamento usado.
      </p>
      <p>
        Isso significa que a eficácia do fechamento depende 100% da qualidade da
        escolha do pool. E como não existe nenhuma forma matematicamente válida de
        prever quais dezenas vão sair (frequência, atraso e ciclos não preveem
        o futuro), a escolha do pool é necessariamente subjetiva.
      </p>

      <h2>Quando o fechamento faz mais sentido</h2>
      <p>
        <strong>Em bolões com orçamento fixo.</strong> Se um grupo vai gastar R$500
        no próximo concurso de qualquer jeito, um fechamento reduzido de um pool de
        18 dezenas (que cobre faixas de 13+ acertos com cerca de R$350-500) é mais
        eficiente do que 143 apostas simples aleatórias com o mesmo valor — porque
        o fechamento cobre sistematicamente o pool sem buracos.
      </p>
      <p>
        <strong>Quando você tem convicção forte sobre um subconjunto de dezenas.</strong>
        Mesmo que essa convicção não tenha base matemática, se você vai jogar aquelas
        dezenas de qualquer forma, organizar os bilhetes com fechamento garante melhor
        cobertura pelo mesmo custo.
      </p>

      <h2>Quando o fechamento não vale</h2>
      <p>
        <strong>Quando o orçamento é pequeno.</strong> Um fechamento reduzido de 18
        dezenas com cobertura de 12+ acertos exige pelo menos 40-60 jogos (~R$140-210).
        Para orçamentos menores, apostar em apostas simples diversificadas ou com mais
        dezenas por bilhete tem resultado equivalente com menos complexidade.
      </p>
      <p>
        <strong>Quando a premissa for tratada como estratégia preditiva.</strong> Se
        a escolha do pool for baseada em "as dezenas que mais saíram" ou "as que estão
        em atraso", o fechamento não vai compensar a premissa inválida. Você vai gastar
        mais dinheiro com a mesma chance de erro na escolha do pool.
      </p>

      <h2>O simulador pode ajudar</h2>
      <p>
        O <a href="/lotofacil/simulador">simulador histórico</a> permite verificar como
        um pool específico de dezenas teria performado ao longo do histórico — quantas
        vezes 15 ou mais dezenas do pool teriam aparecido nos sorteios reais. É a forma
        mais honesta de avaliar retrospectivamente a qualidade de uma escolha de pool,
        sem garantias para o futuro.
      </p>
      <p>
        A calculadora de <a href="/lotofacil/fechamentos">fechamentos</a> gera os
        bilhetes automaticamente dado o pool e a cobertura mínima desejada.
      </p>
    `,
  },
];

export function getAnalise(slug: string): Analise | undefined {
  return ANALISES.find((a) => a.slug === slug);
}

export function getAnalisesRecentes(limit?: number): Analise[] {
  const ordenadas = [...ANALISES].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  );
  return limit ? ordenadas.slice(0, limit) : ordenadas;
}
