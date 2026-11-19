# 02 — Inventário das funcionalidades da Mega-Sena

Fase 1 · 11/11/2026 · `origin/main` em `762b4c2` (branch `auditoria/mega-sena`)

Mapa do que existe no código e mostra números ao usuário da Mega-Sena.
Nada aqui está aprovado: este documento só descreve e aponta o que a Fase 2
vai validar.

**Ponto de partida.** As páginas de `app/[loteria]/…` são compartilhadas
pelas 9 loterias, e a auditoria da Lotofácil já mapeou cada uma
(`docs/auditorias/lotofacil/02-inventario-funcionalidades.md`, seção 2).
Este inventário não repete aquele: lista o que é **específico da
Mega-Sena** e diz, para cada ferramenta compartilhada, quais parâmetros a
Mega-Sena recebe e se as correções da Lotofácil (PRs #70 e #71) valeram
para ela ou ficaram restritas à Lotofácil.

---

## 1. Parâmetros e fontes de dados

| Item | Onde | Valor para a Mega-Sena | Observação |
|---|---|---|---|
| Tabela `loteria` | banco, id **2** | 1–60, 6 sorteadas, `grid_colunas` **6** | Grade 10×6; confirmar com o volante (ficha R20) |
| Tabela `concurso` | banco | 3.084 concursos, nº 1–3084, 1996-03-11 a 2026-11-10 | Sem inválidos (tamanho, faixa, duplicidade); arrecadação ausente em 1–1076 |
| `premiacao_faixa` | banco | faixa 1 "6 acertos", 2 "5 acertos", 3 "4 acertos" em todos | Nunca houve Quina/Quadra sem ganhador |
| `FAIXAS_PREMIADAS.megasena` | `lib/probabilidades.ts:63` | [4, 5, 6] | OK |
| `PARAMS_LOTERIA.megasena` | `lib/probabilidades.ts:130-135` | n 60, m 6, `percFaixa1` 0,3565 (sem uso), `precoAposta` 6,00, `ticketsMedios` 80 mi | `ticketsMedios` sem fonte |
| `PRECO_APOSTA_SIMPLES` | `lib/mega-da-virada.ts:35` | 6 | **Segunda constante de preço**, separada de `PARAMS_LOTERIA` |
| `ERAS_PRECO` | `lib/precos-loteria.ts:24` | **ausente** para a Mega-Sena | Simulador cobra R$ 6 em todo o histórico desde 1996 (o problema LF-04 foi corrigido só para a Lotofácil) |
| `qtdDezenasAposta` | `lib/format.ts:23` | 6 | Conferidor aceita só apostas de 6 |
| Agenda | `lib/calendario.ts:33-37` | ter/qui 21h + dom 11h = 3/semana | Confere com F1; usada para converter atrasos históricos em dias com a frequência **atual** |
| Grupos fixos do Analisador | `lib/analisador.ts:15-19` | `PRIMOS_MS`, `FIB_MS`, `MULT3_MS`, `MOLDURA_MS`, `CENTRO_MS` | Moldura escrita para a grade 10×6 |
| Distribuições fixas do Analisador | `lib/analisador.ts:26-27, 87-94` | `CDF_SOMA_MS`, `DIST_*_MS` | Ver achados preliminares |
| Pesos do Equilíbrio | `lib/equilibrio.ts:51-54` | soma 0,30; pares 0,25; sequências 0,15; primos/Fib./múlt. 3 0,10; **moldura 0** | "Calibrados individualmente" sem documento de calibração |
| Fechamento | `lib/fechamento-config.ts:21-25` | pool 7–16; garantias 4 e 5 | |
| Tabela do bolão | `lib/bolao-opcoes.ts:46-67` | 20 combinações pool × garantia (5 a 1.420 jogos) | Fixa no código; regenerar e comparar |
| Exemplo da página de fechamentos | `app/[loteria]/fechamentos/page.tsx:36` | pool 10, completo 210, k 4 | C(10,6) = 210 confere |
| Faixa típica da soma | `components/AnalisadorClient.tsx:15` | "142–224" | = média ± 1 dp; 68,51% das combinações |
| Total de combinações em texto | `app/[loteria]/equilibrio/page.tsx:58` | "50.063.860" | Confere |
| Contagem de concursos em texto | `app/[loteria]/simulador/page.tsx:99` | "3.000+" | Hoje 3.084 |
| OCR | `lib/ocr-bilhete.ts:28` | 1–60, 6 | |
| Calc. probabilidade | `app/calculadoras/probabilidade-loteria/CalcClient.tsx:8` | n 60, m 6, faixas [6,5,4], **sem `max`** | A Lotofácil ganhou `max: 20` (LF-28); a Mega-Sena não |
| Calc. custo aposta múltipla | `app/calculadoras/custo-aposta-multipla/CalcClient.tsx:17` | 6 a 20, R$ 6,00 | Terceira constante de preço |
| Calc. valor esperado | `app/calculadoras/valor-esperado-aposta/CalcClient.tsx:9` | custo 6, prêmio R$ 50 mi, 1 em 50.063.860 | Ignora Quina e Quadra (análogo ao LF-29) |
| Calc. combinações | `app/calculadoras/combinacoes/CalcClient.tsx:37` | 60, 6 | |
| Relatório PDF e cron | `app/api/relatorio/route.ts:12`, `app/api/cron/relatorio/route.ts:20` | **R$ 5,00** (e Lotofácil 3,00) | Preço desatualizado |
| Projeção de acúmulo | `lib/probabilidades.ts:213` | p = 1/50.063.860, fator +20% por concurso acumulado | **Não há nenhuma referência a "final 0 ou 5"** no código |

---

## 2. Ferramentas por página (o que muda para a Mega-Sena)

Arquivos e algoritmos de cada ferramenta: inventário da Lotofácil, seção 2.
Abaixo, só o que é diferente ou precisa de atenção na Mega-Sena.

| # | Ferramenta | O que verificar na Mega-Sena (Fase 2) |
|---|---|---|
| 2.1 | Resultados, resumo, links do concurso (`lib/resumo-concurso.ts`, `lib/links-concurso.ts`, `lib/analise-concurso.ts`) | Ranking de prêmios com Virada misturada aos concursos normais; "concursos acumulados antes"; textos para 3 faixas de rateio |
| 2.2 | Tabelas (13 categorias; nenhuma excluída para a Mega-Sena) | Moldura/centro e linhas/colunas dependem da grade (R20); duques e trincas com ~1,8 saída esperada por trinca (ruído); recorte "últimos N"; atraso → dias com frequência atual (o histórico teve 1, 2 e 3 sorteios por semana) |
| 2.3 | Destaques (`lib/destaques.ts`) | Critérios e limiares calibrados para a Lotofácil (LF-21) aplicados a N = 60 |
| 2.4 | Heatmap | Desenho 10×6 x volante real; esperado 0,1 por concurso |
| 2.5 | Inéditas | Com 50 mi de combinações e 3.084 concursos, "nunca saiu" vale para 99,994% |
| 2.6 | Recordes (`lib/recordes.ts`) | Virada entra junto com concursos normais? valores nominais desde 1996 |
| 2.7 | Acúmulos (`components/AcumulosClient.tsx`, `getAcumulos`) | Séries com até dezenas de concursos (2.420 de 3.084 acumularam); filtros e escala (LF-22 dizia "herdados de outra loteria" — provavelmente desta); final 0/5; Virada |
| 2.8 | Probabilidades + Projeção | Tabela de b = 6 a 20 contra a Caixa (45 células); "anos de espera" com 3 sorteios/semana; projeção sem final 0/5, sem Virada, fator +20% e `ticketsMedios` 80 mi sem fonte; arrecadação ÷ R$ 6 conta tarifa de bolão e múltiplas |
| 2.9 | Gerador (`lib/gerar-jogo.ts`, `lib/gerador.ts`) | Uniformidade em 1–60; filtros (soma, par/ímpar, primos…) com faixas para 6 dezenas; "quentes" e "atrasadas" com N = 60 |
| 2.10 | Data da sorte | 6 distintas em 1–60; texto sobre aniversários (1–31) faz sentido aqui |
| 2.11 | Gerador relâmpago | Ler |
| 2.12 | Fechamentos | Garantias 4 e 5 para pools 7–16; probabilidade da condição; textos "garante" |
| 2.13 | Bolão (+ alvo "Mega da Virada") | Tabela fixa de 20 planos; regras oficiais de cotas (6 números: máx. 8 cotas; 7: 50; cota mínima R$ 7/R$ 8) e até 10 apostas por bolão — o organizador sugere planos de centenas de jogos simples, o que exige vários bolões na lotérica; preço via `PRECO_APOSTA_SIMPLES` |
| 2.14 | Conferidor | Só apostas de 6; regex de faixa; Virada (sem sena, prêmio vai para a Quina) |
| 2.15 | Simulador histórico + comparador + card | **Preço R$ 6 desde 1996** (sem eras); prêmios nominais; faixa acumulada vale R$ 0; Virada; card compartilhável |
| 2.16 | Simulador de frequência aleatória | p = 0,1, n = 3.084 |
| 2.17 | Analisador | Tabelas fixas da Mega-Sena; soma ainda como "centralidade" (correção LF-16 restrita à Lotofácil) |
| 2.18 | Equilíbrio | Pesos próprios sem documentação; moldura com peso 0 |
| 2.19 | Ao vivo / calendário | Mega-Semanas e datas oficiais fora da grade (`lib/calendario.ts:160`) |
| 2.20 | **Hub Mega da Virada** (`app/mega-da-virada/page.tsx`, `lib/mega-da-virada.ts`, `getEdicoesVirada` em `lib/queries.ts:634`) | Lista `CONCURSOS_VIRADA` (2009–2025) contra o banco; `resumirEdicao` (prêmio total = ganhadores × valor); frequência de dezenas em 17 edições (amostra mínima); `tabelaApostas` com `PRECO_APOSTA_SIMPLES` |
| 2.21 | **Kit de imprensa** (`app/imprensa/page.tsx`, `/imprensa/mega-da-virada.csv`, `lib/kit-imprensa.ts`) | Mesmos números do hub, publicados para jornalistas; maiores prêmios por loteria |
| 2.22 | **Rendimento do prêmio** (`app/calculadoras/quanto-rende-o-premio`) | Usa a Virada como exemplo; taxas do BCB |
| 2.23 | **Quiz** (`components/QuizClient.tsx`) | 8+ afirmações numéricas sobre a Mega-Sena (grade 10×6, 36% sem Fibonacci, maioria sem repetidas, moldura 28 x centro 32, dezenas acima de 31…) |
| 2.24 | Textos | 107 menções em `lib/analises.ts`; 27 arquivos de `app/dicas` e `app/matematica`; artigos citam "183" e "ciclo de mais de 45" (`lib/artigos.ts:30,62`); guia do bolão da Virada; Mega Semana |
| 2.25 | Notificações | Alertas de jogo, push de resultado, processamento de bolões da Virada (`lib/notificacoes/processar-boloes.ts:80`) — só conferência, sem cálculo próprio além de `pontuarJogo` |

---

## 3. Correções da Lotofácil e a Mega-Sena

| Problema da Lotofácil | A correção vale para a Mega-Sena? |
|---|---|
| LF-03 caudas das tabelas fixas do Analisador | **Não**: as tabelas `DIST_*_MS` continuam digitadas à mão |
| LF-04 preço por período no simulador | **Não**: `ERAS_PRECO` só tem Lotofácil |
| LF-16 soma como % de combinações | **Não**: o cálculo exato só roda se `isLF` |
| LF-17 jogos incompletos no Analisador | Sim (filtro por `qtdDezenasSorteadas`, genérico) |
| LF-28 limite de dezenas na calculadora | **Não**: só a Lotofácil recebeu `max` |
| LF-29 valor esperado ignora faixas menores | A verificar: o exemplo da Mega-Sena tem só a sena |
| LF-05 faixa acumulada vale R$ 0 sem aviso | A verificar no simulador da Mega-Sena |
| LF-07 projeção superestima ganhador | Mesmo modelo; recalibrar com dados da Mega-Sena |
| LF-08/LF-27 Equilíbrio sem fundamento e pouco discriminante | Pesos diferentes; mesma metodologia |
| LF-10 maior atraso ignora início e atraso corrente | Com atrasos longos da Mega-Sena, pode deixar de ser latente |
| LF-21 Destaques marca quase tudo como incomum | Mesmo código |
| LF-22 filtro/escala dos Acúmulos | Provavelmente calibrados para a Mega-Sena |
| LF-24 centavos da divisão por cota | Mesmo código |
| LF-46 decimais com ponto | Mesmo código |

---

## 4. Implementações duplicadas que tocam a Mega-Sena

Valem as da seção 3 do inventário da Lotofácil, mais:

| Regra | Implementações | Risco |
|---|---|---|
| Preço da aposta | `PARAMS_LOTERIA.megasena.precoAposta`, `PRECO_APOSTA_SIMPLES` (`lib/mega-da-virada.ts`), calculadoras, `PRECO` dos relatórios (R$ 5,00), textos | Já divergem (relatórios) |
| Moldura | `MOLDURA_MS` fixo, `gerarMoldura`, `fn_zona_da_dezena` (SQL, por `grid_colunas`), `zonaDaDezena` (TS) | Todas seguem 10×6; se o volante for 6×10, todas erram juntas |
| Chance da sena por aposta | `tabelaApostas` (hub da Virada), `calcularProbabilidades`, calculadora de probabilidade, valor esperado, textos | Divergência possível |
| Nomes das faixas | relatórios (`{6:"Sena",5:"Quina",4:"Quadra"}`), regex "acertos" | |

---

## 5. Riscos para outras loterias (registrar, não corrigir aqui)

- `ERAS_PRECO` existe só para a Lotofácil: todas as outras 8 loterias têm o
  mesmo problema do simulador.
- Preço desatualizado nos relatórios afeta também a Lotofácil (R$ 3,00).
- A correção da soma do Analisador (LF-16) é exclusiva da Lotofácil; as
  outras 7 loterias usam o caminho da "centralidade".
- Calculadora de probabilidade sem limite de dezenas nas loterias sem `max`.

---

## 6. Arquivos a investigar na Fase 2

Específicos da Mega-Sena: `lib/mega-da-virada.ts`, `app/mega-da-virada/page.tsx`,
`lib/kit-imprensa.ts`, `app/imprensa/page.tsx`, `lib/queries.ts`
(`getEdicoesVirada`, `getAcumulos`, `getDrawsParaSimulacao`),
`lib/precos-loteria.ts`, `app/api/relatorio/route.ts`,
`app/api/cron/relatorio/route.ts`, `components/QuizClient.tsx`,
`lib/artigos.ts`, os trechos da Mega-Sena em `lib/analises.ts` e `app/dicas/*`.

Compartilhados, com parâmetros da Mega-Sena: `lib/analisador.ts`,
`lib/equilibrio.ts`, `lib/fechamento.ts` + `lib/bolao-opcoes.ts`,
`lib/gerar-jogo.ts`, `lib/gerador.ts`, `lib/destaques.ts`, `lib/recordes.ts`,
`lib/simulador-actions.ts`, `lib/simulador-pontuacao.ts`, `lib/conferencia.ts`,
`lib/bolao-conferencia.ts`, `lib/insights.ts`, `components/AcumulosClient.tsx`,
`components/ProjecaoAcumuloCard.tsx`, `components/ProbabilidadesClient.tsx`,
`components/HeatmapPageClient.tsx`, `components/SimuladorFrequenciaAleatoria.tsx`,
funções SQL de estatística (`supabase/schema.sql`) rodadas com `loteria_id = 2`.

Testes existentes que já usam dados da Mega-Sena: `lib/conferencia.test.ts`,
`lib/bolao-conferencia.test.ts`, `lib/mega-da-virada.test.ts`,
`lib/alertas-jogo.test.ts`, `lib/calendario.test.ts`. Não há referência
independente da Mega-Sena para probabilidades, analisador, fechamento,
gerador ou simulador.
