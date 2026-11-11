# 02 — Inventário das funcionalidades da Lotofácil

Fase 1 · 11/11/2026 · branch `fix/ocr-e-renovacao` (commit `449ccda`)

Mapa do que existe de verdade no código e que mostra números ao usuário da
Lotofácil. A coluna "Fase 2" diz o que será validado. Nenhum item aqui está
aprovado: este documento só descreve.

Todas as páginas ficam em `app/[loteria]/…` e são **compartilhadas pelas 9
loterias**. A Lotofácil entra pelo parâmetro de rota `lotofacil`; os
parâmetros vêm da tabela `loteria` (id 1: 1–25, 15 sorteadas, `grid_colunas`
5) ou de constantes no código.

---

## 1. Fonte de dados e parâmetros

| Item | Onde | Observação |
|---|---|---|
| Tabela `loteria` | `supabase/schema.sql:899`; lida por `getLoteriaPorCodigo` (`lib/queries.ts:16`) | Cache de 24 h. Produção confirmada: 1, 25, 15, 5 |
| Tabela `concurso` | `supabase/schema.sql:853` | `dezenas int[]` **sem CHECK** de tamanho, faixa ou duplicidade; único só por (loteria_id, numero) |
| Tabela `premiacao_faixa` | `supabase/schema.sql:934` | Faixa 1 = 15 acertos … faixa 5 = 11; descrição textual ("15 acertos") é usada por regex |
| Importador | `importador.py` (API da Caixa; espelho não oficial só para a Super Sete) | Validação dos dados na Fase 3 |
| Funções SQL de estatística | `supabase/schema.sql:82-773` (dump) | Não há migration versionando estas funções; é preciso conferir se a produção bate com o dump (Fase 3) |
| `FAIXAS_PREMIADAS.lotofacil = [11..15]` | `lib/probabilidades.ts:62` | Constante fixa |
| `PARAMS_LOTERIA.lotofacil` | `lib/probabilidades.ts:124-129` | n 25, m 15, `percFaixa1` 0,35 (não usado em lugar nenhum), `precoAposta` 3,50, `ticketsMedios` 60 mi |
| `qtdDezenasAposta` | `lib/format.ts:23-27` | Lotofácil → 15 (aposta simples) |
| Agenda de sorteios | `lib/calendario.ts:29-32` | Seg–sex 21h + domingo 11h = 6/semana (PENDENTE de fonte) |
| Preços fixos em telas | `custo-aposta-multipla/CalcClient.tsx:16` (3,50), `valor-esperado-aposta/CalcClient.tsx:10` (3,5 e prêmio de R$ 1,5 mi), `lib/carteira.ts:34`, `lib/simulador-actions.ts:134` | Mesmo preço repetido em 4+ lugares |

---

## 2. Ferramentas por página

### 2.1 Resultados (`/lotofacil/resultados`, `/resultados/[numero]`, `/resultados/pagina/[n]`, `/resultado`)

- **Arquivos:** `app/[loteria]/resultados/*`, `components/Dezenas.tsx`,
  `components/HistoricoConcursos.tsx`, `components/BotaoExportarCsv.tsx`,
  `app/api/[loteria]/exportar/route.ts`.
- **Cálculos:** `lib/resumo-concurso.ts` (`montarResumoConcurso`: acumulados
  antes, ranking do prêmio no histórico/ano), `lib/links-concurso.ts` (frases
  com frequência e "última vez que saiu"), `lib/analise-concurso.ts`
  (`analisarConcurso` = `classificarJogo` + `compararComHistorico`),
  `getContextoConcurso`, `getHistoricoDezenasConcurso`, `getFinsDeCiclo`
  (`lib/queries.ts:268-358`).
- **Entrada:** concurso do banco. **Saída:** dezenas, rateio por faixa, texto
  de resumo, classificação do sorteio (pares, primos, soma…) com % histórico.
- **Fase 2:** percentuais de `compararComHistorico`, ranking de prêmios,
  "concursos acumulados antes", fim de ciclo.

### 2.2 Tabelas estatísticas (`/lotofacil/tabelas` e `/tabelas/[categoria]`)

