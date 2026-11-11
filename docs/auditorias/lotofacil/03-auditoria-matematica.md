# 03 — Auditoria matemática da Lotofácil (Fase 2)

11/11/2026 · commit `449ccda` · dados de produção exportados em 11/11/2026
(3.826 concursos, nº 1 a 3826)

## Método

Cada ferramenta foi verificada contra uma **implementação de referência
independente**, escrita a partir da ficha (`01-ficha-matematica.md`) e sem
reutilizar o código auditado. Quando o código auditado é chamado (fechamento,
gerador, probabilidades), é para comparar a saída dele com o verificador
independente.

Dados: export completo de `concurso` + `premiacao_faixa` da Lotofácil e
saída de todas as funções SQL de estatística, feitos só com SELECT
(`evidencias/fase2/export.sql`, `fns.sql`). Os scripts estão em
`evidencias/fase2/` e leem os JSON exportados (não versionados, ~4,6 MB).
Para refazer: rodar os `.sql` com `supabase db query --linked -f` e salvar como
`lf_raw.json` e `lf_fns.json`, depois rodar `node <script>.mjs` ou
`npx vite-node <script>.ts`.

Resumo dos números: 30 células de probabilidade, 7 tabelas fixas do
Analisador, 21 saídas SQL de estatística, 33 definições de função, 18
fechamentos, 3.333 séries de acúmulo e 369 concursos para a projeção; as
3.268.760 combinações foram enumeradas 2 vezes (Analisador e Equilíbrio),
~240 mil jogos gerados nos testes do gerador, 2.000 históricos simulados
(Monte Carlo) e 2.000 jogos aleatórios reprocessados contra o histórico.

## Resultado por ferramenta

| # | Ferramenta | Status | Problemas |
|---|---|---|---|
| 1 | Probabilidades por faixa (15–20 números) | APROVADO COM RESSALVAS | LF-09 |
| 2 | Projeção de acúmulo | REPROVADO | LF-07, LF-15 |
| 3 | Analisador | REPROVADO | LF-03, LF-16, LF-17 |
| 4 | Tabelas estatísticas (13 categorias) | APROVADO COM RESSALVAS | LF-10, LF-18, LF-19 |
| 5 | Heatmap | REPROVADO (texto) | LF-19 |
| 6 | Simulador de frequência aleatória | APROVADO COM RESSALVAS | LF-20 |
| 7 | Destaques | REPROVADO | LF-21 |
| 8 | Acúmulos | APROVADO COM RESSALVAS | LF-22 |
| 9 | Recordes | APROVADO COM RESSALVAS | LF-10 (latente), valores nominais |
| 10 | Inéditas | APROVADO | — |
| 11 | Fechamentos | APROVADO COM RESSALVAS | LF-23 |
| 12 | Bolão (tabela de opções e conferência) | APROVADO COM RESSALVAS | LF-24 |
| 13 | Gerador de jogos | REPROVADO | LF-25, LF-26 |
| 14 | Gerador "Data da sorte" | APROVADO | — |
| 15 | Simulador histórico | REPROVADO | LF-04, LF-05 |
| 16 | Conferidor | APROVADO COM RESSALVAS | LF-05, LF-11 |
| 17 | Índice de Equilíbrio | REPROVADO | LF-08, LF-27 |
| 18 | Calculadora de probabilidade | APROVADO COM RESSALVAS | LF-28 |
| 19 | Calculadora de valor esperado | REPROVADO | LF-29 |
| 20 | Calculadora de custo de aposta múltipla | APROVADO | — (R$ 3,50 × C(b,15), igual à Caixa) |
| — | Funções SQL (produção x `schema.sql`) | APROVADO | 33 de 33 idênticas |
| — | Markov / transições | NÃO APLICÁVEL | Sem uso; as funções SQL nem existem em produção |

O detalhe de cada problema está em `06-problemas-encontrados.md`.

---

## 1. Probabilidades por faixa

- **Verificado:** `calcularProbabilidades(25, 15, b, [11..15])` para b = 15..20
  (30 células) contra P(K=k) = C(15,k)·C(10,b−k)/C(25,b) e contra a tabela
  oficial da Caixa. Propriedades: soma das probabilidades de todos os k = 1
  (erro < 10⁻¹²) e suporte correto (b−10 ≤ k ≤ 15).
