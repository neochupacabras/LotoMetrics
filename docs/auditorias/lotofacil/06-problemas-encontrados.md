# 06 — Registro de problemas (Lotofácil)

Versão final (Fase 6, 11/11/2026; Fase 3 parcial). Atualizada com a Etapa 1 do
plano de correção (textos), publicada em 11/11/2026 (PR #70), e com a Etapa 2
(cálculos) no branch `fix/lotofacil-calculos`. Gravidades revisadas na
Fase 6: LF-39 subiu para CRÍTICO e LF-40 para ALTO. "Comprovado" = há demonstração reproduzível
(`03-auditoria-matematica.md` e `evidencias/fase2/`); "suspeita" = falta
demonstrar; "descartado" = verificado e não é problema.

Origem: **R** regra/fórmula · **P** parâmetro · **D** dados · **I**
implementação · **A** apresentação · **C** componente compartilhado.

| ID | Grav. | Status | Origem | Ferramenta | Resumo |
|---|---|---|---|---|---|
| LF-04 | ALTO | Corrigido (Etapa 2) | P/A | Simulador histórico | Custo a R$ 3,50 em todo o histórico; retorno médio mostrado 25% x 40% real (preço da época); a página afirma usar o preço de cada concurso |
| LF-01 | ALTO | Corrigido (Etapa 1) | D/A | Textos | Prêmios fixos R$ 5/10/25; vigentes R$ 7/14/35 |
| LF-02 | ALTO | Corrigido (Etapa 1) | D/A | Textos | 43,35% x 43,79% oficial (43,35% valeu até o concurso 3257, 30/11/2024; texto desatualizado) |
| LF-16 | ALTO | Corrigido (Etapa 2) | A | Analisador | Centralidade da soma apresentada como "% dos jogos possíveis com esse padrão" (soma 195: diz 97,8%, real 2,2%) |
| LF-29 | MÉDIO | Corrigido (Etapa 2) | R/A | Calc. valor esperado | Exemplo da Lotofácil ignora prêmios fixos e 14 acertos: mostra 13% de retorno (real ~44%) |
| LF-07 | MÉDIO | Comprovado | R/P | Projeção de acúmulo | Modelo superestima chance de ganhador (87,8% x 75,3%; 1.007 x 871 ganhadores); fator +20% sem calibração (real +70%); ignora final 0 e Independência |
| LF-27 | MÉDIO | Comprovado | R | Equilíbrio | 93,7% das combinações são "típico", 31,6% nota 100; classes não discriminam |
| LF-08 | MÉDIO | Comprovado | R | Equilíbrio | Pesos e teto de 12% sem fundamento; soma por faixa de 10 dita "este valor" |
| LF-21 | MÉDIO | Comprovado | R/A | Destaques | Critério marca 85,6% dos concursos como "resultado incomum" |
| LF-19 | MÉDIO | Corrigido (Etapa 1) | A | Heatmap | Texto fixo "exatamente o esperado (±2 dp)"; 5 de 25 dezenas fora de 2 dp |
| LF-25 | MÉDIO | Corrigido (Etapa 2) | I | Gerador (modo simples) | Dezena obrigatória (atrasada) e excluída (mais frequente) ao mesmo tempo: entra em 28% dos jogos marcados como "atendeu todos os filtros" |
| LF-03 | MÉDIO | Corrigido (Etapa 2) | P | Analisador | Caudas erradas nas tabelas fixas de primos, moldura, Fibonacci e múltiplos de 3 |
| LF-17 | MÉDIO | Corrigido (Etapa 2) | I/A | Analisador | Analisa jogos incompletos (1–14 dezenas) com distribuições de 15 |
| LF-05 | MÉDIO | Corrigido (Etapa 2) | I/A | Simulador | 15 acertos em concurso acumulado (493 concursos) vale R$ 0 e some do resultado, sem aviso |
| LF-18 | INFORMATIVO | Comprovado (estatística) | D? | Tabelas / textos | Histórico rejeita uniformidade das dezenas (χ² 56,6, 24 gl; Monte Carlo p = 0,0005), concentrado em 2003–09 e 2020–21; Fase 3 deve descartar erro de dados |
| LF-20 | BAIXO | Texto corrigido; comparação com viés de seleção mantida | R/A | Simulador de frequência | Compara extremos reais com as mesmas dezenas simuladas (viés de seleção); conclusão escrita não demonstrada |
| LF-15 | BAIXO | Corrigido (Etapa 2) | A | Projeção | Probabilidade ≥ 0,9995 aparece como "100,0%" |
| LF-23 | BAIXO | Comprovado | A | Fechamentos | "Completo … garante o prêmio máximo" sem condição nem probabilidade (pool 18: 1 em 4.006) |
| LF-28 | BAIXO | Corrigido (Etapa 2) | P | Calc. probabilidade | Aceita até 25 dezenas (máximo oficial 20) |
| LF-26 | BAIXO | Corrigido (Etapa 2) | I | Gerador | Sem solução, devolve a 1ª tentativa (não a melhor) como "parcialmente atendidos"; biblioteca aceita obrigatória duplicada (14 dezenas) |
| LF-22 | BAIXO | Comprovado | P/C | Acúmulos | Filtro "≥ 7 sorteios" e escala herdados de outra loteria; na Lotofácil o máximo é 4 |
| LF-09 | BAIXO | Corrigido (Etapa 2) | A | Probabilidades | "1 em N" arredondado para inteiro (4,22 → 4) |
| LF-10 | BAIXO | Comprovado (latente) | R | Atraso, Destaques, Recordes | "Maior atraso" ignora trecho inicial e atraso corrente; hoje sem efeito nos números |
| LF-24 | BAIXO | Comprovado | I/A | Bolão | Divisão por cota arredonda para baixo e os centavos restantes não aparecem |
| LF-11 | INFORMATIVO | Comprovado | — | Conferidor | Só confere apostas de 15 dezenas |
| LF-12 | INFORMATIVO | Comprovado | D | Esquema | `concurso.dezenas` sem CHECK; funções SQL sem migration (mas produção = `schema.sql`) |
| LF-13 | INFORMATIVO | Comprovado | — | Código | `percFaixa1` sem uso e diferente da regra; Markov sem uso e sem SQL em produção |
| LF-14 | — | Descartado | — | Calendário | Dados confirmam 6 sorteios/semana (seg–sex + dom desde 08/2026), igual ao código |
| LF-30 | PENDENTE | Suspeita | D | Dados | Concurso 3780 (Independência 2026) com prêmios fixos pela metade |
| LF-31 | PENDENTE | Suspeita | D/R | Projeção | `valor_acumulado_proximo` preenchido antes de concursos de final 5; a regra oficial lida cita só final 0 |
| LF-32 | PENDENTE | Suspeita | D | Dados | Concursos 3715 e 3716 com a mesma data (20/06/2026) |
| LF-33 | MÉDIO | Comprovado (dados) | R/A | Textos, projeção | Faixa 15 recebe ~43,4% de (bruto − fixos) nos concursos normais desde 2020, não os 62% citados (página da Caixa e artigo); regra oficial a confirmar |
| LF-34 | INFORMATIVO | Comprovado | D | Dados | Arrecadação ausente (0) nos concursos 1–428 |
| LF-38 | ALTO | Corrigido (Etapa 1) | A | Equilíbrio (tela + artigo) | Método descrito como "combinatória pura, não o histórico", "pesos iguais", "alta acima de 70"; o código usa o histórico, pesos 25/20/15/10 e classes 75/55/35 |
| LF-39 | CRÍTICO | Corrigido (Etapa 1) | R/A | Artigos de fechamento | Promete coberturas impossíveis: 16 dezenas/14 pts em 5–8 jogos (mínimo 15), 17/14 em 15–20 (mín. 64), 18/13 em 40–60 (mín. 114), 20/13 em 150–200 (mín. 904), 18/12 em 40–60 (mín. 71); tela de fechamentos diz 156 jogos (o algoritmo gera 164) |
| LF-36 | MÉDIO | Corrigido (Etapa 1) | A | Gerador | Página diz que o modo simples é "puramente aleatório — qualquer combinação com a mesma probabilidade", mas ele aplica atrasadas, ciclo, exclusões, soma, par/ímpar e primos |
| LF-35 | MÉDIO | Corrigido (Etapa 1) | A | Tabela moldura/centro | "A borda leva vantagem" (64,27% x 35,73%) sem normalizar: a moldura tem 64% das dezenas; esperado 64,00% |
| LF-40 | ALTO | Corrigido (Etapa 1) | A | Bolão | "Bolão bem configurado: se 15 das 18 aparecerem, um bilhete acerta 15" — nenhum plano oferecido garante 15 (máximo 14) |
| LF-41 | MÉDIO | Corrigido (Etapa 1) | A | Acúmulos | "A probabilidade de haver ganhador é sempre a mesma" (falso: cresce com as vendas, como a própria Projeção mostra); definições diferentes de recorde em Acúmulos (4) e Recordes (3) |
| LF-42 | MÉDIO | Corrigido (Etapa 1) | A | Artigos (moldura, primos, Fibonacci, múlt. 3, repetidas) | Linhas das pontas das tabelas com contagens e % errados (ex.: 3 primos 2,30% → 4,68%) |
| LF-44 | MÉDIO | Corrigido (Etapa 1) | A | Artigo "resultados improváveis" | 4 percentuais errados (soma < 160: 2,38%, não < 0,5%; ≥ 9 pares: 14,42%, não 5,2% …) |
| LF-47 | MÉDIO | Corrigido (Etapa 1) | D/A | Guia "como jogar" | "Segunda a sábado, sem sorteio aos domingos": desatualizado desde 08/2026 |
| LF-43 | BAIXO | Corrigido (Etapa 1) | A | Artigo duques/trincas | Trinca 19,1% / 711 esperadas (correto 19,78% / 757); "menos de 6% acima" (hoje 8,7%) |
| LF-45 | BAIXO | Corrigido (Etapa 1) | A | Artigos e tabela de ciclos | 6–9 pares "98%" (88,93%); sem 3+ seguidas "≈9.800, 0,30%" (9.042, 0,28%); média de ciclo só dos 15 últimos |
| LF-37 | BAIXO | Corrigido (Etapa 1) | P/A | Gerador, par/ímpar, Data da sorte | Textos genéricos impossíveis na Lotofácil: "0-15 ou 15-0" pares, "aniversários concentram 1 a 31" |
| LF-46 | BAIXO | Comprovado | A | Várias telas | Decimais com ponto em cartões/gráficos ("20.62%", "195.14", "R$14.3M") e vírgula nos textos; "Nao Primo" sem acento |
| LF-48 | ALTO (outras loterias) | Comprovado | C | Analisador (Quina, Lotomania, Dia de Sorte, +Milionária, Timemania, Dupla Sena, Super Sete) | Tabelas guardadas em fração (0,15) e lidas como % (0,15%): todo jogo sai "Raro" em tudo e "0 de 7" típicas (ex.: Quina, 2 pares = 0,15% em vez de 32%). Fora do escopo da Lotofácil; não corrigido |
| LF-06 | — | Descartado | — | Simulador | Todos os 3.826 concursos têm as 5 faixas; o JOIN interno não perde concursos |

---

## Detalhamento dos itens de maior impacto

### LF-04 — Simulador usa o preço atual para todo o histórico (ALTO)

- **Local:** `lib/simulador-actions.ts:134-137,263,406` (`precoAposta` lê
  `PARAMS_LOTERIA.lotofacil.precoAposta`); texto em
  `app/[loteria]/simulador/page.tsx:201`.
- **Atual:** custo = nº de concursos × R$ 3,50; prêmios = valores nominais
  da época.
- **Correto:** custo de cada concurso = preço vigente na data. Eras
  inferidas do prêmio de 11 acertos (= 2 × preço): R$ 1,00 (nº 1), 1,25
  (460), 1,50 (1054), 2,00 (1213), 2,50 (1889), 3,00 (2801), 3,50 (3439).
  Confirmar em fonte oficial antes de usar.
- **Demonstração:** `evidencias/fase2/sim2.mjs` — 2.000 jogos aleatórios no
  histórico completo: retorno médio 25,0% (código) x 40,1% (preço da
  época); mediana 16,2% x 26,0%. Últimos 100: 27,3% nos dois casos.
- **Impacto:** o Premium mostra um prejuízo bem maior do que o real, e a
  página afirma o contrário do que o código faz.
- **Correção:** tabela de preços por data (a mesma serviria para Carteira e
  Conferidor); ou, enquanto ela não existir, avisar na tela que o preço é o
  atual.
- **Teste:** para um jogo fixo, o custo total = Σ preço(data) sobre os
  concursos; regressão com o jogo-exemplo.

### LF-16 — Soma do Analisador apresentada como porcentagem de jogos (ALTO)

- **Local:** `lib/analisador.ts:259-264`; `components/AnalisadorClient.tsx:46-52,81,106,217-219`.
- **Atual:** `pct` = 100 − |50 − percentil| × 2 (centralidade), exibido em
  `fraseFrequencia` e na barra "X% das combinações possíveis".
- **Correto:** % de combinações com a mesma soma (soma 195: 2,2%) ou o
  percentil (51,1% ≤ 195), com o rótulo certo.
- **Demonstração:** `evidencias/fase2/cdf.mjs`.
- **Impacto:** o usuário lê "mais da metade dos jogos possíveis têm esse
  padrão", o que é falso.
- **Teste:** para soma s, o número exibido = contagem exata da enumeração
  ÷ 3.268.760.

### LF-07 — Projeção de acúmulo superestima a chance de ganhador (MÉDIO)

- **Local:** `lib/probabilidades.ts:196-246`; `components/ProjecaoAcumuloCard.tsx`.
- **Demonstração:** `evidencias/fase2/proj.mjs` e `fator.mjs` (369 concursos
  desde 08/2025).
- **Correção:** dizer na tela que o modelo supõe apostas aleatórias e é um
  limite superior; ou calibrar com o histórico (razão observada/prevista de
  ganhadores ≈ 0,86); trocar o fator fixo de 20% por um medido, ou
  removê-lo.
- **Teste:** backtest — a média prevista fica dentro de ±2 dp da observada.

### LF-25 — Conflito entre obrigatória e excluída no gerador (MÉDIO)

- **Local:** `components/GeradorClient.tsx:103-121,128-153`; `lib/gerar-jogo.ts:52-57`.
- **Demonstração:** `evidencias/fase2/ger.ts` — com os dados de 11/11/2026,
  a dezena 20 é atrasada e a mais frequente; entra em 5.660 de 20.000 jogos
  marcados como "atendeu todos os filtros".
- **Correção:** remover das obrigatórias o que está nas excluídas (ou o
  inverso) antes de gerar, ou recusar com mensagem; `gerarJogo` deve
  rejeitar a interseção e duplicatas.
- **Teste:** nenhuma dezena excluída aparece em jogo com
  `atendeuTodosFiltros = true`.

### LF-18 — Desvio da uniformidade no histórico (INFORMATIVO, prioridade de investigação)

- **Demonstração:** `evidencias/fase2/fit.mjs`, `era.mjs`.
- **Não é** um erro de código: as contagens batem 100% com o banco.
- **Antes de concluir algo:** conferir na Fase 3 os concursos 1–500 e
  2001–2500 contra a Caixa. Se os dados estiverem certos, os textos que
  dizem "exatamente o esperado" precisam mudar (LF-19, LF-20). Em nenhum
  caso isso vira previsão: a partir de 2022 o teste não rejeita a
  uniformidade.

Os demais itens têm a demonstração resumida em `03-auditoria-matematica.md`
(seção da ferramenta correspondente).
