# 03 — Auditoria matemática da Mega-Sena

Fase 2 · 11/11/2026 · `origin/main` em `762b4c2`

Cada ferramenta foi validada contra uma **referência independente**
reconstruída a partir das regras (ficha `01-ficha-matematica.md`), e não
relendo a fórmula do código. Quando a ferramenta tem código próprio, ele foi
**executado** com parâmetros da Mega-Sena.

## Como reproduzir

Scripts em `evidencias/fase2/` (rodar dentro da pasta):

| Script | O que faz |
|---|---|
| `export.sql`, `fns.sql` | Exportam (somente SELECT) os 3.084 concursos e a saída de 24 funções SQL de estatística com `loteria_id = 2`. Gerar `ms_raw.json` e `ms_fns.json` com `supabase db query --linked -o json` |
| `hist.mjs` | Reconstrói todas as estatísticas históricas e compara com o SQL |
| `uniform.mjs` | Uniformidade das frequências (Monte Carlo) e ciclo esperado exato |
| `fech.ts` | Regenera a tabela do bolão, verifica garantias, confere 45 células de probabilidade contra a Caixa |
| `anal.ts` | Executa `analisar()` do Analisador |
| `equi.mjs` | Nota do Equilíbrio sobre as 50.063.860 combinações; regra dos Destaques sobre os 3.084 concursos |
| `ger.ts` | Gerador: validade, uniformidade, filtros, bordas, Data da sorte |
| `proj.mjs` | Calibra a Projeção de acúmulo com os concursos reais |
| `sim.mjs` | Retorno esperado exato de um jogo no simulador histórico |
| `acum.mjs` | Reconstrói os Acúmulos |
| `ts-loader.mjs` | Permite `node --import ./ts-loader.mjs arquivo.ts` (imports sem extensão e `@/`) |

Referência combinatória exata (enumeração completa): `../fase1/ms-ref.mjs`.

Preços por período usados como referência (notícias, não oficial; ficha,
seção 4): R$ 2,50 até 23/05/2015, 3,50, 4,50 (a partir de 10/11/2019,
data suposta igual à da Lotofácil), 5,00 (30/04/2023), 6,00 (09/07/2025).
Antes de 2015 o preço real era **menor** que R$ 2,50, então os retornos
"com preço da época" abaixo são um **limite inferior**.

---

## Resumo

| # | Ferramenta | Status | Problemas |
|---|---|---|---|
| 1 | Probabilidades (tabela por faixa) | APROVADO COM RESSALVAS | MS-16 |
| 2 | Conversão "anos de espera" | APROVADO | — |
| 3 | Projeção de acúmulo | REPROVADO | MS-05, MS-17 |
| 4 | Tabelas estatísticas (13 categorias, SQL) | APROVADO COM RESSALVAS | MS-06 (grade), MS-18, MS-12 |
| 5 | Heatmap | APROVADO COM RESSALVAS | MS-06 |
| 6 | Simulador de frequência aleatória | APROVADO | — |
| 7 | Analisador | REPROVADO | MS-01, MS-02 |
| 8 | Equilíbrio | REPROVADO | MS-15 |
| 9 | Destaques | REPROVADO | MS-14 |
| 10 | Gerador de jogos (modo simples e avançado) | APROVADO COM RESSALVAS | MS-16, MS-19 |
| 11 | Data da sorte | APROVADO | — |
| 12 | Fechamentos | APROVADO COM RESSALVAS | MS-20 |
| 13 | Bolão (tabela de planos, divisão) | APROVADO COM RESSALVAS | MS-20, MS-09 |
| 14 | Simulador histórico e comparador | REPROVADO | MS-03, MS-13 |
| 15 | Conferidor / pontuação | APROVADO COM RESSALVAS | — (só aposta de 6; ver LF-11) |
| 16 | Acúmulos | APROVADO COM RESSALVAS | MS-21 |
| 17 | Hub Mega da Virada (`lib/mega-da-virada.ts`) | APROVADO | — |
| 18 | Calc. probabilidade | REPROVADO | MS-07 |
| 19 | Calc. valor esperado | APROVADO COM RESSALVAS | MS-08 |
| 20 | Calc. custo de aposta múltipla | APROVADO | — |
| 21 | Relatórios PDF | REPROVADO | MS-04 |

