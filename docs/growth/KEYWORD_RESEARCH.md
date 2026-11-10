# Pesquisa de palavras-chave

> **Limite metodológico, explícito:** não houve acesso a Keyword Planner, Semrush, Ahrefs ou Google Trends com API. As únicas medidas reais são as **impressões do Google Search Console do próprio site** (90 dias, 08/08–06/11/2026, até 1.000 consultas; consultas anonimizadas ficam de fora). Impressão ≠ volume de mercado: indica que a demanda existe e quanto dela o site já vê. Dificuldade e volume de mercado são **qualitativos** (Baixa/Média/Alta) e derivam da composição da SERP (portais, Caixa, concorrentes de nicho) observada em buscas na web.
>
> **Como validar os volumes:** (1) Google Keyword Planner com uma conta Google Ads gratuita, sem campanha ativa; (2) Google Trends para sazonalidade ("mega da virada", "lotofácil da independência"); (3) a função "Pessoas também perguntam" da SERP. Ver o roteiro de validação no fim.

## 1. Clusters em que o site já aparece [FATO: dados do GSC]

| Cluster | Exemplos de consulta | Impr. 90d | Cliques | Pos. média | Página que ranqueia | Diagnóstico |
|---|---|---|---|---|---|---|
| **"Eu teria ganho"** | eu teria ganho na lotofácil (861), na mega sena (411), eu teria ganhado na mega sena (266), na mega-sena (161), …na milionária (49), …na lotomania (31) | ~2.450 | ~6 | 7–9 | `/[lot]/simulador` | Demanda transacional forte, já na página 1, CTR quase zero. **Prioridade máxima.** |
| **Lotofácil da Independência** | lotofácil independência 2026 (1.364), da independência 2026 (331) | ~1.750 | ~19 | 6–10 | `/analises/lotofacil-independencia-2026-guia-completo` | Sazonal (ago/set). Repetir em 2027 com URL perene. |
| **Dezenas repetidas** | dezenas repetidas lotofacil (347), …da lotofácil (278), tabela de dezenas repetidas (230), repetidas lotofacil (187) | ~1.560 | ~8 | 7,5–9,5 | `/dicas/repetidas` **e** `/lotofacil/tabelas/repetidas` | Canibalização. A intenção é "ver a tabela". |
| **Ciclo das dezenas** | ciclo mega sena (371), ciclo da mega sena (160), ciclo mais milionária (77), ciclo da mega (67) | ~1.050 | ~9 | 8–10 | `/megasena/tabelas/ciclos` | Bom encaixe, CTR baixo. "ciclo lotofácil" está na pos. 48–60 (Lotofácil é mais disputada). |
| **Trincas/duplas que mais saem** | trincas da quina que mais saem juntas (52), trincas que mais saem na quina (34), timemania (22), dia de sorte (16), duplas timemania (19) | ~180+ | ~10 | 5–9 | `/[lot]/tabelas/duques-trincas` | **Melhor CTR do site.** Pouca concorrência. Expandir para "quadras" e por dezena. |
| **Comportamento / linhas e colunas** | tabela de comportamento das dezenas lotofácil (69), linhas e colunas que mais saem (18) | ~120 | 8 | 12–13 | `/lotofacil/tabelas/linhas-colunas` | Nicho de "apostador analítico". |
| **Concurso específico** | quina 3126 resultado, mega sena 3034, dupla sena 311 | ~230 visíveis (cauda enorme) | ~12 | 8–33 | `/[lot]/resultados/[n]` | Dominado por portais e pela Caixa. Ganho só na janela pós-sorteio. |
| **Termos principais** | estatística da lotofácil (85), estatisticas lotofacil (64–68), gerador de jogos lotofacil (55), simulador lotofácil (45–57), fechamentos lotofácil (53) | ~400 | ~3 | 45–85 | hubs | Alta dificuldade. Médio/longo prazo, via autoridade. |
| **Gerador com filtros** | gerador dia de sorte com filtros (16 → 5 cliques, pos. 5,8), gerador lotofacil com filtros (pos. 46) | ~110 | ~10 | variável | `/[lot]/gerador` | Funciona nas loterias menores. |

## 2. Mapa de oportunidades (inclui demanda que o site ainda não captura)

