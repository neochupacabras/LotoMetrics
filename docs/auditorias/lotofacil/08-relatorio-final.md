# 08 — Relatório final: auditoria da Lotofácil

LotoAnalítica · 11/11/2026 · commit `449ccda` (branch `fix/ocr-e-renovacao`)
· histórico até o concurso 3826 (10/11/2026)

## A. Resumo executivo

**Situação geral.** A matemática que o código calcula para a Lotofácil está,
na maior parte, correta e exata. Probabilidades, combinatória, as 21
estatísticas históricas, garantias de fechamento e o gerador passaram em
verificações independentes. Os problemas graves estão em outro lugar:
**no que a plataforma diz sobre esses números**. Há artigos que prometem
coberturas impossíveis, telas que descrevem um método diferente do usado,
frases que tiram conclusões não sustentadas pelos dados, e um simulador que
mistura o preço atual com prêmios antigos.

| Medida | Quantidade |
|---|---|
| Ferramentas auditadas | 20 (+ 13 tabelas estatísticas, 16 telas e 31 artigos) |
| Verificações matemáticas | 30 células de probabilidade · 7 tabelas e 151 valores de CDF do Analisador · 21 saídas SQL · 33 definições de função · 18 fechamentos · 3.333 séries de acúmulo · 369 concursos de backtest · 95 concursos contra a Caixa · ~60 números citados em artigos |
| Enumerações completas | 3.268.760 combinações (4 vezes) |
| Testes automatizados | 87 passando, 14 `todo` (4 `it.fails` documentam bugs) |
| Scripts de evidência | 23 (`evidencias/fase2`, `fase3`) |

| Gravidade | Problemas |
|---|---|
| CRÍTICO | 1 |
| ALTO | 6 |
| MÉDIO | 17 |
| BAIXO | 13 |
| INFORMATIVO | 5 |
| PENDENTE (dados) | 3 |
| Descartados | 2 |
| **Total** | **47** |

**Principais riscos**

1. **LF-39 (crítico):** artigos de fechamento prometem coberturas abaixo do
   mínimo matemático. Exemplo: "16 dezenas, 5–8 jogos, garante 14
   pontos", quando o mínimo é 15 jogos. Quem planejar um bolão pelo artigo
   vai gastar com uma expectativa impossível.
2. **LF-04 (alto):** o simulador Premium cobra R$ 3,50 em todos os
   concursos desde 2003 e diz que usa o preço de cada época. O retorno médio
   mostrado é 25%; o real seria ~40%.
3. **LF-38 / LF-16 (altos):** o Índice de Equilíbrio diz que usa
   "combinatória pura, pesos iguais", mas usa o histórico e pesos de
   25/20/15/10%. O Analisador diz que "mais da metade dos jogos possíveis"
   têm a soma 195; o certo é 2,2%.
4. **LF-40 (alto):** o Bolão promete 15 pontos se as 15 sorteadas estiverem
   no pool, mas nenhum plano oferecido garante mais que 14.
5. **LF-01 / LF-02 (altos):** prêmios fixos (R$ 5/10/25) e percentual
   (43,35%) desatualizados nos textos.

**Avaliação geral da confiabilidade:** **confiável no cálculo, não confiável
na comunicação.** A modalidade ainda não pode ser considerada validada.

## B. Ficha matemática

Ver `01-ficha-matematica.md`. Em resumo: 25 dezenas (1–25); aposta de 15 a
20; 15 sorteadas; sem elementos especiais; faixas 11–15; prêmios fixos
R$ 7/14/35; prêmio bruto 43,79% (desde o concurso 3258, 02/12/2024; antes
43,35%); preço R$ 3,50 (C(b,15) × 3,50 na aposta múltipla); C(25,15) =
3.268.760; acertos ~ hipergeométrica C(15,k)·C(10,b−k)/C(25,b). Fonte: página
oficial da Caixa (lida em 11/11/2026) e dados oficiais.

Regras confirmadas pelos dados (Fase 3): eras de preço (inferidas do prêmio
de 11 acertos = 2 × preço); mudança de 43,35% para 43,79% no concurso 3258;
6 sorteios por semana, com domingo no lugar do sábado desde 08/2026.
Divergência: a faixa 15 recebe ~43,4% de (bruto − fixos), não os 62% da
página oficial (LF-33, pendente de regulamento).