Cálculos verificados: 45 células de probabilidade; 7 distribuições
combinatórias exatas (enumeração de 50.063.860 combinações); 21
estatísticas históricas; 20 planos de fechamento (com verificação
exaustiva da garantia); 6 casos do Analisador; 9 casos do gerador e 330 mil
jogos gerados; calibração da projeção em 1.309 concursos; retorno exato do
simulador em 3 períodos; 664 séries de acúmulo.

---

## 1. Combinatória e probabilidades

**Fórmula.** P(K = k) = C(6,k)·C(54,b−k)/C(60,b) (ficha 3.2).

**Verificação.** `calcularProbabilidades` executado para b = 6…20 e k = 4,
5, 6: **45 de 45** células iguais ao "1 em N" da Caixa, e erro relativo
< 10⁻¹² contra a fórmula independente. Para b = 6, 10 e 20, a soma de P(K = k)
de k = 0 a 6 é 1 (12 casas). `binomial` arredonda o resultado; o
maior valor usado na Mega-Sena é C(60,20) ≈ 4,19·10¹⁵, abaixo de 2⁵³, então
o inteiro é exato.

**Tela de Probabilidades** (`components/ProbabilidadesClient.tsx`): o campo
"Dezenas apostadas" vai de 6 a `6 + QTD_EXTRA_DEZENAS_MAX` = **11**. A
constante 5 foi pensada para a Lotofácil (15 + 5 = 20, o máximo oficial
dela). Na Mega-Sena o máximo oficial é 20: as linhas de 12 a 20 números da
tabela da Caixa não podem ser consultadas → **MS-16**. (O `max` do campo
só limita as setas; digitar um número maior ainda mostra o cálculo.)

**Anos de espera.** 50.063.860 / 3 sorteios por semana / 52 = 320.922 anos.
É o tempo médio até o primeiro acerto (média da geométrica = 1/p), correto
com a agenda atual. APROVADO.

**Calculadora de probabilidade** (`app/calculadoras/probabilidade-loteria`):
sem `max` para a Mega-Sena, o campo aceita de 6 a **60** dezenas e mostra,
por exemplo, para 55 dezenas "sena: 1 em 2" — aposta que não existe
→ **MS-07** (comprovado).

**Calculadora de custo**: 6 a 20, C(b,6) × R$ 6,00; confere com a tabela
de preços da Caixa (R$ 42 … R$ 232.560). APROVADO.

**Calculadora de valor esperado**: o exemplo "Mega-Sena (sena)" usa prêmio
de R$ 50 mi e 1 em 50.063.860 → valor esperado R$ 0,999 (16,6% do preço).
O cálculo está certo e o rótulo diz "(sena)", mas não avisa que Quina e
Quadra (20% do prêmio bruto = 8,76% da arrecadação) ficam de fora →
**MS-08** (baixo).

## 2. Projeção de acúmulo

Modelo (`lib/probabilidades.ts:213`): bilhetes = arrecadação do último
concurso ÷ R$ 6 × (1 + 0,2·acumulados, máx. 5); P(ganhador) = 1 − (1 − p)^bilhetes.

**Calibração** (`proj.mjs`, concursos com arrecadação desde 2016, preço da
época):

| Grupo | Concursos | P(ganhador) do modelo | Observada | Ganhadores do modelo | Observados |
|---|---|---|---|---|---|
| Normais | 1.048 | 20,5% | **16,6%** | 251 | 210 |
| Final 0 ou 5 | 251 | 23,6% | 21,5% | 72 | 78 |
| Virada | 10 | 99,6% | 100% | 69 | 107 |

- Nos concursos normais o modelo superestima a chance de haver ganhador
  (diferença de 3,9 p.p., ≈ 3,4 erros-padrão; n = 1.048). Causas
  plausíveis: arrecadação ÷ preço conta a tarifa do bolão e apostas
  múltiplas como bilhetes; apostas reais repetem números populares.
