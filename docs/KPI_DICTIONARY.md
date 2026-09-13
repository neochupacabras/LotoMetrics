# KPI Dictionary — Admin Control Center

Definição formal de cada métrica exibida em `/admin`. Nenhuma métrica aqui é estimada — todas são calculadas a partir de dados reais no momento da carga da página (`dynamic = "force-dynamic"`, sem cache). Métricas ainda não instrumentadas (Receita, API) não aparecem nesta lista até serem implementadas — ver `docs/ADMIN_AUDIT.md` para o roadmap.

Convenção de período: todo KPI "comparado" usa o período selecionado no Overview (Hoje / 7d / 30d / 90d / Este mês / Mês anterior / Personalizado) contra o **período imediatamente anterior de mesma duração** (ver `lib/admin/periodo.ts`). Datas de corte usam `agoraBrasilia()` (`lib/calendario.ts`) para os períodos calendário-dependentes (Hoje, Este mês, Mês anterior); períodos de janela fixa (7d/30d/90d) são independentes de fuso.

---

### Usuários totais

- **Significado:** número total de contas cadastradas na plataforma, sem filtro de atividade.
- **Fórmula:** `count(profiles)`.
- **Fonte:** Supabase, tabela `profiles`.
- **Período:** snapshot (agora) — não tem "período anterior" porque é uma contagem cumulativa, não um evento.
- **Atualização:** tempo real (sem cache).
- **Limitações:** conta linhas de `profiles`, criadas por trigger no cadastro em `auth.users` — não distingue contas nunca confirmadas por e-mail (`email_confirm` pendente) de contas ativas.

### Novos usuários (período)

- **Significado:** quantas contas foram criadas dentro do período selecionado.
- **Fórmula:** `count(profiles WHERE created_at IN [from, to))`.
- **Fonte:** Supabase, `profiles.created_at`.
- **Comparação:** contagem do período anterior de mesma duração; variação percentual = `(atual - anterior) / anterior * 100` (null se o período anterior for zero e o atual também for zero → mostrado como 0%; null se anterior for zero e atual > 0 → mostrado como "sem período anterior p/ comparar", não como percentual infinito).
- **Limitações:** não distingue cadastro completo (e-mail confirmado) de pendente.

### Assinantes Premium / Free

- **Significado:** quantas contas têm plano Premium ativo agora, e quantas são Free.
- **Fórmula:** Premium = `count(profiles WHERE plan = 'premium' AND (plan_expires_at IS NULL OR plan_expires_at > now()))` — mesma regra de `lib/plano.ts:calcularIsPremium`, a única fonte de verdade do produto para "isso é premium?". Free = `usuariosTotais - premiumAtivos`.
- **Fonte:** Supabase, `profiles.plan` / `profiles.plan_expires_at`.
- **Período:** snapshot (agora). Não tem comparação de período nesta fase — calcular "crescimento de assinantes" corretamente exigiria uma série histórica diária (rollup), que ainda não existe (ver Fase 5 do roadmap). Mostrar aqui uma variação derivada de `novos - cancelados` seria impreciso (não capta upgrades/downgrades de trial, expiração natural, etc.) — por isso não é exibido até haver dado real para isso.

### Cancelamentos (período)

- **Significado:** quantas assinaturas foram marcadas como canceladas dentro do período.
- **Fórmula:** `count(subscriptions WHERE status = 'canceled' AND canceled_at IN [from, to))`.
- **Fonte:** Supabase, `subscriptions.canceled_at`, atualizado pelo webhook do Stripe (`customer.subscription.deleted`).
- **Comparação:** igual a "Novos usuários" — período anterior de mesma duração. Aqui, **subir é ruim** (indicador mostrado invertido — vermelho quando aumenta).
- **Limitações:** não captura o *motivo* do cancelamento (Stripe tem `cancellation_details`, não persistido localmente — achado da auditoria).

### Execuções de ferramentas (período)

- **Significado:** quantas vezes uma ferramenta foi concluída com sucesso (não visualização — execução real).
- **Fórmula:** `count(product_events WHERE event_name = 'tool_completed' AND created_at IN [from, to))`.
- **Fonte:** Postgres, tabela `product_events`, gravada via `lib/telemetry.ts:logToolEvent`.
- **Comparação:** período anterior de mesma duração.
- **Limitações crítica:** **só cobre as ferramentas com paywall**, instrumentadas na Fase 2/3 (Gerador, Simulador, Comparador de jogos, Conferidor, OCR, Exportação CSV, Relatório PDF). As outras 9 ferramentas do site (Resultados, Destaques, Tabelas, Fechamentos, Bolão, Analisador, Acúmulos, Probabilidades, Equilíbrio, Inéditas, Data da Sorte, Ao Vivo) não emitem eventos ainda — este número **não é** o total de uso da plataforma. Instrumentação completa é Fase 4.

