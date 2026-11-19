# 05 — Testes independentes e evidências (Fase 4)

11/11/2026 · Vitest 3.2.7 · nenhum código de produção alterado.

## 1. Onde estão

| Arquivo | Conteúdo |
|---|---|
| `lib/auditoria/mega-sena/referencia.ts` | Implementação de referência **independente**: combinações em BigInt, hipergeométrica, conjuntos listados à mão (primos, Fibonacci, múltiplos de 3, moldura nas duas grades possíveis), tabela oficial da Caixa (45 células) e de preços, enumeração das 50.063.860 combinações, verificador de cobertura, cota de Schönheim, qui-quadrado, concurso real 3084. Não importa nada do código auditado. |
| `lib/auditoria/mega-sena/probabilidades.test.ts` | Probabilidades (45 células), `binomial`, pré-condição dos fechamentos, parâmetros, classificação do volante, `pontuarJogo` com o concurso 3084, projeção (propriedades), hub da Virada |
| `lib/auditoria/mega-sena/analisador.test.ts` | Tabelas fixas do Analisador x hipergeométrica e x enumeração; premissas do Equilíbrio e dos Destaques |
| `lib/auditoria/mega-sena/gerador.test.ts` | Validade, filtros, casos extremos, viés (qui-quadrado), Data da sorte |
| `lib/auditoria/mega-sena/fechamento.test.ts` | As 20 opções de fechamento/bolão, completo, propriedades da garantia, `planosViaveis` |
| `lib/auditoria/mega-sena/simulador.test.ts` | `pontuarDraw` com o concurso 3084, preço por época |
| `lib/auditoria/mega-sena/pendentes.test.ts` | `it.todo` de regressões que dependem de a regra virar função testável |
| `docs/auditorias/mega-sena/evidencias/fase2/` | Scripts com dados de produção (recontagem do SQL, backtest da projeção, retorno do simulador, Equilíbrio em todas as combinações, Destaques nos 3.084 concursos) |

Rodar: `npx vitest run lib/auditoria/mega-sena` (~5 s; a enumeração das
50 milhões de combinações leva ~3 s e é feita uma vez por arquivo).

### Convenção (a mesma da Lotofácil)

`it.fails` = problema comprovado e ainda não corrigido: o teste passa
**enquanto o erro existir** e falha quando ele for corrigido; quem corrigir
troca `it.fails` por `it`, e o teste vira regressão. `it.todo` = depende de
uma decisão de produto, de fonte oficial ou de a regra sair de um
componente/rota para uma função testável.

## 2. Resultado

**Suíte da Mega-Sena:** 110 testes passando (5 deles `it.fails`), 16 `todo`,
0 falhas.
**`lib/auditoria` inteira (Lotofácil + Mega-Sena):** 230 passando, 25
`todo`; três execuções seguidas com o mesmo resultado (os testes
estatísticos têm limiar com p ≈ 0,002).
`tsc --noEmit`: 0 erros. `eslint lib/auditoria/mega-sena docs/auditorias/mega-sena`: 0 erros.

