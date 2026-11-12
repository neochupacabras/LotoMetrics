# 07 — Plano de correção (Lotofácil)

11/11/2026. **Nenhuma correção foi feita.** Este plano depende de
autorização. A ordem considera gravidade, risco da mudança, dependências e
impacto em outras loterias. Cada item diz como provar que ficou certo (os
testes de `lib/auditoria/lotofacil/` já cobrem vários: troque `it.fails` por
`it` ou implemente o `it.todo` correspondente).

Regra geral: o código das ferramentas é **compartilhado pelas 9 loterias**.
Onde a correção tocar componente compartilhado, a coluna "Outras loterias"
diz o que conferir antes de publicar.

---

## Etapa 0 — Base comum (antes de tudo, pequena)

| # | Ação | Resolve / habilita | Outras loterias |
|---|---|---|---|
| 0.1 | Criar um módulo único com as regras vigentes da Lotofácil e suas datas: preço por período, prêmios fixos por período, percentual do prêmio bruto por período, faixas. Hoje esses valores estão espalhados em `PARAMS_LOTERIA`, calculadoras, carteira, simulador e textos. | Fonte única para LF-01, LF-02, LF-04, LF-29 | Estrutura vale para todas; preencher só a Lotofácil agora |
| 0.2 | Confirmar em fonte oficial a tabela de preços (inferida dos dados: R$ 1,00 / 1,25 / 1,50 / 2,00 / 2,50 / 3,00 / 3,50, mudando nos concursos 460, 1054, 1213, 1889, 2801 e 3439) e a regra de rateio da faixa 15 (LF-33) | LF-04, LF-33 | — |

## Etapa 1 — Textos que afirmam algo falso (risco baixo, impacto alto)

Só conteúdo; nenhuma fórmula muda. Pode ser um único PR.

| # | Problema | Ação | Prova |
|---|---|---|---|
| 1.1 | **LF-39** (CRÍTICO) | Refazer a tabela de `app/dicas/fechamento/page.tsx` e os números de "fechamento: quando vale" (`lib/analises.ts`) com a saída real de `OPCOES_BOLAO` (16/14 = 15 jogos; 17/14 = 64; 18/13 = 258; 18/12 = 164); trocar o exemplo "156" de `app/[loteria]/fechamentos/page.tsx:30` por 164 (ou ler de `OPCOES_BOLAO`) | Teste que compara os números do exemplo com `OPCOES_BOLAO` |
| 1.2 | **LF-40** (ALTO) | `app/[loteria]/bolao/page.tsx:116`: deixar claro que 15 pontos exigem o fechamento completo (816 jogos para 18 dezenas), que o otimizador não oferece | Revisão de texto |
| 1.3 | **LF-38** (ALTO) | `app/[loteria]/equilibrio/page.tsx:107-118` e o artigo "índice de equilíbrio" (`lib/analises.ts` ~775-850): descrever o método real (histórico, pesos 25/20/15/10, classes 75/55/35) — ou mudar o método na Etapa 3 e então descrever o novo | Revisão de texto |
| 1.4 | **LF-01, LF-02** (ALTO) | Atualizar prêmios fixos (R$ 7/14/35) e percentual (43,79%, desde o concurso 3258) em `dicas/como-os-premios-sao-calculados`, `dicas/retorno-ao-apostador`, `lib/analises.ts` (inclusive "simulador 10 anos"); citar a data de vigência | Teste de conteúdo contra o módulo 0.1 |
| 1.5 | **LF-36** | `app/[loteria]/gerador/page.tsx:86`: o modo simples aplica filtros fixos (já dito no topo da tela) | Revisão |
| 1.6 | **LF-35** | Callout de moldura/centro: comparar com a proporção esperada (16/25 = 64%) | Teste: callout só diz "vantagem" se o desvio for significativo |
| 1.7 | **LF-41** | Acúmulos: trocar "a probabilidade de haver ganhador é sempre a mesma" por "a chance de cada bilhete é sempre a mesma"; harmonizar a definição de recorde com Recordes | Revisão |
| 1.8 | **LF-42, LF-44, LF-43, LF-45** | Corrigir as tabelas e percentuais dos artigos (valores exatos em `03b-auditoria-apresentacao.md`, seção 3). Melhor: gerar as tabelas dos artigos pela fórmula, como em `referencia.ts` | Teste que recalcula cada tabela citada |
| 1.9 | **LF-47** | Guia "como jogar": seg–sex 21h e domingo 11h (ou ler de `lib/calendario.ts`) | Revisão |
| 1.10 | **LF-19, LF-20** | Heatmap, duques e simulador de frequência: trocar "exatamente o esperado" por texto condicionado a um teste (ou neutro). Ver LF-18 antes | Teste do texto com o histórico atual |
| 1.11 | **LF-37** | Remover exemplos impossíveis na Lotofácil ("0-15", "0 pares/15 ímpares", "aniversários 1 a 31") ou torná-los dependentes da loteria | Revisão |