## C. Inventário auditado

Ver `02-inventario-funcionalidades.md`: 23 grupos de funcionalidade, as
funções TS e SQL de cada um, 9 regras com implementação duplicada e 4
componentes compartilhados com risco para outras loterias.

## D. Resultados por funcionalidade

| Ferramenta | Como foi verificado | Status | Problemas |
|---|---|---|---|
| Probabilidades | Hipergeométrica exata + tabela da Caixa (30 células); testes | APROVADO COM RESSALVAS | LF-09 |
| Projeção de acúmulo | Backtest de 369 concursos | REPROVADO | LF-07, LF-15, LF-31 |
| Analisador | Enumeração completa + hipergeométrica; testes | REPROVADO | LF-03, LF-16, LF-17 |
| Tabelas estatísticas (13) | Recontagem independente (21/21 idênticas); aderência à teoria | APROVADO COM RESSALVAS | LF-10, LF-35, LF-45 |
| Heatmap | Frequências + texto x dados | REPROVADO (texto) | LF-19 |
| Simulador de frequência aleatória | Algoritmo + método de comparação | APROVADO COM RESSALVAS | LF-20 |
| Destaques | Critério aplicado aos 3.826 concursos | REPROVADO | LF-21 |
| Acúmulos | 3.333 séries reconstruídas (idênticas) | APROVADO COM RESSALVAS | LF-22, LF-41 |
| Recordes | Valores x banco | APROVADO COM RESSALVAS | valores nominais (avisados) |
| Inéditas | 2.300/2.300 trincas | APROVADO | — |
| Fechamentos | Verificador próprio nos 18 casos; limite de Schönheim; testes | APROVADO COM RESSALVAS (ferramenta) / REPROVADO (artigos) | LF-23, LF-39 |
| Bolão | Tabela = algoritmo; conferência | APROVADO COM RESSALVAS (cálculo) / REPROVADO (texto) | LF-24, LF-40 |
| Gerador | 240 mil jogos; qui-quadrado; filtros; casos extremos | REPROVADO | LF-25, LF-26, LF-36, LF-37 |
| Gerador por data | 366 datas | APROVADO | — |
| Simulador histórico | Reprocessamento de 2.000 jogos com preço por era | REPROVADO | LF-04, LF-05 |
| Conferidor | Pontuação com concurso real; faixas | APROVADO COM RESSALVAS | LF-11 |
| Índice de Equilíbrio | Nota recalculada para todas as combinações | REPROVADO | LF-08, LF-27, LF-38 |
| Calc. probabilidade | Fórmula + limites | APROVADO COM RESSALVAS | LF-28 |
| Calc. valor esperado | Exemplo x valor esperado real | REPROVADO | LF-29 |
| Calc. custo aposta múltipla | x tabela da Caixa | APROVADO | — |
| Artigos e guias | ~60 números conferidos | REPROVADO | LF-01, LF-02, LF-33, LF-39, LF-42 a LF-47 |
| Dados históricos | Integridade (3.826) + 95 x Caixa | PENDENTE | LF-18, LF-30, LF-32, LF-34 |
| Funções SQL | Produção = `schema.sql` (33/33) | APROVADO | LF-12 |

Detalhes: `03-auditoria-matematica.md` (cálculo), `03b-auditoria-apresentacao.md`
(telas e textos), `04-validacao-dados.md` (dados).

## E. Registro de problemas

Ver `06-problemas-encontrados.md` (47 itens com gravidade, status e origem;
os de maior impacto com descrição, comportamento atual e correto,
demonstração, correção e teste).

Por origem, os 45 problemas não descartados se concentram em
**apresentação** (textos, rótulos, descrições de método), seguida de
**parâmetros sem fundamento** (pesos, limiares, fator de acúmulo, preço
fixo). Erros de fórmula na lógica central são poucos (LF-03 nas constantes do
Analisador, LF-25/26 no gerador).

## F. Plano de correção

Ver `07-plano-de-correcao.md`. Ordem sugerida:

1. **Textos** (Etapa 1): resolve o crítico, 4 dos 6 altos e 7 médios sem
   mexer em fórmula.
2. **Preço por época** no simulador e na Carteira (LF-04), depois de
   confirmar a tabela oficial de preços.
3. **Analisador** gerado pela fórmula (LF-03/16/17); os testes já existem.
4. Gerador e ajustes menores de cálculo.
5. Retomar a validação dos dados (Fase 3).
6. Decisões de produto: Equilíbrio, Destaques, Projeção.

## G. Testes e evidências

Ver `05-testes-evidencias.md`. 87 testes automatizados em
`lib/auditoria/lotofacil/`, com referência independente em BigInt.
`npx vitest run lib/auditoria` ≈ 13 s. A suíte completa, `tsc` e `eslint`
passam. Scripts com dados de produção em `evidencias/`.

## H. Limitações

- **Fase 3 parcial (pedido do usuário):** só 95 de 3.826 concursos foram
  comparados com a Caixa (0 divergências). Os 3.731 restantes, os concursos
  3715/3716/3780 e o período 2001–2500 seguem pendentes.
- **Regulamento oficial** não localizado: a regra do prêmio fixo
  insuficiente e o rateio real da faixa 15 (LF-33) não foram confirmados.
- **Histórico de preços** inferido dos dados, não de fonte oficial.
- **Telas Premium e área de membros** não foram vistas (exigem login);
  interações com resultado (gerar, simular, PDF) foram testadas na lógica,
  não clicando no site. OCR não foi auditado.
- **Simulador, Equilíbrio, Destaques e calculadoras** não têm função pura
  testável; os testes de regressão deles esperam a correção (`it.todo`).
- Telas lidas no site publicado (que difere deste branch só no OCR).
- Testes estatísticos sem semente (limiares escolhidos para falso alarme
  ≈ 2e-6).

## I. Parecer final

**A matemática da modalidade está correta?**
Sim no núcleo: probabilidades, combinatória, estatísticas históricas,
fechamentos e gerador sem filtros estão certos e exatos. Não nas
constantes do Analisador (LF-03), no cálculo financeiro do simulador
(LF-04), na projeção de acúmulo (LF-07) e nos números de vários artigos.

**As ferramentas respeitam todas as particularidades da loteria?**
Em grande parte sim: universo, faixas, tamanho de aposta, volante 5×5 e
garantias usam os parâmetros certos. Há restos de outras loterias ou de
regras antigas: filtro de acúmulo "≥ 7 sorteios" (máximo real 4), exemplos
"0-15 pares" e "aniversários 1 a 31", calculadora aceitando 25 dezenas,
calendário e prêmios antigos nos textos.

**Os dados históricos são confiáveis?**
Provavelmente sim, mas não está demonstrado. A integridade interna é
completa (0 inválidos nos 3.826 concursos) e a amostra de 95 concursos bate
100% com a Caixa. Falta comparar o restante e explicar 3 anomalias. O
histórico rejeita a uniformidade das dezenas (Monte Carlo p = 0,0005),
concentrado em 2003–09 e 2020–21. Isso pede a conferência completa antes de
qualquer conclusão, e em nenhum caso é um sinal para prever sorteios.

**Existem informações incorretas sendo exibidas ao usuário?**
Sim. Pelo menos 25 problemas comprovados afetam diretamente o que aparece na
tela ou nos artigos, incluindo 1 crítico e 6 altos.

**A modalidade pode ser considerada matematicamente validada?**
**Não, ainda não.** O motor de cálculo é sólido, mas a modalidade só pode ser
considerada validada depois de corrigir o que é dito ao usuário e concluir a
validação dos dados.

**O que precisa ser resolvido antes de considerá-la confiável?**
1. LF-39, LF-40, LF-38, LF-01, LF-02 (textos que afirmam coisas falsas).
2. LF-04 (simulador com preço por época, ou aviso explícito).
3. LF-16 e LF-03 (números do Analisador).
4. Concluir a Fase 3 (comparação completa com a Caixa e as 3 anomalias).

Depois disso, rodar de novo `npx vitest run lib/auditoria` (os `it.fails`
corrigidos viram `it`) e refazer a Fase 5 nas telas alteradas.
