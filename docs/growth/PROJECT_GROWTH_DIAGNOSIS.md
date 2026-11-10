# Diagnóstico de crescimento — LotoAnalítica

> Auditoria de 09/11/2026. Nenhum código foi alterado.
> Convenção usada em todos os documentos desta pasta:
> **[FATO]** = medido em produção nesta auditoria · **[ESTIMATIVA]** = cálculo a partir de dados reais com premissas explícitas · **[HIPÓTESE]** = precisa de validação (o método está indicado).

## 1. O que é o projeto

| Pergunta | Resposta |
|---|---|
| Propósito | Resultados oficiais e estatística honesta das 9 loterias da Caixa (Lotofácil, Mega-Sena, Quina, Lotomania, Dia de Sorte, +Milionária, Timemania, Dupla Sena, Super Sete). |
| Problema que resolve | 1) "Meu jogo já teria ganho?" (conferência histórica); 2) "Como estão as dezenas?" (tabelas de repetidas, ciclos, trincas, atraso); 3) organizar bolão de amigos/trabalho sem planilha. |
| Diferencial real | Tom honesto ("sem enrolação": nada aumenta a chance, e o site diz isso), histórico completo, ferramentas que funcionam sem cadastro, organizador de bolão com página pública `/b/[slug]`, PWA com push de resultado, API de dados. |
| Público (inferido dos dados) | Apostador recorrente de Lotofácil/Mega-Sena, majoritariamente **mobile (76% dos cliques do Google)**, que já joga e quer conferir/analisar; organizador de bolão (trabalho, família, WhatsApp). |
| Monetização | AdSense; Premium Apostador (Stripe + Pix); Bolão Pro R$ 14,90/bolão (Pix); API paga. |

### Inventário de páginas [FATO]

- `sitemap.xml` com **4.785 URLs**: 9 loterias × 16 abas, 67 páginas de tabelas por categoria, até 500 concursos por loteria, 52 análises, 27 dicas, 29 artigos de matemática, 19 calculadoras, glossário (38 termos), FAQ, quiz, comparador, calendário.
- Ferramentas: conferidor, simulador ("eu teria ganho"), gerador, fechamentos, analisador, equilíbrio, heatmap, inéditas, data da sorte, ao vivo, acúmulos, probabilidades, bolão.
- 6 das 19 calculadoras não têm relação com loteria (IMC, área/perímetro, conversor de unidades, diferença de datas, financiamento, média ponderada).

## 2. Situação atual em números

### Google Search Console (fonte: API, consultada em 09/11/2026) [FATO]

| Período | Cliques | Impressões | CTR | Posição média |
|---|---|---|---|---|
| 90 dias (08/08–06/11) | 789 | 53.580 | 1,47% | 11,9 |
| 28 dias (09/10–06/11) | 290 | 16.011 | 1,81% | 11,2 |

| Mês | Cliques | Impressões |
|---|---|---|
| jul/2026 | 223 | 26.834 |
| ago/2026 | 304 | 24.152 |
| set/2026 | 210 | 16.407 |
| out/2026 | 288 | 17.591 |

Leitura: o pico de impressões de julho/agosto foi puxado pela Lotofácil da Independência (sazonal). Fora da sazonalidade o site está **estável em ~280–300 cliques/mês**, ou seja, sem crescimento orgânico estrutural desde agosto.

Dispositivo: mobile 603 cliques / 42.916 impressões; desktop 179 / 10.428.

### Vercel Web Analytics, 30 dias (09/10–08/11) [FATO]

- 2.051 visitantes / 4.495 pageviews **no total**, mas 1.250+ visitantes vêm de CN, SG, MX, HK e US com ~1 pageview cada — padrão de robô. **Brasil: 788 visitantes / 3.100 pageviews.**
- A rota `/[loteria]/resultados/[numero]` aparece com 1.051 visitantes, mas só ~11 aterrissagens reais nela pela telemetria própria → a maior parte é rastreador.
- Referenciadores: google.com 311, bing.com 91, Yahoo 29, DuckDuckGo 10, perplexity 1.

### Telemetria própria `product_events`, 30 dias [FATO]

- `visit_landing` (dispara no navegador, filtra a maior parte dos robôs): **679 aterrissagens**. Origem: direto 314, Google 242, Bing 75, **`utm_source=chatgpt.com` 105**, Yahoo 24.
- Páginas de entrada: conferidor 136, home 90, gerador 44, tabelas/duques-trincas 41, tabelas 40, simulador 21, dicas/repetidas 21.
- Uso real de ferramenta (`tool_completed`): conferidor 272, simulador 99.
- Funil: `pricing_view` 64 eventos (28 pessoas) → `checkout_started` 6 → `pix_payment_approved` 3 / `subscription_started` 1.
- Bolão: `bolao_created` 2, `bolao_shared` 2, `bolao_public_view` 6. Tabela `boloes` com 0 linhas hoje.
- Contas: 21 no total, 10 criadas nos últimos 30 dias. Inscrições de push: 1. `lista_espera`: 0.