13 categorias (`lib/categorias.ts:10-106`); a Lotofácil não exclui nenhuma.
Página: `app/[loteria]/tabelas/[categoria]/page.tsx`. Componentes:
`HeatmapVolante`, `GraficoBarras`, `AnelProgresso`, `SomaCalculadora`,
`SimuladorFrequenciaAleatoria`, `InsightCallout`. Textos de SEO:
`lib/seo-tabelas.ts`. Conversão "atraso → dias": `lib/insights.ts:37`
(`estimarDiasCorridos`) com `qtdSorteiosPorSemana`.

| Categoria | Função TS (`lib/estatisticas.ts`) | Função SQL | Fórmula implementada |
|---|---|---|---|
| Frequência | `getFrequencia` | `fn_frequencia` | COUNT por dezena; recorte "últimos N" usa `numero > MAX − N` (supõe numeração contínua) |
| Atraso | `getAtraso` | `fn_atraso`, `fn_maior_atraso_historico` | atraso = último nº − última aparição; maior atraso = maior intervalo **entre** aparições (ignora o trecho antes da 1ª e o atraso corrente) |
| Ciclos | `getCiclos` | `fn_ciclo_atual`, `fn_ciclos_historico` | Fecha o ciclo quando nº de dezenas distintas vistas ≥ `dezena_max` |
| Sequências | `getSequencias` | `fn_distribuicao_sequencias`, `fn_maior_sequencia_por_concurso`, `fn_maior_sequencia_consecutiva_dezena` | Maior corrida de números consecutivos no sorteio; maior série de concursos seguidos em que uma dezena saiu |
| Pares e ímpares | `getParesImpares` | `fn_distribuicao_par_impar` | Contagem por concurso, % sobre total de concursos |
| Primos | `getPrimosFrequencia/Distribuicao` | `fn_primos_*`, `fn_eh_primo` | Teste de primalidade |
| Soma | `getSoma` | `fn_estatisticas_soma`, `fn_histograma_soma(…,10)` | Mín, máx, média, mediana (`PERCENTILE_CONT`); histograma em faixas de 10 |
| Fibonacci | `getFibonacci*` | `fn_fibonacci_*`, `fn_eh_fibonacci` | Lista fixa 1,2,3,5,8,13,21,34,55,89,144 |
| Múltiplos de 3 | `getMultiplos3*` | `fn_multiplos_3_*` | `n % 3 = 0` |
| Repetidas | `getRepetidas` | `fn_distribuicao_repetidas`, `fn_repetidas_concurso_anterior` | Interseção com o concurso anterior por `LAG(… ORDER BY numero)` |
| Moldura/centro | `getMolduraCentro` | `fn_moldura_centro_*`, `fn_zona_da_dezena` | Borda da grade `grid_colunas` × ⌈max/colunas⌉ |
| Linhas/colunas | `getLinhasColunas` | `fn_frequencia_por_linha/coluna` | ⌈d/5⌉ e ((d−1) mod 5)+1 |
| Duques e trincas | `getDuques`, `getTrincas`, `getCoberturaTrincas` | `fn_duques_mais_frequentes`, `fn_trincas_mais_frequentes` | Top 20; cobertura = trincas já saídas / C(25,3) |

**Fase 2:** reconstruir cada distribuição a partir dos dados brutos e comparar
com a referência teórica (ficha, seção 3.5–3.7); denominadores; tratamento
de empates; textos de cada página.

### 2.3 Destaques (`/lotofacil/destaques`)

- `lib/destaques.ts` (`gerarDestaques`, 151 linhas) — **não lido nesta fase**.
- **Fase 2:** ler e validar cada destaque.

### 2.4 Heatmap (`/lotofacil/heatmap`)

- `components/HeatmapPageClient.tsx` (368 linhas), `getFrequenciaHeatmap`
  (`lib/queries.ts:412`), recorte por plano (`lib/plano.ts`).
- Frequência por dezena e total de concursos do recorte; recorte "últimos N"
  com a mesma premissa de numeração contínua.
- **Fase 2:** escala de cor, normalização, denominador.

### 2.5 Inéditas (`/lotofacil/ineditas`)

