# 07 — Plano de correção (Mega-Sena)

12/11/2026. **Etapa 1 concluída** (ver `09-correcoes-etapa1.md`); as
demais dependem de autorização. A ordem considera gravidade, risco da mudança, dependências e
impacto nas outras loterias. Cada item diz como provar que ficou certo: os
testes de `lib/auditoria/mega-sena/` já cobrem vários (trocar `it.fails`
por `it` ou implementar o `it.todo`).

**Lição da Lotofácil.** Várias correções da Lotofácil foram feitas só para
ela (`isLF`, `ERAS_PRECO.lotofacil`, `max: 20`), e a Mega-Sena herdou os
mesmos defeitos (MS-01, MS-02, MS-03, MS-07, MS-16). Neste plano, sempre
que o defeito está num componente compartilhado, a correção proposta é
**por loteria a partir das regras**, não um novo caso especial — e cada
item diz o que conferir nas outras 7 loterias.

---

## Etapa 0 — Decisões e fontes (antes de mexer em código)

| # | Ação | Resolve / habilita |
|---|---|---|
| 0.1 | **Grade do volante**: confirmar com um volante físico ou a tela de aposta da Caixa que a Mega-Sena é 6 linhas × 10 colunas (a imagem oficial e o seletor do site indicam isso) | MS-06 |
| 0.2 | **Preço por período**: obter da Caixa (ou de normativos) os preços e as datas de vigência, inclusive antes de 2015 (notícias: R$ 2,50 até 23/05/2015; 3,50; 4,50 em 2019; 5,00 em 30/04/2023; 6,00 em 09/07/2025). Converter datas em números de concurso | MS-03 |
| 0.3 | **Imposto**: regra vigente (limite de isenção, se existe) e se o prêmio anunciado pela Caixa é bruto ou líquido | MS-28 |
| 0.4 | **Destaques e Equilíbrio**: decidir o que "incomum" e "típico" devem significar (ver Etapa 3) | MS-14, MS-15 |

## Etapa 1 — Textos que afirmam algo falso (risco baixo)

Só conteúdo; nenhuma fórmula muda. Pode ser um único PR.

| # | Problema | Ação | Prova |
|---|---|---|---|
| 1.1 | **MS-33** (ALTO) | Artigo "quina vs sena": trocar "35/19/19" pela regra oficial (do prêmio bruto de 43,79%: 40% sena, 10% quina, 10% quadra, 25% para final 0/5, 15% para a Virada) | Teste de conteúdo contra um módulo de regras |
| 1.2 | **MS-32** (ALTO) | Artigo "acúmulos longos": resumo e corpo com o recorde real (17 concursos sem ganhador, 3060–3076) — melhor: ler de `getRecordesLoteria` | Teste que compara o número citado com os dados |
| 1.3 | **MS-23** (MÉDIO) | Página do Bolão: exemplo calculado da loteria (Mega-Sena: pool 12, garantia 4 → 71 jogos) em vez de "18 dezenas / garantia de 13" | Teste do texto renderizado para Mega-Sena e Lotofácil |
| 1.4 | **MS-35, MS-34** (MÉDIO) | "20–30% de chance de ganhador num concurso sem acúmulo" → ~9% observado; "terças, quintas e sábados" → domingo às 11h (ou ler de `lib/calendario.ts`) | Revisão |
| 1.5 | **MS-29, MS-30, MS-31** (MÉDIO) | Dicas de atraso (0,00265%; só uma dezena passou de 100), duques/trincas (83,2% das trincas já saíram; 1 em 1.711) e soma (183; 56,0%; regra das caudas) | Teste que recalcula cada número citado com `referencia.ts` |
| 1.6 | **MS-13** (texto) | Simulador e Conferidor: tirar "espera perder ~57%" / "~43% para qualquer combinação" como referência do resultado de um jogo da Mega-Sena; explicar que 25% e 15% do prêmio vão para concursos especiais e que a sena acumula em ~78% dos concursos | Ver Etapa 2.4 |
| 1.7 | **MS-24, MS-25, MS-26** (BAIXO) | "o que a maioria já jogou" → "a maioria das combinações possíveis"; "faltam apenas" só quando poucas faltam; média de ciclo do histórico inteiro e esperado (45,2); "ponto quente" só com teste de significância (ou texto neutro) | Revisão |
| 1.8 | **MS-27, MS-08** (INFO/BAIXO) | Virada: dizer que a série conta a partir de 2009 e que em 2008 houve concurso especial com outro nome; calculadora de valor esperado: avisar que quina e quadra ficam fora | Revisão |

**Outras loterias:** os itens 1.3, 1.6 e 1.7 estão em páginas
compartilhadas; conferir a frase em Lotofácil, Quina e Lotomania.

## Etapa 2 — Cálculos (risco médio; cobertos por testes)