- **Resultado:** erro relativo 0 em todas as células. Todas batem com a Caixa.
- **Ressalvas:** "1 em N" é arredondado para inteiro (LF-09: 4,22 → 4;
  2,59 → 3; 3,24 → 3). Para b > 15 a tabela mostra a chance de a aposta ter
  exatamente k acertos; uma aposta múltipla com k acertos ganha também faixas
  menores (ficha 3.3), e a página não explica isso.
- `binomial()` arredonda o produto em ponto flutuante; para N = 25 é exato
  (todos os valores < 2⁵³).
- "Anos para acertar" = umEm ÷ 6 ÷ 52 depende de 6 sorteios/semana (LF-14,
  pendente).

## 2. Projeção de acúmulo (`calcularProjecao`)

- **Verificado:** o modelo P(≥1 ganhador) = 1 − (1 − 1/C(25,15))^T, com
  T = arrecadação ÷ R$ 3,50 × fator de acúmulo, foi aplicado aos 369
  concursos desde 01/08/2025 (preço já de R$ 3,50) e comparado com o que
  aconteceu.

| Medida | Modelo | Real |
|---|---|---|
| Concursos com ganhador de 15 | 87,8% | 75,3% |
| Ganhadores de 15 no período | 1.007 | 871 |

  A diferença no número de concursos com ganhador é de ~7 desvios-padrão:
  o modelo **superestima** sistematicamente a chance de haver ganhador.
  Causa provável: apostas reais não são uniformes (números e jogos populares
  se repetem), o que o modelo ignora; a arrecadação também inclui apostas
  múltiplas e tarifas de bolão.
- **Fator de acúmulo:** o código soma +20% de apostas por concurso
  acumulado. Nos dados, a arrecadação cresce em média **+70%** depois de 1
  acúmulo e **+46%** depois do 2º. O parâmetro não tem fonte e não está
  calibrado para a Lotofácil.
- O modelo não trata concursos de final 0 nem a Independência (regras
  R10/R11), que mudam o prêmio e o volume de apostas.
- `formatarPct` mostra "100,0%" quando p ≥ 0,9995 (T ≥ 24,8 milhões de
  apostas). Isso aconteceria em 9 dos 369 concursos recentes no cenário +50%
  (LF-15).
- "Mínimo garantido" = `valor_acumulado_proximo` da Caixa. Os dados mostram
  esse campo preenchido também em concursos com ganhador, antes de concursos
  terminados em 5 (ex.: 3814, 3824). A regra oficial lida só cita final 0:
  **pendente** de verificação na Fase 3.

## 3. Analisador

- **Verificado:** todas as tabelas fixas da Lotofácil (`DIST_*_LF` e
  `CDF_SOMA_LF`) contra a enumeração completa das 3.268.760 combinações
  (`enum.mjs`) e contra a hipergeométrica (`hip.mjs`).
- **Corretos:** pares (todas as chaves), sequência máxima (todas as
  chaves; falta só a 14, 0,003%), CDF da soma (151 valores, diferença
  máxima 0,0), conjuntos de primos, Fibonacci, múltiplos de 3 e moldura.
  Média 195 e variância 325 confirmadas.
- **Errados:** caudas de primos, moldura, Fibonacci e múltiplos de 3
  (LF-03).
- **Apresentação da soma (LF-16):** o "pct" da soma é uma centralidade
  (100 − |50 − percentil| × 2), mas a tela o apresenta como porcentagem de
  combinações. Para soma 195 aparece "Mais da metade dos jogos possíveis têm
  esse mesmo padrão (97,8%)". O correto é: 2,2% das combinações têm soma
  exatamente 195, e 51,1% têm soma ≤ 195. A frase é falsa. Há ainda uma
  pequena assimetria: somas 185 e 205 (equidistantes da média) recebem
  60,4 e 56,8.
- **Jogo incompleto (LF-17):** a análise roda a cada clique, com 1 a 14
  dezenas, comparando com distribuições de 15 dezenas. Com 3 dezenas, por
  exemplo, aparecem métricas "Raro" e o veredito "x de 7".