- `app/[loteria]/ineditas/page.tsx` + `lib/estatisticas.ts`
  (`getCoberturaTrincas` e possivelmente outras). **Fase 2:** ler a página e
  validar "combinações que nunca saíram".

### 2.6 Recordes (`/lotofacil/recordes`)

- `lib/recordes.ts` (`getRecordesLoteria`, `getMaioresPremiosPorLoteria`),
  `lib/recordes-regras.ts`. **Fase 2:** maiores prêmios, valores nominais
  (sem correção monetária), critério de empate.

### 2.7 Acúmulos (`/lotofacil/acumulos`)

- `components/AcumulosClient.tsx` (361 linhas), `getAcumulos`
  (`lib/queries.ts:459`): agrupa sequências de concursos sem ganhador na
  faixa 1 com `LAG(qtd_ganhadores, 1, 1)`.
- **Fase 2:** reconstrução independente das séries de acúmulo; tratamento da
  Independência (que não acumula) e dos concursos final 0.

### 2.8 Probabilidades (`/lotofacil/probabilidades`)

- `components/ProbabilidadesClient.tsx`: `calcularProbabilidades(25, 15, b,
  [11..15])` (`lib/probabilidades.ts:28`), b de 15 a 20; conversão "anos de
  espera" = `umEm / sorteiosPorSemana / 52`.
- `components/ProjecaoAcumuloCard.tsx` + `calcularProjecao`
  (`lib/probabilidades.ts:213`): p = 1/C(25,15); tickets = arrecadação ÷ R$ 3,50;
  fator de acúmulo +20% por concurso acumulado (até 5×); cenários ±50%.
- **Fase 2:** hipergeométrica (já conferida contra a Caixa para b = 15),
  arredondamento de `umEm`, interpretação para b > 15 (ficha 3.3), premissas
  da projeção (fator 20%, apostas uniformes, final 0, Independência).

### 2.9 Gerador de jogos (`/lotofacil/gerador`)

- `components/GeradorClient.tsx` (550 linhas), `lib/gerar-jogo.ts`
  (`gerarJogo`: amostragem uniforme + rejeição até 500 tentativas; se nenhuma
  passa, devolve a 1ª tentativa com `atendeuTodosFiltros: false`),
  `lib/gerador.ts` (`prepararDadosGerador`: 10 mais atrasadas, 10 mais
  frequentes, par/ímpar mais comum, top-3 faixas de soma, faltantes do ciclo,
  duques e trincas "quentes", top-2 de primos/Fibonacci/múltiplos de 3).
- Filtros: obrigatórias, excluídas, faixa de soma, par/ímpar, primos,
  Fibonacci, múltiplos de 3. RNG: `Math.random`.
- **Fase 2:** uniformidade (teste qui-quadrado sobre muitas gerações),
  respeito aos filtros, distinção entre jogos, comunicação de que filtros
  não mudam a chance.

### 2.10 Gerador "Data da sorte" (`/lotofacil/data-da-sorte`)

- `components/GeradorDataClient.tsx`, `gerarJogoDaData`
  (`lib/gerar-jogo.ts:155`): Fisher-Yates com mulberry32 semeado pela data.
- **Fase 2:** validade (15 distintas em 1..25), reprodutibilidade.

### 2.11 Gerador relâmpago (home/menus)

- `components/GeradorRelampago.tsx` (cita `lotofacil`). **Fase 2:** ler.

### 2.12 Fechamentos (`/lotofacil/fechamentos`)

- `components/FechamentoClient.tsx`, `lib/fechamento.ts`
  (`gerarFechamentoCompleto`, `gerarFechamentoReduzido` guloso,
  `verificarGarantia` exaustivo), `lib/fechamento-config.ts:16-20`
  (pool 16–20; garantias 11–14, só 11–12 no pool 20), probabilidade da
  pré-condição via `probabilidadeAoMenosK(dezenaMax, 15, pool, k)`.
- **Fase 2:** demonstrar a garantia "k se k"; checar se o texto deixa claro
  que é condicional; recontar o número de jogos; propor cotas inferiores.

### 2.13 Bolão (`/lotofacil/bolao`, `/b/[slug]`, área de membros)