| # | Problema | Ação | Prova |
|---|---|---|---|
| 2.1 | **MS-02** (ALTO) | Analisador: generalizar o cálculo exato da soma por faixa de 10 (hoje só `isLF`) para toda loteria, a partir da distribuição exata das somas (para a Mega-Sena, contagem por programação dinâmica — não precisa enumerar) | `it.fails` "MS-02" vira `it` |
| 2.2 | **MS-01, MS-22** (MÉDIO/BAIXO) | Trocar as tabelas digitadas `DIST_*_MS` por `distHipergeometrica(60, K, 6)` e a da maior sequência por cálculo exato (como foi feito para a Lotofácil) | `it.fails` "MS-01" e "MS-22" viram `it` |
| 2.3 | **MS-03** (ALTO) | `ERAS_PRECO.megasena` com as datas da Etapa 0.2; ajustar o teste da Lotofácil que usa a Mega-Sena como "loteria sem tabela" | `it.fails` "MS-03" vira `it`; teste de fronteira de cada era |
| 2.4 | **MS-13** (ALTO) | Referência de retorno do simulador calculada para a loteria e o período (média exata de todas as combinações, como em `evidencias/fase2/sim.mjs`), em vez de "~43%" fixo | Teste da função de referência (Mega-Sena histórico completo ≈ 9,5% com preço fixo / ≥ 16,8% com preço da época) |
| 2.5 | **MS-16, MS-07** (MÉDIO/BAIXO) | Máximo de dezenas por loteria a partir da regra (Mega-Sena 20) em Probabilidades, Gerador e calculadora de probabilidade, num só lugar | `todo` "MS-16" e "MS-07" viram testes |
| 2.6 | **MS-04, MS-11** (MÉDIO/INFO) | Uma única fonte de preço (`precoAtual`) para relatórios, calculadoras, `PRECO_APOSTA_SIMPLES` e textos | `todo` "MS-04" e "MS-11" |
| 2.7 | **MS-19, MS-36** (BAIXO) | Faixa de soma do gerador só com faixas contíguas e mais frequentes; histograma da soma com as faixas vazias | Testes das funções extraídas |

**Outras loterias:** 2.1, 2.2, 2.5 e 2.6 corrigem as 7 loterias restantes
ao mesmo tempo (é o objetivo); comparar a tela do Analisador antes e depois
em todas. 2.3 deve ganhar eras para as demais loterias à medida que as
fontes aparecerem.

## Etapa 3 — Decisões de produto (risco maior)

| # | Problema | Opções |
|---|---|---|
| 3.1 | **MS-14** (ALTO) Destaques "incomum" em 100% dos concursos | (a) comparar cada característica pelo percentil (cauda) e não pela frequência do valor exato; (b) limiar por métrica ajustado à granularidade; (c) dizer "o fato menos frequente deste concurso" sem rótulo "incomum". Testar: % de concursos marcados como incomuns deve ficar perto da taxa nominal escolhida |
| 3.2 | **MS-15** (MÉDIO) Equilíbrio sem poder de discriminação | Mesma base do 3.1: nota pela probabilidade de cauda de cada critério e pesos documentados; ou assumir no texto que é uma escala de "não atípico" |
| 3.3 | **MS-05, MS-17** (MÉDIO) Projeção | Receber o número do concurso; tratar final 0/5 e Virada; calibrar com o backtest (`proj.mjs`); trocar `ticketsMedios` 80 mi pela mediana recente; mostrar que é um modelo |
| 3.4 | **MS-06** (MÉDIO) Grade | Depois da 0.1: `grid_colunas = 10` para a Mega-Sena no banco (migration), `MOLDURA_MS`/`CENTRO_MS` gerados da grade, Heatmap, Quiz e 2 artigos. As tabelas de moldura, linhas e colunas mudam de valor: avisar no texto |
| 3.5 | **MS-20** (MÉDIO) Fechamentos não mínimos | (a) usar coberturas conhecidas (ex.: Steiner S(5,6,12) com 132 jogos) para os casos da tabela; (b) dizer que o fechamento é "bom, não mínimo" |
| 3.6 | **MS-21, MS-12, MS-09** (BAIXO/INFO) | Viradas fora das séries de acúmulo (ou marcadas); conversão de atraso em dias pela frequência de cada período; explicar a diferença entre o organizador e o bolão oficial |

## Fora do escopo (para as próximas auditorias)

- Quiz: +Milionária "1 em 238.360.656" (238.360.500) e Quina "≈ 1 em 37"
  (35,6).
- Artigo de comparação com a Lotofácil: "14 acertos 1 em 4.655; 13: 334;
  12: 52" (21.792; 692; 60) — não aparece no registro da Lotofácil.
- Artigo da Quina: "5 vezes por semana" (agenda: 6).
- `ERAS_PRECO`, soma do Analisador e máximo de dezenas: as mesmas lacunas
  nas outras 7 loterias.

## Ordem sugerida

Etapa 0 (decisões) → Etapa 1 (um PR de textos) → Etapa 2 (um PR de
cálculo, com os `it.fails` virando `it`) → Etapa 3 (um PR por decisão).
As Etapas 1 e 2 independem das decisões, exceto 2.3 (precisa da 0.2).
