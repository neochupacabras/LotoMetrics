# 08 — Relatório final: auditoria da Mega-Sena

LotoAnalítica · 12/11/2026 · código `origin/main` em `762b4c2` (já com as
correções da Lotofácil, PRs #70 e #71) · histórico até o concurso 3084
(10/11/2026)

## A. Resumo executivo

**Situação geral.** O núcleo matemático da Mega-Sena está certo:
probabilidades (45 de 45 células iguais à Caixa), as 21 estatísticas
históricas calculadas pelo banco, as garantias dos 20 planos de fechamento
e o gerador passaram em verificações independentes. Os problemas estão em
três camadas acima desse núcleo:

1. **Correções da Lotofácil que não chegaram à Mega-Sena.** O simulador,
   o Analisador e os limites de dezenas foram corrigidos com casos
   especiais da Lotofácil; a Mega-Sena continua com os mesmos defeitos
   (MS-01, MS-02, MS-03, MS-07, MS-16).
2. **Critérios calibrados para a Lotofácil.** Destaques chama de
   "incomum" 100% dos concursos da Mega-Sena; o Equilíbrio marca 85% das
   combinações como "típicas"; o simulador compara o jogo com uma média de
   ~43% que, na Mega-Sena, é 9,5%.
3. **Textos.** Artigos com fatos errados sobre a própria Mega-Sena (regra
   de rateio, recorde de acúmulo, chance de ganhador, dias de sorteio) e
   uma grade de volante que não é a oficial.

| Medida | Quantidade |
|---|---|
| Ferramentas auditadas | 21 (+ 13 tabelas, 17 telas publicadas, hub da Virada, imprensa, Quiz e ~40 frases numéricas em artigos) |
| Verificações matemáticas | 45 células de probabilidade · 15 preços · 7 distribuições exatas e 325 valores de CDF · 21 saídas SQL · 33 definições de função · 20 fechamentos verificados exaustivamente · 664 séries de acúmulo · backtest da projeção em 1.309 concursos · retorno exato do simulador em 3 períodos · 2 concursos contra a API da Caixa |
| Enumerações completas | 50.063.860 combinações (referência da ficha, Equilíbrio e suíte de testes) |
| Testes automatizados | 110 passando, 16 `todo` (5 `it.fails` documentam bugs) |
| Scripts de evidência | 17 (`evidencias/fase1`, `fase2`) |

| Gravidade | Problemas |
|---|---|
| CRÍTICO | 0 |
| ALTO | 6 |
| MÉDIO | 14 |
| BAIXO | 11 |
| INFORMATIVO | 5 |
| PENDENTE (fonte) | 1 |
| **Total** | **37** |

Nenhum problema foi classificado como crítico: não achei promessa de
garantia impossível nem cálculo de probabilidade errado. Os altos induzem o
usuário a conclusões falsas sobre o histórico ou sobre o retorno.

**Principais riscos**

1. **MS-14 — Destaques:** todo concurso é anunciado como "resultado
   incomum", o que ensina ao usuário que resultados comuns são raros.
2. **MS-13 / MS-03 — Simulador:** cobra R$ 6 desde 1996 e compara com uma
   média de ~43% que ninguém atinge na Mega-Sena; o usuário conclui que o
   seu jogo foi "abaixo da média" quando ficou na média.
3. **MS-02 — Analisador:** a soma mais comum aparece como "99,0% dos jogos
   possíveis têm esse padrão" (real 9,55%).
4. **MS-33 / MS-32 — Artigos:** regra de rateio errada (35/19/19 em vez de
   40/10/10 + reservas) e recorde de acúmulo inflado ("30, 40 e até mais";
   o real é 17).
5. **MS-06 — Grade:** o site usa duas grades diferentes para o mesmo
   volante; moldura, linhas e colunas descrevem uma grade que não é a do
   volante oficial.

**Avaliação geral da confiabilidade:** **cálculo central confiável;
ferramentas derivadas e textos ainda não.** A modalidade não pode ser
considerada validada.

## B. Ficha matemática

Ver `01-ficha-matematica.md`. Resumo: 60 números (1–60); aposta de 6 a 20;
6 sorteados; sem elementos especiais; faixas sena, quina e quadra, todas
por rateio; prêmio bruto 43,79% (40% sena, 10% quina, 10% quadra, 25%
reservados para concursos de final 0 ou 5, 15% para a Virada); Virada não
acumula (desce para a quina e a quadra); R$ 6,00 a aposta simples; 3
sorteios por semana (ter, qui 21h; dom 11h); C(60,6) = 50.063.860; soma
média 183, dp 40,58; ciclo esperado 45,2 concursos. Volante oficial em
6 linhas × 10 colunas.

## C. Inventário auditado

Ver `02-inventario-funcionalidades.md`: parâmetros, 25 ferramentas e
grupos de páginas, duplicações e a tabela de quais correções da Lotofácil
valem para a Mega-Sena.

## D. Resultados por funcionalidade

| Ferramenta | Como foi verificado | Status |
|---|---|---|
| Probabilidades (tabela) | 45 células x hipergeométrica e x Caixa; Σ = 1 | APROVADO COM RESSALVAS (MS-16) |
| "Anos de espera" | 1/p ÷ 3 ÷ 52 | APROVADO |
| Projeção de acúmulo | Backtest em 1.309 concursos | REPROVADO (MS-05, MS-17) |
| Tabelas estatísticas (SQL) | 21 reconstruções; 33 funções = repositório | APROVADO COM RESSALVAS (MS-06, MS-18, MS-25, MS-26, MS-36) |
| Heatmap | Esperado e dp; tela | APROVADO COM RESSALVAS (MS-06) |
| Simulador de frequência aleatória | Código e espaço amostral | APROVADO |
| Analisador | Enumeração completa; função executada; tela | REPROVADO (MS-01, MS-02, MS-22, MS-24) |
| Equilíbrio | Nota em todas as 50 mi de combinações | REPROVADO (MS-15) |
| Destaques | Regra aplicada aos 3.084 concursos; tela | REPROVADO (MS-14) |
| Gerador | 330 mil jogos, filtros, bordas | APROVADO COM RESSALVAS (MS-16, MS-19) |
| Data da sorte | Reprodutibilidade e uniformidade | APROVADO |
| Fechamentos | 20 planos com verificador próprio; Schönheim | APROVADO COM RESSALVAS (MS-20) |
| Bolão | Tabela regenerada; `planosViaveis`; texto | APROVADO COM RESSALVAS (MS-20, MS-23, MS-09) |
| Simulador histórico | Retorno exato; preço; tela | REPROVADO (MS-03, MS-13) |
| Conferidor / pontuação | Concurso 3084, 0–6 acertos | APROVADO COM RESSALVAS (só aposta de 6) |
| Acúmulos | 664 séries reconstruídas | APROVADO COM RESSALVAS (MS-21, MS-37) |
| Recordes | Todos os números x banco | APROVADO |
| Inéditas | 28.479 de 34.220 trincas | APROVADO |
| Hub da Virada e imprensa | Edições, prêmios, tabela de apostas | APROVADO COM RESSALVAS (MS-27, MS-28) |
| Calc. probabilidade | Limites | REPROVADO (MS-07) |
| Calc. valor esperado | Cálculo e rótulo | APROVADO COM RESSALVAS (MS-08) |
| Calc. custo de aposta múltipla | 15 preços | APROVADO |
| Relatórios PDF | Preço | REPROVADO (MS-04) |
| Artigos e dicas | ~40 frases numéricas | REPROVADO (MS-29 a MS-35) |
| Quiz | 8 afirmações da Mega-Sena | APROVADO COM RESSALVAS (MS-06) |

## E. Registro de problemas

Ver `06-problemas-encontrados.md` (37 itens, com arquivo, origem e
demonstração). Os altos: MS-02, MS-03, MS-13, MS-14, MS-32, MS-33.

## F. Plano de correção

Ver `07-plano-de-correcao.md`. Etapa 0: decisões e fontes (grade, preços
históricos, imposto, critérios de "incomum"). Etapa 1: textos (8 itens,
risco baixo). Etapa 2: cálculos (7 itens, cobertos por testes; corrigem
também as outras 7 loterias). Etapa 3: decisões de produto (Destaques,
Equilíbrio, Projeção, grade, fechamentos mínimos).

## G. Testes e evidências

`05-testes-evidencias.md`. Referência independente em
`lib/auditoria/mega-sena/referencia.ts`; 6 arquivos de teste (110 passando,
16 `todo`, 5 `it.fails`); `tsc` e `eslint` limpos. Scripts com dados de
produção em `evidencias/fase2/` (os JSON exportados não são versionados).

## H. Limitações

- **Fase 3 pulada** a pedido: só 2 concursos foram conferidos na API da
  Caixa (308 e 309); integridade interna completa.
- **Preços históricos** só por notícias; antes de 2015, desconhecidos. Os
  retornos "com preço da época" são limites inferiores.
- **Grade do volante**: confirmada por uma imagem oficial em baixa
  resolução e pelo próprio site; falta um volante físico.
- **Imposto** e "prêmio anunciado bruto ou líquido": fontes jornalísticas
  divergentes.
- **Mega 30 Anos**: regra lida, concurso não identificado.
- **Áreas logadas** (Premium: simulador completo, heatmap por período,
  modo avançado do gerador) foram verificadas pelo código e por execução,
  não pela tela.
- **Artigos**: lidas as frases com números da Mega-Sena; a leitura
  integral de todos os 107 trechos de `lib/analises.ts` não foi feita.

## I. Parecer final

- **A matemática da modalidade está correta?** No núcleo, sim:
  probabilidades, combinatória, estatísticas do banco, fechamentos e
  gerador. Não nas ferramentas derivadas: Analisador (soma e moldura),
  Projeção, simulador (preço e referência).
- **As ferramentas respeitam as particularidades da Mega-Sena?** Não
  totalmente. Limiares e textos herdados da Lotofácil (Destaques, Equilíbrio,
  Bolão, limite de 11 dezenas, "faltam apenas"), regra de final 0/5 e da
  Virada ausente da Projeção, grade do volante invertida.
- **Os dados históricos são confiáveis?** Integridade interna sem falhas e
  funções SQL idênticas ao repositório; conferência com a Caixa só
  amostral (2 concursos). Desvio da uniformidade (p = 0,0077) merece a
  verificação da Fase 3.
- **Há informações incorretas sendo exibidas?** Sim: 6 altas (Destaques,
  simulador, Analisador, dois artigos) e várias médias em artigos.
- **A modalidade pode ser considerada matematicamente validada?** Não.
- **O que resolver antes de considerá-la confiável?** Etapa 1 inteira
  (textos falsos), Etapa 2 itens 2.1 a 2.4 (Analisador, preço e referência
  do simulador) e a decisão 3.1 (Destaques). Com isso, nenhuma tela da
  Mega-Sena mostraria um número que a auditoria provou errado.