- `components/BolaoClient.tsx`, `lib/bolao-opcoes.ts` (tabela fixa
  `OPCOES_BOLAO.lotofacil` com 18 combinações pool × garantia e total de
  jogos; `planosViaveis` por orçamento), `lib/bolao-limites.ts`,
  `lib/bolao-conferencia.ts`, `lib/bolao-pdf.ts`, `lib/bolao-actions.ts`.
- **Fase 2:** regenerar a tabela com `gerarFechamentoReduzido` e comparar;
  conferência do bolão (soma de prêmios por jogo); regras oficiais de bolão
  (cotas 2–7 para 15 números etc., ficha R18).

### 2.14 Conferidor (`/lotofacil/conferidor`)

- `components/ConferidorClient.tsx`, `components/ConferidorFoto.tsx` (OCR),
  `lib/conferidor-actions.ts`, `lib/conferidor.ts` (`conferirJogo` via
  `fn_conferir_jogo`; `calcularRetornoFinanceiro` com preço digitado pelo
  usuário), limite do plano grátis (`lib/conferidor-plano.ts`).
- Aceita **exatamente 15** dezenas (apostas de 16–20 não podem ser
  conferidas).
- Faixa achada por regex `(\d+)\s*acerto` na descrição.
- **Fase 2:** pontuação, faixa, valores, prêmio acumulado tratado como "não
  calculável", custo com preço único para todo o histórico.

### 2.15 Simulador histórico (`/lotofacil/simulador`) e comparador

- `components/SimuladorHistoricoClient.tsx` (836 linhas),
  `lib/simulador-actions.ts` (`simularHistorico`, `compararJogos`),
  `getDrawsParaSimulacao` (`lib/queries.ts:514`, JOIN interno com
  `premiacao_faixa`), `getMapaFaixasPorAcertos` (`lib/queries.ts:550`),
  `lib/simulador-plano.ts`, card compartilhável
  (`app/api/simulador/card/route.tsx`, `lib/card-simulador.ts`).
- Custo = nº de concursos × **R$ 3,50 atual**; ganho = prêmio nominal de
  cada concurso; faixa acumulada conta R$ 0.
- **Fase 2:** mistura de preço atual com prêmios históricos; concursos sem
  premiação omitidos; drawdown; textos.

### 2.16 Simulador de frequência aleatória (nas tabelas)

- `components/SimuladorFrequenciaAleatoria.tsx` (105 linhas). **Fase 2:**
  algoritmo, espaço amostral, comparação com a teoria.

### 2.17 Analisador (`/lotofacil/analisador`)

- `components/AnalisadorClient.tsx`, `lib/analisador.ts` (`analisar`).
  Distribuições **fixas no código** para a Lotofácil (`DIST_*_LF`,
  `CDF_SOMA_LF`), descritas como "combinatória exata"; rótulos ≥ 20% "Muito
  comum", ≥ 10% "Comum", ≥ 3% "Incomum"; soma vira "centralidade"
  100 − |50 − percentil|·2.
- **Fase 2:** recalcular todas as tabelas (incluindo sequência e CDF da soma
  por enumeração das 3.268.760 combinações); definir se aceita mais de 15
  dezenas.

### 2.18 Índice de Equilíbrio (`/lotofacil/equilibrio`)

- `components/EquilibrioClient.tsx`, `lib/equilibrio-actions.ts`,
  `lib/equilibrio.ts` (`calcularEquilibrio`): 7 critérios com pesos fixos
  (soma 0,25; pares 0,20; sequências 0,15; primos, Fibonacci, múltiplos de 3
  e moldura 0,10 cada), score = min(100, % histórico / 12 × 100), classes
  ≥75 / ≥55 / ≥35.
- Usa a distribuição **histórica** (concursos reais), enquanto o Analisador
  usa a distribuição **combinatória** — duas ferramentas de "tipicidade" com
  bases e limiares diferentes.
- **Fase 2:** fundamento dos pesos e do limiar de 12%, dependência da largura
  da faixa de soma, nome `percentilHistorico` (não é percentil), jogos com
  mais de 15 dezenas.

### 2.19 Ao vivo (`/lotofacil/ao-vivo`)

