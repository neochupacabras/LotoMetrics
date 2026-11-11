# 01 — Ficha matemática da Lotofácil

Auditoria matemática, estatística e funcional — LotoAnalítica
Modalidade: **Lotofácil** · Fase 1 (mapeamento) · 11/11/2026

Esta ficha é a referência contra a qual todas as ferramentas serão validadas
nas fases seguintes. Cada regra traz a fonte e a consequência matemática.
Itens marcados **PENDENTE** não puderam ser confirmados em fonte oficial nesta
fase e não devem ser usados como verdade até a validação.

---

## 1. Fontes

| ID | Fonte | Situação |
|----|-------|----------|
| F1 | Página oficial da Caixa — <https://loterias.caixa.gov.br/Paginas/Lotofacil.aspx> (lida na íntegra em 11/11/2026, sem data de atualização visível) | Usada |
| F2 | API oficial de resultados da Caixa — `servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil` (fonte do importador, `importador.py`) | Será usada na Fase 3 |
| F3 | Banco de produção (tabela `loteria`, consulta somente leitura em 11/11/2026) | Usada para conferir parâmetros |
| F4 | Página de regras de sorteio da Caixa — `/Paginas/regras-sorteios.aspx` | **Não lida** (PENDENTE) |
| F5 | Regulamento/portaria formal da modalidade (normativo da Caixa/Ministério) | **Não localizado** (PENDENTE) |

Matérias jornalísticas encontradas na busca divergem entre si (preço de
R$ 3,00 x R$ 3,50, 43,35% x outras taxas) e **não** foram usadas como fonte.

---

## 2. Regras oficiais vigentes

| # | Regra | Valor | Fonte | Consequência matemática |
|---|-------|-------|-------|-------------------------|
| R1 | Universo de números | 25 números no volante | F1; F3 (`dezena_min=1`, `dezena_max=25`) | N = 25 |
| R2 | Intervalo numérico | 01 a 25 | F3 (a F1 não cita o intervalo literal) | Não há zero; `dezenaMax = N` vale aqui (não vale na Lotomania) |
| R3 | Números por aposta | mínimo 15, máximo 20 | F1 | b ∈ {15,…,20} |
| R4 | Números sorteados | 15 por concurso | F1; F3 (`qtd_dezenas_sorteadas=15`) | m = 15; o sorteio é um 15-subconjunto de {1..25} |
| R5 | Elementos especiais | Nenhum (sem trevo, mês, time ou 2º sorteio) | F1 | Só a interseção de conjuntos decide o prêmio |
| R6 | Faixas premiadas | 11, 12, 13, 14 e 15 acertos | F1 | 5 faixas; 0–10 acertos não pagam |
| R7 | Prêmios fixos | 11 = R$ 7,00 · 12 = R$ 14,00 · 13 = R$ 35,00 | F1 | Valor independe da arrecadação (com ressalva R10) |
| R8 | Prêmio bruto | 43,79% da arrecadação | F1 | Retorno teórico ao apostador ≤ 43,79% |
| R9 | Rateio (concurso normal) | Do prêmio bruto, menos os fixos: 62% → 15 acertos; 13% → 14 acertos; 10% → acúmulo para concursos de final 0; 15% → acúmulo para a Independência | F1 | 14 e 15 acertos são rateio (valor varia por concurso) |
| R10 | Rateio (concurso final 0) | 72% → 15; 13% → 14; 15% → Independência | F1 | Concursos com número terminado em 0 pagam mais na faixa 15 |
| R11 | Lotofácil da Independência | Setembro; volantes próprios; 30 dias de vendas; 87% → 15, 13% → 14; recebe os acumulados | F1 | Não acumula: sem ganhador de 15, o prêmio desce para 14, depois 13… até a 5ª faixa |
| R12 | Acúmulo (concurso normal) | Sem ganhador em qualquer faixa, o valor acumula para a faixa de 15 acertos do concurso seguinte | F1 | `qtd_ganhadores = 0` com `valor_premio = 0` é esperado nos dados |
| R13 | Prêmio fixo maior que o disponível | A F1 **não** diz o que acontece | — | PENDENTE |
| R14 | Preço da aposta simples | R$ 3,50 (15 números) | F1 | Ver tabela de preços abaixo |
| R15 | Preço de aposta múltipla | C(b,15) × R$ 3,50 | F1 (tabela) | 16 = R$ 56; 17 = R$ 476; 18 = R$ 2.856; 19 = R$ 13.566; 20 = R$ 54.264 |
| R16 | Surpresinha | O sistema escolhe os números | F1 | Sem efeito na probabilidade |
| R17 | Teimosinha | 2, 3, 4, 6, 8, 9, 12, 18 ou 24 concursos seguidos | F1 | Sem efeito na probabilidade por concurso |
| R18 | Bolão | Cota mínima R$ 4,50 (15 e 16 números); 2 a 7 cotas (15) … 2 a 100 cotas (20); tarifa de até 35% sobre a cota | F1 | Relevante para o otimizador de bolão |
| R19 | Dias e horário dos sorteios | A F1 não informa; o código assume seg–sex 21h + domingo 11h (`lib/calendario.ts:29-32`) | — | PENDENTE (afeta conversões "concursos → dias/anos") |