### Taxa de erro (ferramentas)

- **Significado:** proporção de tentativas de uso de uma ferramenta instrumentada que terminaram em falha.
- **Fórmula:** `tool_failed / (tool_completed + tool_failed) * 100` no período. Retorna "sem execuções no período" (não zero) quando o denominador é zero — uma taxa de erro de 0% e "não sei" são coisas diferentes.
- **Fonte:** `product_events`.
- **Limitações:** mesma limitação de cobertura do KPI anterior (só ferramentas com paywall).

### Erros (período)

- **Significado:** quantos erros de aplicação foram capturados no período (webhook do Stripe, OCR, e o que for adicionado nas próximas fases).
- **Fórmula:** `count(error_events WHERE created_at IN [from, to))`.
- **Fonte:** Postgres, tabela `error_events`, gravada via `lib/telemetry.ts:logError`.
- **Comparação:** período anterior; subir é ruim (indicador invertido).
- **Limitações:** cobertura parcial — só os pontos instrumentados explicitamente (assinatura de webhook inválida, `supabase_user_id` ausente, falhas da Vision API no OCR). A maioria dos `console.error` espalhados pelo código ainda não alimenta esta tabela (ver Fase 6 — Operations, `/admin/errors`).

---

## Platform Health

Cada célula do Platform Health é `healthy` / `warning` / `critical` / `unknown` — nunca um percentual (seção 33 do audit: "Health: 94%" sem definição técnica é pior que um status categórico defensável).

| Domínio | Critério | Fonte |
|---|---|---|
| Usuários | Sempre `healthy` nesta fase — não há regra de degradação definida ainda para usuários (não confundir com "não importa"; simplesmente não foi definida uma condição objetiva de "usuários não saudável" ainda). | — |
| Dados das loterias | Pior status entre as 9 loterias — ver "Frescor de dados por loteria" abaixo. | `concurso`, `lib/calendario.ts` |
| Receita | `unknown` — aguarda Fase 5 (tabela de preço↔plano, cálculo de MRR). | — |
| Jobs | Pior status entre os 4 jobs monitorados — ver "Saúde de jobs" abaixo. | `job_runs` |
| Erros | `healthy` até 5 erros/24h, `warning` até 20, `critical` acima. Limiar não calibrado por histórico real ainda (tabela nova) — revisar quando houver volume real de comparação. | `error_events` |
| API | `unknown` — aguarda Fase 6. | — |

### Frescor de dados por loteria

- **Significado:** a loteria está recebendo resultados novos na cadência esperada?
- **Fórmula:** `diasDesde = hoje - data_sorteio do último concurso`. Tolerância = `2 × (7 / sorteiosPorSemana) + 1` dia. `healthy` se `diasDesde <= tolerância`; `warning` se `<= 2×tolerância`; `critical` acima disso ou se não há nenhum concurso salvo.
- **Fonte:** Postgres, `concurso.data_sorteio` + `lib/calendario.ts:qtdSorteiosPorSemana`.
- **Limitação:** é um proxy, não uma verificação exata do calendário oficial da Caixa dia a dia — pensado para sinalizar atraso visivelmente anormal, não para prever a data exata do próximo sorteio.

### Saúde de jobs

- **Significado:** o job rodou recentemente e com sucesso?
- **Fórmula:** para cada `job_name`, pega a execução mais recente em `job_runs`. `critical` se `status = 'failed'` ou se já passou o dobro da tolerância sem rodar; `warning` se passou da tolerância simples ou o último status foi `partial`; `unknown` se nunca houve execução registrada (não é alarme — é "instrumentação nova, sem histórico ainda"); `healthy` caso contrário.
- **Tolerâncias (horas), documentadas em `lib/admin/queries.ts`:**
  - `cron_conferir`: 72h (roda seg/qua/sex/sáb 22h)
  - `cron_relatorio`: 864h / 36 dias (mensal, dia 1 às 8h)
  - `revalidar`: 72h (disparado pelo importador + reforçado pelo cron da Vercel)
  - `importador_resultados`: 30h (GitHub Actions roda ≥1×/dia, incluindo rotina de segurança às 3h BRT mesmo sem sorteio)
- **Fonte:** Postgres, `job_runs`.

---

## Uso de ferramentas (todas as 16, `/admin/tools`)

