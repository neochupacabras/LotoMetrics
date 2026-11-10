# Estratégia de SEO programático

## 1. Ponto de partida [FATO]

O site **já é programático**: 9 loterias × 16 abas, 67 tabelas por categoria e até 500 concursos por loteria, totalizando 4.785 URLs no sitemap. O desempenho por template em 90 dias mostra onde o programático funciona:

| Template | URLs com impressão | Impressões | Cliques | Cliques/URL |
|---|---|---|---|---|
| `/[lot]/tabelas/[categoria]` | 67 | 13.015 | 428 | **6,4** |
| `/[lot]/simulador` | 4 | 5.802 | 29 | 7,3 |
| `/[lot]/gerador` | 4 | 270 | 29 | 7,3 |
| `/[lot]/acumulos` | 4 | 877 | 24 | 6,0 |
| `/[lot]/resultados/[n]` | 825 | 2.669 | 65 | **0,08** |

**Conclusão:** páginas de **dado agregado com intenção estável** (tabelas) rendem cerca de 80 vezes mais por URL que páginas de **evento único** (concurso). A expansão deve seguir o modelo das tabelas, não o dos concursos.

## 2. Princípios (para não criar páginas sem valor)

1. Cada URL nova responde a **uma consulta que existe** (comprovada no GSC, no Keyword Planner ou no "Pessoas também perguntam").
2. Cada URL tem **dado que só ela mostra** (cálculo sobre o histórico), e não texto trocado com variáveis.
3. Abaixo de um limiar de valor, a página **existe para o usuário, mas leva `noindex`** (ex.: combinações de fechamento sem economia real).
4. Lançar em **lotes de até 50 URLs**, medir 4–6 semanas no GSC e só então expandir.

## 3. Oportunidades priorizadas

### P1 — Fechamentos por combinação
- **URL:** `/lotofacil/fechamentos/18-dezenas-garantia-14`
- **Universo:** gerado de `lib/fechamento-config.ts`. Na Lotofácil: pools 16–20 × garantias 11–14, menos as combinações excluídas, dá cerca de 18 URLs. Nas demais loterias, ~150 no total. Indexar só as combinações com economia de jogos ≥ 30% sobre o fechamento completo.
- **Conteúdo exclusivo:** número de jogos, custo (preço vigente), economia contra o fechamento completo, quantas vezes a garantia teria sido atingida no histórico (o site tem o motor) e a matriz pronta para baixar em CSV/PDF.
- **Por quê:** o Valor Final já ranqueia com exatamente esse modelo. O diferencial do LotoAnalítica é o backtest histórico. "fechamentos lotofácil" já aparece na pos. 53.
- **Risco:** canibalizar `/[lot]/fechamentos`. Mitigar fazendo do hub a página de "como funciona + calculadora", com as filhas linkadas em tabela.

### P1 — Mega da Virada e eventos sazonais (URLs perenes)
- **URLs:** `/mega-da-virada`, `/lotofacil/independencia`, `/quina/sao-joao`, `/duplasena/pascoa`. Uma URL fixa por evento, **sem ano**; o ano vai no `<title>` e no H1, atualizados pelo banco.
- **Conteúdo:** contagem regressiva, prêmio estimado, histórico de todas as edições (prêmio, ganhadores, dezenas), dezenas mais sorteadas nas edições especiais, "quanto custa cada aposta", organizador de bolão integrado e card de compartilhamento.
- **Por quê:** a página de guia da Independência 2026 rendeu 2.177 impressões em uma URL com ano, que perde a autoridade quando o ano vira. A URL perene acumula links e histórico ano após ano.

### P2 — Página por dezena
- **URL:** `/megasena/dezenas/10`. Universo: 60 + 25 + 80 + 100 + 31 + 50 + 80 + 50 ≈ 476 URLs (o Super Sete fica de fora ou vira 7 colunas × 10).
- **Conteúdo exclusivo:** frequência total e nos últimos 100 concursos, atraso atual e recorde, maiores parceiras (duplas e trincas com essa dezena), em quais ciclos ela "fechou", gráfico de aparições por ano.
- **Indexação:** lançar Mega-Sena e Lotofácil (85 URLs), medir e depois expandir. Se em 8 semanas menos de 20% das URLs tiverem impressão, aplicar `noindex` no restante.
- **Validação prévia:** procurar no Keyword Planner "número 10 mega sena", "dezena 25 lotofácil quantas vezes saiu".

### P2 — Variações de tabelas com intenção própria
- Quadras (`/quina/tabelas/quadras`), "dezenas que mais saem juntas com X" (fica dentro da página por dezena), "repetidas por faixa de concurso".
- Só quando o GSC mostrar consulta própria (ex.: "quadras que mais saem na quina"). Hoje "trincas que mais saem" é o cluster de melhor CTR do site.

### P3 — Recordes e curiosidades gerados do banco
- `/lotofacil/recordes`: maior prêmio, maior acúmulo, concurso com mais ganhadores, maior sequência de dezenas, dezena mais atrasada da história. Atualização automática a cada concurso.
- Bom para linkagem externa (jornalistas e portais citam recordes).