- `components/AoVivoClient.tsx`, `lib/calendario.ts`. **Fase 5:** horários.

### 2.20 Calculadoras gerais com Lotofácil

| Calculadora | Arquivo | O que tem de Lotofácil |
|---|---|---|
| Probabilidade de loteria | `app/calculadoras/probabilidade-loteria/CalcClient.tsx:5` | n 25, m 15, faixas 11–15 (implementação própria, a comparar com `lib/probabilidades.ts`) |
| Custo de aposta múltipla | `app/calculadoras/custo-aposta-multipla/CalcClient.tsx:16` | 15–20 números, R$ 3,50 |
| Valor esperado | `app/calculadoras/valor-esperado-aposta/CalcClient.tsx:10` | custo 3,5, prêmio R$ 1,5 mi, 1 em 3.268.760 |
| Rateio de bolão, imposto sobre prêmio, quanto rende | `app/calculadoras/*` | Genéricas; revisar só a parte de imposto (faixa de isenção) |

### 2.21 Textos educativos (dicas, análises, glossário, FAQ)

Afirmam números da Lotofácil: `app/dicas/*` (par-impar, soma, sequencias,
repetidas, duques-trincas, atraso, ciclos, frequencia, moldura-centro,
linhas-colunas, primos, fibonacci, multiplos-de-3, fechamento,
mais-dezenas-vale-a-pena, retorno-ao-apostador,
como-os-premios-sao-calculados, numeros-populares, vieses-cognitivos),
`lib/analises.ts` (3.469 linhas de artigos), `lib/glossario.ts`,
`lib/faq.ts`, `app/matematica/*`. **Fase 5:** conferir cada número contra
a ficha.

### 2.22 API pública, relatórios e conta

- `app/api/v1/resultados`, `app/api/v1/estatisticas` (mesmas funções SQL),
  `app/api/relatorio`, `app/api/cron/relatorio`, `lib/relatorio-pdf.ts`.
- Carteira e alertas: `lib/carteira.ts` (preço fixo 3,50),
  `lib/conferencia.ts` (`pontuarJogo`), `lib/alertas-jogo.ts`,
  `lib/notificacoes/*`, OCR (`lib/ocr-bilhete.ts`).
- **Fase 2/5:** mesma pontuação do Conferidor? mesmos valores?

### 2.23 Código morto ou sem fonte

- `components/TransicaoClient.tsx` + `lib/markov.ts` + `lib/markov-actions.ts`:
  não são usados por nenhuma página, e as funções SQL `fn_transicao_markov` e
  `fn_total_transicoes` não estão no repositório. Fora do ar para o usuário;
  registrar e não auditar.
- `PARAMS_LOTERIA.*.percFaixa1`: definido, nunca lido.

---

## 3. Implementações duplicadas da mesma regra

| Regra | Implementações | Risco |
|---|---|---|
| Primos | `ehPrimo` (`lib/classificacao.ts:7`), `fn_eh_primo` (SQL), `PRIMOS_LF` fixo e `gerarPrimos` (`lib/analisador.ts`) | Divergência entre telas |
| Fibonacci | `FIBONACCI_ATE_144` (TS), `fn_eh_fibonacci` (SQL), `FIB_LF` fixo, `gerarFibonacci` | Idem |
| Moldura/centro | `zonaDaDezena` (TS), `fn_zona_da_dezena` (SQL), `MOLDURA_LF` fixo, `gerarMoldura` | Idem |
| Maior sequência | `maiorSequenciaConsecutiva` (TS), `maiorSeq` (`lib/analisador.ts:76`), `fn_maior_sequencia_por_concurso` (SQL) | Idem |
| Pontuação de um jogo | `fn_conferir_jogo` (SQL), `pontuarJogo` (`lib/conferencia.ts`), `pontuarDraw` (`lib/simulador-actions.ts`), `conferirBolao` (`lib/bolao-conferencia.ts`) | Faixa por regex x por mapa derivado x por índice |
| Acertos → faixa | regex em `lib/conferencia.ts:57` e `lib/conferidor.ts:244`; `getMapaFaixasPorAcertos` (`lib/queries.ts:550`) | Mesma ideia, código separado |
| Probabilidade por faixa | `calcularProbabilidades` (`lib/probabilidades.ts`), calculadora própria (`app/calculadoras/probabilidade-loteria`), números escritos à mão em textos | Divergência |
| Preço da aposta | `PARAMS_LOTERIA`, calculadoras, carteira, simulador, textos | Reajuste exige editar vários lugares |
| "Tipicidade" de um jogo | Analisador (combinatória, tabelas fixas) x Equilíbrio (histórico, SQL) x `compararComHistorico` (histórico) | Notas diferentes para o mesmo jogo |