### Tabela oficial de probabilidades (F1, "1 em N")

| Acertos | 15 núm. | 16 núm. | 17 núm. | 18 núm. | 19 núm. | 20 núm. |
|---|---|---|---|---|---|---|
| 15 | 3.268.760 | 204.298 | 24.035 | 4.006 | 843 | 211 |
| 14 | 21.792 | 3.027 | 601 | 153 | 47 | 17 |
| 13 | 692 | 162 | 49 | 18 | 8 | 4,2 |
| 12 | 60 | 21 | 9 | 5 | 3,2 | 2,6 |
| 11 | 11 | 6 | 4 | 3 | 2,9 | 3,9 |

A tabela foi extraída de um texto achatado e remontada pela ordem; os valores
para 15 números e as células conferidas abaixo batem com a fórmula
independente da seção 3, o que confirma o mapeamento.

---

## 3. Fórmulas fundamentais (derivadas das regras, não do código)

Notação: N = 25, m = 15 (sorteadas), b = números apostados (15 ≤ b ≤ 20),
k = acertos.

### 3.1 Espaço amostral

- Sorteios possíveis: C(25,15) = **3.268.760**, todos equiprováveis (sorteio
  sem reposição, ordem irrelevante).
- Uma aposta de b números equivale a C(b,15) apostas simples:
  16 → 16; 17 → 136; 18 → 816; 19 → 3.876; 20 → 15.504.

### 3.2 Acertos de uma aposta (hipergeométrica)

A quantidade de acertos de uma aposta fixa de b números contra um sorteio
uniforme é hipergeométrica: população N = 25, "sucessos" m = 15, amostra b.

P(K = k) = C(15,k) · C(10, b−k) / C(25, b)

Suporte: max(0, b−10) ≤ k ≤ min(15, b). Para b = 15: **5 ≤ k ≤ 15**
(é impossível acertar menos de 5). Justificativa do modelo: o sorteio é sem
reposição e uniforme; a aposta é fixa. Binomial seria incorreta (as dezenas
não são sorteadas de forma independente).

Aposta simples (b = 15), verificada por cálculo independente:

| k | Combinações favoráveis | P | 1 em |
|---|---|---|---|
| 15 | 1 | 3,06×10⁻⁷ | 3.268.760 |
| 14 | 150 | 4,59×10⁻⁵ | 21.791,7 |
| 13 | 4.725 | 1,446×10⁻³ | 691,8 |
| 12 | 54.600 | 1,670×10⁻² | 59,87 |
| 11 | 286.650 | 8,769×10⁻² | 11,40 |
| qualquer prêmio | 346.126 | 0,10589 | 9,44 |

