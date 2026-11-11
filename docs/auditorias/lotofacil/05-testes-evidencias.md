# 05 — Testes independentes e evidências (Fase 4)

11/11/2026 · Vitest 3.2.7 · nenhum código de produção alterado.

## 1. Onde estão

| Arquivo | Conteúdo |
|---|---|
| `lib/auditoria/lotofacil/referencia.ts` | Implementação de referência **independente**: combinações em BigInt (exatas), hipergeométrica, conjuntos do volante listados à mão, enumeração das 3.268.760 combinações (Gosper), verificador de cobertura de fechamento, limite de Schönheim, qui-quadrado, tabela oficial da Caixa. Não importa nada do código auditado. |
| `lib/auditoria/lotofacil/probabilidades.test.ts` | Probabilidades, `binomial`, pré-condição do fechamento, projeção (propriedades), classificação do volante, `pontuarJogo` com o concurso real 3826 |
| `lib/auditoria/lotofacil/analisador.test.ts` | Tabelas fixas do Analisador x hipergeométrica e x enumeração completa |
| `lib/auditoria/lotofacil/fechamento.test.ts` | As 18 opções de fechamento/bolão, completo, propriedades da garantia |
| `lib/auditoria/lotofacil/gerador.test.ts` | Validade, filtros, viés (qui-quadrado), casos extremos, gerador por data |
| `lib/auditoria/lotofacil/pendentes.test.ts` | `it.todo` dos testes de regressão que dependem de a correção expor uma função pura |
| `docs/auditorias/lotofacil/evidencias/fase2/`, `fase3/` | Scripts com dados de produção (backtests, recontagem SQL, Monte Carlo) |

Rodar: `npx vitest run lib/auditoria` (~13 s; os pools 19 e 20 do fechamento
levam 1–3 s cada).

### Convenção para problemas comprovados

Testes de bugs confirmados usam `it.fails`: passam **enquanto o bug
existir** e passam a falhar quando ele for corrigido. Quem corrigir troca
`it.fails` por `it`, e o teste vira regressão. Testes que dependem de uma
decisão de produto (o formato certo) ou de código ainda não testável são
`it.todo`.

## 2. Resultado

**Suíte da auditoria:** 87 testes passando, 14 `todo`, 0 falhas.
**Suíte completa do projeto:** passa (40 arquivos de teste do repositório;
o `vitest run` também apanha 31 cópias em `.claude/worktrees/`, que passam).
`tsc --noEmit`: 0 erros. `eslint lib/auditoria`: limpo.

| Grupo | Testes | Cobre | Resultado |
|---|---|---|---|
| Sanidade da referência | 3 | C(25,15); Σ = 1 para b = 15..20; reproduz a tabela da Caixa (30 células, mesma precisão) | OK |
| Parâmetros | 3 | faixas 11–15; n, m, preço; aposta de 15 | OK |
| `binomial` | 2 | exato para todo C(25,k); domínio | OK |
| `calcularProbabilidades` | 13 | b = 15..20 contra a referência (erro ≤ 1e-15); Σ = 1; suporte [b−10, 15]; valores da aposta simples | OK · LF-09 `todo` |
| `probabilidadeAoMenosK` | 2 | 25 pares (pool, k) contra a referência; P(≥10) = 1 no pool 20 | OK |
| Projeção | 2 | p = 1/C(25,15); P ∈ [0,1] e monotônica | OK · LF-07 `todo` |
| Classificação | 5 | primos, Fibonacci, múlt. 3, moldura/centro, linha/coluna; maior sequência x referência (5.000 jogos) | OK |
| `pontuarJogo` (concurso 3826 real) | 12 | 5 a 15 acertos → faixa e valor certos; faixa acumulada sem valor inventado | OK |
| Analisador — categorias | 3 | valores ≥ 1% batem; rótulos coerentes; **caudas** | OK · **LF-03 `fails`** (10 células erradas) |
| Analisador — enumeração | 4 | média 195 e variância 325; CDF da soma (151 valores); maior sequência; **soma.pct** | OK · **LF-16 `fails`** |
| Analisador — entrada | 1 | jogo vazio → null | OK · LF-17 `todo` |
| Fechamento — config | 3 | pool 16–20; garantias 11–14; tabela do bolão = combinações permitidas | OK |
| Fechamento — 18 opções | 18 | jogos válidos, sem duplicata, garantia por verificador próprio, total = tabela do bolão, ≥ Schönheim | OK |
| Fechamento — propriedades | 5 | pools 16–17 ótimos; completo = C(v,15); detecção de cobertura quebrada; garantia contra 5.000 sorteios; `planosViaveis` | OK · LF-23 `todo` |
| Gerador — validade | 7 | 15–20 dezenas (12.000 jogos); obrigatórias/excluídas; filtros cumpridos quando declarados; impossível sinalizado; exclusão demais lança erro; **conflito**; **duplicata** | OK · **LF-25 `fails`** · **LF-26 `fails`** |
| Gerador — viés | 3 | qui-quadrado < 70 (24 gl, p ≈ 2e-6) em 60.000 jogos; soma média 195 ± 0,5; uniforme condicional com 7 pares (7/12 e 8/13) | OK |
| Gerador por data | 1 | 366 datas: válido e reprodutível | OK |

Os 4 `it.fails` foram conferidos à parte: falham exatamente pelos motivos
registrados (ex.: LF-03 falha nas 10 células primos 1/2/9, Fibonacci 0/1,
múltiplos de 3 1/8, moldura 6/13/14, e em nenhuma outra).

## 3. Evidências com dados de produção (fora do Vitest)

Dependem do export do banco e não rodam na suíte:

| Script | Prova |
|---|---|
| `fase2/hist.mjs` | 21 estatísticas SQL = recontagem independente |
| `fase2/defs.mjs` | 33 funções SQL de produção = `schema.sql` |
| `fase2/fit.mjs`, `era.mjs` | Aderência à teoria; LF-18 (Monte Carlo p = 0,0005) |
| `fase2/proj.mjs`, `fator.mjs` | LF-07 (backtest da projeção) |
| `fase2/sim2.mjs` | LF-04 (25% x 40%) |
| `fase2/equi.mjs` | LF-27 (93,7% "típico") |
| `fase2/dest.mjs` | LF-21 (85,6% "incomum") |
| `fase2/acum.mjs` | Acúmulos = SQL (3.333 séries) |
| `fase3/cmp.mjs` | 95 concursos = API da Caixa |
| `fase3/integ.mjs`, `integ2.mjs` | Integridade; 43,35% → 43,79% em 02/12/2024; dias de sorteio |

## 4. Limitações

- Simulador histórico, Equilíbrio, Destaques, calculadoras e textos não têm
  função pura exportada; os testes de regressão deles estão em
  `pendentes.test.ts` como `todo` e só poderão ser escritos junto com a
  correção.
- As funções SQL não têm teste automatizado no Vitest (não há banco nos
  testes); a equivalência foi provada pelos scripts da Fase 2 com os dados de
  produção.
- Testes estatísticos usam `Math.random` sem semente; os limites foram
  escolhidos para falso alarme desprezível (p ≈ 2e-6 no qui-quadrado,
  ±0,015 na frequência condicional, ~5σ).