---

## 4. Componentes compartilhados com risco para outras loterias

Registrados para auditorias futuras; **não** fazem parte do escopo da
Lotofácil e não serão corrigidos nesta auditoria sem autorização:

- `fn_ciclo_atual` / `fn_ciclos_historico` comparam dezenas distintas com
  `dezena_max`. Na Lotomania (0–99, 100 dezenas) o ciclo fecharia com 99.
- `FechamentoClient.tsx:170` passa `dezenaMax` como tamanho do universo para
  `probabilidadeAoMenosK`; errado se uma loteria começar em 0 (hoje a
  Lotomania não tem fechamento).
- `fn_frequencia` e `getFrequenciaHeatmap` supõem numeração sem lacunas.
- Pesos do Equilíbrio: 7 loterias herdam os pesos da Lotofácil.

---

## 5. Arquivos a investigar nas próximas fases

Lidos nesta fase (mapeamento): `lib/probabilidades.ts`, `lib/estatisticas.ts`,
`lib/classificacao.ts`, `lib/categorias.ts`, `lib/gerar-jogo.ts`,
`lib/gerador.ts`, `lib/fechamento.ts`, `lib/fechamento-config.ts`,
`lib/equilibrio.ts`, `lib/analisador.ts`, `lib/conferencia.ts`,
`lib/conferidor.ts`, `lib/conferidor-actions.ts`, `lib/simulador-actions.ts`,
`lib/queries.ts`, `lib/markov.ts`, `lib/bolao-opcoes.ts`,
`supabase/schema.sql` (funções e tabelas), trechos de
`components/ProbabilidadesClient.tsx`, `components/FechamentoClient.tsx` e
`app/[loteria]/probabilidades/page.tsx`.

Ainda **não lidos** (Fase 2 e 5): `lib/destaques.ts`, `lib/recordes.ts`,
`lib/recordes-regras.ts`, `lib/resumo-concurso.ts`, `lib/links-concurso.ts`,
`lib/analise-concurso.ts`, `lib/insights.ts`, `lib/bolao-conferencia.ts`,
`lib/carteira.ts`, `lib/card-simulador.ts`, `lib/seo-tabelas.ts`,
`components/GeradorClient.tsx`, `components/AnalisadorClient.tsx`,
`components/EquilibrioClient.tsx`, `components/AcumulosClient.tsx`,
`components/ProjecaoAcumuloCard.tsx`, `components/HeatmapPageClient.tsx`,
`components/SimuladorHistoricoClient.tsx`,
`components/SimuladorFrequenciaAleatoria.tsx`, `components/SomaCalculadora.tsx`,
`components/BolaoClient.tsx`, `components/GeradorRelampago.tsx`,
`app/[loteria]/tabelas/[categoria]/page.tsx`, `app/[loteria]/ineditas/page.tsx`,
`app/calculadoras/probabilidade-loteria`, `custo-aposta-multipla`,
`valor-esperado-aposta`, `imposto-premio-loteria`, os artigos de `app/dicas/*`
e `lib/analises.ts`, e `importador.py` (Fase 3).

Testes existentes que tocam a Lotofácil: `lib/conferencia.test.ts`,
`lib/ocr-bilhete.test.ts`, `lib/resumo-concurso.test.ts`,
`lib/links-concurso.test.ts`, `lib/retrospectiva.test.ts`,
`lib/seo-tabelas.test.ts`, `lib/recordes-regras.test.ts`. **Não há** teste de
`probabilidades.ts`, `fechamento.ts`, `gerar-jogo.ts`, `analisador.ts`,
`equilibrio.ts` nem das funções SQL.