Média de acertos: E[K] = b·m/N = 15·15/25 = 9.

### 3.3 Aposta múltipla — prêmios simultâneos

Uma aposta de b números com k acertos contém, entre as suas C(b,15) apostas
simples, exatamente **C(k,j) · C(b−k, 15−j)** apostas com j acertos. Ex.:
16 números e 15 acertos = 1 prêmio de 15 + 15 prêmios de 14. Qualquer
ferramenta que confira ou simule apostas múltiplas precisa somar todas as
faixas simultâneas, não só a maior.

A coluna "1 em N" da Caixa para b > 15 é P(K = k) da fórmula 3.2 (conferido:
20 números, 15 acertos = C(10,5)/C(25,20) = 252/53.130 → 1 em 210,8; 20 números,
11 acertos = C(15,11)·C(10,9)/53.130 → 1 em 3,89). Ou seja, é a
probabilidade do **número de acertos da aposta**, não de "ganhar a faixa k"
como prêmio isolado.

### 3.4 Valor esperado (aposta simples, só a parte fixa)

E[prêmio fixo] = (286.650·7 + 54.600·14 + 4.725·35) / 3.268.760 = **R$ 0,898**
por aposta de R$ 3,50 (25,7% do preço). O restante do retorno vem do rateio de
14 e 15 acertos e só pode ser estimado com a arrecadação e o número de
ganhadores de cada concurso. Teto teórico do retorno: 43,79% (R8).

### 3.5 Propriedades do volante (5 × 5)

| Categoria | Elementos | Qtde |
|---|---|---|
| Pares | 2,4,…,24 | 12 |
| Ímpares | 1,3,…,25 | 13 |
| Primos | 2,3,5,7,11,13,17,19,23 | 9 |
| Fibonacci (sem repetição) | 1,2,3,5,8,13,21 | 7 |
| Múltiplos de 3 | 3,6,…,24 | 8 |
| Moldura (borda 5×5) | 1–5, 6, 10, 11, 15, 16, 20, 21–25 | 16 |
| Centro | 7,8,9,12,13,14,17,18,19 | 9 |

Para qualquer categoria com K elementos, a contagem dentro de um sorteio é
hipergeométrica: P(X = x) = C(K,x)·C(25−K,15−x)/C(25,15).

Referência exata (em % de todas as combinações; calculada nesta fase):

| x | Pares (K=12) | Primos (K=9) | Fibonacci (K=7) | Múlt. 3 (K=8) | Moldura (K=16) |
|---|---|---|---|---|---|
| 0 | — | 0,0000 | 0,025 | 0,004 | — |
| 1 | — | 0,033 | 0,655 | 0,166 | — |
| 2 | 0,002 | 0,617 | 5,504 | 2,039 | — |
| 3 | 0,087 | 4,677 | 19,877 | 10,601 | — |
| 4 | 1,181 | 16,837 | 34,075 | 26,503 | — |
| 5 | 6,930 | 30,868 | 28,112 | 33,318 | — |
| 6 | 20,211 | 29,398 | 10,412 | 20,824 | 0,245 |
| 7 | 31,183 | 14,174 | 1,339 | 5,950 | 3,150 |
| 8 | 25,986 | 3,150 | — | 0,595 | 14,174 |
| 9 | 11,549 | 0,245 | — | — | 29,398 |
| 10 | 2,599 | — | — | — | 30,868 |
| 11 | 0,262 | — | — | — | 16,837 |
| 12 | 0,009 | — | — | — | 4,677 |
| 13 | — | — | — | — | 0,617 |
| 14 | — | — | — | — | 0,033 |
| 15 | — | — | — | — | 0,0005 |

### 3.6 Soma das 15 dezenas

- Mínimo 120 (1..15); máximo 270 (11..25); média 15 × 13 = **195**.
- Variância (amostragem sem reposição): m·σ²·(N−m)/(N−1), com σ² = (25²−1)/12
  = 52 → 15 · 52 · 10/24 = **325**; desvio-padrão ≈ **18,03**.