### NÃO recomendado
- **Páginas por concurso além do que já existe**: o template rende 0,08 clique por URL. Manter a janela de 500 no sitemap e não aumentar.
- **Páginas por cidade** ("lotérica em Campinas", "ganhadores em SP"): o site não tem dado próprio de lotérica. Seria texto raso, com risco de "scaled content abuse".
- **Combinações de dezenas** ("01-02-03-04-05-06 já saiu?"): universo de milhões de URLs e conteúdo trivial. Atender pelo simulador, com URL parametrizada e `noindex`.
- **Calculadoras genéricas novas** (IMC, unidades, área): diluem o tema do domínio. Ver a recomendação de consolidação em SEO_TECHNICAL_AUDIT.md.

## 4. Arquitetura de URLs e hierarquia

```
/                                   (hub geral)
/[loteria]/resultados               (hub de resultados)
  /[loteria]/resultados/[n]         (concurso — janela de 500 no sitemap)
/[loteria]/tabelas                  (hub de estatísticas)
  /[loteria]/tabelas/[categoria]    (67 URLs — modelo vencedor)
/[loteria]/dezenas                  (NOVO hub: grade das dezenas)
  /[loteria]/dezenas/[n]            (NOVO, P2)
/[loteria]/fechamentos              (hub + calculadora)
  /[loteria]/fechamentos/[pool]-dezenas-garantia-[k]  (NOVO, P1)
/[loteria]/simulador                ("eu teria ganho")
/mega-da-virada  /lotofacil/independencia  /quina/sao-joao  /duplasena/pascoa  (NOVO, sazonais perenes)
/dicas/*  /analises/*  /matematica/*  (editorial)
```

## 5. Linkagem interna

- **Hub ↔ filhas:** todo hub lista todas as filhas em tabela HTML com dado (ex.: no hub de dezenas, a grade inteira com a frequência de cada uma).
- **Laterais com sentido:** página da dezena → as 3 trincas mais frequentes que a contêm → tabela de trincas. Página do concurso → "dezenas deste concurso" → páginas das dezenas.
- **Dos concursos para as ferramentas:** o resumo do concurso (PR #33) deve linkar "Repetiu X do anterior → ver tabela de repetidas" e "ciclo atual: faltam N → tabela de ciclos". As 825 páginas de concurso viram distribuidoras de autoridade para os templates que convertem.
- **Do editorial para a ferramenta:** `/dicas/repetidas` deve ter, logo no topo, "Ver a tabela atualizada da Lotofácil", com âncora exata "tabela de dezenas repetidas da Lotofácil". Isso também resolve a canibalização (ver auditoria técnica).
- **Âncoras:** usar o texto da consulta ("ciclo da Mega-Sena", "trincas que mais saem na Quina") em vez de "clique aqui" ou "ver mais".

## 6. Geração automatizada de conteúdo

- **Texto a partir de dado** (determinístico, sem LLM): o gerador de resumo do concurso (`lib/resumo-concurso.ts`) já faz isso. Replicar o padrão: "A dezena 10 saiu 312 vezes em 2.950 concursos (10,6%), 4ª mais frequente. Está há 7 concursos sem sair; o maior atraso dela foi 41."
- **LLM só como apoio editorial** (rascunho de guia sazonal revisado por humano). Nunca gerar centenas de páginas de texto livre.
- **Revalidação:** as páginas de dado se atualizam com o importador (`/api/revalidar` já existe). Garantir que dezenas e fechamentos usem ISR com `revalidate` e que o sitemap traga o `lastModified` real.

## 7. Requisitos de qualidade por página

- [ ] H1 e `<title>` com a consulta principal + dado vivo (ex.: "Ciclo da Mega-Sena: faltam 9 dezenas (concurso 2.951)").
- [ ] Primeiro bloco visível responde à consulta em uma linha.
- [ ] Ao menos uma tabela ou gráfico exclusivo.
- [ ] Data e número do último concurso considerado.
- [ ] Bloco "o que isso significa (e o que não significa)", que mantém o tom honesto e é diferencial de E-E-A-T.
- [ ] Links para hub, laterais e a ferramenta relevante.
- [ ] JSON-LD: `Dataset` nas páginas de tabela, `BreadcrumbList` e `FAQPage` quando houver perguntas reais.

## 8. Riscos

| Risco | Mitigação |
|---|---|
| Conteúdo quase duplicado entre loterias (mesmo texto, outra loteria) | Texto determinístico com números reais; parágrafos condicionais (ex.: "na Mega, mais da metade dos sorteios não repete nenhuma") |
| Canibalização hub × filhas | Hub foca "o que é + escolher", filha foca "a combinação X"; canonical sempre próprio; nada de paginação indexada duplicada |
| Orçamento de rastreamento gasto em concursos | Manter a janela de 500; aplicar `noindex` em concursos antigos sem impressão em 12 meses [HIPÓTESE: medir antes] |
| Penalidade por "scaled content" | Lotes pequenos, limiar de valor e `noindex` no que não performar |

## 9. Estratégia de indexação

1. Sitemap segmentado: `sitemap-estatisticas.xml`, `sitemap-concursos.xml`, `sitemap-editorial.xml`, `sitemap-programatico.xml`. Isso permite ver a cobertura por tipo no GSC.
2. `lastModified` real em tabelas e dezenas (data do último concurso). Hoje as tabelas não informam essa data.
3. IndexNow (Bing e Yandex) a cada concurso importado: grátis e com efeito no Bing, que já traz 75–91 visitantes por mês.
4. Inspeção manual no GSC das 10 URLs novas mais importantes de cada lote.
5. Critério de corte: URL sem impressão em 90 dias após a indexação → revisar o conteúdo ou aplicar `noindex`.