**Outras loterias:** os textos das páginas `app/[loteria]/*` aparecem para
todas. Nos itens 1.1–1.3, 1.5–1.7 e 1.10, conferir a frase resultante em
pelo menos Mega-Sena e Lotomania.

### Situação da Etapa 1 (11/11/2026 — publicada, PR #70)

Feitos: 1.1 a 1.9, 1.11 e a parte de texto de 1.10. Itens resolvidos: LF-01, LF-02,
LF-19, LF-35 a LF-45 e LF-47 (ver o status em `06-problemas-encontrados.md`).

- O exemplo de fechamentos agora lê o total de `OPCOES_BOLAO`. O callout de
  moldura/centro compara com a fração de casas do volante (margem de 2 dp). O
  heatmap informa quantas dezenas ficaram dentro de ±2 dp. A página do
  Equilíbrio mostra os pesos de cada loteria (`pesosParaLoteria` foi exportada,
  sem mudar a lógica).
- Também corrigidos fora da lista original: chance de atraso 8 no artigo de
  atraso (≈ 0,07%, não "< 1,7%"); frase do quiz que negava discrepância nas
  frequências; contagens do artigo "jogar o mesmo jogo por 10 anos".
- **Fora da Etapa 1:** LF-33 (aguarda regulamento); parte de código do LF-20
  (comparar extremos com extremos); LF-46 (formato decimal).
- **Achados de outras loterias, não alterados:** o guia da Quina diz "segunda a
  sábado", mas `lib/calendario.ts` dá seg–sex + domingo; o artigo do Dia de
  Sorte afirma que "em todas as loterias" a variação está dentro do esperado.
- Testes: `lib/auditoria/lotofacil/textos.test.ts` (21 testes) confere os
  números citados contra a referência e impede o retorno das frases falsas.
  Telas conferidas no servidor local (Lotofácil e Mega-Sena).

## Etapa 2 — Cálculos com erro comprovado

| # | Problema | Ação | Prova | Outras loterias |
|---|---|---|---|---|
| 2.1 | **LF-04** (ALTO) | Simulador e comparador: custo de cada concurso = preço vigente na data (módulo 0.1); até lá, avisar na tela que o preço é o atual. Mesmo ajuste na Carteira (`lib/carteira.ts:34`) | `it.todo` LF-04 → teste com jogo fixo e soma por era | Todas: precisa da tabela de preços de cada uma; sem ela, manter o aviso |
| 2.2 | **LF-16** (ALTO), **LF-03**, **LF-17** | Analisador: gerar as tabelas da Lotofácil pela hipergeométrica/enumeração em vez de constantes; para a soma, mostrar "% com a mesma soma" ou "percentil", com o rótulo certo; não rotular jogo incompleto | `it.fails` LF-03 e LF-16 viram `it`; `it.todo` LF-17 | As tabelas das outras 7 loterias vêm de amostragem (500 mil); recalcular exatas é escopo das auditorias delas |
| 2.3 | **LF-25**, **LF-26** | Gerador: obrigatória ∩ excluída → remover da lista de obrigatórias (ou avisar); deduplicar obrigatórias; no fallback, devolver a tentativa que cumpre mais filtros e dizer quais falharam | `it.fails` LF-25/26 viram `it` | Todas usam `gerarJogo` |
| 2.4 | **LF-05** | Simulador: 15 acertos em concurso acumulado aparece como "acumulado — valor indeterminado" (como o Conferidor já faz) | `it.todo` LF-05 | Todas |
| 2.5 | **LF-29** | Valor esperado: exemplo da Lotofácil com todas as faixas (fixos + 14 + 15) ou com o retorno total (43,79%) | `it.todo` LF-29 | Só o exemplo |
| 2.6 | **LF-28** | Calculadora de probabilidade: limitar a 15–20 | `it.todo` LF-28 | Conferir os limites das outras na auditoria delas |
| 2.7 | **LF-15**, **LF-09** | Nunca exibir "100,0%" para p < 1; "1 em N" com 1 casa quando N < 10 | `it.todo` | Componentes compartilhados |

### Situação da Etapa 2 (11/11/2026 — branch `fix/lotofacil-calculos`)

Feitos 2.1 a 2.7. Itens resolvidos: LF-03, LF-04, LF-05, LF-09, LF-15, LF-16,
LF-17, LF-25, LF-26, LF-28, LF-29.

- **Preços por época (LF-04):** novo `lib/precos-loteria.ts`. As eras da
  Lotofácil saem da série de prêmios fixos (prêmio de 11 acertos = 2 × preço).
  Os reajustes de 2015 (R$ 2,00, concurso 1213), 2019 (R$ 2,50, 1889), 2023
  (R$ 3,00, 2801) e 2025 (R$ 3,50, 3439) foram confirmados por notícias da
  época; os três primeiros (R$ 1,00 / 1,25 / 1,50) seguem só deduzidos.
  Simulador, comparador e Carteira usam o preço de cada concurso; as outras
  loterias continuam com o preço atual (a página diz isso).