- O fator +20% por concurso acumulado **confere** com a Mega-Sena até ~7
  acumulados (razão observada 1,21 / 1,42 / 1,57 / 1,69 / 1,90 / 2,12 / 2,42
  contra 1,2 … 2,4) e **subestima** depois (10 acumulados: 3,61 x 3,00;
  11: 4,34 x 3,20). O fator parece ter sido calibrado na Mega-Sena — o que
  explica por que ficou errado na Lotofácil (LF-07).
- Regra oficial de final 0 ou 5 (25% do bruto reservado) ausente do
  código: os concursos de final 0/5 pagam mais (mediana do prêmio total da
  sena desde 2024: R$ 81,5 mi x R$ 53,9 mi nos demais). O próximo concurso
  (3085) é de final 5 e a projeção não sabe disso → **MS-05**.
- `ticketsMedios` = 80 mi (usado quando falta arrecadação); a mediana real
  desde 2024 é **9,7 mi** de apostas simples equivalentes (8× menor).

Status: REPROVADO (MS-05, MS-17).

## 3. Estatísticas históricas (Tabelas, Heatmap, entradas do Gerador)

`hist.mjs` reconstruiu as 21 estatísticas a partir dos dados brutos:
frequência (total e últimos 100), atraso, maior atraso, pares/ímpares,
primos, Fibonacci, múltiplos de 3, moldura (grade 10×6), maior sequência,
repetidas, soma (mín., máx., média, mediana), histograma de soma, linhas,
colunas, duques (top 400), trincas (quantidade e top 30), ciclos, ciclo
atual e sequência de concursos por dezena. **21 de 21 iguais ao SQL.**

- Integridade: 3.084 concursos, numeração contínua, nenhum inválido.
- LF-10 (maior atraso ignora o trecho inicial e o atraso corrente): sem
  efeito hoje na Mega-Sena (nenhuma dezena tem atraso atual ou inicial
  acima do maior atraso registrado). Maior atraso: 108; atraso atual
  máximo: 37.
- **Ciclos**: 65 fechados, média 47,4 concursos (mín. 27, máx. 83).
  Esperado exato por cadeia de Markov: **45,23** (simulação: 45,1; P5 = 30,
  P95 = 67). A diferença (≈ 1,5 erro-padrão) é compatível com o acaso. A
  frase do artigo "mais de 45" está correta.
- **Duques**: os 1.770 já saíram; o mais frequente, 43 vezes, contra 26,1
  esperadas por duque.
- **Uniformidade** (MS-18, informativo): χ² = 90,1 com 59 graus de
  liberdade; p de Monte Carlo = **0,0077** (31 de 4.000 simulações).
  Concentrado nos blocos 1–500 (χ² 69), 1001–1500 (73) e 2001–2500 (89).
  Com várias loterias e várias estatísticas testadas, um p desse tamanho
  pode ser acaso; não sustenta previsão. Pede a mesma investigação de dados
  do LF-18.
- **Grade** (MS-06, pendente): moldura, linhas e colunas estão corretas
  **para uma grade 10×6**. Se o volante oficial for 6×10, os números estão
  certos para um volante que não existe. A contagem por concurso na
  moldura não muda (28 dezenas nas duas grades), mas a lista de quais
  dezenas são "moldura", as 10 "linhas" e as 6 "colunas" mudam.
- Heatmap: esperado = concursos × 6/60 e desvio √(n·0,1·0,9), corretos.

Status: APROVADO COM RESSALVAS.

## 4. Analisador

Tabelas fixas da Mega-Sena x enumeração completa:

| Tabela | Situação |
|---|---|
| Pares, primos, Fibonacci, múltiplos de 3 | Conferem (arredondamento de 2 casas) |
| Maior sequência | Confere com tolerância de 0,1 p.p. (57,9 / 38,8 / 3,1 / 0,2); a Fase 4 achou 2 células mal arredondadas (38,8 → 38,9; 3,1 → 3,0) → **MS-22** |
| CDF da soma | Confere (diferença máxima 0,05 p.p.) |
| **Moldura** | **Errada nas pontas**: 0 na moldura 0,02% (exato 1,81%), 6 na moldura 2,52% (exato 0,75%) → **MS-01** |

`analisar()` executado (`anal.ts`):