Legenda: Vol. = volume de mercado qualitativo · Dif. = dificuldade · Rel. = relevância para o negócio · P = prioridade (P0 = já, P3 = depois).

### 2.1 Transacionais e de ferramenta (convertem melhor)

| Palavra-chave | Intenção | Vol. | Dif. | Concorrência observada | Rel. | Tipo de página | P |
|---|---|---|---|---|---|---|---|
| eu teria ganho na mega sena / lotofácil / quina… | Usar ferramenta | Alto [HIPÓTESE: ~2.450 impr. só na pos. 8] | Média | Só Matemática, Valor Final, Intersena | Muito alta | Simulador com campo de números acima da dobra | **P0** |
| conferir jogo mega sena / conferidor lotofácil | Usar ferramenta | Alto | Alta (Caixa, portais) | Caixa, Sorte Online, portais | Muito alta | Conferidor (já existe) + conferir por foto | P1 |
| meus números já saíram mega sena | Usar ferramenta | Médio | Média | Só Matemática, "Você Pergunta" | Alta | Variação de título/H2 do simulador | P0 |
| fechamento lotofácil 18 dezenas garantia 14 | Usar ferramenta | Médio (cauda longa) | Média | **Valor Final** (página por combinação) | Alta | Páginas programáticas de fechamento | P1 |
| como organizar bolão / planilha bolão mega da virada | Resolver problema | Alto em dezembro | Baixa–média | Artigos genéricos, planilhas | **Máxima** (produto Pro) | Landing do organizador + modelo de planilha | **P0** |
| rateio bolão / quanto cada um ganha no bolão | Calcular | Médio | Baixa | Calculadoras genéricas | Alta | Calculadora (já existe `/calculadoras/rateio-bolao`) | P1 |
| imposto prêmio loteria / quanto recebe líquido mega sena | Calcular | Médio, com pico na Virada | Média | Portais de finanças | Média | Calculadora (já existe: 174 impr., 0 cliques) | P1 |
| quanto custa apostar 7, 8, 9… números mega sena | Calcular/decidir | Médio | Baixa–média | Portais e Caixa | Média | Tabela de preços + calculadora de aposta múltipla | P2 |

### 2.2 Informacionais com dados próprios (escaláveis)

| Palavra-chave | Intenção | Vol. | Dif. | Rel. | Tipo de página | P |
|---|---|---|---|---|---|---|
| dezenas repetidas lotofácil (variações) | Ver dados | Médio | Média | Alta | Tabela como página principal; artigo como apoio | **P0** |
| ciclo mega sena / ciclo lotofácil / ciclo +milionária | Ver dados | Médio | Média | Alta | Tabela de ciclos com "ciclo atual: faltam X dezenas" | **P0** |
| trincas / duplas / quadras que mais saem na [loteria] | Ver dados | Baixo–médio por loteria; soma alta | **Baixa** | Alta | Tabela por loteria (existe) + página por dezena | P1 |
| números mais sorteados da mega sena / lotofácil | Ver dados | **Alto** | Alta | Alta | Hub de frequência com data de atualização | P1 |
| dezenas atrasadas lotofácil hoje | Ver dados | Médio | Média | Alta | Tabela de atraso (existe; pos. 17 na Mega) | P1 |
| número X na mega sena (ex.: "número 10 mega sena quantas vezes saiu") | Curiosidade | Baixo por URL; cauda longa grande | **Baixa** | Média | Página por dezena (programático) | P2 |
| mega da virada números mais sorteados / histórico | Ver dados | **Muito alto (dezembro)** | Alta | Alta | Hub Mega da Virada | **P0** |
| lotofácil da independência 2027 | Ver/planejar | Alto (ago/set) | Média | Alta | URL perene `/lotofacil/independencia` | P2 (julho/2027) |
| quina de são joão / dupla sena de páscoa | Ver/planejar | Alto (sazonal) | Média | Alta | URLs perenes sazonais | P2 |

### 2.3 Educacionais (autoridade e GEO)

