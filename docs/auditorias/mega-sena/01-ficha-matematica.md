# 01 — Ficha matemática da Mega-Sena

Auditoria matemática, estatística e funcional — LotoAnalítica
Modalidade: **Mega-Sena** · Fase 1 (mapeamento) · 11/11/2026
Código auditado: `origin/main` em `762b4c2` (já inclui as correções da
Lotofácil, PRs #70 e #71), no branch `auditoria/mega-sena`.

Esta ficha é a referência contra a qual as ferramentas serão validadas nas
próximas fases. Cada regra traz a fonte e a consequência matemática. Itens
**PENDENTE** não foram confirmados em fonte oficial e não podem ser usados
como verdade até a validação.

---

## 1. Fontes

| ID | Fonte | Situação |
|----|-------|----------|
| F1 | Página oficial da Caixa — <https://loterias.caixa.gov.br/Paginas/Mega-Sena.aspx> (lida em 11/11/2026; regras de premiação conferidas frase a frase) | Usada |
| F2 | API oficial de resultados da Caixa (`servicebus2.caixa.gov.br/portaldeloterias/api/megasena`, fonte do `importador.py`) | Fase 3 (pulada a pedido) |
| F3 | Banco de produção, somente leitura (tabelas `loteria`, `concurso`, `premiacao_faixa`), 11/11/2026 | Usada |
| F4 | Volante físico ou tela de aposta oficial (disposição da grade) | **Não obtida** (PENDENTE, ver R20) |
| F5 | Regulamento/portaria formal da modalidade | **Não localizado** (PENDENTE) |
| F6 | Notícias de reajuste de preço (tnh1, bnldata, seudinheiro, itatiaia) | Usadas só para o histórico de preços, marcadas como não oficiais |

---

## 2. Regras oficiais vigentes

| # | Regra | Valor | Fonte | Consequência matemática |
|---|-------|-------|-------|-------------------------|
| R1 | Universo | 60 números no volante | F1; F3 (`dezena_min=1`, `dezena_max=60`) | N = 60 |
| R2 | Intervalo | 01 a 60 | F3 | Sem zero; `dezenaMax = N` |
| R3 | Números por aposta | mínimo 6, máximo 20 | F1 | b ∈ {6,…,20} |
| R4 | Números sorteados | 6 por concurso | F1; F3 (`qtd_dezenas_sorteadas=6`) | m = 6 |
| R5 | Elementos especiais | Nenhum (sem trevo, mês, time, 2º sorteio) | F1 | Só a interseção decide o prêmio |
| R6 | Faixas | Sena (6), Quina (5), Quadra (4) | F1; F3 (3 faixas em todos os 3.084 concursos, "6/5/4 acertos") | 3 faixas; 0–3 acertos não pagam |
| R7 | Prêmios fixos | **Nenhum** — as 3 faixas são rateio | F1 | Valor de cada faixa depende da arrecadação e do nº de ganhadores; não há como deduzir o preço histórico pelos prêmios (diferente da Lotofácil) |
| R8 | Prêmio bruto | 43,79% da arrecadação | F1 | Teto teórico de retorno: 43,79% |
| R9 | Rateio (concurso normal) | 40% Sena; 10% Quina; 10% Quadra; 25% acumulam para a Sena dos concursos de **final 0 ou 5**; 15% acumulam para a Sena do **último concurso especial** (Virada) | F1 (citação literal) | Só 60% do bruto (26,27% da arrecadação) é pago no próprio concurso; concursos de final 0/5 recebem uma reserva extra |
| R10 | Acúmulo | "Não havendo acertador em qualquer faixa, o valor acumula para o concurso seguinte, na respectiva faixa" | F1 | Vale para Quina e Quadra também (nos dados, nunca aconteceu: F3) |
| R11 | Mega da Virada | Concurso especial; 90% Sena, 5% Quina, 5% Quadra; sem sena, o prêmio é rateado entre os acertadores de 5; depois de 4 | F1 | A Virada não acumula na Sena; regras de série temporal (acúmulos, projeção) precisam tratá-la à parte |
| R12 | Mega 30 Anos | Concurso especial com regras próprias ("final zero ou cinco" citado) | F1 | **PENDENTE**: concurso e data não identificados no banco |
| R13 | Preço da aposta simples | R$ 6,00 | F1 | Tabela de preços R15 |
| R14 | Probabilidades oficiais | Tabela "1 em N" abaixo | F1 | Conferida na seção 3 |
| R15 | Preço de aposta múltipla | C(b,6) × R$ 6,00 | F1 | 7 = R$ 42 … 15 = R$ 30.030 … 20 = R$ 232.560 (confere com F1) |
| R16 | Surpresinha | Sistema escolhe os números | F1 | Sem efeito na probabilidade |
| R17 | Teimosinha | 2, 3, 4, 6, 8, 9 ou 12 concursos | F1 | Sem efeito na probabilidade por concurso |
| R18 | Bolão | 2 a 100 cotas (6 números: máx. 8; 7 números: máx. 50); até 10 apostas por bolão, todas com a mesma quantidade de números; cota mínima R$ 7,00 (6 números), R$ 8,00 (7 a 9); tarifa de até 35% | F1 | Restrições para o organizador de bolão |
| R19 | Sorteios | Terças e quintas às 21h e domingos às 11h | F1 | 3 sorteios por semana (o código diz o mesmo: `lib/calendario.ts:33-37`) |
| R20 | Disposição do volante | O banco usa `grid_colunas = 6` (10 linhas × 6 colunas). **Não confirmado** com o volante oficial; a lembrança do auditor é de 6 linhas × 10 colunas (01–10 na primeira linha) | F3 | **PENDENTE e importante**: define moldura/centro, linhas e colunas e o desenho do heatmap. A *quantidade* de dezenas na moldura é 28 nas duas grades (2·10+2·4 = 2·6+2·8), mas o *conjunto* muda |
| R21 | Prescrição | 90 dias após o sorteio | F1 | Só texto |
| R22 | Imposto | A F1 não fala de imposto | — | A calculadora de imposto será conferida com a lei (Fase 5) |

### Tabela oficial de probabilidades (F1, "1 em N")

| Números | Preço | Sena | Quina | Quadra |
|---|---|---|---|---|
| 6 | R$ 6,00 | 50.063.860 | 154.518 | 2.332 |
| 7 | R$ 42,00 | 7.151.980 | 44.981 | 1.038 |
| 8 | R$ 168,00 | 1.787.995 | 17.192 | 539 |
| 9 | R$ 504,00 | 595.998 | 7.791 | 312 |
| 10 | R$ 1.260,00 | 238.399 | 3.973 | 195 |
| 11 | R$ 2.772,00 | 108.363 | 2.211 | 129 |
| 12 | R$ 5.544,00 | 54.182 | 1.317 | 90 |
| 13 | R$ 10.296,00 | 29.175 | 828 | 65 |
| 14 | R$ 18.018,00 | 16.671 | 544 | 48 |
| 15 | R$ 30.030,00 | 10.003 | 370 | 37 |
| 16 | R$ 48.048,00 | 6.252 | 260 | 29 |
| 17 | R$ 74.256,00 | 4.045 | 188 | 23 |
| 18 | R$ 111.384,00 | 2.697 | 139 | 19 |
| 19 | R$ 162.792,00 | 1.845 | 105 | 16 |
| 20 | R$ 232.560,00 | 1.292 | 81 | 13 |

---

## 3. Fórmulas fundamentais (derivadas das regras, não do código)

Notação: N = 60, m = 6, b = números apostados (6 ≤ b ≤ 20), k = acertos.

### 3.1 Espaço amostral

- Sorteios possíveis: C(60,6) = **50.063.860**, equiprováveis.
- Aposta de b números = C(b,6) apostas simples: 7 → 7; 8 → 28; 9 → 84;
  10 → 210; 12 → 924; 15 → 5.005; 20 → 38.760.

### 3.2 Acertos de uma aposta (hipergeométrica)

P(K = k) = C(6,k) · C(54, b−k) / C(60,b), para max(0, b−54) ≤ k ≤ min(6,b).

Justificativa: sorteio sem reposição, uniforme, aposta fixa. Binomial é
incorreta (as dezenas não são sorteadas de forma independente).

Aposta simples (b = 6):

| k | Combinações favoráveis | P | 1 em |
|---|---|---|---|
| 6 | 1 | 1,997×10⁻⁸ | 50.063.860 |
| 5 | 324 | 6,472×10⁻⁶ | 154.518,1 |
| 4 | 21.465 | 4,288×10⁻⁴ | 2.332,3 |
| qualquer prêmio | 21.790 | 4,352×10⁻⁴ | 2.297,6 |
| 3 (não paga) | 496.080 | 9,91×10⁻³ | 100,9 |
| 0 | 25.827.165 | 51,59% | 1,94 |

Média de acertos: E[K] = b·m/N = 6·6/60 = 0,6.

A coluna "1 em N" da Caixa para b > 6 é P(K = k) desta fórmula
(ex.: b = 20, sena = C(20,6)/C(60,6) = 38.760/50.063.860 → 1 em 1.291,6;
b = 20, quadra = C(6,4)·C(54,16)/C(60,20) → 1 em 13,2). A conferência de
todas as 45 células fica para a Fase 2.

### 3.3 Aposta múltipla — prêmios simultâneos

Com b números e k acertos, a aposta contém **C(k,j)·C(b−k, 6−j)** apostas
simples com j acertos. Ex.: 7 números e 6 acertos = 1 sena + 6 quinas;
8 números e 6 acertos = 1 sena + 12 quinas + 15 quadras. Conferidor,
simulador e bolão precisam somar todas as faixas.

### 3.4 Valor esperado

Não há prêmio fixo, então o valor esperado depende do rateio de cada
concurso. Teto: 43,79% do preço; pagos no próprio concurso normal, 26,27%
(R9). A parte restante vai para concursos de final 0/5 e para a Virada —
um apostador só de concursos "comuns" recebe, em média, menos que 43,79%.

### 3.5 Propriedades do volante (1–60)

| Categoria | Elementos | Qtde |
|---|---|---|
| Pares | 2,4,…,60 | 30 |
| Primos | 2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59 | 17 |
| Fibonacci (sem repetição) | 1,2,3,5,8,13,21,34,55 | 9 |
| Múltiplos de 3 | 3,6,…,60 | 20 |
| Moldura | depende de R20; 28 dezenas nas duas grades possíveis | 28 |
| Centro | idem | 32 |

Contagem por sorteio: hipergeométrica C(K,x)·C(60−K,6−x)/C(60,6).
Referência exata (% das 50.063.860 combinações; enumeração completa
feita nesta fase, script na seção 5):

| x | Pares (30) | Primos (17) | Fibonacci (9) | Múlt. 3 (20) | Moldura (28) |
|---|---|---|---|---|---|
| 0 | 1,186 | 12,177 | 35,973 | 7,667 | 1,810 |
| 1 | 8,540 | 32,687 | 42,229 | 26,287 | 11,263 |
| 2 | 23,812 | 33,525 | 17,970 | 34,684 | 27,151 |
| 3 | 32,925 | 16,762 | 3,494 | 22,498 | 32,457 |
| 4 | 23,812 | 4,293 | 0,321 | 7,549 | 20,285 |
| 5 | 8,540 | 0,532 | 0,013 | 1,239 | 6,282 |
| 6 | 1,186 | 0,025 | 0,0002 | 0,077 | 0,753 |

Maior sequência de consecutivos (enumeração): 1 → 57,905%; 2 → 38,883%;
3 → 3,042%; 4 → 0,163%; 5 → 0,0059%; 6 → 0,0001%.

### 3.6 Soma das 6 dezenas

- Mínimo 21 (1..6), máximo 345 (55..60), média 6 × 30,5 = **183**.
- Variância: m·σ²·(N−m)/(N−1), σ² = (60²−1)/12 = 299,92 →
  6 · 299,92 · 54/59 = **1.647**; desvio-padrão **40,58** (bate com a
  enumeração).
- Simétrica em torno de 183 (bijeção d → 61 − d).
- Percentis (enumeração): P5 = 116, P10 = 130, P25 = 155, P50 = 183,
  P75 = 211, P90 = 236, P95 = 250. Faixa 142–224: 68,51% das combinações.

### 3.7 Estatísticas entre concursos (sorteio justo)

- Cada dezena sai com probabilidade 6/60 = **0,1** por concurso.
- Frequência esperada em n concursos: 0,1n ± √(0,09n). Para n = 3.084:
  308,4 ± 16,7.
- Atraso: P(atraso ≥ g) = 0,9^g. Atraso médio esperado 9 concursos;
  atrasos de 30+ ocorrem com prob. 4,2% por dezena — **com 60 dezenas,
  é normal haver dezenas com atrasos longos**, e isso não muda a chance
  seguinte.
- Repetidas do concurso anterior: hipergeométrica b = 6 → P(0) = 51,59%,
  P(1) = 37,90%, P(2) = 9,48%, P(≥3) = 1,03%, média 0,6.
- Duque específico no mesmo concurso: C(58,4)/C(60,6) = 1/118 ≈ 0,847%.
  Trinca específica: 6·5·4/(60·59·58) ≈ 0,0584%. Existem 1.770 duques e
  34.220 trincas; com 3.084 concursos × 20 trincas cada = 61.680 saídas,
  espera-se ~1,8 saída por trinca — tabelas de "trincas quentes" na
  Mega-Sena são quase todas ruído.
- Ciclo (todas as 60 saírem): problema do colecionador com lotes de 6
  sem reposição. Valor esperado a calcular na Fase 2 (um artigo afirma
  "mais de 45").

### 3.8 Fechamentos

- Completo de v números: C(v,6) jogos; garante a sena **só se as 6
  sorteadas estiverem no pool**: P = C(v,6)/C(60,6) (v = 10: 1 em 238.399).
- Garantia "k se k": se ≥ k sorteadas no pool, algum jogo faz ≥ k.
  P(condição) = Σ_{j≥k} C(6,j)·C(54,v−j)/C(60,v).
- Com v ≤ 54 não há mínimo garantido de sorteadas no pool (pode ser 0).
- Nenhum fechamento muda a probabilidade das dezenas do pool.

### 3.9 Probabilidade de haver ganhador (acúmulo)

T apostas simples uniformes: P(≥1 sena) = 1 − (1 − 1/50.063.860)^T.
Apostas reais não são uniformes. Além disso, a arrecadação dividida pelo
preço inclui apostas múltiplas e a tarifa de bolão, e precisa ser ajustada
para concursos de final 0/5 e para a Virada.

---

## 4. Mudanças ao longo do tempo

Banco (F3): 3.084 concursos, nº 1 a 3.084 sem lacunas, de 11/03/1996 a
10/11/2026; 3 faixas em todos; nenhum concurso com tamanho, faixa ou
duplicidade inválidos; nenhuma data repetida.

| Mudança | Evidência | Afeta | Situação |
|---|---|---|---|
| Preço da aposta | R$ 2,50 (até 2015) → R$ 3,50 (24/05/2015) → R$ 4,50 (2019, data exata a confirmar) → R$ 5,00 (30/04/2023) → R$ 6,00 (julho/2025; 09 ou 10/07). **Antes de 2015: desconhecido** (F6, não oficial) | Simulador histórico, Conferidor (retorno), Carteira, relatórios | PENDENTE de fonte oficial; o código não tem eras de preço para a Mega-Sena (ver inventário) |
| Sorteios por semana | Dados: 1/semana (1996–2000, domingo e depois sábado); 2/semana (qua + sáb, 2001/2002–2022); transição em 2023; 3/semana (ter, qui, sáb) desde 2024; sábado → domingo 11h em 07/2026; "Mega-Semanas" extras (ex.: 26–30/10/2026, 5 sorteios) | Conversões "concursos → dias/anos"; recortes "últimos N" | Inferido dos dados (F3) |
| Máximo de números por aposta | Hoje 20 (F1); pode ter sido 15 no passado | Textos, simulador | PENDENTE |
| Percentuais de rateio (40/10/10/25/15) e prêmio bruto 43,79% | Só a regra atual foi lida | Textos, projeção | PENDENTE: datas de mudança |
| Mega da Virada | Regra especial desde 2009 (concurso 1140); 31/12 de 1998, 1999, 2005–2008 foram concursos comuns (dados F3: 2006–2008 acumularam) | Hub da Virada, acúmulos | Coerente com `CONCURSOS_VIRADA`; F3 mostra edição 2025 em 01/01/2026 (nº 2955) |
| Arrecadação | Ausente (0/nula) nos concursos 1–1076 | Projeção, ranking de arrecadação | Comprovado (F3) |

N = 60, m = 6 e as 3 faixas nunca mudaram, então combinatória e
estatísticas de dezenas valem para o histórico inteiro. O que muda são
valores em reais e a frequência de sorteios.

---

## 5. Evidência desta fase

- Script de referência independente (enumera as 50.063.860 combinações em
  ~3 s): `evidencias/fase1/ms-ref.mjs` (cópia do script usado).
- Consultas ao banco: `evidencias/fase1/*.sql` (somente SELECT).