| Jogo | Soma | Mostrado | Correto |
|---|---|---|---|
| 10 20 30 35 40 48 | 183 | "99,0% das combinações possíveis", Muito comum | 9,55% das combinações têm soma de 180 a 189 |
| 5 12 18 22 27 36 | 120 | 12,6%, rótulo **Raro** | 3,65% (faixa 120–129); com 12,6% a régua do próprio Analisador diria "Comum" |
| 8 9 10 11 14 15 | — | moldura 0: 0,02%, Raro | 1,81%, Incomum |

A "centralidade" (100 − 2·|50 − percentil|) continua sendo exibida como
porcentagem de combinações na Mega-Sena; a correção do LF-16 só roda para
a Lotofácil (`if (isLF && …)`) → **MS-02** (comprovado). Jogos com 7+
dezenas são recusados (correção LF-17, genérica): OK.

Status: REPROVADO.

## 5. Equilíbrio

Nota calculada com os pesos da Mega-Sena (soma 0,30; pares 0,25;
sequências 0,15; primos, Fibonacci, múltiplos de 3: 0,10; moldura 0) sobre
**todas** as 50.063.860 combinações (`equi.mjs`):

| Classe | Combinações | Sorteios reais |
|---|---|---|
| Típico (≥ 75) | **84,7%** | 85,1% |
| Equilibrado (≥ 55) | 14,8% | 14,2% |
| Razoável (≥ 35) | 0,5% | 0,7% |
| Atípico | **0,0%** | 0% |

- A classificação quase não discrimina: 5 em cada 6 jogos possíveis são
  "muito típicos" e nenhum é "atípico".
- **Nota 100 é impossível**: a maior faixa de soma tem 10,38% dos
  concursos, o que dá no máximo 86 pontos no critério de maior peso
  (teto de 12% herdado da Lotofácil). Nota máxima atingível: 96.
- Pesos "calibrados individualmente" sem nenhum registro da calibração;
  moldura com peso 0 sem justificativa.
→ **MS-15**. Status: REPROVADO.

## 6. Destaques

Regra (`lib/destaques.ts:141`): o concurso é "resultado incomum" quando a
característica mais rara tem frequência histórica < 15%. Na Mega-Sena a
soma é comparada em faixas de 10, e a maior faixa só tem 10,38% dos
concursos — **a soma sozinha já fica sempre abaixo de 15%**.

