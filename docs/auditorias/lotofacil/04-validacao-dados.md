# 04 — Validação dos dados (Fase 3 — PARCIAL)

11/11/2026. **Fase interrompida a pedido do usuário** antes da comparação
completa com a Caixa. Este documento registra o que foi verificado e o que
ficou pendente. Scripts em `evidencias/fase3/`.

## 1. O que foi verificado

### 1.1 Comparação com a API oficial da Caixa (amostra)

- Fonte: `servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil/{n}`; o
  download em lote (`/api/resultados/download`) responde 404.
- Comparados: **95 concursos** (nº 1 a 94 e nº 3826), campo a campo: data,
  dezenas, ordem do sorteio, acumulado, arrecadação e as 5 faixas
  (descrição, ganhadores, valor).
- Resultado: **0 divergências.**
- Limitação: a amostra não foi escolhida ao acaso (são os primeiros
  baixados). Cobre o começo do período 1–500, onde o desvio de LF-18 é maior,
  mas não cobre 2001–2500 nem os concursos 3715/3716/3780.

### 1.2 Integridade interna (3.826 concursos, todos)

| Verificação | Resultado |
|---|---|
| Numeração 1..3826 sem lacunas nem duplicatas | OK |
| 15 dezenas distintas, inteiras, entre 1 e 25 | OK (0 inválidos) |
| Dezenas em ordem crescente | OK |
| Ordem do sorteio é uma permutação das dezenas | OK |
| Flag `acumulado` ⇔ faixa 1 sem ganhador | OK |
| Ganhadores > 0 ⇔ valor > 0, em todas as faixas | OK |
| Prêmio de faixa menor nunca maior que de faixa maior | OK |
| 5 faixas com descrição padronizada em todos os concursos | OK |
| Datas estritamente crescentes | **Falha:** concursos 3715 e 3716 com a mesma data (20/06/2026) |
| Arrecadação preenchida | **Ausente** nos concursos 1 a 428 (valor 0) |

### 1.3 Regras históricas deduzidas dos próprios dados

- **Percentual do prêmio bruto:** pela regra "14 acertos = 13% de (bruto −
  fixos)", o percentual aplicado é exatamente **43,35%** até o concurso 3257
  (30/11/2024) e **43,79%** a partir do 3258 (02/12/2024). Antes de 2020 o
  valor deduzido varia (49–58%), sinal de outra regra de rateio. Conclusão:
  o texto do site (43,35%) estava correto até 11/2024 (LF-02 = texto
  desatualizado).
- **Preços e prêmios fixos:** eras do prêmio de 11 acertos (2 × preço):
  R$ 2 (nº 1), 2,50 (460), 3 (1054), 4 (1213), 5 (1889), 6 (2801), 7 (3439).
- **Faixa de 15 acertos:** em concursos normais, desde 2020, recebe de forma
  estável **43,4%** de (bruto − fixos), e não os 62% da página oficial
  (antes: 29,6%). Os de final 0 recebem mais (acúmulo). A regra publicada
  não explica os valores pagos: **pendente** de regulamento oficial. Afeta
  o artigo "como os prêmios são calculados" (que copia os 62%).
- **Dias de sorteio:** 2 por semana até 2006; 3 (2012–2019); 6 de seg a sáb
  (2021–07/2026); desde 08/2026, seg a sex e domingo. O código
  (`lib/calendario.ts`) bate com a agenda atual → LF-14 resolvido.

## 2. Pendências da Fase 3

1. Comparar os 3.731 concursos restantes com a Caixa (`evidencias/fase3/baixar.mjs`
   é retomável: ~40 min, 1 requisição por vez).
2. Concursos 3715/3716 com a mesma data: conferir na Caixa.
3. Concurso 3780 com prêmios fixos pela metade (LF-30).
4. `valor_acumulado_proximo` antes de concursos de final 5 (LF-31). A API
   expõe ainda `valorAcumuladoConcurso_0_5` e
   `valorAcumuladoConcursoEspecial`, que o importador não grava.
5. Período 2001–2500 de LF-18.
6. Regulamento oficial do rateio da faixa 15.