## 4. Tabelas estatísticas

- **Verificado:** recontagem independente de 21 saídas SQL a partir dos
  sorteios brutos (`hist.mjs`): frequência (total e últimos 100), atraso,
  maior atraso, ciclos (809 completos + atual), sequências, sequência de
  concursos por dezena, pares e ímpares, primos, Fibonacci, múltiplos de 3,
  moldura e centro, linhas, colunas, soma (mín/máx/média/mediana),
  histograma, repetidas, os 300 duques, trincas (2.300 distintas e as 30
  mais frequentes).
- **Resultado:** **21/21 idênticas.** Denominadores corretos (repetidas usam
  N − 1 concursos, o resto N). As funções de produção são idênticas às do
  `schema.sql`.
- **Comparação com a teoria (aderência, χ²):** pares p ≈ 0,93; primos
  0,54; Fibonacci 0,77; múltiplos de 3 0,41; moldura 0,11. Ciclos: média
  observada 4,728 concursos x teórica 4,766 (cadeia de Markov exata).
  Repetidas: compatível com a hipergeométrica. Maior atraso por dezena
  7–12 x ~8,4 esperado.
- **Frequência das dezenas (LF-18, informativo, importante):** o histórico
  completo **rejeita** a hipótese de que todas as dezenas saem com a mesma
  frequência: χ² = 56,6 com 24 graus de liberdade. O p-valor é ≈ 0,0002 pela
  aproximação e **0,0005 em 2.000 simulações Monte Carlo**. Os desvios se
  concentram nos concursos 1–500 (2003–2009, p ≈ 0,01) e 2001–2500
  (2020–2021, p ≈ 0,004); de 2022 em diante o teste não rejeita nada.
  Dezena 16: 2.189 vezes (z = −3,5); dezena 20: 2.384 vezes (z = +2,9).
  Isso não é previsão nem vantagem para o futuro, mas contradiz frases do
  site que dizem que a variação é "exatamente o esperado" (LF-19). A Fase 3
  precisa descartar erro de dados nesses períodos antes de qualquer
  conclusão.
- **Maior atraso (LF-10):** a definição ignora o trecho antes da 1ª
  aparição e o atraso corrente. Hoje não muda nenhum número (verificado:
  nenhuma dezena tem atraso atual ou inicial acima do recorde), mas o
  Destaque e os Recordes dependem disso.
- Recorte "últimos N" supõe numeração contínua: confirmado (1..3826 sem
  lacunas).

## 5. Heatmap

- Frequências corretas (mesma contagem de `fn_frequencia`).
- Texto fixo para ≥ 500 concursos: "variação ... exatamente o esperado pela
  teoria estatística (±61 aparições dentro de 2 desvios padrão)". No
  histórico completo, 5 das 25 dezenas estão fora de ±2 desvios (esperado
  ≈ 1,1), com extremos −107 e +88. A frase é afirmada sem testar os dados
  (LF-19).

## 6. Simulador de frequência aleatória

- Algoritmo correto (amostragem sem reposição uniforme).
- Compara as 5 dezenas mais frequentes do histórico real com as mesmas
  dezenas numa simulação. Essa comparação tem viés de seleção: os extremos
  reais deveriam ser comparados com os extremos da simulação. O padrão é
  1.000 concursos simulados contra 3.826 reais. A conclusão escrita
  ("variação natural") não é demonstrada pela tela e, para o histórico
  completo, é contrariada pelo item 4 (LF-20).

## 7. Destaques

- "Recorde de atraso" usa atraso ≥ maior atraso: correto como recorde ou
  empate (o texto diz "o maior já registrado" também no empate).
- **"Resultado incomum" (LF-21):** o critério é "a menor das 7 métricas tem
  < 15%". Aplicado aos 3.826 concursos reais, **85,6%** seriam chamados de
  "resultado incomum". É um problema de comparações múltiplas: com 7
  métricas, quase sempre alguma fica abaixo de 15%. Para a soma, "aconteceu
  em X%" é a frequência da **faixa de 10** e não do valor.

## 8. Acúmulos

