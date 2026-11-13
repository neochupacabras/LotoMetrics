# 06 — Registro de problemas da Mega-Sena

Atualizado na Fase 5 (12/11/2026). Gravidades ainda podem mudar na
consolidação (Fase 6). Demonstrações em `03-auditoria-matematica.md` (cálculo)
e `03b-auditoria-apresentacao.md` (telas e textos).

Status: **Comprovado** = demonstrado por cálculo, execução ou leitura
direta do código; **Suspeita** = indício, falta demonstração; **Pendente**
= depende de fonte externa.

Origem (como no registro da Lotofácil): R = regra/premissa, F = fórmula,
P = parâmetro, D = dados, I = implementação, A = apresentação,
C = componente compartilhado.

| ID | Gravidade | Status | Origem | Ferramenta | Arquivo | Resumo |
|---|---|---|---|---|---|---|
| MS-14 | ALTO | Comprovado | P/C | Destaques | `lib/destaques.ts:141` | Limiar de 15% com soma em faixas de 10 (máx. 10,4% na Mega-Sena): **100% dos 3.084 concursos** seriam "resultado incomum" |
| MS-13 | ALTO | Comprovado | R/A | Simulador histórico | `components/SimuladorHistoricoClient.tsx:645` | Compara o retorno com "média histórica de ~43% para qualquer combinação"; a média real de todas as combinações no próprio simulador é 9,5% (R$ 6 fixo) ou ≥ 16,8% (preço da época). Quase todo jogo aparece "abaixo da média". Fase 5: a página do Simulador ("espera perder ~57%") e a do Conferidor repetem a referência de ~43% |
| MS-32 | ALTO | Comprovado (Fase 5) | A | Artigo "acúmulos longos" | `lib/analises.ts` (slug `megasena-acumulos-longos-historico`) | "Sequências de acúmulo de 30, 40 e até mais concursos", "ultrapassaram os 20": o recorde é 17 sem ganhador (18 com o que pagou) |
| MS-33 | ALTO | Comprovado (Fase 5) | R/A | Artigo "quina vs sena" | `lib/analises.ts` (slug `mega-sena-chance-real-quina-vs-sena`) | "35% sena, 19% quina, 19% quadra": a regra oficial é 40/10/10 do prêmio bruto, mais 25% para final 0/5 e 15% para a Virada |
| MS-03 | ALTO | Comprovado | P/C | Simulador histórico, comparador, card | `lib/precos-loteria.ts:24-34` | Sem eras de preço: R$ 6,00 em todos os concursos desde 1996 (R$ 2,50 até 2015, menos antes). Retorno do histórico completo cai de ≥ 16,8% para 9,5%. Mesmo defeito do LF-04 |
| MS-02 | ALTO | Comprovado | A/C | Analisador | `lib/analisador.ts:322-334`, `components/AnalisadorClient.tsx:82` | Soma exibida como "% das combinações possíveis" usando a "centralidade": soma 183 → 99,0% (real 9,55% para 180–189); soma 120 → 12,6% e "Raro" (real 3,65%). Mesmo defeito do LF-16 |
| MS-01 | MÉDIO | Comprovado | P | Analisador | `lib/analisador.ts:90` | Tabela da moldura com pontas erradas: 0 → 0,02% (exato 1,81%); 6 → 2,52% (exato 0,75%) |
| MS-15 | MÉDIO | Comprovado | R/P | Equilíbrio | `lib/equilibrio.ts:51-54, 109-112` | 84,7% das combinações são "típico", 0% "atípico"; nota 100 impossível (máx. 96, teto de 12% herdado da Lotofácil); pesos "calibrados" sem registro; moldura com peso 0 sem justificativa |
| MS-16 | MÉDIO | Comprovado | P/C | Probabilidades, Gerador | `components/ProbabilidadesClient.tsx:9`, `components/GeradorClient.tsx:24` | `QTD_EXTRA_DEZENAS_MAX = 5` (15 + 5 = 20 na Lotofácil) limita a Mega-Sena a **11** dezenas; o máximo oficial é 20 |
| MS-17 | MÉDIO | Comprovado | R/P | Projeção de acúmulo | `lib/probabilidades.ts:130-135, 203-245` | Superestima a chance de ganhador nos concursos normais (20,5% x 16,6% observados, ≈ 3,4 EP; 251 x 210 ganhadores); `ticketsMedios` 80 mi x 9,7 mi reais. O fator +20% confere até ~7 acumulados e subestima depois |
| MS-05 | MÉDIO | Comprovado | R | Projeção de acúmulo | `lib/probabilidades.ts:213` | Ignora a regra de final 0 ou 5 (25% do bruto) e a reserva da Virada (15%); concursos de final 0/5 pagam mais (mediana R$ 81,5 mi x R$ 53,9 mi desde 2024) |
| MS-20 | MÉDIO | Comprovado | F | Fechamentos, Bolão | `lib/fechamento.ts`, `lib/bolao-opcoes.ts:46-67` | Garantias corretas, mas algoritmo guloso bem acima do ótimo: 12 números/garantia 5 = 226 jogos, o ótimo (Steiner S(5,6,12)) é 132 (R$ 1.356 x R$ 792); 16/5 = 1.420 x cota inferior 728. A ferramenta não diz que o fechamento não é mínimo |
| MS-04 | MÉDIO | Comprovado | P | Relatórios PDF | `app/api/relatorio/route.ts:12`, `app/api/cron/relatorio/route.ts:20` | Preço fixo R$ 5,00 (atual R$ 6,00); Lotofácil em R$ 3,00 |
| MS-06 | MÉDIO | Comprovado (Fase 5; imagem oficial em baixa resolução) | D/P | Moldura/centro, linhas/colunas, Heatmap, Analisador, Quiz, 2 artigos | banco `grid_colunas = 6`; `lib/analisador.ts:18-19` | Volante oficial e seletor do próprio site: 6 linhas × 10 colunas. Heatmap, moldura, linhas/colunas, Analisador, Quiz e `dicas/linhas-colunas` e `dicas/moldura-centro` usam 10 × 6. Ex.: o Analisador diz "2 na borda" para 10-20-30-35-40-48; no volante são 4. Os percentuais de distribuição da moldura não mudam (28 dezenas nas duas) |
| MS-23 | MÉDIO | Comprovado (Fase 5) | A/C | Bolão | `app/[loteria]/bolao/page.tsx` | Texto com números da Lotofácil na página da Mega-Sena: "18 dezenas", "garantia de 13 … um bilhete faz 13 pontos" (impossível: 6 sorteadas, pool até 16, garantia 4 ou 5) |
| MS-29 | MÉDIO | Comprovado (Fase 5) | A | Artigo de atraso | `app/dicas/atraso/page.tsx:199-205` | "Atraso de 100 concursos: 0,0000265%" (correto 0,00265%, erro de 100×); "atrasos acima de 100 já ocorreram para dezenas" (só a 42, com 108) |
| MS-30 | MÉDIO | Comprovado (Fase 5) | A | Artigo de duques e trincas | `app/dicas/duques-trincas/page.tsx:185-190` | "A maioria das 34.220 trincas nunca apareceu junta" (83,2% já saíram, segundo a própria página Inéditas); "1 em 1.670 sorteios" (1 em 1.711) |
| MS-31 | MÉDIO | Comprovado (Fase 5) | A | Artigo de soma | `app/dicas/soma/page.tsx:134-175` | Média "183,5" (183); faixa 152–215 "≈ 80%" (56,0%); "somas < 100 ou > 270, cada uma < 0,1%" (a soma 99 tem 0,12%) |
| MS-34 | MÉDIO | Comprovado (Fase 5) | A | Artigo "como jogar" | `lib/analises.ts` (slug `como-jogar-mega-sena-regras-completas`) | "Sorteios às terças, quintas e sábados": domingo às 11h desde 19/07/2026 (como o LF-47) |
| MS-35 | MÉDIO | Comprovado (Fase 5) | A | Artigo do prêmio anunciado | `lib/analises.ts` | "Concurso típico sem acúmulo: 20–30% de chance de ganhador": observado 9,3% (237 concursos desde 2016) |
| MS-07 | BAIXO | Comprovado | P | Calc. probabilidade | `app/calculadoras/probabilidade-loteria/CalcClient.tsx:8` | Sem `max`: aceita 6 a 60 dezenas (ex.: 55 → "sena: 1 em 2") |
| MS-19 | BAIXO | Comprovado | I | Gerador | `lib/gerador.ts:81-87` | "Faixa de soma mais comum" = mín. a máx. das 3 maiores faixas (180, 200, 170) → 170–209, incluindo 190–199, que não está entre as 3 |
| MS-21 | BAIXO | Comprovado | R/A | Acúmulos | `lib/queries.ts:459` | As 17 Viradas fecham "séries de acúmulo" como se pagassem o acumulado delas; o prêmio da Virada vem da reserva especial e a Virada não acumula |
| MS-22 | BAIXO | Comprovado (Fase 4) | P | Analisador | `lib/analisador.ts:88` | Tabela fixa da maior sequência mal arredondada em 2 células: 2 seguidas 38,8% (exato 38,883%), 3 seguidas 3,1% (exato 3,042%) |
| MS-08 | BAIXO | Comprovado | A | Calc. valor esperado | `app/calculadoras/valor-esperado-aposta/CalcClient.tsx:9` | Exemplo "Mega-Sena (sena)" correto como cálculo, mas não avisa que Quina e Quadra (8,76% da arrecadação) ficam de fora |
| MS-12 | BAIXO | Suspeita | R | Tabelas (atraso), Destaques | `lib/insights.ts:37` | Atraso convertido em dias com a frequência atual (3/semana); histórico teve 1, 2 e 3 por semana. Verificar na Fase 5 |
| MS-24 | BAIXO | Comprovado (Fase 5) | A | Analisador | `components/AnalisadorClient.tsx` | "6 de 7 características batem com o que a maioria já jogou": a comparação é com as combinações possíveis, não com jogos feitos |
| MS-25 | BAIXO | Comprovado (Fase 5) | A/C | Tabela de ciclos | `app/[loteria]/tabelas/[categoria]/page.tsx` | "Faltam apenas 34 dezenas" (texto da Lotofácil); média dos 15 últimos ciclos (49) sem dizer que o histórico é 47,4 e o esperado 45,2 (como o LF-45) |
| MS-26 | BAIXO | Comprovado (Fase 5) | A | Tabela de linhas/colunas | `app/[loteria]/tabelas/[categoria]/page.tsx` | "O ponto quente do volante: linha 6 e coluna 5" sem a variação esperada (coluna 5 a +2,4 dp, a maior de 6; linha 6 a +1,4 dp); sugere tendência |
| MS-36 | BAIXO | Comprovado (Fase 5) | A | Tabela de soma | `app/[loteria]/tabelas/[categoria]/page.tsx` | Histograma pula as faixas vazias 300–309 e 320–329; a cauda parece contínua |
| MS-37 | BAIXO | Comprovado (Fase 5) | A/C | Várias telas | — | Decimais com ponto ("7.6%", "R$324.9M", "183.04", "30.77%") e rótulos "Nao Primo", "Multiplo De 3" (como o LF-46) |
| MS-18 | INFORMATIVO | Comprovado (estatística) | D? | Tabelas, textos | — | Frequências rejeitam uniformidade: χ² 90,1 (59 gl), p Monte Carlo 0,0077; concentrado nos concursos 1–500, 1001–1500, 2001–2500. Mesma natureza do LF-18 |
| MS-09 | INFORMATIVO | Comprovado | A | Bolão | `components/BolaoClient.tsx` | O organizador é rateio entre amigos, não o bolão oficial (2–100 cotas, até 10 apostas); oportunidade de explicar a diferença |
| MS-10 | INFORMATIVO | Pendente (fonte) | R | Hub da Virada, Acúmulos | — | Regra da "Mega 30 Anos" (F1) não identificada no banco nem no código |
| MS-27 | INFORMATIVO | Comprovado (fontes jornalísticas) | D/A | Hub da Virada, artigos | `app/mega-da-virada/page.tsx`, `lib/analises.ts` | "A primeira edição foi em 2009": em 31/12/2008 houve concurso especial de fim de ano (nº 1035, outro nome, acumulou); explicar o critério |
| MS-28 | PENDENTE | Pendente (fonte) | R/A | Calc. imposto, artigo de prêmios, imprensa, calc. rendimento | `app/calculadoras/imposto-premio-loteria`, `app/dicas/como-os-premios-sao-calculados`, `app/imprensa` | Contradição interna: calculadora "30% sem isenção" x artigo "isentos até R$ 2.280" (notícias: R$ 2.259,20). Notícias também divergem se o prêmio anunciado pela Caixa é bruto ou líquido ("R$ 1 bi vira R$ 700 mi") |
| MS-11 | INFORMATIVO | Comprovado | P | Código | `lib/probabilidades.ts:132`, `lib/mega-da-virada.ts:35` | Quatro lugares com preço da Mega-Sena; `percFaixa1` 0,3565 sem uso e diferente da regra |

Total após a Fase 5: 6 altos, 14 médios, 11 baixos (1 suspeita),
5 informativos, 1 pendente — 37 itens (MS-01 a MS-37). Confirmados também
na tela publicada: MS-02, MS-05, MS-14, MS-16. Testes dos itens de cálculo:
`05-testes-evidencias.md`, seção 3; os de texto (Fase 5) ainda não têm
teste.

Registrado para outras auditorias (fora do escopo): Quiz "+Milionária 1 em
238.360.656" (238.360.500); Quiz "Quina, 2 acertos ≈ 1 em 37" (35,6);
artigo de comparação com a Lotofácil "14 acertos 1 em 4.655; 13: 334; 12: 52"
(21.792; 692; 60); artigo da Quina "5 vezes por semana" (agenda: 6).

## Aprovações relevantes (sem problema)

- 45 de 45 probabilidades iguais à Caixa; tabela de preço/chance do hub da
  Virada idem.
- 21 de 21 estatísticas históricas do SQL iguais à reconstrução.
- 20 de 20 planos de fechamento com garantia verificada e contagem igual à
  tabela fixa.
- Gerador uniforme e sem violações de filtro; Data da sorte reprodutível.
- Ciclo esperado 45,2 concursos (artigo "mais de 45" correto).