| Palavra-chave | Intenção | Vol. | Dif. | Rel. | Tipo | P |
|---|---|---|---|---|---|---|
| qual a chance de ganhar na mega sena | Aprender | Alto | Alta | Média | Calculadora de probabilidade + artigo (existe) | P2 |
| vale a pena jogar mais dezenas | Decidir | Médio | Média | Alta | Artigo existente (87 impr.) | P2 |
| como funciona o bolão da caixa / bolão oficial vs bolão entre amigos | Aprender | Médio–alto | Média | **Alta** (leva ao organizador) | Guia comparativo | P1 |
| como os prêmios são calculados / rateio | Aprender | Médio | Média | Média | Existe (293 impr., pos. 8) | P2 |
| prêmio da mega sena prescreve? prazo para resgatar | Resolver | Médio | Média | Média | FAQ e guia | P2 |
| como receber prêmio da lotofácil acima de R$ 2.259,20 | Resolver | Médio | Média | Baixa | Guia [validar o valor vigente no site da Caixa] | P3 |

### 2.4 Comparação e alternativas

| Palavra-chave | Vol. | Dif. | Tipo | P |
|---|---|---|---|---|
| melhor loteria para ganhar / qual loteria é mais fácil | Médio–alto | Média | Comparador (existe `/comparador`) com tabela de chances e retorno | P1 |
| lotofácil ou mega sena qual vale mais a pena | Médio | Média | Análise existente (74 impr.) | P2 |
| app para conferir loteria / app resultados loteria | Alto | Alta (apps com centenas de milhares de instalações, segundo estimativas do AppGoblin) | Página `/aplicativo` (PWA) | P2 |
| planilha de bolão vs app de bolão | Baixo–médio | Baixa | Comparativo honesto | P2 |

### 2.5 Emergentes / tendências [HIPÓTESE]

- **Apostas online da Caixa** e o crescimento do canal digital: na Mega da Virada 2025, metade dos 6 ganhadores apostou pelo canal eletrônico (folhavitoria.com.br, dgabc.com.br). Buscas do tipo "como fazer bolão online", "bolão pelo app da Caixa" tendem a crescer.
- **Busca por IA** (ChatGPT, Perplexity, AI Overviews): 105 aterrissagens via ChatGPT em 30 dias. Consultas conversacionais ("eu teria ganho se tivesse jogado X?") se encaixam no simulador.
- **Prêmios recordes**: a Mega da Virada 2025 pagou R$ 1,09 bilhão (infomoney.com.br). Cada edição recorde puxa buscas de "quanto rende 1 bilhão na poupança" e "imposto do prêmio".

## 3. Lacunas de conteúdo (demanda que concorrentes capturam e o site não)

| Lacuna | Quem atende hoje | O que fazer |
|---|---|---|
| Página por combinação de fechamento ("18 dezenas garantia 14") | Valor Final | Páginas programáticas com a matriz pronta para baixar (ver SEO_PROGRAMMATIC_STRATEGY.md) |
| Hub permanente da Mega da Virada | Portais de notícia, Caixa | `/mega-da-virada` com histórico, prêmios, números mais sorteados nas Viradas, organizador de bolão e contagem regressiva |
| "Como organizar bolão" com ferramenta real | Artigos genéricos; Valor Final anuncia um "bolão cofre" ainda não lançado | Landing do organizador (o site já tem o produto e está à frente) |
| Página por dezena ("dezena 13 na Lotofácil") | Pouca coisa; portais fazem notas avulsas | Programático controlado (ver estratégia) |
| Recordes e curiosidades atualizados automaticamente | Notícias avulsas (Tribuna de Jundiaí, Money Times) | "Recordes da Lotofácil" gerados do banco |

## 4. Roteiro de validação (antes de investir em cada cluster)

1. **Keyword Planner** (grátis): exportar volumes de "mega da virada", "bolão mega da virada", "eu teria ganho na mega sena", "dezenas repetidas lotofácil", "fechamento lotofácil", "números mais sorteados mega sena".
2. **Google Trends**: comparar "mega da virada" com "lotofácil da independência" nos últimos 5 anos para dimensionar o pico de dezembro.
3. **GSC semanal**: acompanhar impressões dos clusters P0 depois de cada mudança de título/conteúdo (ver o módulo de automação em GROWTH_ROADMAP_90_DAYS.md).
4. **Teste de SERP manual** (navegação anônima, celular): registrar quem ocupa as posições 1–5 de cada consulta P0 e se há caixa de resposta, vídeo ou "Pessoas também perguntam".