- **Verificado:** reconstrução independente das 3.333 séries
  (concurso inicial, final, duração, ganhadores, prêmio): idênticas ao SQL.
  Duração média 1,148; máximo 4 concursos.
- **LF-22:** o filtro "≥ 7 sorteios" e a escala de cor (até 15) vieram de
  outra loteria. Na Lotofácil o filtro sempre mostra 0 resultados. Prêmios
  em valores nominais.

## 9. Fechamentos

- **Verificado:** as 18 combinações (pool 16–20 × garantia 11–14) com pool
  aleatório; verificador independente de cobertura (todos os k-subconjuntos
  do pool, por bitmask); validade (15 dezenas distintas do pool); ausência de
  duplicatas; fechamento completo = C(v,15).
- **Resultado:** 18/18 garantias corretas; nenhum jogo inválido ou
  duplicado. A garantia "se ≥ k das sorteadas estiverem no pool, algum jogo
  faz ≥ k" está demonstrada: escolha k sorteadas dentro do pool; algum jogo
  as contém.
- **Otimalidade:** pools 16 e 17 atingem o limite inferior de Schönheim
  (ótimos). Pools 18–20 usam 1,7× a 4,7× o limite (ex.: 19/14 = 1.888 jogos;
  limite 829). O limite não é necessariamente atingível, mas a ferramenta
  não é mínima, e a página não promete que seja.
- **Texto:** a probabilidade da condição aparece para o reduzido (correta,
  conferida); o callout explica que é condicional. Ressalva LF-23: o rótulo
  "Completo (… garante o prêmio máximo)" não traz a condição nem a
  probabilidade (pool 18: 15 acertos só se as 15 sorteadas estiverem nas 18,
  1 em 4.006).

## 10. Bolão

- `OPCOES_BOLAO.lotofacil`: os 18 totais conferem com a saída real do
  algoritmo (item 9). `planosViaveis` é aritmética simples.
- `conferirBolao`: soma o prêmio de cada jogo de 15; divide por cota com
  arredondamento para baixo. Os centavos que sobram não são mostrados
  (LF-24, baixo).
- O bolão do site é um organizador próprio, não o bolão oficial da Caixa;
  as regras oficiais (2–7 cotas para 15 números, cota mínima R$ 4,50) não se
  aplicam diretamente. Ver Fase 5.

## 11. Gerador de jogos

- **Sem filtros (200 mil jogos):** 0 inválidos; χ² da frequência = 18,8 com
  24 gl (uniforme); soma média 195,08 e variância 325,8 (teoria: 195 e 325).
  A amostragem por rejeição preserva a distribuição uniforme condicional.
- **Modo simples com os dados reais de hoje (20 mil jogos):** 100% atendem
  soma, pares e primos.
- **LF-25:** a dezena 20 está entre as 10 mais atrasadas (vira
  "obrigatória") e é a mais frequente do histórico ("excluída"). Em 28% dos
  jogos ela entra mesmo assim. O jogo sai marcado como "atendeu todos os
  filtros", mas viola a exclusão anunciada. O código não trata o conflito
  entre obrigatória e excluída.
- **LF-26:** quando nenhuma das 500 tentativas atende os filtros, devolve a
  1ª tentativa (não a melhor) com o selo "Filtros parcialmente atendidos",
  que pode não atender nenhum filtro. A função aceita dezena obrigatória
  duplicada e devolve 14 dezenas distintas. A tela usa `Set`, então isso não
  acontece pela interface; fica o risco latente na biblioteca.
- Vários jogos (até 10) não são checados contra repetição entre si;
  probabilidade desprezível sem filtros.

## 12. Gerador "Data da sorte"

- 15 dezenas distintas em 1..25; reprodutível (mesma data → mesmo jogo).
  Fisher-Yates correto.

## 13. Simulador histórico