- **Significado:** views, conclusões, falhas e paywalls por ferramenta, no período selecionado.
- **Fórmula:** contagem de `product_events` por `tool` e `event_name`, sem filtro de loteria.
- **Fonte:** `product_events`.
- **Cobertura:** desde a Fase 4, as 16 ferramentas emitem `tool_view`. Conclusão (`tool_completed`)/falha (`tool_failed`)/paywall (`paywall_view`) só existem nas ferramentas com gate de Premium (Gerador, Simulador, Comparador de jogos, Conferidor, OCR, Exportação CSV, Relatório PDF) — as demais 9 não têm ação "concluir" distinguível de "ver".
- **Limitação conhecida:** `tool_view` é gravado no servidor a cada render da página (via `after()`), não é um pageview de analytics de terceiros — conta requisições reais à rota, não inclui cache de CDN (o site não usa cache de rota completo hoje, então isso não deveria subcontar, mas também não deduplica múltiplas abas/recarregamentos da mesma visita).

## Matriz ferramenta × loteria (`/admin/lotteries`)

- **Significado:** saúde de cada combinação ferramenta×loteria aplicável.
- **Fórmula:** ver critério documentado em `lib/admin/queries.ts:getMatrizFerramentaLoteria` — `unsupported` vem da configuração estática real (`lib/abas-loteria.ts`, a mesma fonte usada pela navegação e pelo sitemap); `sem_dados` quando não há nenhum evento no período; caso contrário, taxa de falha `> 10%` = `critical`, `> 2%` = `warning`, senão `healthy`.
- **Fonte:** `product_events` + `lib/abas-loteria.ts`.
- **Limitação:** limiares de taxa de falha não calibrados por histórico real ainda.

## Funil de monetização por ferramenta (`/admin/funnels`)

- **Significado:** de quantas visualizações de paywall uma ferramenta gera checkouts, e desses checkouts, quantas assinaturas.
- **Fórmula/atribuição (last touch, não multi-touch):**
  - `checkout_started` é gravado em `app/api/stripe/checkout/route.ts` com o `tool`/`lottery` do evento `tool_view` ou `paywall_view` mais recente do mesmo usuário nos 7 dias anteriores (o Referer HTTP do próprio POST de checkout não serve pra isso — sempre seria `/assinar`, a única página que chama essa rota).
  - `subscription_started` é gravado no webhook do Stripe só no evento `customer.subscription.created` (não em `.updated`, que também dispara em renovação) — marca uma ativação nova de verdade.
  - Na leitura (`getFunilMonetizacao`), cada `subscription_started` é atribuído ao `checkout_started` mais recente do mesmo `user_id` antes dele (`JOIN LATERAL`).
- **Fonte:** `product_events` (event_name IN `paywall_view`, `checkout_started`, `subscription_started`).
- **Limitações:** (1) só cobre usuários que passaram por uma tela com `tool_view`/`paywall_view` registrado nos 7 dias antes do checkout — um checkout "frio" (ex.: linkado direto de um e-mail) cai em `tool: "desconhecido"`; (2) é atribuição de última ferramenta, não considera todo o caminho percorrido; (3) trial (7 dias) significa que `subscription_started` acontece no início do trial, não na primeira cobrança — é "início de assinatura", não "primeira cobrança confirmada".

## Aquisição e ativação — não implementado

Ver seção seguinte ("ainda NÃO implementadas") — nenhum evento de sessão/login, cadastro ou pageview anônimo existe hoje, então esses funis não podem ser construídos sem instrumentação adicional.

---

## Métricas mencionadas no pedido original ainda NÃO implementadas

Para rastreabilidade — evita a falsa impressão de que "se não está aqui, foi esquecido":

| Métrica | Por que ainda não | Fase prevista |
|---|---|---|
| DAU / WAU / MAU | Exige evento de sessão/login — Fases 2-4 focaram em ferramentas, não em auth | A definir |
| Retenção (D1/D7/D30, cohort) | Exige histórico de eventos de sessão por usuário ao longo do tempo | A definir |
| Funil de aquisição/ativação | Exige evento de sessão/login e cadastro, que não existem | A definir |
| MRR / ARR / Churn de receita | Exige tabela de preço↔`stripe_price_id` (valor não é persistido em `subscriptions` hoje) | Fase 5 |
| Uso de API pública | `api_keys` já tem contagem agregada mensal, mas não por requisição | Fase 6 |
| SEO orgânico (cliques, impressões, CTR) | Depende de integração com a API do Google Search Console | Fase 7 |
