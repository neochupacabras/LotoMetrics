# Roadmap de 90 dias, matriz de priorização, conversão, monitoramento e projeções

Período: **10/11/2026 → 07/02/2027**. O marco central é a **Mega da Virada (31/12)**.
Premissa de capacidade: 1 pessoa, ~10–15 h/semana em growth. Nada aqui foi implementado; cada item precisa de aprovação.

## 1. Matriz de priorização

Notas de 1 a 5 (5 = melhor; em Custo, Complexidade, Manutenção e Risco, 5 = baixo).

| Iniciativa | Tráfego | Conversão | Custo | Complex. | Tempo | Escala | Manut. | Risco | Classe |
|---|---|---|---|---|---|---|---|---|---|
| Títulos/descrições das tabelas e simulador com dado vivo (T5, T6) | 4 | 3 | 5 | 5 | 5 | 5 | 5 | 5 | **QUICK WIN** |
| Resolver a canibalização "repetidas" (T4) | 4 | 3 | 5 | 5 | 5 | 3 | 5 | 4 | **QUICK WIN** |
| Bing WMT + IndexNow | 2 | 2 | 5 | 5 | 5 | 4 | 5 | 5 | **QUICK WIN** |
| Corrigir `tool_view` / filtro de robôs (T9, T10) | 0 | — | 5 | 4 | 5 | — | 5 | 5 | **QUICK WIN** (medição) |
| Links dos concursos → tabelas (resumo do PR #33) | 3 | 2 | 5 | 4 | 5 | 5 | 5 | 5 | **QUICK WIN** |
| Hub `/mega-da-virada` | 5 | 4 | 4 | 3 | 4 | 4 | 4 | 4 | **CURTO PRAZO (urgente)** |
| Simulador acima da dobra + card compartilhável | 5 | 3 | 4 | 3 | 4 | 4 | 4 | 5 | **CURTO PRAZO** |
| Bolão sem fricção + mensagem para o grupo | 4 | 5 | 4 | 3 | 4 | 5 | 4 | 4 | **CURTO PRAZO** |
| Resultados/gerador sem renderização dinâmica (T1, T2) | 3 | 2 | 4 | 3 | 4 | 5 | 4 | 3 | **CURTO PRAZO** |
| CTA "avise-me se meu jogo ganhar" (push/e-mail) | 2 | 5 | 5 | 4 | 5 | 4 | 4 | 5 | **CURTO PRAZO** |
| Bot de resultados no Telegram | 2 | 2 | 5 | 4 | 5 | 4 | 4 | 5 | CURTO PRAZO |
| Kit de dados da Virada para a imprensa | 3 | 1 | 5 | 4 | 4 | 2 | 5 | 5 | CURTO PRAZO |
| Fechamentos programáticos | 3 | 4 | 4 | 3 | 3 | 4 | 4 | 3 | MÉDIO PRAZO |
| Páginas por dezena (lote de teste) | 3 | 2 | 4 | 3 | 3 | 5 | 4 | 3 | MÉDIO PRAZO |
| Recordes + "fato raro do concurso" | 3 | 1 | 4 | 3 | 3 | 4 | 5 | 5 | MÉDIO PRAZO |
| Relatório semanal de GSC no admin | — | — | 5 | 3 | 4 | — | 4 | 5 | MÉDIO PRAZO |
| YouTube Shorts automáticos (teste) | 3 | 1 | 3 | 3 | 3 | 3 | 3 | 4 | MÉDIO PRAZO |
| Widget incorporável | 2 | 1 | 4 | 3 | 3 | 4 | 4 | 4 | LONGO PRAZO |
| TWA na Play Store | 3 | 3 | 4 | 3 | 3 | 3 | 3 | 4 | LONGO PRAZO |
| URLs sazonais perenes (Páscoa, São João, Independência) | 4 | 3 | 4 | 3 | 3 | 4 | 4 | 5 | LONGO PRAZO (calendário) |
| Vercel Pro (fora do Hobby) | — | — | 3 | 5 | 5 | — | 5 | **5 (reduz risco)** | Pré-requisito para escalar |

## 2. Roadmap semanal

| Semana | Datas | Entregáveis | Métrica de saída |
|---|---|---|---|
| **1** | 10–16/nov | (a) Títulos e descrições com dado vivo nas 67 tabelas + 9 simuladores; (b) `/dicas/repetidas` com link-âncora para a tabela no topo e título focado no "porquê"; (c) Bing WMT + sitemap; (d) `tool_view` só no cliente | Deploy feito; baseline de CTR por cluster registrada |
| **2** | 17–23/nov | **Hub `/mega-da-virada`** (contagem, histórico das edições, dezenas mais sorteadas, custos, chances, bolão embutido, inscrição para o resultado) + inspeção de URL no GSC | Página indexada até 25/11 |
| **3** | 24–30/nov | Bolão sem fricção (montar antes de cadastrar) + mensagem pronta para o grupo + eventos de funil em cada passo | Funil do bolão medido de ponta a ponta |
| **4** | 1–7/dez | Simulador: campo acima da dobra no mobile + card "meu jogo teria ganho" + CTA de alerta | `tool_completed` do simulador ↑; compartilhamentos > 0 |
| **5** | 8–14/dez | Kit de dados da Virada (página de recordes da Virada + e-mail para ~20 jornalistas) + bot do Telegram + calculadora "quanto rende o prêmio" com gancho da Virada | ≥ 2 menções/links de portais [meta, não previsão] |
| **6** | 15–21/dez | T1/T2: hub de resultados e gerador sem renderização dinâmica (TTFB < 800 ms) + aquecer cache no importador | TTFB p75 < 800 ms |
| **7** | 22–28/dez | **Congelar mudanças grandes.** Monitorar erros, carga e o funil do bolão; responder dúvidas em Quora e grupos | Uptime; bolões criados |
| **8** | 29/dez–4/jan | Virada: push/e-mail de resultado, conferência automática dos bolões, mensagem para o grupo pós-sorteio | Inscritos em alertas; reenvios |
| **9** | 5–11/jan | Retrospectiva: o que a Virada trouxe (GSC, funil, receita). Decisão: dobrar a aposta no bolão ou ajustar | Relatório de 1 página |
| **10** | 12–18/jan | Fechamentos programáticos (lote 1: Lotofácil, ~18 URLs com backtest) | URLs indexadas |
| **11** | 19–25/jan | Página por dezena (lote de teste: Mega + Lotofácil, 85 URLs) + `Dataset` schema nas tabelas | URLs indexadas |
| **12** | 26/jan–1/fev | Relatório semanal automático de GSC no admin (striking distance, queda, CTR baixo) | Primeiro relatório gerado |
| **13** | 2–7/fev | Preparar `/duplasena/pascoa` (Páscoa 2027) + revisão de 90 dias | Plano do próximo trimestre |

## 3. Conversão e retenção

### Funil atual (30 dias) [FATO]
`visit_landing` 679 → cadastros 10 → `pricing_view` 28 pessoas → `checkout_started` 5 → pagamentos 3–4 (incluindo possíveis testes) · bolões criados 2 · push 1.

### Pontos de abandono e correções

| Ponto | Problema | Correção |
|---|---|---|
| Primeira visita via tabela/simulador | Visitante usa a ferramenta e sai; não há "próximo passo" | Após o resultado, um único CTA contextual: "Quer saber se esse jogo ganhar no próximo sorteio? Receba um aviso" (push ou e-mail, sem senha) |
| Conferidor (272 conclusões) | Nenhuma captação | Mesmo CTA; salvar o jogo com 1 toque |
| Bolão | Cadastro antes de ver valor | Montar → ver a página pública de pré-visualização → só então e-mail |
| `/assinar` | 64 pricing_views → 6 checkouts | Proposta por perfil (já existe `?perfil=`). Mostrar o que o usuário perde com o exemplo **do próprio jogo dele** |
| Mobile | 76% dos cliques | Testar o fluxo inteiro em 375 px; a barra inferior do PWA não pode cobrir os CTAs |
| Retorno | Sem canal com escala | Meta: 300 inscritos em alertas (push + e-mail) até a Virada |

**Não fazer:** pop-up de e-mail na entrada, intersticiais, "cadastre-se para ver o resultado".

## 4. Monitoramento e automação

### Painel (dentro do `/admin`, que já integra o GSC)

| Métrica | Fonte | Frequência |
|---|---|---|
| Visitantes reais (BR / `visit_landing`) | product_events | diária |
| Cliques, impressões, CTR e posição orgânicos | GSC API | semanal |
| Origem (Google, Bing, IA, direto, compartilhamento) | `visit_landing.referrer` + utm | semanal |
| Ferramentas concluídas | `tool_completed` | semanal |
| Funil do bolão (criar → compartilhar → visita pública → novo organizador) | product_events | semanal |
| Inscritos em alertas e taxa de abertura | push_inscricoes, notificacoes_enviadas | semanal |
| Receita e conversão | pix_payments, subscriptions | semanal |
| Crescimento mês a mês | todas | mensal |

### Automações do "Growth Intelligence" (módulo futuro do admin)

1. **Striking distance:** consultas na pos. 4–15 com ≥ 30 impressões. Hoje são **43 consultas somando 6.905 impressões**. Lista semanal com a página que ranqueia.
2. **CTR abaixo do esperado:** CTR < 50% da média esperada para a posição → candidata a reescrever o título.
3. **Queda:** páginas com −30% de cliques em 28 dias contra os 28 dias anteriores.
4. **Consulta nova:** consultas que apareceram pela primeira vez → candidatas a conteúdo.
5. **Canibalização:** consultas com 2+ páginas recebendo impressão.
6. **Órfãs:** URLs do sitemap sem nenhum link interno (crawl mensal).
7. **Sazonal:** alerta 45 dias antes de cada evento do calendário.
8. **Concorrência:** registrar mensalmente a posição em 20 consultas-chave (GSC dá a sua; para concorrentes, checagem manual ou API paga, que não é necessária agora).

Implementação: rota de cron mensal/semanal reaproveitando `lib/admin/search-console.ts` + tabela `growth_snapshots`. Custo zero.

## 5. Projeções (cenários hipotéticos, não promessa)

**Base [FATO]:** ~290 cliques orgânicos do Google em 28 dias; ~680 aterrissagens reais por mês (todas as origens); ~10 cadastros por mês.

**Premissas:**
- CTR na pos. 8 tende a 2–4% quando o snippet e a página estão bem alinhados à intenção (referência genérica de curvas de CTR do mercado, **não medida neste site**).
- A Mega da Virada é o maior pico de busca de loteria do ano [HIPÓTESE: confirmar no Trends]. Em 2025 arrecadou mais de R$ 3 bilhões e pagou prêmio recorde de R$ 1,09 bi.
- Novas páginas levam 2–4 meses para estabilizar a posição.
- Não há verba para mídia paga.

| Cenário | O que precisa acontecer | Aterrissagens/mês em 6 meses (mai/2027) | Em 12 meses (nov/2027) |
|---|---|---|---|
| **Conservador** | Só quick wins (títulos, canibalização, Bing) | 900–1.200 | 1.100–1.500 |
| **Moderado** | Quick wins + hub da Virada + simulador/bolão melhorados + alertas + 1 lote programático | 1.500–2.500 (com pico em dez/jan de 3–5 mil) | 2.500–4.000 |
| **Agressivo** | Tudo do moderado + programático completo (fechamentos, dezenas) + PR com backlinks + loop do bolão girando (cada bolão trazendo 1+ organizador novo) + Telegram/Shorts | 3.000–5.000 | 6.000–10.000 (pico da Virada 2027 de 15 mil+) |

**Como chegar a cada patamar:**
- **1.000/mês:** consertar o CTR do que já ranqueia (o cluster "eu teria ganho" a 3% de CTR já soma cerca de +75 cliques/mês [ESTIMATIVA: 2.450 impr./90d × 3%]).
- **3.000/mês:** sazonais perenes + programático com dado próprio + Bing/IA.
- **10.000/mês:** só com efeito de rede (bolão compartilhado) e autoridade (backlinks de imprensa). SEO sozinho dificilmente leva até lá num nicho dominado por portais.

**Variáveis que mudam tudo:** atualização de algoritmo do Google, AI Overviews reduzindo cliques em consultas informacionais, prêmios recordes (mais busca) e mudança regulatória das loterias.
