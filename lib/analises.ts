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

  {
    slug: "eleicoes-2026-loteria-numeros-sorte",
    titulo: "Eleições 2026 e números da sorte: o que viés cognitivo e política têm em comum",
    resumo:
      "Com o 1º turno marcado para 4 de outubro, o Brasil entra em modo eleitoral. Pesquisas de opinião e análise estatística de loteria compartilham um problema em comum.",
    data: "2026-07-03",
    categoria: "educativo" as const,
    tempoLeitura: 5,
    corpo: `
      <p>
        O 1º turno das Eleições Gerais de 2026 está marcado para 4 de outubro, com
        eventual 2º turno em 25 de outubro. Mais de 155 milhões de brasileiros vão
        às urnas escolher presidente, governadores, senadores e deputados. É um evento
        de probabilidade e estatística — e alguns dos mesmos erros cognitivos que
        atrapalham a interpretação de dados eleitorais também aparecem na análise de loterias.
      </p>

      <h2>Pesquisas eleitorais e amostras pequenas</h2>
      <p>
        Uma pesquisa eleitoral bem feita entrevista entre 1.000 e 3.000 pessoas para
        estimar a intenção de voto de mais de 155 milhões de eleitores. Com uma amostra
        bem desenhada, a margem de erro é de 2-3 pontos percentuais — matematicamente
        suficiente para capturar tendências, mesmo sendo uma fração minúscula do total.
      </p>
      <p>
        Na análise de loteria, um erro análogo é usar amostras muito pequenas (últimos
        20 ou 30 concursos) para tirar conclusões sobre "tendências" de dezenas. Com
        uma amostra de 30 concursos, a variação esperada de frequência de uma dezena é
        tão grande que qualquer "padrão" observado está dentro do ruído estatístico.
        É como fazer uma pesquisa eleitoral com 10 pessoas e afirmar que o resultado é
        representativo do eleitorado.
      </p>

      <h2>O viés de confirmação em política e em loteria</h2>
      <p>
        Em política, o viés de confirmação faz eleitores lembrarem seletivamente das
        notícias que confirmam sua visão de mundo e descartarem as que contradizem.
        O mesmo mecanismo funciona em loteria: apostadores se lembram dos concursos
        em que a dezena "quente" saiu e esquecem os que ela não saiu. O resultado é
        uma percepção distorcida de que a estratégia "funciona".
      </p>
      <p>
        A cura em ambos os casos é a mesma: dados sistemáticos, não seletivos.
        Em política, isso significa acompanhar múltiplas pesquisas de fontes distintas.
        Em loteria, o <a href="/lotofacil/conferidor">conferidor histórico</a> faz
        exatamente isso — mostra o desempenho de um jogo em <em>todos</em> os concursos,
        sem filtro, para que você veja o resultado real sem viés de confirmação.
      </p>

      <h2>Números da sorte e superstição política</h2>
      <p>
        É famosa a tradição de candidatos políticos que atribuem significado a números
        — o número do partido na urna eletrônica vira âncora emocional e parte da
        identidade política, não apenas um identificador técnico.
      </p>
      <p>
        O equivalente na loteria são os "números da sorte" pessoais — datas de
        nascimento, combinações que "quase ganharam". Em ambos os casos, a mente humana
        atribui significado especial a números que são, matematicamente, apenas
        identificadores arbitrários.
      </p>
      <p>
        A diferença prática: em política, votar no partido que você acredita é uma
        escolha legítima de valor. Em loteria, jogar as dezenas do aniversário não
        aumenta nem diminui sua chance — e entender isso ajuda a tomar decisões mais
        conscientes sobre quanto gastar. Veja o artigo sobre
        <a href="/dicas/numeros-populares">números populares</a> para entender
        quando a escolha de dezenas pode (ou não) importar.
      </p>

      <h2>O que eleições e loteria têm em comum</h2>
      <p>
        Tanto eleições quanto sorteios envolvem incerteza, expectativa e a possibilidade
        de um resultado transformador. Em ambos, a tendência humana de criar narrativas
        sobre o resultado é forte.
      </p>
      <p>
        A diferença fundamental: resultados eleitorais são influenciáveis pelo esforço
        coletivo (campanha, debate de ideias, mobilização de eleitores). Resultados de
        loteria não são influenciáveis por nenhum esforço individual ou coletivo.
        Entender essa distinção ajuda a calibrar onde vale investir energia de análise —
        e onde é melhor aceitar a incerteza como parte do jogo.
      </p>
    `,
  },
  {
    slug: "mega-da-virada-2026-matematica-premio",
    titulo: "Mega da Virada 2026: a matemática honesta do maior prêmio do ano",
    resumo:
      "A Mega da Virada acumula prêmios que podem ultrapassar R$600 milhões. O que a matemática diz sobre quanto você precisaria apostar para ter chance real — e por que o resultado surpreende.",
    data: "2026-06-28",
    categoria: "megasena" as const,
    tempoLeitura: 5,
    corpo: `
      <p>
        A Mega da Virada acontece todo 31 de dezembro e concentra o maior prêmio do
        calendário das loterias brasileiras — resultado dos acúmulos programáticos
        ao longo do ano. A pergunta que todo apostador tem mas raramente vê respondida
        com honestidade: quanto você precisaria gastar para ter uma chance "real" de ganhar?
      </p>

      <h2>O que é uma "chance real"</h2>
      <p>
        Nenhuma quantidade de apostas garante vitória. A Mega-Sena tem 50.063.860
        combinações possíveis, e cada aposta cobre apenas 1 delas. Para ter 50% de
        chance de acertar a sena em pelo menos 1 aposta, você precisaria cobrir
        aproximadamente 34,7 milhões de combinações — a R$6 cada, isso representa
        R$208 milhões em apostas. Para 10% de chance: R$30 milhões. Para 1% de chance:
        R$3 milhões.
      </p>
      <p>
        Isso não significa que você "precisa" gastar R$3 milhões para "justificar"
        apostar. Significa que, com uma aposta de R$6, você tem 0,000002% de chance —
        e essa chance existe tanto para você quanto para qualquer outro apostador,
        independente de qual combinação você escolheu.
      </p>

      <h2>A matemática do valor esperado com prêmio grande</h2>
      <p>
        O valor esperado de uma aposta é: (prêmio) × (probabilidade) − (custo).
        Com prêmio de R$600 milhões, probabilidade de 1 em 50.063.860 e aposta de R$6:
      </p>
      <p>
        Valor esperado = R$600.000.000 × (1/50.063.860) − R$6 = R$11,98 − R$6 = R$5,98.
      </p>
      <p>
        Isso significa que, matematicamente, com esse prêmio, o valor esperado de uma
        aposta simples é <em>positivo</em> — algo extremamente raro em loterias. Na
        maioria dos concursos normais da Mega-Sena, o valor esperado é negativo (retorno
        de ~43% da arrecadação). Com prêmios acumulados muito grandes, a equação muda.
      </p>

      <h2>Por que isso não significa "vale a pena" de forma simples</h2>
      <p>
        O valor esperado positivo não captura toda a realidade por dois motivos
        importantes.
      </p>
      <p>
        <strong>O prêmio é rateado.</strong> Se milhões de apostadores apostarem mais
        quando o prêmio é alto — o que de fato acontece — a probabilidade de precisar
        dividir o prêmio com outros ganhadores também aumenta. Em concursos com prêmio
        muito alto, o volume de apostas pode superar 200 milhões, reduzindo
        drasticamente o valor esperado real por ganhador.
      </p>
      <p>
        <strong>Utilidade marginal do dinheiro.</strong> Para a maioria das pessoas, a
        diferença entre ter R$0 e ter R$6 é concreta (uma refeição). A diferença entre
        ter R$600 milhões e R$1,2 bilhão é abstrata. O valor esperado matemático trata
        R$1 como equivalente em qualquer contexto, o que não reflete a realidade.
      </p>

      <h2>O que fazer com essa informação</h2>
      <p>
        A Mega da Virada é o único concurso do ano onde o valor esperado por aposta
        pode ser positivo — matematicamente interessante. Mas "positivo" não significa
        "provável de ganhar". Com prêmio de R$600 milhões e uma aposta de R$6, você
        espera ganhar R$11,98 em média — ao longo de 50 milhões de apostas. Em uma
        única aposta, você quase certamente não vai ganhar nada.
      </p>
      <p>
        A forma mais honesta de ver a Mega da Virada: é o concurso onde o custo de
        entretenimento por aposta tem o melhor "negócio" do ano, graças ao prêmio
        acumulado. Não é uma estratégia de investimento.
      </p>
      <p>
        Acompanhe o histórico de todos os acúmulos da Mega-Sena, incluindo as edições
        anteriores da Mega da Virada, na
        <a href="/megasena/acumulos">linha do tempo de acúmulos</a>.
      </p>
    `,
  },

  {
    slug: "lotofacil-como-ler-destaques-concurso",
    titulo: "Lotofácil: como ler os destaques de um concurso e o que cada número significa",
    resumo:
      "A página de destaques mostra muito mais que o resultado bruto — ganhadores por faixa, prêmio médio, acúmulo e estimativa do próximo. Guia completo de leitura.",
    data: "2026-07-08",
    categoria: "lotofacil" as const,
    tempoLeitura: 4,
    corpo: `
      <p>
        Depois de cada sorteio da Lotofácil, a página de
        <a href="/lotofacil/destaques">destaques</a> é atualizada com um resumo
        do concurso. Parece simples à primeira vista, mas tem vários números que
        merecem uma explicação mais detalhada.
      </p>

      <h2>Número do concurso e data</h2>
      <p>
        O número do concurso é sequencial desde o primeiro sorteio da Lotofácil,
        em setembro de 2003. Ele é útil para localizar um concurso específico no
        histórico — o conferidor e o simulador permitem filtrar por número de
        concurso para ver o que aconteceu naquele dia exato.
      </p>

      <h2>Dezenas sorteadas</h2>
      <p>
        As 15 dezenas do resultado, ordenadas do menor para o maior. Elas são
        sorteadas por uma máquina física de bolas certificada pelo INMETRO e
        auditada pela Caixa. A ordem de saída não importa para fins de premiação —
        só a combinação final conta.
      </p>

      <h2>Ganhadores por faixa</h2>
      <p>
        Esse é o número mais importante para entender o prêmio real. A Lotofácil
        tem 5 faixas de premiação: 15, 14, 13, 12 e 11 acertos. O prêmio das
        faixas 14 e 15 é rateado — dividido igualmente entre todos os ganhadores
        daquela faixa. As faixas 11, 12 e 13 têm valores fixos (R$5, R$10 e R$25).
      </p>
      <p>
        Um concurso com 2 ganhadores de 15 acertos e prêmio total de R$4 milhões
        paga R$2 milhões para cada. Um concurso com 50 ganhadores de 15 acertos
        e mesmo prêmio total paga R$80 mil para cada. O número de ganhadores
        importa tanto quanto o tamanho do prêmio.
      </p>

      <h2>Prêmio acumulado</h2>
      <p>
        Quando nenhum apostador acerta 15 dezenas, o valor destinado a essa faixa
        não desaparece — é somado ao fundo do próximo concurso. A coluna de
        "acumulado" mostra se houve acúmulo e quanto foi transferido. Concursos
        com acúmulo tendem a ter mais apostadores (o que reduz o prêmio por
        ganhador se houver mais de um).
      </p>

      <h2>Estimativa do próximo prêmio</h2>
      <p>
        A Caixa divulga uma estimativa do prêmio do próximo concurso baseada na
        arrecadação histórica de concursos equivalentes. É uma previsão — o valor
        real depende de quantas apostas forem feitas no próximo concurso, que só
        é conhecido após o encerramento das apostas.
      </p>

      <h2>A linha do tempo dos acúmulos</h2>
      <p>
        Para ver o histórico completo de quando houve acúmulo, quantos concursos
        durou cada sequência e os prêmios pagos ao final, a
        <a href="/lotofacil/acumulos">linha do tempo de acúmulos</a> mostra tudo
        visualmente desde o primeiro concurso da Lotofácil.
      </p>
    `,
  },
  {
    slug: "indice-equilibrio-para-que-serve",
    titulo: "Índice de Equilíbrio: o que é, como é calculado e para que serve",
    resumo:
      "Uma nota de 0 a 100 que mede o quão 'típico' é um jogo em 7 dimensões estatísticas ao mesmo tempo. Entenda o que a nota diz — e o que ela não diz.",
    data: "2026-07-11",
    categoria: "educativo" as const,
    tempoLeitura: 5,
    corpo: `
      <p>
        O <a href="/lotofacil/equilibrio">Índice de Equilíbrio</a> é uma das
        ferramentas mais originais do LotoAnalítica — e também uma das que mais
        precisa de explicação para ser usada corretamente. A ideia central é simples:
        em vez de olhar para sete métricas estatísticas separadamente, combinar todas
        em uma única nota de 0 a 100.
      </p>

      <h2>Os 7 critérios avaliados</h2>
      <p>
        Para cada jogo analisado, o índice calcula:
      </p>
      <ul>
        <li><strong>Soma das dezenas</strong> — quão próxima da média de 195</li>
        <li><strong>Distribuição par/ímpar</strong> — quão próxima de 7-8</li>
        <li><strong>Maior sequência consecutiva</strong> — quão típica para a Lotofácil</li>
        <li><strong>Moldura vs. centro</strong> — proporção dentro do esperado</li>
        <li><strong>Números primos</strong> — quão próximo de 5,4 por jogo</li>
        <li><strong>Múltiplos de 3</strong> — quão próximo de 4,8 por jogo</li>
        <li><strong>Números de Fibonacci</strong> — quão próximo de 4,2 por jogo</li>
      </ul>
      <p>
        Cada critério é avaliado individualmente usando combinatória — comparando
        o valor do jogo com a distribuição de todas as combinações possíveis. Um
        jogo com soma de 195 exatos recebe nota máxima nesse critério; um jogo
        com soma de 120 recebe nota próxima de zero (pois quase nenhuma das
        3.268.760 combinações tem soma tão baixa).
      </p>

      <h2>Como a nota final é calculada</h2>
      <p>
        As notas dos 7 critérios são combinadas com pesos iguais numa média
        ponderada. Um jogo que está exatamente na mediana em todos os 7 critérios
        recebe nota 100. Qualquer desvio em qualquer critério reduz a nota
        proporcionalmente à raridade desse desvio.
      </p>
      <p>
        Importante: a nota é baseada em combinatória pura, não em histórico de
        concursos. Isso significa que ela é estável — não muda com sorteios
        recentes, e dois jogos idênticos sempre têm a mesma nota, independente
        de quando são analisados.
      </p>

      <h2>O que a nota diz</h2>
      <p>
        Nota alta (acima de 70): o jogo tem um perfil estatisticamente próximo
        do "jogo médio" em todos os critérios. A maioria das combinações possíveis
        da Lotofácil teria uma nota parecida.
      </p>
      <p>
        Nota baixa (abaixo de 30): o jogo é estatisticamente incomum em pelo menos
        um critério — soma muito extrema, distribuição par/ímpar muito desbalanceada,
        ou outra característica rara. Isso não o torna pior para jogar, só mais
        distante do perfil típico.
      </p>

      <h2>O que a nota não diz</h2>
      <p>
        A nota não tem nenhuma relação com a probabilidade de ganhar. Um jogo com
        nota 95 tem exatamente a mesma chance de acertar 15 dezenas que um jogo
        com nota 15: 1 em 3.268.760. O índice mede tipicidade estatística, não
        sorte. Use-o como ferramenta de curiosidade e caracterização — não como
        critério de seleção de jogos.
      </p>
      <p>
        Para ver cada critério separado com detalhes, use o
        <a href="/lotofacil/analisador">Analisador de jogo</a>, que mostra a
        posição percentil de qualquer jogo em cada dimensão individualmente.
      </p>
    `,
  },
  {
    slug: "copa-2026-matematica-zebras-loteria",
    titulo: "Copa 2026: a matemática das zebras — o que futebol e loteria têm em comum",
    resumo:
      "Na Copa 2026 com 48 seleções, zebras são mais prováveis do que nunca. A mesma matemática que explica surpresas no futebol ajuda a entender por que loteria é diferente.",
    data: "2026-07-14",
    categoria: "educativo" as const,
    tempoLeitura: 5,
    corpo: `
      <p>
        A Copa do Mundo 2026, com 48 seleções e 104 jogos, é a maior edição da
        história do torneio. Com mais seleções e um formato que avança 32 times
        para o mata-mata, a probabilidade de zebras — resultados inesperados —
        aumentou em relação às edições anteriores. A matemática por trás disso
        tem paralelos interessantes com a forma como probabilidade funciona (e
        não funciona) em loteria.
      </p>

      <h2>Por que zebras acontecem em futebol</h2>
      <p>
        Uma zebra no futebol acontece quando o time com menor probabilidade estimada
        vence. Com 48 seleções de nível bem variado, a diferença de qualidade entre
        os times na fase de grupos é maior do que nas edições com 32 seleções. Mas
        futebol tem alta variância — o gol aleatório, o erro defensivo no pior momento,
        as condições do campo. Mesmo com 80% de chance de vitória estimada, o favorito
        perde 20% das vezes.
      </p>
      <p>
        Com 104 jogos na Copa 2026, estatisticamente espera-se aproximadamente 15 a 20
        resultados que seriam considerados "zebra" — não por falha no modelo, mas porque
        variância faz parte de qualquer sistema com incerteza. Isso é esperado,
        não surpresa.
      </p>

      <h2>O que é diferente na loteria</h2>
      <p>
        Em futebol, "zebra" significa que o time com menor probabilidade ganhou.
        Em loteria, não existe time com menor probabilidade — toda combinação
        específica tem exatamente 1 em 3.268.760 de chance. Não há "favorito".
      </p>
      <p>
        Quando um resultado da Lotofácil parece improvável ("como saíram 7 dezenas
        seguidas?"), não é uma zebra — é só um dos 3.268.760 resultados possíveis,
        todos igualmente prováveis. A surpresa está na nossa expectativa, não na
        probabilidade real do evento.
      </p>

      <h2>O erro de interpretar surpresas como padrão</h2>
      <p>
        No futebol, quando uma seleção considerada fraca vai longe na Copa, analistas
        revisam os modelos: talvez a diferença de qualidade fosse menor do que se
        pensava, ou houve fatores não modelados. É uma atualização legítima baseada
        em nova informação.
      </p>
      <p>
        Em loteria, quando uma combinação "improvável" sai (como sequências longas),
        não há nada a revisar — a probabilidade era igual à de qualquer outra combinação,
        e continua sendo igual no próximo concurso. Interpretar o resultado inesperado
        como "sinal" de alguma tendência é o erro central que o artigo sobre
        <a href="/dicas/vieses-cognitivos">vieses cognitivos</a> descreve.
      </p>

      <h2>O que dá para aprender com a Copa para jogar melhor</h2>
      <p>
        A lição mais útil da Copa para apostadores de loteria não é sobre probabilidade
        — é sobre diversão. A Copa é seguida apaixonadamente mesmo por quem sabe que
        não pode prever o resultado. A loteria funciona melhor quando tratada da mesma
        forma: como entretenimento com incerteza embutida, não como sistema de geração
        de renda. Defina seu orçamento, jogue com prazer, e use as
        <a href="/lotofacil/tabelas/frequencia">tabelas do site</a> para curiosidade
        histórica, não como guia preditivo.
      </p>
    `,
  },
  {
    slug: "mega-sena-combinacoes-mais-apostadas",
    titulo: "Mega-Sena: as combinações mais apostadas — e por que isso pode custar caro",
    resumo:
      "Milhões de apostadores escolhem as mesmas combinações sem saber. Se uma dessas combinações sair, o prêmio é dividido entre centenas ou milhares de ganhadores.",
    data: "2026-07-18",
    categoria: "megasena" as const,
    tempoLeitura: 5,
    corpo: `
      <p>
        A Mega-Sena tem 50.063.860 combinações possíveis — mas não todas são apostadas
        com a mesma frequência. Alguns padrões são escolhidos por muito mais apostadores
        do que outros, e isso tem uma consequência direta: se uma dessas combinações
        populares for sorteada, o prêmio é dividido entre muitos ganhadores.
      </p>

      <h2>O que faz uma combinação ser popular</h2>
      <p>
        A maioria das apostas manuais segue padrões previsíveis ditados pelo cérebro
        humano, não por aleatoriedade. As combinações mais apostadas tendem a ter:
      </p>
      <ul>
        <li>Números entre 1 e 31 (datas de calendário — aniversários, datas comemorativas)</li>
        <li>Padrões visuais no volante (diagonais, bordas, formas geométricas)</li>
        <li>Sequências simples como 5, 10, 15, 20, 25, 30</li>
        <li>Múltiplos de um número (2, 4, 6, 8, 10, 12)</li>
        <li>Combinações amplamente divulgadas em grupos de WhatsApp</li>
      </ul>
      <p>
        A Caixa não divulga quais combinações foram mais apostadas em cada concurso,
        mas a evidência indireta é clara: concursos cujo resultado tem muitos números
        baixos (abaixo de 31) tendem a ter mais ganhadores do que concursos com
        números altos — exatamente o que se esperaria se uma grande fatia dos
        apostadores concentrasse escolhas nessa faixa.
      </p>

      <h2>O custo real de dividir o prêmio</h2>
      <p>
        Imagine um concurso com prêmio acumulado de R$200 milhões. Se a combinação
        sorteada for uma das mais populares e 500 apostadores tiverem aquele bilhete,
        cada um recebe R$400.000 — significativo, mas muito diferente de R$200 milhões.
      </p>
      <p>
        Já uma combinação que quase ninguém escolheu — como 33, 41, 47, 52, 58, 59 —
        tem a mesma probabilidade de ser sorteada, mas se sair, o ganhador único leva
        os R$200 milhões inteiros. A escolha da combinação não muda sua chance de ganhar,
        mas pode mudar drasticamente quanto você ganha se ganhar.
      </p>

      <h2>Como o gerador ajuda</h2>
      <p>
        O <a href="/megasena/gerador">gerador de jogos da Mega-Sena</a> produz
        combinações com distribuição estatisticamente típica, incluindo dezenas
        distribuídas por toda a faixa de 1 a 60 — não concentradas no intervalo
        de datas. Isso não aumenta sua chance de ganhar, mas reduz a probabilidade
        de você estar apostando a mesma combinação que milhares de outras pessoas.
      </p>
      <p>
        Para referência, o artigo sobre
        <a href="/dicas/numeros-populares">números populares</a> explora esse tema
        em profundidade — incluindo a evidência histórica de que a distribuição de
        ganhadores por concurso é consistente com uma concentração de apostas nos
        números mais "humanos".
      </p>
    `,
  },
  {
    slug: "lotofacil-como-gerador-escolhe-dezenas",
    titulo: "Lotofácil: como o gerador inteligente escolhe dezenas — por dentro do algoritmo",
    resumo:
      "O gerador não é um simples sorteador aleatório. Ele aplica filtros de combinatória para produzir jogos com perfil estatístico típico. Veja como funciona cada etapa.",
    data: "2026-07-21",
    categoria: "lotofacil" as const,
    tempoLeitura: 5,
    corpo: `
      <p>
        O <a href="/lotofacil/gerador">gerador de jogos</a> do LotoAnalítica tem dois
        modos: simples e avançado. No modo simples, ele gera combinações aleatórias
        dentro das 3.268.760 possíveis. No modo avançado, aplica filtros configuráveis.
        Este artigo explica o que acontece por dentro — e por que isso importa
        (e por que também não importa tanto quanto parece).
      </p>

      <h2>Modo simples: aleatoriedade real</h2>
      <p>
        No modo simples, o gerador usa o gerador de números aleatórios criptográfico
        do navegador (window.crypto) para selecionar 15 dezenas de 25. Isso garante
        que cada uma das 3.268.760 combinações tem exatamente a mesma probabilidade
        de ser gerada — sem viés para números "quentes", sem preferências humanas,
        sem padrões implícitos.
      </p>
      <p>
        É matematicamente equivalente a um sorteio físico honesto, mas feito em
        milissegundos. O resultado tem as propriedades estatísticas esperadas: em
        média, 9 dezenas da moldura e 6 do centro, distribuição par/ímpar próxima
        de 7-8, soma próxima de 195, e sequências de 4-5 dezenas consecutivas.
      </p>

      <h2>Modo avançado: filtros de combinatória</h2>
      <p>
        No modo avançado, o gerador primeiro gera uma combinação aleatória e depois
        verifica se ela passa em todos os filtros configurados. Se não passar, gera
        outra, e repete o processo até encontrar uma que atenda a todos os critérios.
        Os filtros disponíveis incluem:
      </p>
      <ul>
        <li><strong>Faixa de soma:</strong> aceita só combinações com soma dentro do intervalo especificado (ex: 180-210)</li>
        <li><strong>Distribuição par/ímpar:</strong> aceita só combinações com exatamente N dezenas pares</li>
        <li><strong>Primos, Fibonacci, múltiplos de 3:</strong> aceita só combinações com N dezenas de cada tipo</li>
        <li><strong>Atraso mínimo:</strong> exige que pelo menos N dezenas do jogo não tenham saído nos últimos X concursos</li>
        <li><strong>Ciclo atual:</strong> pode incluir ou excluir dezenas que já saíram no ciclo atual</li>
      </ul>

      <h2>O que os filtros fazem de verdade</h2>
      <p>
        Cada filtro aplicado reduz o espaço de combinações possíveis. Um filtro de
        soma 180-210 aceita aproximadamente 58% das combinações; um filtro de
        distribuição 7-8 pares aceita cerca de 57%. Combinar dois filtros pode
        aceitar apenas 30-40% das combinações — e cada filtro adicionado reduz
        mais ainda.
      </p>
      <p>
        O resultado é uma combinação que pertence ao subconjunto filtrado — não
        necessariamente "melhor", mas diferente das que ficaram de fora. Dentro
        desse subconjunto, todas as combinações têm a mesma probabilidade de ganhar.
        Os filtros não identificam combinações "mais prováveis de sair" — identificam
        combinações com certas características estatísticas.
      </p>

      <h2>Por que usar o gerador mesmo assim</h2>
      <p>
        A vantagem prática não é probabilística — é comportamental. Combinações
        geradas aleatoriamente tendem a ser diferentes das combinações que a maioria
        dos apostadores escolhe manualmente, o que reduz a probabilidade de dividir
        o prêmio com outros ganhadores caso você acerte. Esse é o único argumento
        concreto para usar um gerador, e ele está explicado em detalhes no artigo
        sobre <a href="/dicas/numeros-populares">números populares</a>.
      </p>
    `,
  },
  {
    slug: "mega-sena-rateio-premio-anunciado",
    titulo: "O que é rateio — e por que o prêmio da Mega-Sena quase nunca é o valor anunciado",
    resumo:
      "O prêmio anunciado é uma estimativa. O que você recebe de verdade depende de quantas pessoas apostaram e quantas ganharam. A diferença pode ser enorme.",
    data: "2026-07-25",
    categoria: "megasena" as const,
    tempoLeitura: 4,
    corpo: `
      <p>
        "Mega-Sena acumulada em R$150 milhões" — essa manchete leva milhões de
        brasileiros a apostar. Mas o número que aparece na manchete quase nunca
        é o que o ganhador recebe. Entender por que é entender como a Mega-Sena
        realmente funciona.
      </p>

      <h2>A diferença entre estimativa e prêmio real</h2>
      <p>
        O valor anunciado pela Caixa antes do sorteio é uma <em>estimativa</em>
        baseada no histórico de arrecadação de concursos similares. O prêmio real
        de qualquer concurso só é conhecido depois que as apostas encerram — porque
        ele é calculado como uma porcentagem da arrecadação daquele concurso
        específico, somada aos acúmulos anteriores.
      </p>
      <p>
        Se a Caixa estima R$150 milhões mas o concurso arrecada mais do que o
        esperado (o que acontece em concursos com prêmio alto, quando mais pessoas
        apostam), o prêmio real pode ser R$180 milhões. Se arrecada menos, pode
        ser R$130 milhões. A estimativa tem margem de erro que pode chegar a
        10-20% para cima ou para baixo.
      </p>

      <h2>O que é rateio e como ele reduz o prêmio por ganhador</h2>
      <p>
        Rateio significa que o valor disponível para a faixa principal é dividido
        igualmente entre todos os ganhadores daquela faixa. Se o prêmio real é
        R$150 milhões e há 3 ganhadores de sena, cada um recebe R$50 milhões.
        Se há 10 ganhadores, cada um recebe R$15 milhões.
      </p>
      <p>
        O número de ganhadores é completamente imprevisível — depende de quantas
        apostas foram feitas e quais combinações foram escolhidas. Em concursos com
        prêmio muito alto (que atraem muito mais apostadores), a chance de haver
        múltiplos ganhadores é bem maior do que em concursos normais.
      </p>

      <h2>O efeito perverso do prêmio alto</h2>
      <p>
        Concursos com prêmio acumulado muito alto atraem um volume enorme de apostas
        — às vezes 5 ou 10 vezes mais do que um concurso normal. Isso aumenta a
        arrecadação (e portanto o prêmio real), mas também aumenta drasticamente
        a probabilidade de múltiplos ganhadores. O prêmio por ganhador pode ser
        muito menor do que o estimado, mesmo com o prêmio bruto maior.
      </p>
      <p>
        Entender isso ajuda a calibrar expectativas: o "prêmio recorde de R$500
        milhões" pode resultar em vários ganhadores recebendo R$80 milhões cada —
        ainda transformador, mas bem diferente dos R$500 milhões da manchete. O
        histórico completo de prêmios pagos está na
        <a href="/megasena/acumulos">linha do tempo de acúmulos</a>.
      </p>
    `,
  },
  {
    slug: "bolao-como-dividir-apostas-eficientemente",
    titulo: "Bolão: como dividir as apostas de forma eficiente entre os participantes",
    resumo:
      "Um bolão bem organizado não é só juntar dinheiro — é distribuir combinações de forma que cada real apostado cubra o máximo possível. Veja como fazer isso.",
    data: "2026-07-28",
    categoria: "educativo" as const,
    tempoLeitura: 5,
    corpo: `
      <p>
        Bolão de loteria parece simples: cada um coloca R$20, compram-se bilhetes
        e dividem-se os prêmios. Mas a forma como os bilhetes são escolhidos
        e distribuídos faz diferença real na eficiência da cobertura. Este guia
        explica as principais abordagens.
      </p>

      <h2>Bolão de apostas independentes</h2>
      <p>
        A forma mais comum: cada participante sugere combinações, todas são apostadas,
        e qualquer prêmio é dividido proporcionalmente à contribuição. Funciona, mas
        tem um problema: as combinações podem se sobrepor — dois participantes podem
        sugerir jogos com 12 dezenas iguais, desperdiçando cobertura. Sem coordenação,
        o grupo acaba cobrindo um espaço menor do que poderia com o mesmo dinheiro.
      </p>

      <h2>Bolão com fechamento reduzido</h2>
      <p>
        A alternativa organizada: o grupo escolhe um pool de dezenas (ex: 18 dezenas)
        e usa um fechamento reduzido para garantir que, se as dezenas sorteadas
        estiverem dentro do pool, pelo menos um bilhete do grupo capture uma boa
        pontuação. O <a href="/lotofacil/bolao">otimizador de bolão</a> faz esse
        cálculo por você — basta escolher o pool, o orçamento e o nível de cobertura
        desejado.
      </p>
      <p>
        A vantagem sobre apostas independentes: zero sobreposição desperdiçada,
        cobertura sistemática do pool escolhido. A desvantagem: depende da qualidade
        da escolha do pool — se as dezenas sorteadas ficarem fora do pool, nenhum
        bilhete ganha na faixa principal.
      </p>

      <h2>Como gerenciar a distribuição entre participantes</h2>
      <p>
        Em grupos maiores, é útil documentar formalmente quem participou, quanto
        cada um contribuiu e quais bilhetes pertencem ao bolão. O
        <a href="/lotofacil/bolao">gerador de bolão</a> produz um PDF com todos os
        bilhetes e a lista de participantes — ideal para compartilhar no grupo do
        WhatsApp antes do sorteio e evitar disputas caso haja ganhador.
      </p>

      <h2>A regra de ouro do bolão</h2>
      <p>
        Independente do formato escolhido, o mais importante é documentar tudo antes
        do sorteio. Prêmios grandes revelam desentendimentos que não existiam antes —
        "eu participei sim", "esse bilhete era do bolão sim". Um registro simples com
        nome, valor contribuído e número dos bilhetes resolve esses problemas antes
        que eles apareçam.
      </p>
    `,
  },
  {
    slug: "lotofacil-independencia-2026-o-que-esperar",
    titulo: "Lotofácil da Independência 2026: o que esperar do maior prêmio de setembro",
    resumo:
      "Todo 7 de setembro a Lotofácil realiza um concurso especial com prêmio inflado pelo acúmulo programático do ano. Entenda como o prêmio é formado e o que diferencia esse concurso.",
    data: "2026-08-01",
    categoria: "lotofacil" as const,
    tempoLeitura: 4,
    corpo: `
      <p>
        Todo ano, próximo ao 7 de setembro, a Lotofácil realiza o concurso da
        Independência — um sorteio especial cujo prêmio é inflado por um acúmulo
        programático acumulado ao longo do ano. Em 2026, o concurso está entre os
        mais aguardados do calendário.
      </p>

      <h2>Como o prêmio especial é formado</h2>
      <p>
        A Caixa separa automaticamente 15% do fundo de cada concurso regular da
        Lotofácil ao longo do ano para o concurso da Independência. Isso significa
        que cada aposta que você faz em qualquer concurso normal da Lotofácil também
        está contribuindo indiretamente para o prêmio especial de setembro.
      </p>
      <p>
        Ao longo de aproximadamente 9 meses de acúmulo (de janeiro até o concurso),
        com centenas de concursos regulares e bilhões de reais em arrecadação, o
        fundo acumulado pode chegar a R$100 milhões ou mais. Combinado com a
        arrecadação do próprio concurso especial (que tende a ser muito maior que
        o normal, pois mais pessoas apostam), o prêmio pode ultrapassar R$150 milhões.
      </p>

      <h2>O que diferencia o concurso especial dos regulares</h2>
      <p>
        Do ponto de vista das regras, o concurso da Independência é idêntico a
        qualquer outro da Lotofácil: 25 dezenas, 15 sorteadas, mesmas faixas de
        premiação, mesmo processo de rateio. A única diferença é o tamanho do
        fundo disponível para a faixa principal.
      </p>
      <p>
        Isso tem uma implicação prática: com muito mais apostadores participando
        (atraídos pelo prêmio alto), a probabilidade de múltiplos ganhadores de
        15 acertos é muito maior do que num concurso normal. O prêmio por ganhador
        pode ser bem menor do que o total anunciado.
      </p>

      <h2>Faz sentido apostar mais no concurso especial?</h2>
      <p>
        Do ponto de vista do valor esperado, sim — o fundo maior significa mais
        retorno esperado por aposta. Mas as mesmas ressalvas do artigo sobre a
        <a href="/analises/mega-da-virada-2026-matematica-premio">Mega da Virada</a>
        se aplicam: o volume maior de apostas aumenta a chance de rateio, e o
        retorno esperado nunca é positivo o suficiente para transformar a loteria
        em investimento.
      </p>
      <p>
        A forma mais honesta de ver o concurso especial: é um bom momento para
        jogar se você já joga regularmente, com o mesmo orçamento de sempre. Apostar
        10 vezes mais "porque o prêmio é maior" não muda a matemática a seu favor.
      </p>
    `,
  },
  {
    slug: "simulador-historico-jogar-mesmo-jogo-10-anos",
    titulo: "O que acontece se você jogar o mesmo jogo na Lotofácil por 10 anos?",
    resumo:
      "O simulador histórico responde com dados reais: custo total, prêmios ganhos, faixas acertadas e saldo final de qualquer combinação em todo o histórico.",
    data: "2026-08-04",
    categoria: "educativo" as const,
    tempoLeitura: 5,
    corpo: `
      <p>
        Uma das dúvidas mais comuns entre apostadores regulares: "se eu jogar sempre
        o mesmo jogo, eventualmente vou ganhar?" O
        <a href="/lotofacil/simulador">simulador histórico</a> responde essa pergunta
        com dados reais — não com estimativas, mas com o resultado concurso por concurso
        de qualquer combinação em toda a história da Lotofácil.
      </p>

      <h2>O experimento: jogar sempre o mesmo jogo</h2>
      <p>
        Escolha qualquer combinação de 15 dezenas. O simulador vai calcular, para
        cada um dos 3.700+ concursos da Lotofácil, quantas dezenas desse jogo
        coincidiram com o resultado e se houve premiação. No final, você vê:
      </p>
      <ul>
        <li>Quantas vezes o jogo teve 11, 12, 13, 14 e 15 acertos</li>
        <li>O total gasto (número de concursos × R$3,50)</li>
        <li>O total recebido em prêmios brutos</li>
        <li>O saldo final (quase sempre negativo)</li>
        <li>A evolução do saldo ao longo do tempo</li>
      </ul>

      <h2>O que o resultado típico mostra</h2>
      <p>
        Para um jogo típico de 15 dezenas conferido contra todos os 3.720 concursos:
        o custo total fica em torno de R$13.000. Os prêmios arrecadados somam cerca
        de R$5.500 a R$6.000 (refletindo o retorno de ~43% da Caixa). O saldo final
        fica negativo em aproximadamente R$7.000 a R$8.000.
      </p>
      <p>
        Isso inclui dezenas de concursos com 11 acertos (R$5 cada), cerca de 70-90
        concursos com 12 acertos (R$10 cada), 10-15 concursos com 13 acertos (R$25
        cada) e provavelmente zero ou um concurso com 14 ou 15 acertos. É um retrato
        honesto do que acontece na prática.
      </p>

      <h2>Jogar sempre o mesmo jogo vs. trocar todo concurso</h2>
      <p>
        Matematicamente, não faz diferença. A probabilidade de cada concurso é
        independente — jogar a mesma combinação por 100 concursos não aumenta
        a chance de acertar no 101º. É o mesmo que comprar 100 bilhetes de rifa
        diferentes vs. comprar 100 bilhetes com o mesmo número: a probabilidade
        total é idêntica.
      </p>
      <p>
        A única diferença é emocional: jogar sempre o mesmo jogo cria a sensação
        de que "o jogo está quase ganhando" quando acerta 13 ou 14 dezenas. Esse
        apego emocional pode levar a gastar mais do que o planejado. O simulador
        ajuda a ver esses momentos no contexto do histórico completo, sem o viés
        da memória seletiva.
      </p>

      <h2>Como usar o simulador</h2>
      <p>
        Acesse <a href="/lotofacil/simulador">Lotofácil → Simulador</a>, selecione
        as dezenas no volante e clique em simular. A versão gratuita mostra os
        últimos 100 concursos; assinantes Premium têm acesso ao histórico completo
        de mais de 3.700 concursos.
      </p>
    `,
  },
  {
    slug: "mega-sena-ganhadores-por-concurso-media",
    titulo: "Mega-Sena: quantos ganhadores por concurso, em média — e o que os dados revelam",
    resumo:
      "A distribuição de ganhadores por concurso da Mega-Sena é altamente assimétrica. Na maioria dos sorteios não há ganhador de sena — mas quando há, pode haver vários.",
    data: "2026-08-08",
    categoria: "megasena" as const,
    tempoLeitura: 4,
    corpo: `
      <p>
        A pergunta parece simples: em média, quantas pessoas ganham a sena por
        concurso? A resposta revela algo interessante sobre como o volume de apostas
        afeta a distribuição de prêmios.
      </p>

      <h2>A distribuição assimétrica</h2>
      <p>
        Em um concurso típico da Mega-Sena (sem acúmulo, com volume normal de
        apostas), a chance de haver pelo menos um ganhador de sena é de
        aproximadamente 20-30%. Ou seja, em cerca de 70-80% dos concursos, ninguém
        acerta as 6 dezenas e o prêmio acumula para o próximo.
      </p>
      <p>
        Quando há acúmulo prolongado e o prêmio fica muito alto, o volume de apostas
        pode multiplicar por 5 ou 10. Isso aumenta a probabilidade de haver um
        ganhador — mas também aumenta drasticamente a chance de múltiplos ganhadores.
        Em concursos com prêmio de R$200 milhões ou mais, não é incomum haver 3,
        5 ou até 10 ganhadores de sena.
      </p>

      <h2>O paradoxo do prêmio alto</h2>
      <p>
        Prêmios altos atraem mais apostadores, o que por si só aumenta a arrecadação
        e portanto o prêmio bruto. Mas os mesmos apostadores extras aumentam a
        probabilidade de que alguém escolheu a mesma combinação que você — reduzindo
        o prêmio por ganhador. É um efeito que vai na direção oposta ao que a
        intuição sugere.
      </p>
      <p>
        Em termos de valor esperado por aposta, concursos com prêmio acumulado muito
        grande (acima de ~R$300 milhões) tendem a ter valor esperado positivo mesmo
        considerando o rateio esperado. Mas a variância é enorme — você pode tanto
        ganhar R$50 milhões (com outros 5 ganhadores) quanto ganhar R$300 milhões
        (como único ganhador).
      </p>

      <h2>O histórico real</h2>
      <p>
        Olhando os dados históricos disponíveis na
        <a href="/megasena/acumulos">linha do tempo de acúmulos</a>, os maiores
        prêmios individuais da Mega-Sena foram pagos em concursos com ganhador
        único — o que acontece quando o prêmio é alto mas o volume de apostas
        não foi grande o suficiente para multiplicar muito a base. Concursos com
        prêmio muito amplamente divulgado tendem a ter mais ganhadores e portanto
        prêmio por pessoa menor.
      </p>
    `,
  },
  {
    slug: "lotofacil-5-filtros-gerador-avancado",
    titulo: "Lotofácil: 5 filtros do gerador avançado explicados — o que cada um faz",
    resumo:
      "O modo avançado do gerador tem mais de 10 parâmetros configuráveis. Veja os 5 mais usados, o que cada um faz matematicamente e quando faz sentido ativá-los.",
    data: "2026-08-11",
    categoria: "lotofacil" as const,
    tempoLeitura: 5,
    corpo: `
      <p>
        O <a href="/lotofacil/gerador">gerador de jogos da Lotofácil</a> em modo
        avançado oferece mais de 10 filtros configuráveis. Para usuários Premium,
        esses filtros podem ser combinados livremente. Aqui estão os 5 mais usados
        com explicação de como cada um funciona matematicamente.
      </p>

      <h2>1. Filtro de soma (180–210)</h2>
      <p>
        Aceita apenas combinações cuja soma das 15 dezenas esteja dentro do intervalo
        configurado. O intervalo padrão de 180-210 cobre aproximadamente 58% de todas
        as combinações possíveis — excluindo as somas mais extremas que raramente
        aparecem no histórico real. Como explicado no artigo sobre
        <a href="/dicas/soma">soma das dezenas</a>, isso não aumenta a chance de
        ganhar, mas gera jogos com perfil mais "típico".
      </p>

      <h2>2. Filtro par/ímpar (6-9 pares)</h2>
      <p>
        Aceita apenas combinações com entre 6 e 9 dezenas pares (e portanto 6 a 9
        ímpares). As distribuições 7-8 e 8-7 são as mais comuns historicamente,
        cobrindo ~57% de todas as combinações. Filtrar para 6-9 pares cobre ~98%
        das combinações — um filtro amplo que só exclui os extremos mais raros.
      </p>

      <h2>3. Filtro de primos (4-7 primos)</h2>
      <p>
        Aceita apenas combinações com entre 4 e 7 números primos entre as 15 dezenas.
        Com média esperada de 5,4 primos por jogo, esse intervalo cobre a faixa central
        da distribuição. Os extremos (0-2 primos ou 8-9 primos) são raros e o filtro
        os exclui.
      </p>

      <h2>4. Filtro de atraso mínimo</h2>
      <p>
        Exige que pelo menos N dezenas do jogo não tenham saído nos últimos X concursos.
        Por exemplo: "pelo menos 5 dezenas com atraso maior que 3". Esse filtro é
        baseado na ideia de incluir dezenas "descansadas" — mas como explicado no
        artigo sobre <a href="/dicas/atraso">atraso</a>, isso não tem base matemática
        para prever o próximo concurso. É uma preferência pessoal, não uma estratégia.
      </p>

      <h2>5. Filtro de ciclo atual</h2>
      <p>
        O ciclo atual mostra quais dezenas já saíram desde que o último ciclo fechou
        (todas as 25 dezenas apareceram pelo menos uma vez). O filtro permite incluir
        ou excluir dezenas que ainda não saíram no ciclo atual. Matematicamente, isso
        tem o mesmo problema do filtro de atraso — o ciclo não prevê nada sobre o
        próximo concurso. Mas é uma forma diferente de organizar a escolha de dezenas
        se você aprecia essa perspectiva visual.
      </p>

      <h2>Como combinar filtros sem travar o gerador</h2>
      <p>
        Cada filtro adicionado reduz o espaço de combinações válidas. Com muitos filtros
        restritivos combinados, o gerador pode não encontrar nenhuma combinação válida
        dentro do limite de tentativas — e vai avisar. A recomendação é começar com 1
        ou 2 filtros e adicionar mais gradualmente, verificando se o gerador ainda
        produz resultados. O modo simples sempre funciona como fallback.
      </p>
    `,
  },
  {
    slug: "eleicoes-2026-superstição-numeros-candidatos",
    titulo: "Eleições 2026: números de candidatos, superstição e o que a psicologia diz",
    resumo:
      "Com a campanha eleitoral aquecendo, os números dos candidatos viram fetiches e talismãs. A mesma psicologia que cria 'números da sorte' opera aqui — e a ciência explica por quê.",
    data: "2026-08-15",
    categoria: "educativo" as const,
    tempoLeitura: 5,
    corpo: `
      <p>
        Com as eleições de outubro se aproximando e a propaganda eleitoral começando
        em 16 de agosto, o Brasil entra no ciclo dos números de candidatos — o 13,
        o 22, o 45, o 55. Esses números viram parte da identidade política de milhões
        de pessoas. A psicologia por trás desse fenômeno é a mesma que cria "números
        da sorte" em loteria — e é fascinante entender por quê.
      </p>

      <h2>Como números viram símbolos</h2>
      <p>
        Em política, o número do partido na urna eletrônica é um identificador
        técnico — ele diz ao sistema qual candidato você está votando. Mas para o
        eleitor, esse número rapidamente se carrega de significado emocional: ele
        está associado a um candidato que você admira, a vitórias passadas, a uma
        comunidade de pessoas que pensam como você. O número vira símbolo.
      </p>
      <p>
        O mesmo processo acontece em loteria: o número do aniversário, a combinação
        que "quase ganhou", os números que você joga há anos — todos acumulam
        significado emocional que vai muito além de sua função matemática (que é
        zero — nenhum número tem propriedade especial em um sorteio honesto).
      </p>

      <h2>A psicologia do "meu número"</h2>
      <p>
        Pesquisas em psicologia cognitiva mostram que as pessoas atribuem
        características pessoais a números com os quais têm associações — o número
        do time, o número do candidato favorito, a data de nascimento. Esse fenômeno
        é chamado de "efeito de posse" cognitivo: tratamos o número como "nosso",
        e por isso o percebemos como mais valioso, mais provável, mais especial.
      </p>
      <p>
        Em política, isso é parte legítima do processo democrático — criar identidade
        em torno de símbolos (incluindo números) ajuda a mobilizar eleitores e
        construir coesão em torno de causas. Em loteria, o mesmo mecanismo cria
        uma ilusão de probabilidade que não existe — o "meu número" não tem mais
        chance de sair do que qualquer outro.
      </p>

      <h2>O que fazer com essa informação</h2>
      <p>
        Em outubro, quando você for votar, o número do candidato vai funcionar
        perfeitamente como identificador — é para isso que existe. Em loteria,
        se você quer jogar os números do seu candidato favorito, tudo bem —
        mas saiba que a motivação é emocional, não matemática. A chance de ganhar
        é exatamente a mesma de qualquer outra combinação.
      </p>
      <p>
        O artigo sobre <a href="/dicas/vieses-cognitivos">vieses cognitivos</a>
        explora em profundidade os mecanismos psicológicos que fazem certas
        combinações parecerem "melhores" do que outras — e por que resistir a
        esses vieses é difícil mesmo quando você sabe que eles existem.
      </p>
    `,
  },
  {
    slug: "conferidor-foto-como-funciona",
    titulo: "Como funciona o conferidor por foto do bilhete da Lotofácil",
    resumo:
      "Fotografe o bilhete físico da lotérica e o conferidor identifica as dezenas automaticamente via OCR. Veja como usar, o que funciona bem e as limitações.",
    data: "2026-08-18",
    categoria: "lotofacil" as const,
    tempoLeitura: 4,
    corpo: `
      <p>
        Apostou na lotérica, pegou o bilhete físico e quer conferir sem digitar
        dezena por dezena? O <a href="/lotofacil/conferidor">conferidor por foto</a>
        faz isso automaticamente — você fotografa o bilhete, o sistema lê as dezenas
        e confere contra o último resultado (ou qualquer concurso do histórico).
      </p>

      <h2>Como o reconhecimento funciona</h2>
      <p>
        O sistema usa OCR (Optical Character Recognition) via Google Cloud Vision —
        a mesma tecnologia usada para digitalizar documentos e extrair texto de
        imagens. A foto é enviada para a API, que retorna o texto reconhecido,
        e o sistema então interpreta quais números correspondem às dezenas do jogo.
      </p>
      <p>
        Para que o reconhecimento funcione bem, o bilhete precisa estar bem
        iluminado, sem dobras que distorçam os números, e a câmera precisa
        estar centralizada sobre o bilhete. Fotos tiradas de lado, com sombra
        forte ou muito longe do bilhete tendem a ter menor taxa de acerto.
      </p>

      <h2>O que o sistema faz com o texto reconhecido</h2>
      <p>
        Após extrair o texto, o sistema procura padrões numéricos que correspondam
        a dezenas válidas da Lotofácil (1 a 25). Filtra números fora desse intervalo
        (como o número do concurso, a data, o valor pago) e monta a lista de dezenas
        do jogo. Se reconhecer exatamente 15 dezenas válidas sem ambiguidade, confere
        automaticamente. Se houver dúvida, pede confirmação antes de processar.
      </p>

      <h2>Limitações importantes</h2>
      <p>
        O OCR não é infalível. Bilhetes velhos, amassados, molhados ou com tinta
        borrada podem produzir erros de reconhecimento. O sistema sempre mostra as
        dezenas reconhecidas antes de confirmar a conferência — revise se os números
        batem com o bilhete físico antes de aceitar o resultado.
      </p>
      <p>
        O conferidor por foto está disponível para assinantes Premium. A versão
        gratuita usa o conferidor manual, onde você seleciona as dezenas no volante
        digital.
      </p>

      <h2>Conferência contra o histórico</h2>
      <p>
        Além de conferir contra o último concurso, você pode usar as dezenas
        reconhecidas para verificar o desempenho histórico daquele jogo em todos
        os concursos — o mesmo recurso do conferidor manual. Útil para ver se
        aquele bilhete que você guarda há anos "quase ganhou" quantas vezes de
        verdade (a resposta honesta costuma ser diferente da impressão).
      </p>
    `,
  },
  {
    slug: "mega-sena-chance-real-quina-vs-sena",
    titulo: "Mega-Sena: a chance real de acertar quina vs sena — e o retorno de cada faixa",
    resumo:
      "Acertar 5 dezenas na Mega-Sena é 324 vezes mais fácil que acertar 6. Mas o prêmio é também muito menor. Veja a relação entre probabilidade e retorno em cada faixa.",
    data: "2026-08-22",
    categoria: "megasena" as const,
    tempoLeitura: 4,
    corpo: `
      <p>
        A Mega-Sena tem 3 faixas de premiação: sena (6 acertos), quina (5 acertos)
        e quadra (4 acertos). A diferença de probabilidade entre elas é enorme —
        e a relação entre probabilidade e retorno esperado por faixa é uma das
        análises mais reveladoras sobre como as loterias são estruturadas.
      </p>

      <h2>As probabilidades exatas</h2>
      <p>
        Para uma aposta simples de 6 dezenas:
      </p>
      <ul>
        <li><strong>Sena (6 acertos):</strong> 1 em 50.063.860 — probabilidade de 0,000002%</li>
        <li><strong>Quina (5 acertos):</strong> 1 em 154.518 — probabilidade de 0,00065%</li>
        <li><strong>Quadra (4 acertos):</strong> 1 em 2.332 — probabilidade de 0,043%</li>
      </ul>
      <p>
        A quina é 324 vezes mais provável que a sena. A quadra é 21.500 vezes mais
        provável que a sena. Esses números mostram por que a maioria dos apostadores
        que alguma vez recebeu algum prêmio da Mega-Sena acertou a quadra — é a faixa
        acessível em escala humana de apostas.
      </p>

      <h2>O retorno esperado por faixa</h2>
      <p>
        A Caixa destina percentuais fixos da arrecadação para cada faixa: 35% para
        sena, 19% para quina e 19% para quadra (o restante acumula para concursos
        especiais). Combinando probabilidade com retorno esperado:
      </p>
      <ul>
        <li>Sena: altíssima variância, prêmio pode ser de milhões a bilhões</li>
        <li>Quina: prêmio médio histórico de R$30.000 a R$80.000, altamente variável com o rateio</li>
        <li>Quadra: prêmio médio histórico de R$700 a R$1.500, mais estável</li>
      </ul>
      <p>
        O prêmio da quina e da quadra variam muito porque também são rateados —
        muitos apostadores acertam essas faixas por concurso, e o fundo disponível
        é dividido entre todos eles.
      </p>

      <h2>Faz sentido apostar "para acertar quina"?</h2>
      <p>
        Matematicamente não existe estratégia que melhore a chance de acertar
        qualquer faixa específica — cada dezena tem exatamente a mesma probabilidade.
        O que você pode fazer é usar apostas com mais dezenas (7, 8, 9 dezenas),
        que aumentam proporcionalmente a chance de acertar todas as faixas,
        mas custam proporcionalmente mais. Veja o artigo sobre
        <a href="/dicas/mais-dezenas-vale-a-pena">apostar mais dezenas</a> para
        a análise completa de custo vs. probabilidade.
      </p>
    `,
  },
  {
    slug: "lotofacil-resultados-mais-improvaveis-historia",
    titulo: "Lotofácil: os concursos com resultado mais improvável da história",
    resumo:
      "Alguns resultados históricos da Lotofácil têm combinações de características estatísticas rarísimas. Quais são e o que eles revelam sobre aleatoriedade.",
    data: "2026-08-25",
    categoria: "lotofacil" as const,
    tempoLeitura: 5,
    corpo: `
      <p>
        Toda combinação da Lotofácil tem a mesma probabilidade de ser sorteada:
        1 em 3.268.760. Mas algumas combinações são "improváveis" em outro sentido —
        elas têm um perfil estatístico muito distante do típico: soma extremamente
        baixa ou alta, distribuição par/ímpar incomum, sequências longas incomuns.
        Olhar para esses concursos é uma forma fascinante de entender o que
        "improvável" realmente significa em um sistema aleatório.
      </p>

      <h2>O que torna um resultado "improvável"</h2>
      <p>
        Um resultado é estatisticamente incomum quando seu perfil cai em regiões
        raras da distribuição combinatória. Por exemplo: um resultado com soma
        abaixo de 160 é incomum porque menos de 0,5% de todas as combinações têm
        essa propriedade. Um resultado com 10 dezenas pares é incomum porque apenas
        2,6% das combinações têm distribuição 10-5.
      </p>
      <p>
        Mas é importante separar dois tipos de "improvável": improvável de existir
        (pouquíssimas combinações têm aquela característica) vs. improvável de sair
        (toda combinação específica tem a mesma chance baixíssima). O resultado com
        soma 155 não tem menos chance de sair do que o resultado com soma 195 — ele
        simplesmente tem poucas "irmãs" com a mesma característica.
      </p>

      <h2>Exemplos históricos notáveis</h2>
      <p>
        Ao longo de 3.720+ concursos, a Lotofácil já produziu resultados com:
      </p>
      <ul>
        <li>Somas abaixo de 158 (menos de 0,2% das combinações)</li>
        <li>Somas acima de 233 (menos de 0,3% das combinações)</li>
        <li>9 ou mais dezenas pares (apenas 5,2% das combinações têm 9+ pares)</li>
        <li>Sequências de 8 ou mais dezenas consecutivas (menos de 1% das combinações)</li>
        <li>Nenhuma dezena prima ou apenas 1 primo (menos de 0,1% das combinações)</li>
      </ul>
      <p>
        Todos esses eventos já aconteceram no histórico real — exatamente na frequência
        que a combinatória prevê. Isso é, ao mesmo tempo, esperado (a combinatória
        prevê que eventos raros vão acontecer em uma amostra grande) e revelador
        (mostra que o sorteio realmente gera todas as combinações, não só as "típicas").
      </p>

      <h2>O Índice de Equilíbrio dos concursos mais improváveis</h2>
      <p>
        Usando o <a href="/lotofacil/equilibrio">Índice de Equilíbrio</a>, você pode
        calcular a nota de qualquer resultado histórico. Os concursos com resultados
        mais "improváveis" no sentido estatístico teriam notas muito baixas —
        indicando que o resultado é incomum em múltiplas dimensões ao mesmo tempo.
        Mas a nota baixa não os tornou menos prováveis de sair: aconteceram como
        qualquer outro.
      </p>
      <p>
        Esse é um dos exemplos mais concretos de por que "improvável" em estatística
        não significa "difícil de acontecer" — significa apenas "raro no espaço de
        possibilidades". Com 3.720 tentativas, até os eventos com probabilidade de
        0,1% de existir aparecem várias vezes.
      </p>
    `,
  },
  {
    slug: "lotofacil-independencia-2026-guia-completo",
    titulo: "Lotofácil da Independência 2026: guia completo para o concurso de setembro",
    resumo:
      "Data, formato, como o prêmio é formado, estratégias de bolão e o que esperar. Tudo sobre o maior concurso da Lotofácil no ano.",
    data: "2026-09-01",
    categoria: "lotofacil" as const,
    tempoLeitura: 6,
    corpo: `
      <p>
        O concurso da Lotofácil da Independência é o mais esperado do ano para
        apostadores da Lotofácil. Com prêmio inflado por meses de acúmulo programático,
        ele concentra um volume de apostas muito maior que o normal — e algumas
        particularidades que vale entender antes de decidir como participar.
      </p>

      <h2>Quando acontece</h2>
      <p>
        O concurso especial é realizado próximo ao 7 de setembro, Dia da Independência
        do Brasil — daí o nome. A data exata é definida pela Caixa com algumas semanas
        de antecedência, sempre em um dia próximo ao feriado. As apostas seguem o
        mesmo prazo de qualquer concurso regular: encerram até às 19h no dia do sorteio.
      </p>

      <h2>Como o prêmio especial é formado</h2>
      <p>
        Desde janeiro, 15% do fundo de cada concurso regular da Lotofácil é separado
        automaticamente para o concurso da Independência. Com centenas de concursos
        regulares e arrecadação total de bilhões de reais, esse acúmulo programático
        pode chegar a R$100-150 milhões antes do concurso especial começar.
      </p>
      <p>
        Somado à arrecadação do próprio concurso especial (que tende a ser de 3 a 5
        vezes maior que um concurso normal, porque muitos apostadores que não jogam
        regularmente participam), o prêmio final pode facilmente ultrapassar
        R$200 milhões.
      </p>

      <h2>O que é diferente no concurso especial</h2>
      <p>
        As regras são idênticas às de qualquer Lotofácil: 25 dezenas, 15 sorteadas,
        mesmas faixas de premiação (11 a 15 acertos), mesmo processo de rateio.
        A única diferença é o tamanho do fundo — e suas consequências:
      </p>
      <ul>
        <li>Muito mais apostadores participam, atraídos pelo prêmio maior</li>
        <li>A chance de múltiplos ganhadores de 15 acertos é bem maior que no normal</li>
        <li>O prêmio por ganhador pode ser muito menor que o total anunciado</li>
        <li>Os prêmios das faixas 11, 12 e 13 continuam fixos (R$5, R$10, R$25)</li>
      </ul>

      <h2>Estratégias de bolão para o concurso especial</h2>
      <p>
        O concurso da Independência é ideal para bolões porque o prêmio maior justifica
        um investimento maior do grupo. Um bolão com fechamento reduzido de 18 dezenas
        (cerca de R$350-500 por grupo) cobre sistematicamente o pool escolhido — se
        as dezenas sorteadas estiverem dentro do pool, pelo menos um bilhete do grupo
        captura um bom resultado.
      </p>
      <p>
        O <a href="/lotofacil/bolao">otimizador de bolão</a> gera o plano completo:
        escolha o pool de dezenas, o orçamento do grupo e o nível de cobertura
        desejado, e o sistema gera os bilhetes otimizados com PDF para distribuir.
      </p>

      <h2>Quanto apostar: a regra do orçamento fixo</h2>
      <p>
        O concurso especial não é uma oportunidade única de enriquecer — é um concurso
        com prêmio maior, mas com mais competidores e maior probabilidade de rateio.
        A recomendação financeiramente saudável é: participe com o mesmo orçamento
        que você usaria em qualquer concurso que te pareça interessante. Apostar 10
        vezes mais "porque o prêmio é maior" não muda a matemática a seu favor — só
        aumenta o valor esperado de perda proporcional ao que você apostar.
      </p>
      <p>
        Use o <a href="/lotofacil/simulador">simulador histórico</a> para ver como
        jogos similares performaram nos concursos especiais anteriores — e o
        <a href="/lotofacil/acumulos">histórico de acúmulos</a> para ver os prêmios
        pagos nas edições passadas da Independência.
      </p>
    `,
  },

  {
    slug: "quina-como-funciona-probabilidades",
    titulo: "Quina: como funciona, probabilidades e por que é a loteria mais versátil do Brasil",
    resumo:
      "5 de 80 dezenas, 5 sorteios por semana, 4 faixas de premiação. A Quina tem a melhor relação entre frequência de sorteios e probabilidade de ganho entre as loterias federais.",
    data: "2026-07-08",
    categoria: "educativo" as const,
    tempoLeitura: 5,
    corpo: `
      <p>
        A Quina é uma das loterias mais antigas do Brasil — existe desde 1994, antes
        mesmo da Mega-Sena. Com 5 sorteios por semana (segunda a sábado, exceto domingo),
        é também a mais frequente entre as loterias federais. E tem algumas características
        matemáticas que a tornam interessante de analisar.
      </p>

      <h2>Como funciona</h2>
      <p>
        O apostador escolhe entre 5 e 15 números de 1 a 80. A Caixa sorteia 5 dezenas.
        Há 4 faixas de premiação:
      </p>
      <ul>
        <li><strong>Quina (5 acertos):</strong> 1 em 24.040.016</li>
        <li><strong>Quadra (4 acertos):</strong> 1 em 65.000</li>
        <li><strong>Terno (3 acertos):</strong> 1 em 866</li>
        <li><strong>Duque (2 acertos):</strong> 1 em 37</li>
      </ul>
      <p>
        A faixa do duque (2 acertos) é a mais acessível de todas as loterias federais
        — com probabilidade de 1 em 37, quem joga regularmente vai acertar essa faixa
        com relativa frequência. O prêmio é pequeno (geralmente R$4 a R$6), mas é uma
        faixa com retorno frequente.
      </p>

      <h2>Comparação com Mega-Sena e Lotofácil</h2>
      <p>
        A probabilidade de acertar a Quina completa (1 em 24 milhões) fica entre a
        Lotofácil (1 em 3,2 milhões) e a Mega-Sena (1 em 50 milhões). Mas o que torna
        a Quina diferente é a combinação de frequência alta (5 sorteios/semana) e faixas
        acessíveis (duque e terno com probabilidades razoáveis).
      </p>
      <p>
        O prêmio principal da Quina é consideravelmente menor que o da Mega-Sena —
        raramente ultrapassa R$10-15 milhões em concursos normais. Mas o acúmulo
        acontece mais raramente porque a probabilidade de haver ganhador é maior
        (universo menor de combinações).
      </p>

      <h2>As probabilidades exatas para aposta simples (5 dezenas)</h2>
      <p>
        Com 80 dezenas disponíveis e 5 sorteadas, o total de combinações possíveis é
        C(80,5) = 24.040.016. As faixas intermediárias:
      </p>
      <ul>
        <li>Terno: C(5,3) × C(75,2) ÷ C(80,5) = 1 em 866</li>
        <li>Duque: C(5,2) × C(75,3) ÷ C(80,5) = 1 em 37</li>
      </ul>
      <p>
        Em média, quem joga a Quina regularmente acerta o duque a cada 37 concursos —
        com 5 sorteios por semana, isso é aproximadamente uma vez a cada 7-8 semanas.
        O terno acontece a cada 866 concursos — cerca de uma vez a cada 3 anos de jogo
        regular.
      </p>

      <h2>Acompanhe na plataforma</h2>
      <p>
        Os resultados, tabelas estatísticas e ferramentas da Quina estão disponíveis em
        <a href="/quina/resultados">Quina → Resultados</a>. Use o
        <a href="/quina/conferidor">conferidor</a> para ver como qualquer combinação
        teria se saído no histórico completo, ou o
        <a href="/quina/simulador">simulador</a> para ver o resultado financeiro real
        de jogar sempre o mesmo jogo.
      </p>
    `,
  },
  {
    slug: "lotomania-a-loteria-dos-50-numeros",
    titulo: "Lotomania: a lógica inversa da loteria que você marca 50 números para acertar 20",
    resumo:
      "Na Lotomania, o apostador marca 50 de 100 números — e a Caixa sorteia 20. Você ganha tanto acertando muitos quanto acertando zero. A matemática por trás dessa peculiaridade.",
    data: "2026-07-11",
    categoria: "educativo" as const,
    tempoLeitura: 6,
    corpo: `
      <p>
        A Lotomania tem uma mecânica completamente diferente de todas as outras loterias
        federais — e por isso é frequentemente mal entendida. Este artigo explica como
        ela funciona, por que a faixa de "0 acertos" existe e o que os números reais
        dizem sobre as probabilidades.
      </p>

      <h2>A mecânica básica</h2>
      <p>
        O apostador marca exatamente 50 números de 0 a 99 (100 números no total).
        A Caixa sorteia 20 números. Você então compara suas 50 marcações com os 20
        sorteados. As faixas de premiação são:
      </p>
      <ul>
        <li><strong>20 acertos:</strong> suas 50 marcações contêm todos os 20 sorteados</li>
        <li><strong>19 acertos:</strong> 19 dos 20 sorteados estão entre suas 50 marcações</li>
        <li><strong>18, 17, 16, 15 acertos:</strong> faixas intermediárias</li>
        <li><strong>0 acertos:</strong> nenhum dos 20 sorteados está entre suas 50 marcações</li>
      </ul>
      <p>
        A faixa de 0 acertos é a mais peculiar: você ganha um prêmio por não acertar
        nenhuma das 20 dezenas sorteadas. Isso é possível porque, ao marcar 50 de 100
        números, há uma chance real de que todos os 20 sorteados caiam nos 50 que você
        <em>não</em> marcou.
      </p>

      <h2>Por que a faixa de 0 acertos existe matematicamente</h2>
      <p>
        A probabilidade de seus 50 números não incluírem nenhum dos 20 sorteados é
        calculada assim: dos 100 números, você marcou 50 e deixou 50 de fora. Para
        que nenhum dos 20 sorteados esteja entre seus 50 marcados, todos os 20 precisam
        cair nos seus 50 não-marcados.
      </p>
      <p>
        A probabilidade exata: C(50,20) ÷ C(100,20) ≈ 1 em 100.000. Ou seja, em cerca
        de 1 em cada 100.000 apostas, você acerta a faixa de 0. É rara, mas acontece.
      </p>

      <h2>Qual faixa é mais provável?</h2>
      <p>
        Com 50 marcações e 20 sorteados de 100, a média esperada de acertos é
        50 × 20 ÷ 100 = 10. A distribuição é centrada em 10 acertos, e as faixas
        premiadas (15 a 20 acertos) ficam bem acima da média esperada — por isso
        são raras.
      </p>
      <ul>
        <li>15 acertos: aproximadamente 1 em 1.400</li>
        <li>16 acertos: aproximadamente 1 em 7.000</li>
        <li>17 acertos: aproximadamente 1 em 47.000</li>
        <li>18 acertos: aproximadamente 1 em 400.000</li>
        <li>19 acertos: aproximadamente 1 em 5.000.000</li>
        <li>20 acertos: aproximadamente 1 em 75.000.000</li>
      </ul>

      <h2>A Lotomania é uma boa escolha?</h2>
      <p>
        A Lotomania tem menos apostadores que Mega-Sena e Lotofácil, o que significa
        que quando há ganhador da faixa principal, o prêmio raramente é dividido com
        muitas pessoas. Por outro lado, o prêmio acumula com frequência e pode chegar
        a valores altos para uma loteria de menor volume.
      </p>
      <p>
        O retorno ao apostador é o mesmo de qualquer loteria federal (~43% da
        arrecadação em prêmios). A peculiaridade da faixa de 0 acertos não muda o
        retorno esperado — é apenas uma forma diferente de distribuir prêmios que
        torna a mecânica mais interessante.
      </p>
      <p>
        Acompanhe os resultados e estatísticas em
        <a href="/lotomania/resultados">Lotomania → Resultados</a>.
      </p>
    `,
  },

  {
    slug: "dia-de-sorte-guia-completo",
    titulo: "Dia de Sorte: guia completo para entender a loteria do mês",
    resumo:
      "Com sorteios 3 vezes por semana e o menor universo de dezenas (1-31), o Dia de Sorte tem as faixas intermediárias mais acessíveis das loterias federais.",
    data: "2026-07-09",
    categoria: "educativo" as const,
    tempoLeitura: 5,
    corpo: `
      <p>
        O Dia de Sorte foi lançado em maio de 2018 e desde então acumula mais de
        1.200 concursos. Com dezenas de 1 a 31 e um mês sorteado como elemento extra,
        tem a mecânica mais diferente entre as loterias de formato simples.
      </p>

      <h2>O universo pequeno muda tudo</h2>
      <p>
        Com apenas 31 dezenas disponíveis e 7 sorteadas por concurso, a proporção
        é de 22,6% — bem acima dos 10% da Mega-Sena e ainda abaixo dos 60% da
        Lotofácil. O efeito prático: acertar 4 dezenas tem probabilidade de 1 em 40,
        o que torna a 5ª faixa bem mais frequente do que na maioria das loterias.
      </p>
      <p>
        Para quem quer ganhar alguma coisa com mais regularidade, o Dia de Sorte
        oferece as faixas intermediárias mais acessíveis entre as loterias que não
        são a Lotofácil.
      </p>

      <h2>O Mês da Sorte na prática</h2>
      <p>
        A 6ª faixa paga um prêmio pequeno só por acertar o mês — sem precisar acertar
        nenhuma dezena. Com probabilidade de 1 em 12, quem joga todo concurso da
        semana vai acertar o mês em média uma vez por mês. É um detalhe que torna o
        jogo mais frequentemente "lucrativo" em pequena escala.
      </p>
      <p>
        Os resultados completos, incluindo o Mês da Sorte sorteado, estão disponíveis
        em <a href="/diadesorte/resultados">Dia de Sorte → Resultados</a>.
      </p>

      <h2>Acompanhe as estatísticas</h2>
      <p>
        O <a href="/diadesorte/heatmap">heatmap do Dia de Sorte</a> mostra a frequência
        de cada dezena ao longo dos mais de 1.200 concursos. Como em todas as loterias,
        a variação observada está dentro do esperado por pura aleatoriedade — mas é
        visualmente interessante comparar o comportamento dos últimos 50 concursos
        com o histórico completo.
      </p>
    `,
  },
  {
    slug: "mais-milionaria-trevos-matematica",
    titulo: "+Milionária: a matemática dos trevos e por que eles importam mais do que parecem",
    resumo:
      "Os 2 trevos da +Milionária têm probabilidade de 1 em 15 de acertar os dois certos. Entenda como eles se combinam com as dezenas para criar as 10 faixas.",
    data: "2026-07-10",
    categoria: "maismilionaria" as const,
    tempoLeitura: 5,
    corpo: `
      <p>
        A +Milionária é a loteria federal mais nova (lançada em 2022) e a única que
        combina dois tipos de elemento: dezenas (1-50) e trevos (1-6). Essa combinação
        cria uma estrutura de premiação com 10 faixas que depende de acertos em ambos
        os componentes.
      </p>

      <h2>Por que os trevos importam</h2>
      <p>
        Diferente das dezenas, onde acertar 6 de 50 é 1 em 15.890.700, acertar os
        2 trevos certos de 6 possíveis tem probabilidade de apenas 1 em 15. Isso
        significa que os trevos têm um impacto desproporcional na probabilidade de
        cada faixa.
      </p>
      <p>
        Acertar 3 dezenas sem os trevos não paga nada. Acertar 3 dezenas e 1 trevo
        paga a 8ª faixa. Acertar 3 dezenas e 2 trevos paga a 7ª faixa. Os trevos
        determinam qual das duas faixas é atingida — e a diferença de prêmio entre
        elas pode ser de 2 a 5 vezes.
      </p>

      <h2>A faixa principal mais rara do Brasil</h2>
      <p>
        A 1ª faixa da +Milionária (6 dezenas + 2 trevos) tem probabilidade de 1 em
        238.360.656 — a mais rara entre todas as loterias federais ativas. Por isso
        o prêmio tende a acumular mais e chegar a valores excepcionalmente altos.
        O recorde histórico já ultrapassou R$100 milhões.
      </p>

      <h2>Como conferir seu jogo com trevos</h2>
      <p>
        O <a href="/maismilionaria/conferidor">conferidor da +Milionária</a> neste site
        inclui um seletor de trevos. Além das 6 dezenas, selecione os 2 trevos do seu
        jogo para que o conferidor calcule corretamente em qual faixa cada concurso
        histórico teria sido premiado.
      </p>
      <p>
        Os resultados recentes, com os trevos sorteados destacados em vermelho, estão
        em <a href="/maismilionaria/resultados">+Milionária → Resultados</a>.
      </p>
    `,
  },
  {
    slug: "timemania-time-coracao-analise",
    titulo: "Timemania: análise histórica do Time do Coração e das dezenas de 1 a 80",
    resumo:
      "Com mais de 2.400 concursos desde 2008, a Timemania tem um histórico rico. O que os dados dizem sobre distribuição de dezenas, frequência de acúmulos e o Time do Coração.",
    data: "2026-07-13",
    categoria: "educativo" as const,
    tempoLeitura: 5,
    corpo: `
      <p>
        A Timemania existe desde setembro de 2008 — uma das loterias com maior histórico
        depois da Mega-Sena e da Quina. Com mais de 2.400 concursos e um universo de
        80 dezenas, tem características únicas em relação às outras loterias.
      </p>

      <h2>O maior universo entre as loterias de formato simples</h2>
      <p>
        Com 80 dezenas disponíveis e apenas 7 sorteadas, a Timemania tem a menor
        proporção de dezenas sorteadas por concurso: apenas 8,75%. Isso tem
        consequências diretas:
      </p>
      <ul>
        <li>Dezenas ficam mais tempo sem sair — atrasos longos são normais</li>
        <li>Sequências consecutivas são mais raras do que em outras loterias</li>
        <li>O ciclo completo (todas as 80 dezenas saírem ao menos uma vez) leva muito mais concursos</li>
      </ul>
      <p>
        O <a href="/timemania/tabelas/atraso">histórico de atraso da Timemania</a>
        mostra os recordes por dezena — valores bem maiores do que os da Lotofácil,
        o que é esperado pela proporção menor de dezenas sorteadas.
      </p>

      <h2>O Time do Coração no histórico</h2>
      <p>
        O Time do Coração sorteado aparece nos resultados da Timemania da mesma forma
        que o Mês da Sorte aparece no Dia de Sorte. A lista de times participantes
        varia ao longo dos anos, conforme clubes entram e saem do programa de
        arrecadação da Caixa.
      </p>
      <p>
        A faixa do Time do Coração paga um prêmio fixo pequeno independente das
        dezenas. Quem escolhe seu time e joga regularmente vai acertar essa faixa
        com uma frequência proporcional ao número de times na lista atual.
      </p>

      <h2>Explore os dados</h2>
      <p>
        O <a href="/timemania/heatmap">heatmap da Timemania</a> mostra a frequência
        de cada dezena de 1 a 80. Com 2.400+ concursos no histórico, a distribuição
        está bem próxima da esperada — o que confirma que o sorteio é honesto e que
        qualquer variação visível é ruído estatístico normal.
      </p>
    `,
  },
  {
    slug: "dupla-sena-dois-sorteios-estrategia",
    titulo: "Dupla Sena: como dois sorteios por concurso afetam sua estratégia",
    resumo:
      "Com dois sorteios independentes por aposta, a Dupla Sena dobra aproximadamente suas chances. Mas isso é equivalente a comprar dois bilhetes da Mega-Sena?",
    data: "2026-07-16",
    categoria: "educativo" as const,
    tempoLeitura: 5,
    corpo: `
      <p>
        A Dupla Sena existe desde 2001 e tem uma mecânica que a diferencia: cada
        aposta é conferida em dois sorteios distintos realizados no mesmo concurso.
        O que isso significa na prática para probabilidades e estratégia?
      </p>

      <h2>Dois sorteios, dobro de chances?</h2>
      <p>
        Tecnicamente sim, mas com uma nuance. A probabilidade de acertar a sena em
        pelo menos um dos dois sorteios é:
      </p>
      <p>
        1 − (1 − 1/15.890.700)² ≈ 1 em 7.945.350
      </p>
      <p>
        Isso é quase o dobro da probabilidade de um único sorteio — e é matematicamente
        equivalente a jogar dois bilhetes diferentes numa loteria de sorteio único. A
        diferença real é que você não precisa escolher duas combinações: com um único
        jogo, você já está coberto nos dois sorteios.
      </p>

      <h2>Comparação com a Mega-Sena</h2>
      <p>
        A Dupla Sena usa dezenas de 1 a 50 (não 1-60 como a Mega-Sena), então o
        universo é menor e a probabilidade de acertar é maior por sorteio. Um único
        sorteio da Dupla Sena tem probabilidade de 1 em 15.890.700 — mais de 3 vezes
        mais provável que a Mega-Sena. Com o segundo sorteio incluído, fica 1 em
        ~7.945.350 — ainda mais de 6 vezes mais provável que a Mega.
      </p>

      <h2>As 8 faixas na prática</h2>
      <p>
        Com 4 faixas por sorteio (sena, quina, quadra e terno), cada faixa existe
        em duplicata. É possível, em teoria, ganhar em ambos os sorteios no mesmo
        concurso — dois prêmios pelo preço de uma aposta.
      </p>
      <p>
        Confira o histórico completo dos dois sorteios em
        <a href="/duplasena/resultados">Dupla Sena → Resultados</a>, onde o 1º e
        o 2º sorteio aparecem separados visualmente.
      </p>
    `,
  },
  {
    slug: "super-sete-colunas-independentes-curiosidades",
    titulo: "Super Sete: as curiosidades matemáticas de uma loteria com 7 colunas independentes",
    resumo:
      "Com 10 milhões de combinações possíveis e dezenas que podem se repetir, a Super Sete tem propriedades estatísticas completamente diferentes de todas as outras loterias.",
    data: "2026-07-17",
    categoria: "educativo" as const,
    tempoLeitura: 5,
    corpo: `
      <p>
        A Super Sete foi lançada em outubro de 2020 e já tem quase 900 concursos.
        Sua mecânica de 7 colunas independentes cria propriedades estatísticas únicas
        que não aparecem em nenhuma outra loteria federal.
      </p>

      <h2>O mesmo dígito em múltiplas colunas</h2>
      <p>
        Porque cada coluna é sorteada independentemente, o mesmo dígito pode aparecer
        em várias colunas no mesmo concurso. No concurso 869, o resultado foi
        [8, 7, 4, 3, 9, 6, 6] — o dígito 6 apareceu nas colunas C6 e C7.
      </p>
      <p>
        No histórico da Super Sete, resultados com dois dígitos iguais são comuns —
        com probabilidade de exatamente 63% para qualquer par de colunas ter o mesmo
        dígito (pelo problema do aniversário aplicado a 7 escolhas de 10 opções).
        Resultados com três ou mais repetições existem mas são mais raros.
      </p>

      <h2>A soma mais previsível de todas as loterias</h2>
      <p>
        Com apenas 22 somas possíveis (de 0+0+0+0+0+0+0=0 a 9+9+9+9+9+9+9=63),
        a distribuição de somas da Super Sete é a mais compacta entre todas as loterias.
        A soma média esperada é 31,5 (média de cada coluna × 7 = 4,5 × 7).
        No <a href="/supersete/tabelas/soma">histograma de somas</a>, você pode ver
        como a distribuição real se compara com o esperado.
      </p>

      <h2>O heatmap por coluna</h2>
      <p>
        O <a href="/supersete/heatmap">heatmap da Super Sete</a> neste site usa uma
        visualização especial: em vez de colorir dezenas num volante linear, ele mostra
        a frequência de cada dígito (0-9) numa grade de 10 × 7. Isso permite ver,
        por exemplo, se o dígito 9 aparece com mais frequência na coluna C3 do que nas
        outras — o que seria evidência de viés, mas que (como esperado) não existe
        nos dados reais.
      </p>

      <h2>3 números por coluna: quando faz sentido</h2>
      <p>
        Escolher 3 números em vez de 1 por coluna aumenta a probabilidade de acertar
        aquela coluna de 10% para 30% — um aumento de 3 vezes. Mas o custo também
        aumenta 3 vezes (para uma coluna) ou 3⁷ = 2.187 vezes (para todas as 7
        colunas com 3 números cada). Como em todas as loterias, a eficiência por real
        gasto é idêntica independente da estratégia de aposta.
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