- **Acertos em faixa acumulada (LF-05):** o simulador lista os concursos em
  que o jogo teria batido uma faixa sem ganhador, em vez de omiti-los.
  `pontuarDraw` foi para `lib/simulador-pontuacao.ts` para ser testável.
- **Analisador (LF-03, LF-16, LF-17):** tabelas da Lotofácil calculadas pela
  fórmula; a soma mostra o % de combinações na mesma faixa de 10; só analisa
  o jogo completo (e não deixa marcar mais dezenas que o sorteio). A tela
  passou a enviar a faixa e a grade da loteria (antes usava 1–25 para todas).
  Frase "1 em cada N jogos" calculada do próprio % (dizia "1 em cada 10" para
  21%).
- **Gerador (LF-25, LF-26):** obrigatórias sorteadas só entre as dezenas
  permitidas; conflito explícito vira erro claro; obrigatórias deduplicadas;
  sem solução, devolve a melhor tentativa e diz quais filtros faltaram.
- **Formatação (LF-09, LF-15):** `formatarUmEm` (1 casa abaixo de 10) e
  `formatarProbabilidadePct` (nunca "100,0%" para p < 1), em `lib/format.ts`.
- **Calculadoras (LF-28, LF-29):** Lotofácil limitada a 15–20 dezenas; o
  exemplo de valor esperado diz que considera só os 15 pontos e informa o
  retorno total de 43,79%.
- **Achado em componente compartilhado (LF-48):** o Analisador está quebrado
  nas outras 7 loterias (tabelas em fração lidas como %). Registrado, não
  corrigido (fora do escopo desta auditoria).
- Testes: 443 de `lib` passando; os 4 `it.fails` viraram regressão;
  `simulador.test.ts` novo. Telas conferidas no servidor local (worktree).

## Etapa 3 — Ferramentas que precisam de decisão de produto

O problema não é um bug: o método não sustenta o que a tela promete.

| # | Problema | Opções |
|---|---|---|
| 3.1 | **LF-27, LF-08** Equilíbrio | (a) recalibrar as classes por percentis reais da nota (ex.: "atípico" = 5% menos típicos), com pesos documentados; (b) fundir com o Analisador; (c) retirar a nota única |
| 3.2 | **LF-21** Destaques | Chamar de "incomum" só o que for raro levando em conta as 7 métricas juntas (ex.: probabilidade conjunta, ou limiar corrigido), ou mostrar o fato sem rótulo |
| 3.3 | **LF-07, LF-31** Projeção | Calibrar com o histórico (o observado é ~86% do previsto), medir o fator de acúmulo, tratar final 0/5 e Independência; ou exibir como "limite teórico com apostas aleatórias" |
| 3.4 | **LF-22, LF-10, LF-24, LF-46, LF-23** | Ajustes de apresentação: filtros de acúmulo pela distribuição da loteria; definição de maior atraso incluindo o atraso corrente; centavos do bolão; formato decimal pt-BR único; condição e probabilidade no fechamento completo |

## Etapa 4 — Dados (retomar a Fase 3)

| # | Ação | Resolve |
|---|---|---|
| 4.1 | Rodar `evidencias/fase3/baixar.mjs` (retomável) e `cmp.mjs` para os 3.731 concursos restantes | Confiabilidade do histórico; LF-18 |
| 4.2 | Conferir na Caixa os concursos 3715/3716 (mesma data) e 3780 (prêmios fixos pela metade) | LF-32, LF-30 |
| 4.3 | Gravar `valorAcumuladoConcurso_0_5` e `valorAcumuladoConcursoEspecial` no importador, se a projeção for mantida | LF-31 |
| 4.4 | Adicionar CHECK em `concurso.dezenas` (tamanho e faixa por loteria, via trigger) e versionar as funções SQL numa migration | LF-12 |
| 4.5 | Arrecadação dos concursos 1–428: buscar na Caixa ou marcar como "não disponível" nas telas que a usam | LF-34 |
| 4.6 | Se 4.1 confirmar os dados, documentar LF-18 nos textos de frequência (desvio real em 2003–09 e 2020–21, sem valor preditivo) | LF-18, LF-19 |

## Ordem sugerida e esforço

| Ordem | Pacote | Gravidade coberta | Esforço | Risco |
|---|---|---|---|---|
| 1 | Etapa 1 (textos) | 1 crítico, 4 altos, 7 médios | Pequeno a médio (só conteúdo) | Baixo |
| 2 | 0.2 + 2.1 (preço por época) | 1 alto | Médio | Médio (Carteira e simulador) |
| 3 | 2.2 (Analisador) | 1 alto, 2 médios | Médio | Baixo (testes prontos) |
| 4 | 2.3–2.7 | 3 médios, 4 baixos | Pequeno | Baixo |
| 5 | Etapa 4 (dados) | Pendentes | Médio (download ~40 min) | Baixo (só leitura até 4.4) |
| 6 | Etapa 3 (decisões) | 4 médios | Depende da decisão | Médio |

Dependências: 1.4 e 2.1 usam o módulo 0.1; 2.1 depende de 0.2; 1.10
depende de 4.1/4.6; 3.3 depende de 4.3.