| Grupo | Testes | Cobre | Resultado |
|---|---|---|---|
| Sanidade da referência | 5 | C(60,6); Σ = 1 para b = 6..20; 45 células da Caixa; 15 preços; moldura 28 nas duas grades | OK |
| Parâmetros | 3 | faixas 4–6; n, m, preço nas duas constantes; aposta de 6; 3 sorteios/semana | OK · MS-04, MS-11 `todo` |
| `binomial` | 1 | exato para C(60,k), k ≤ 20 | OK |
| `calcularProbabilidades` | 18 | b = 6..20 contra referência (erro < 1e-12) e Caixa; Σ = 1; aposta simples; monotonia | OK |
| `probabilidadeAoMenosK` | 2 | 20 pares (pool, k); pool 10 → 1 em 238.399 | OK |
| Classificação | 5 | primos, Fibonacci, múlt. 3, moldura 10×6, linha/coluna; maior sequência (5.000 jogos); concurso 3084 | OK · MS-06 `todo` |
| `pontuarJogo` (3084) | 8 | 0 a 6 acertos; sena acumulada sem valor inventado | OK |
| Projeção | 2 | p = 1/C(60,6); P ∈ [0,1], monotônica, cenários ±50% | OK · **MS-17 `fails`** (80 mi de apostas); MS-17, MS-05 `todo` |
| Hub da Virada | 3 | `tabelaApostas` = Caixa (6–20); 17 edições; 01/01 = ano anterior | OK |
| Analisador — categorias | 6 | pares, primos, Fibonacci, múlt. 3 (0..6); moldura 1..5; rótulos; jogos ≠ 6 | OK · **MS-01 `fails`** |
| Analisador — enumeração | 5 | soma 21–345, média 183, variância 1.647; CDF (325 somas, ≤ 0,06 p.p.); maior sequência (≤ 0,1 p.p.) | OK · **MS-22 `fails`**, **MS-02 `fails`** |
| Equilíbrio | 2 | pesos somam 1, moldura 0; premissa: maior faixa de soma < 12% | OK · MS-15 `todo` |
| Destaques | 1 | premissa: com a distribuição exata, toda soma fica < 15% | OK · MS-14 `todo` |
| Gerador | 9 | validade 6–20; obrigatórias/excluídas; filtros; impossível; extremos; χ² de 100.000 jogos; soma média; Data da sorte | OK · MS-16, MS-19 `todo` |
| Fechamento — config | 2 | pools 7–16, garantias 4 e 5; tabela = combinações permitidas | OK |
| Fechamento — 20 opções | 20 | jogos válidos, sem duplicata, garantia por verificador próprio, total = tabela, ≥ Schönheim | OK |
| Fechamento — propriedades | 6 | pools 7–8 ótimos; completo = C(v,6); detecção de cobertura quebrada; 20.000 sorteios; `planosViaveis`; premissa do MS-20 | OK · MS-20 `todo` |
| Simulador | 9 | `pontuarDraw` 0–6 acertos e sena acumulada; preço atual | OK · **MS-03 `fails`**; MS-13 `todo` |
| Pendentes | 5 | — | MS-07, MS-08, MS-21, MS-12, MS-10 `todo` |

### Problema novo encontrado pelos testes

**MS-22 (BAIXO):** a tabela fixa da maior sequência (`DIST_SEQ_MS`) tem duas
células que não são o arredondamento do valor exato: 2 seguidas = 38,8%
(exato 38,883% → 38,9%) e 3 seguidas = 3,1% (exato 3,042% → 3,0%). A Fase 2
tinha conferido essa tabela com tolerância de 0,1 p.p. e não viu.

## 3. Cobertura por problema

| Problema | Teste | Tipo |
|---|---|---|
| MS-01 | `analisador.test.ts` "MS-01: moldura com 0 e com 6" | `it.fails` |
| MS-02 | `analisador.test.ts` "MS-02: soma.pct" | `it.fails` |
| MS-03 | `simulador.test.ts` "MS-03" | `it.fails` |
| MS-17 | `probabilidades.test.ts` "estimativa padrão de apostas" | `it.fails` (+ backtest `todo`) |
| MS-22 | `analisador.test.ts` "MS-22" | `it.fails` |
| MS-14, MS-15, MS-20 | premissa matemática testada; regra completa `todo` | teste + `todo` |
| MS-04, MS-05, MS-06, MS-07, MS-08, MS-10, MS-11, MS-12, MS-13, MS-16, MS-19, MS-21 | `todo` (regra dentro de componente, rota ou SQL; ou fonte pendente) | `todo` |
| MS-18 | `evidencias/fase2/uniform.mjs` (dados de produção) | script |
| MS-09 | — (informativo) | — |

## 4. Evidências com dados de produção (não entram no Vitest)

Os testes do Vitest não acessam o banco. O que depende dos 3.084 concursos
fica nos scripts de `evidencias/fase2/`, com os resultados registrados em
`03-auditoria-matematica.md`: `hist.mjs` (21/21 estatísticas iguais ao SQL),
`uniform.mjs` (χ² 90,1; p = 0,0077; ciclo esperado 45,23), `proj.mjs`
(backtest), `equi.mjs` (Equilíbrio e Destaques), `sim.mjs` (retorno do
simulador), `acum.mjs` (acúmulos).

## 5. Atenção para quem corrigir

- `lib/auditoria/lotofacil/simulador.test.ts` afirma que "loterias sem
  tabela continuam com o preço atual" usando a Mega-Sena como exemplo.
  Corrigir o MS-03 quebra esse teste; trocar o exemplo por outra loteria.
- Os scripts `.ts` das evidências rodam com
  `node --import ./ts-loader.mjs arquivo.ts` dentro de `evidencias/fase2/`.