> ⚠️ `tool_view` registra ~850 eventos para **cada** ferramenta com `anonymous_id` nulo (12.287 no total). A uniformidade indica que é disparado no servidor e conta robôs. Não use `tool_view` como métrica de audiência até corrigir (ver SEO_TECHNICAL_AUDIT.md, item T9).

## 3. O que já funciona (portas de entrada comprovadas)

1. **Tabelas estatísticas por loteria** (`/[loteria]/tabelas/[categoria]`): 67 URLs, 13.015 impressões, 428 cliques em 90 dias. É o maior gerador de tráfego e o mais escalável.
2. **"Trincas/duplas que mais saem"** (Quina, Dia de Sorte, Timemania): posições 5–8, CTR saudável. Nicho com pouca concorrência.
3. **Guias sazonais** (Lotofácil da Independência 2026): 2.177 impressões em uma página.
4. **Conferidor**: principal ferramenta usada (272 conclusões) e principal página de entrada.
5. **ChatGPT como canal**: 105 aterrissagens em 30 dias (15% das aterrissagens reais) sem nenhum esforço deliberado.

## 4. O que não funciona

1. **"Eu teria ganho na Mega/Lotofácil"**: cerca de 2.450 impressões em 90 dias, posição ~8, **~6 cliques**. A demanda existe e o site já ranqueia na primeira página, mas quase ninguém clica. É a maior oportunidade imediata.
2. **Canibalização em "dezenas repetidas"**: `/dicas/repetidas` (7.349 impressões, pos. 7,6, 47 cliques) disputa com `/lotofacil/tabelas/repetidas` (2.830 impressões, pos. 9,0). Quem busca quer a **tabela atual**, e o Google mostra o artigo.
3. **Termos principais fora do alcance**: "estatística lotofácil" (pos. 65–85), "gerador lotofácil" (pos. 55), "simulador lotofácil" (pos. 45). Autoridade de domínio insuficiente contra portais.
4. **Páginas de concurso** (825 URLs com impressão): 65 cliques em 90 dias. Buscas por "resultado mega sena 3034" são dominadas por portais de notícia e pela Caixa.
5. **Mega da Virada**: zero impressões em 90 dias. Faltam 52 dias para o maior evento de busca de loteria do ano, e não existe uma página dedicada (só análises soltas).
6. **Conversão**: 679 aterrissagens/mês → 10 cadastros → 1 a 3 pagamentos. Nenhum mecanismo de retorno (e-mail, push) ganhou escala: 1 inscrição de push e lista de espera vazia.

## 5. Limitações

- **Operação de uma pessoa**: tudo precisa ser automatizável ou de baixa manutenção.
- **Vercel Hobby**: uso comercial fora dos termos e limite de 31 dias no Analytics. Migrar para Pro (US$ 20/mês) antes de escalar anúncios e pagamentos.
- **Sem staging**: migrations vão direto para produção.
- **Nicho sensível (jogos de azar)**: Google Ads restringe anúncios de loteria; redes sociais limitam conteúdo de aposta; promessas de "aumentar a chance" são antiéticas e arriscam a marca. O tom honesto é um ativo e deve ser preservado.
- **Sem ferramenta de volume de busca** (Semrush, Ahrefs, Keyword Planner). Volumes desta auditoria vêm do GSC do próprio site (impressões) e são indicadores relativos, não volume de mercado.

## 6. Conclusão do diagnóstico

O gargalo é **distribuição + captura de demanda já existente**, não falta de conteúdo. O site tem 4.785 URLs e muitas ferramentas, mas:

- ranqueia na primeira página para clusters de demanda real e não converte o clique (CTR de 0–1%);
- não tem página-âncora para os picos sazonais (Virada, Independência, Quina de São João, Páscoa);
- não tem nenhum mecanismo de retorno com escala;
- o recurso com loop viral (bolão → grupo de WhatsApp) quase não é usado.

A estratégia recomendada (detalhada em GROWTH_EXECUTIVE_SUMMARY.md) é: **consertar o CTR do que já ranqueia → Mega da Virada como evento de aquisição → bolão como motor viral → SEO programático de dados próprios → canais de retorno (push/e-mail) → GEO para ChatGPT/Perplexity.**