Resultado: **3.084 de 3.084 concursos (100%)** seriam anunciados como
"resultado incomum"; em 2.281 o "fato" escolhido é a soma (no máximo "isso já
aconteceu em 10,4% do histórico", mesmo para a faixa de soma mais comum)
→ **MS-14**. Status: REPROVADO.

## 7. Gerador de jogos e Data da sorte

`ger.ts` executou `gerarJogo` e `gerarJogoDaData`:

- 300.000 jogos sem filtro: nenhum inválido; χ² das frequências 62,5
  (59 gl; limite p = 0,01 é 87,2); soma média 183,02 e variância 1.646
  (teórico 183 e 1.647). Uniforme.
- Preset do modo simples com os dados reais (2 das 10 mais atrasadas,
  1 faltante do ciclo, exclui as 2 mais frequentes, soma, par/ímpar e
  primos mais comuns): 29.400 de 30.000 atenderam, **0 violações** entre os
  que dizem ter atendido. O preset desloca as dezenas: as atrasadas
  aparecem em ~30% dos jogos (sem filtro: 10%) e as 2 mais frequentes em
  0%. É o comportamento descrito na página (correção LF-36); não muda a
  chance.
- Faixa de soma "mais comum" = união das 3 maiores faixas de 10
  (180, 200 e 170) → **170–209**, que inclui 190–199, fora do top 3
  (**MS-19**, baixo).
- Caso impossível: devolve `atendeuTodosFiltros: false` com o filtro que
  falhou. Excluir 55 dezenas: erro claro. Obrigatória duplicada: jogo
  válido. 20 dezenas: válido.
- Campo "Dezenas no jogo" limitado a **11** (mesma constante da tela de
  Probabilidades) → **MS-16**.
- Data da sorte: reprodutível; 10.959 datas, χ² 67,1 (59 gl). OK.

## 8. Fechamentos e bolão

`fech.ts` gerou, para cada um dos 20 planos de `OPCOES_BOLAO.megasena`,
o fechamento com `gerarFechamentoReduzido` num pool aleatório e verificou a
garantia **com um verificador independente** (todos os k-subconjuntos do
pool):

- 20 de 20: número de jogos igual à tabela, garantia verdadeira, jogos
  válidos, sem duplicatas; tempo máximo 381 ms (16/5).
- Fechamento completo de 10: 210 jogos; sena garantida só se as 6
  sorteadas estiverem no pool (1 em 238.399).
- Probabilidade da condição "≥ k sorteadas no pool" (exibida pela
  ferramenta) confere com a hipergeométrica.
- **Eficiência** (MS-20): o algoritmo é guloso e fica bem acima da cota
  inferior de Schönheim nos pools maiores (16/5: 1.420 jogos x cota 728;
  14/5: 580 x 348). Para 12/5 o ótimo é conhecido: o sistema de Steiner
  S(5,6,12) cobre todos os 5-subconjuntos de 12 números com **132** jogos;
  o site sugere **226** (R$ 1.356 x R$ 792). Não é erro de garantia; é custo
  maior que o necessário, e a ferramenta não diz que não é ótima.
- Bolão: o organizador é um rateio entre amigos, não o bolão oficial da
  Caixa; não promete as regras da lotérica (2–100 cotas, até 10 apostas).
  Fica como oportunidade de explicar a diferença (MS-09, informativo).

## 9. Simulador histórico

- **Preço** (MS-03, comprovado): sem eras de preço para a Mega-Sena, o
  simulador cobra R$ 6,00 em todos os concursos desde 1996. A frase "ao
  preço de cada época" só aparece quando os preços variam, então a tela não
  mente, mas o custo está errado.
- **Referência de 43%** (MS-13): a tela compara o retorno do jogo com "a
  média histórica de ~43% para qualquer combinação". Retorno exato da média
  de todas as combinações neste simulador (`sim.mjs`):

| Período | Concursos | Com R$ 6 fixo (o que a tela usa) | Com preço da época |
|---|---|---|---|
| Histórico completo | 3.084 | **9,5%** | ≥ 16,8% |
| Desde 24/05/2015 | 1.377 | 14,4% | 19,3% |
| Desde 30/04/2023 | 497 | 16,3% | 18,1% |

  Os 43,79% são o prêmio bruto da regra, mas 25% dele vai para concursos de
  final 0/5 e 15% para a Virada, e a sena ficou sem ganhador em 2.420
  concursos (valor registrado R$ 0). Na Mega-Sena praticamente todo jogo
  sairá "abaixo da média de ~43%"; a comparação é falsa para esta loteria.
- Faixa acumulada: aviso explícito (correção LF-05, genérica). OK.

## 10. Conferidor, Acúmulos, Virada, relatórios

- **Pontuação** (`pontuarJogo`, `pontuarDraw`, `conferirBolao`): mesma
  interseção, faixa por descrição "N acertos" (as 3 faixas têm descrição
  única em todos os concursos). Testes existentes com o concurso 3056.
  Regra da Virada sem sena → Quina não precisa de lógica: o site usa o
  valor pago registrado (e nunca houve Virada sem sena).
- **Acúmulos** (`acum.mjs`): 664 séries, média 4,64 concursos, recorde 18
  (3060–3077), 164 séries de 7+ (o filtro "7+" faz sentido aqui). As 17
  Viradas encerram séries como se pagassem o acumulado da série, mas o
  prêmio delas vem da reserva especial (MS-21, baixo). "Prêmio" é o valor
  por ganhador; os 5 maiores prêmios totais são todos Viradas.
- **Hub da Virada**: `CONCURSOS_VIRADA` confere com o banco (17 edições,
  2009–2025, a de 2025 em 01/01/2026); `tabelaApostas` reproduz a tabela da
  Caixa (7 → 7.151.980 … 20 → 1.292); prêmio total = ganhadores × valor.
  APROVADO. (A lista "dezenas que mais saem na Virada" usa 17 edições —
  102 dezenas para 60 números; é descritiva, revisar o texto na Fase 5.)
- **Relatórios** (`app/api/relatorio`, `app/api/cron/relatorio`): R$ 5,00
  fixo (MS-04, comprovado).