- Distribuição simétrica em torno de 195 (a troca d → 26 − d leva um jogo de
  soma s a outro de soma 390 − s, uma bijeção entre combinações).

### 3.7 Estatísticas entre concursos (sob a hipótese de sorteio justo)

- Cada dezena sai com probabilidade 15/25 = **0,6** por concurso.
- Frequência esperada em n concursos: 0,6n; desvio-padrão √(0,24n). Para
  n = 3.826: 2.295,6 ± 30,3.
- Atraso (concursos seguidos sem sair): P(atraso ≥ g) = 0,4^g. Atraso de 5 já
  ocorre com prob. 1%; atrasos longos são raros, mas **não** tornam a saída
  mais provável no concurso seguinte (concursos independentes).
- Repetidas do concurso anterior: mesma hipergeométrica da seção 3.2 com
  b = 15 → média 9, suporte 5..15.
- Duque específico no mesmo concurso: C(23,13)/C(25,15) = 0,35. Trinca
  específica: (15·14·13)/(25·24·23) ≈ 0,1978. Existem C(25,2) = 300 duques e
  C(25,3) = 2.300 trincas.
- Ciclo (todas as 25 saírem ao menos uma vez): distribuição a calcular na
  Fase 2 (cadeia de Markov sobre "dezenas ainda faltantes").

### 3.8 Fechamentos (desdobramentos)

- Fechamento completo de um pool de v números: C(v,15) jogos; garante 15
  acertos **somente se as 15 sorteadas estiverem no pool**.
- Garantia "k se k": todo k-subconjunto do pool contido em algum jogo. Se ao
  menos k sorteadas estiverem no pool, algum jogo faz ≥ k. A condição tem
  probabilidade P(|S ∩ pool| ≥ k) = Σ_{j≥k} C(15,j)·C(10,v−j)/C(25,v).
- Número mínimo de sorteadas dentro de um pool de v números: v − 10 (para
  v = 18, ao menos 8). Isso é certo; acima disso, é probabilístico.
- Nenhum fechamento aumenta a probabilidade de as dezenas do pool serem
  sorteadas.

### 3.9 Probabilidade de haver ganhador (acúmulo)

Se T apostas simples independentes e **uniformes** forem feitas,
P(≥ 1 ganhador de 15) = 1 − (1 − 1/3.268.760)^T. Ressalva: apostas reais não
são uniformes (números populares, repetição de jogos); o modelo é um limite
teórico, não uma previsão.

---

## 4. Regras que mudaram ao longo do tempo (PENDENTE de validação)

O banco tem 3.826 concursos (do nº 1 ao nº 3826, sem lacunas na numeração;
último em 10/11/2026). Mudanças que podem afetar a leitura do histórico:

| Mudança | Afeta | Situação |
|---|---|---|
| Preço da aposta (subiu várias vezes desde 2003; R$ 3,50 é o atual) | Simulador histórico, Conferidor (retorno), Carteira | PENDENTE: levantar datas e valores oficiais |
| Valor dos prêmios fixos (11/12/13 acertos) | Simulador, textos | Verificável nos próprios dados: o `valor_premio` das faixas 3–5 ao longo do tempo mostra cada reajuste (Fase 3) |
| Percentual do prêmio bruto (o site cita 43,35%; a Caixa hoje diz 43,79%) | Textos de dicas | PENDENTE: data da mudança |
| Regras de rateio e acúmulo (final 0, Independência) | Projeção de acúmulo, Acúmulos | PENDENTE: data de início de cada regra |
| Dias de sorteio por semana | Conversões de concursos em dias/anos | PENDENTE |

Nenhuma mudança conhecida alterou N = 25, m = 15 ou as faixas 11–15, então
toda a combinatória e as estatísticas de dezenas valem para o histórico
inteiro. O que muda de período para período são **valores em reais**.
