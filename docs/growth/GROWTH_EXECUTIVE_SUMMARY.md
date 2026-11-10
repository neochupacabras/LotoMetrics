# Resumo executivo — growth do LotoAnalítica

> Auditoria de 09/11/2026 com dados reais de produção (Google Search Console, Vercel Analytics, `product_events`, banco) e pesquisa competitiva na web. Nenhum código foi alterado.

## Onde estamos

- **~290 cliques orgânicos do Google por mês** (CTR 1,8%, pos. média 11), estáveis desde agosto: o site não cresce de forma estrutural.
- **~680 aterrissagens reais por mês.** O total do Vercel (2.051) está inflado: ~60% são robôs de CN/SG/MX/HK/US.
- **15% das aterrissagens vêm do ChatGPT**, sem nenhum esforço. Mais do que o Bing.
- 21 contas, 10 novas no mês; 1 a 3 pagamentos no mês; 2 bolões criados; 1 inscrição de push.
- 4.785 URLs no sitemap. **Conteúdo não é o gargalo; captura e distribuição são.**

## Os 5 achados que mais importam

1. **O site já está na página 1 para "eu teria ganho na Mega/Lotofácil" (~2.450 impressões em 90 dias, pos. 8) e recebe ~6 cliques.** É a demanda mais valiosa e está sendo desperdiçada.
2. **As tabelas de dados são o motor que funciona** (6,4 cliques por URL contra 0,08 das páginas de concurso). Expandir esse modelo, não o dos concursos.
3. **Canibalização em "dezenas repetidas"** (artigo × tabela) e títulos genéricos nas tabelas.
4. **Mega da Virada: zero presença, a 52 dias do maior evento de busca de loteria do ano.** Um concorrente direto (Valor Final) já anuncia um "bolão cofre" que ainda não lançou. O LotoAnalítica tem o produto pronto.
5. **Hub de resultados e gerador demoram 2,5–5 s para responder** (renderização dinâmica sem cache).

## Estratégia em uma frase

> Ser **"o jeito honesto de jogar com os amigos"**: capturar quem já procura conferir o jogo ("eu teria ganho", conferidor, tabelas) e transformar cada bolão num canal de distribuição via WhatsApp, usando a Mega da Virada como evento de lançamento.

## Prioridades (ver GROWTH_ROADMAP_90_DAYS.md)

| Quando | O quê |
|---|---|
| **Esta semana** | Títulos com dado vivo nas tabelas e no simulador; resolver a canibalização "repetidas"; Bing WMT + IndexNow; corrigir a telemetria `tool_view` |
| **Até 25/11** | Hub `/mega-da-virada` no ar e indexado |
| **Até 7/12** | Bolão sem fricção + mensagem pronta para o grupo; simulador acima da dobra + card "meu jogo teria ganho"; CTA de alertas |
| **Dezembro** | Kit de dados para imprensa, bot do Telegram, performance (T1/T2), operação da Virada |
| **Jan–fev** | Fechamentos programáticos, páginas por dezena (lote de teste), relatório automático de GSC, sazonais perenes |

## 12 estratégias não convencionais

1. **Bolão como cavalo de Troia:** cada página pública `/b/[slug]` é uma landing vista por 5–100 pessoas que nunca procurariam o site. Rodapé discreto "Organize o seu bolão grátis" + mensagem pós-sorteio pronta para o grupo.
2. **"Meu jogo teria ganho R$ X"** como cartão compartilhável: transforma o resultado do simulador em conteúdo de WhatsApp.
3. **Fato raro automático por concurso** ("5 dezenas consecutivas: acontece 1 vez a cada 40 concursos") publicado no Telegram e oferecido a jornalistas. Portais escrevem essas notas todo dia sem fonte; o site vira a fonte.
4. **Kit de dados da Mega da Virada para a imprensa:** histórico, recordes e "quanto rende R$ 1 bilhão", com atribuição. Backlinks de autoridade sem custo.
5. **GEO deliberado:** frases-fato datadas e citáveis no topo de cada página de dado, `llms.txt`, Bing/IndexNow. O ChatGPT já manda 15% do tráfego; dá para fazer disso um canal.
6. **Widget "contagem regressiva da Virada" / "último resultado"** para blogs e sites locais incorporarem, com link de volta.
7. **API gratuita com atribuição obrigatória:** desenvolvedores que fazem bots de loteria no Telegram/Discord viram fonte de backlinks.
8. **URLs sazonais perenes** (`/mega-da-virada`, `/lotofacil/independencia`), que acumulam autoridade ano após ano em vez de recomeçar com URLs que levam o ano.
9. **Retrospectiva "Meu ano na loteria"** em dezembro, compartilhável (estilo Spotify Wrapped), com o tom honesto: "você gastou R$ X e ganhou R$ Y".
10. **Conferir pela foto do bilhete, grátis 1 vez por dia:** experiência "uau" que gera boca a boca; o volume maior é Pro.
11. **PWA na Play Store via TWA:** entra na busca da loja ("conferir loteria", "bolão") por US$ 25 de taxa única, reaproveitando 100% do código.
12. **Página "verdade ou mito" como antídoto às dicas milagrosas:** responde às mesmas buscas dos sites de "como ganhar" com a resposta honesta, que as IAs tendem a preferir citar.