- **LF-04 (comprovado):** o custo usa R$ 3,50 em todos os concursos. O
  prêmio de 11 acertos sempre foi 2× o preço da aposta, e a série real
  mostra 7 eras: R$ 2 (desde o nº 1), 2,50 (nº 460), 3 (nº 1054), 4
  (nº 1213), 5 (nº 1889), 6 (nº 2801) e 7 (nº 3439). Isso implica preços de
  R$ 1,00 / 1,25 / 1,50 / 2,00 / 2,50 / 3,00 / 3,50 (a confirmar em fonte
  oficial). Em 2.000 jogos aleatórios no histórico completo (Premium), o
  retorno médio mostrado é **25,0%**; com o preço de cada época seria
  **40,1%**. Na mediana: 16,2% x 26,0%. A página diz o contrário do código:
  "quanto teria gasto (o preço do bilhete em cada concurso)". No plano
  grátis (últimos 100 concursos, todos a R$ 3,50) não há distorção.
- **LF-05:** 493 concursos tiveram a faixa de 15 sem ganhador. Se o jogo
  simulado tivesse 15 acertos num deles, o simulador conta R$ 0 e nem
  registra o acerto. A tela não avisa.
- LF-06 descartado: todos os 3.826 concursos têm as 5 faixas de premiação
  (o JOIN interno não perde nada hoje).
- Faixas por regex: as 5 descrições são uniformes ("15 acertos" …
  "11 acertos") em todo o histórico.
- **Dado estranho:** o concurso 3780 (Independência, 15/09/2026) tem os
  prêmios fixos pela metade (R$ 3,50 / 7 / 17,50). Pode ser a regra de
  prêmio fixo insuficiente (ficha R13) ou um erro de importação. Fica para a
  Fase 3.

## 14. Conferidor

- Pontuação por interseção (`fn_conferir_jogo`); faixa por regex sobre as
  descrições uniformes; aceita só 15 dezenas, distintas, em 1..25.
- Retorno financeiro: custo = concursos × preço **digitado** (um único preço
  para todo o histórico, mesmo problema conceitual de LF-04, mas a escolha é
  do usuário); faixa acumulada vira "não calculável" e a tela mostra a
  contagem (melhor que o simulador).

## 15. Índice de Equilíbrio

- **Verificado:** reimplementação da nota com as distribuições históricas
  reais, aplicada às 3.268.760 combinações e aos 3.826 sorteios.

| Classe | Todas as combinações | Sorteios reais |
|---|---|---|
| Típico (≥ 75) | 93,7% | 94,2% |
| Equilibrado (55–74) | 6,1% | 5,7% |
| Razoável (35–54) | 0,2% | 0,1% |
| Atípico (< 35) | 0,0% | 0,0% |

  31,6% de todas as combinações tiram nota **100**. Com o teto de 12%, toda
  métrica cujo valor ocorre em ≥ 12% dos concursos vale 100. As classes não
  discriminam nada (LF-27), e os pesos não têm fundamento (LF-08).
- A métrica de soma usa a faixa de 10 do histograma, mas a tela diz "X% dos
  sorteios históricos têm este valor".
- A action do servidor não valida quantidade, faixa nem duplicidade das
  dezenas (impacto baixo: só gera nota sem sentido para quem chama a action
  diretamente).

## 16. Calculadoras

- **Probabilidade (LF-28):** fórmula correta (C por logaritmo, exata para
  N = 25), mas aceita até 25 dezenas na Lotofácil (o máximo oficial é 20):
  com 25 dezenas mostra "100%" para 15 acertos.
- **Valor esperado (LF-29):** o exemplo "Lotofácil (15 pontos)" calcula o
  retorno só pela faixa de 15 (R$ 1,5 mi ÷ 3.268.760 = R$ 0,46 por R$ 3,50,
  13%). Ignora os prêmios fixos (R$ 0,90 por aposta) e os 14 acertos. O
  retorno real esperado fica perto de 43,79% (≈ R$ 1,53). O exemplo ensina
  um número errado.
- **Custo de aposta múltipla:** igual à tabela oficial.

## O que ainda falta (não coberto nesta fase)

- Ler `lib/resumo-concurso.ts`, `lib/links-concurso.ts` e
  `lib/analise-concurso.ts` além da parte de percentuais (já coberta por
  `compararComHistorico` = mesmas tabelas); `lib/carteira.ts` (preço fixo,
  mesmo problema de LF-04); OCR. Ficam para a Fase 5, junto dos textos.
- A validação dos dados contra a Caixa (Fase 3) pode mudar as conclusões de
  LF-18 e do concurso 3780.