## Riscos e o que não fazer

- Nada de "aumente suas chances", previsão por IA ou números "quentes garantidos": destrói o diferencial e atrai problemas de política (Google, AdSense, redes).
- Nada de criar páginas em massa sem dado próprio (por cidade, por combinação de dezenas).
- Sem mídia paga por enquanto: loteria é categoria restrita no Google Ads e o retorno do AdSense não cobre o CPC.
- **Vercel Hobby não permite uso comercial.** Migrar para Pro antes de escalar tráfego e receita.

## Como medir o sucesso em 90 dias (metas, não previsões)

| Métrica | Hoje | Meta 07/02/2027 |
|---|---|---|
| Cliques orgânicos Google / 28 dias | 290 | 600+ (fora do pico da Virada) |
| CTR do cluster "eu teria ganho" | ~0,3% | ≥ 3% |
| Aterrissagens reais / mês | 680 | 1.500+ |
| Bolões criados (dez/jan) | 2/mês | 100+ na Virada |
| Inscritos em alertas (push + e-mail) | 1 | 300+ |
| Aterrissagens via IA / mês | 105 | 250+ |

## Documentos

1. [Diagnóstico](PROJECT_GROWTH_DIAGNOSIS.md)
2. [Pesquisa de palavras-chave](KEYWORD_RESEARCH.md)
3. [SEO programático](SEO_PROGRAMMATIC_STRATEGY.md)
4. [Concorrência](COMPETITIVE_ANALYSIS.md)
5. [Conteúdo](CONTENT_MARKETING_STRATEGY.md)
6. [Canais de aquisição](TRAFFIC_ACQUISITION_CHANNELS.md)
7. [Funcionalidades de aquisição](GROWTH_FEATURE_OPPORTUNITIES.md)
8. [Auditoria técnica](SEO_TECHNICAL_AUDIT.md)
9. [Roadmap de 90 dias, conversão, monitoramento e projeções](GROWTH_ROADMAP_90_DAYS.md)

## Fontes externas consultadas
- Concorrente Valor Final: [fechamentos](https://valorfinal.com.br/fechamentos-lotofacil/18-dezenas-garantia-14), [calculadora de fechamento](https://valorfinal.com.br/calculadora-fechamento-lotofacil), [conferidor histórico](https://valorfinal.com.br/conferir-megasena-historico), [hub Lotofácil](https://valorfinal.com.br/loterias/lotofacil), [guia de estatísticas](https://valorfinal.com.br/guia/estatisticas-lotofacil)
- Só Matemática: [simulador Mega-Sena](https://www.somatematica.com.br/megasenaVerifica.php), [repetidas Lotofácil](https://www.somatematica.com.br/lotofacilDezenasRepetidas.php)
- Intersena: [simulador](https://www.intersena.com.br/curiosidades/simulador-mega-sena)
- Mega da Virada 2025: [InfoMoney](https://www.infomoney.com.br/consumo/mega-da-virada-2025-premio-recorde-de-r-1-bi-pode-se-tornar-realidade-neste-sabado/), [DGABC](https://www.dgabc.com.br/Noticia/4277276/mega-da-virada-2025-faz-seis-novos-milionarios-e-paga-quase-r%24-182-mi-por-aposta), [Folha Vitória](https://www.folhavitoria.com.br/loterias/mega-da-virada-2025-paga-premio-historico-confira-os-vencedores/)
- Apps de resultados (estimativas de instalação): [AppGoblin](https://appgoblin.info/apps/com.app.lottery_results)
- Portais de resultado: [Brasil 61](https://brasil61.com/n/resultado-da-lotofacil-3823-jogo260089), [Tribuna de Jundiaí](https://tribunadejundiai.com.br/loterias/resultados-loterias-5-novembro-2026/)
- Bolão (sem ferramenta específica de loteria encontrada): [Valor Final — guia de bolão](https://valorfinal.com.br/guia/bolao-lotofacil), [Canaltech — apps de bolão (futebol)](https://canaltech.com.br/apps/melhores-sites-e-apps-para-organizar-o-bolao-da-copa/)
