# Auditoria Estratégica — LotoAnalítica → Admin Control Center

**Data:** 2026-09-12
**Escopo:** Etapas A–F (auditoria e arquitetura conceitual). Nenhuma implementação foi feita. Nenhum arquivo de produto foi alterado.
**Método:** exploração direta do repositório + 5 investigações paralelas dedicadas (banco de dados, inventário de produto/ferramentas, monetização/billing, analytics/SEO/observabilidade, jobs/infra) com leitura de código-fonte, arquivos `.sql`, workflows de CI e configuração de deploy.

---

## 1. Executive Summary

O LotoAnalítica é um produto Next.js 16/App Router maduro, com 9 loterias, 16 ferramentas reais (não 13), ~113 páginas, um modelo de negócio simples e coerente (Free/Premium binário + AdSense) e uma base de conteúdo SEO grande e bem estruturada. Tecnicamente, o site funciona e a monetização funciona.

Mas hoje a plataforma é **operacionalmente cega**: não existe nenhuma tabela de eventos, nenhum log de uso de ferramenta, nenhum error tracking centralizado, nenhum papel de administrador, nenhum teste automatizado, e — o achado mais grave da auditoria — **o schema do banco de dados que sustenta o produto inteiro não está reproduzível a partir do repositório**: os arquivos SQL que criam as tabelas `loteria`, `concurso`, `premiacao_faixa` e as ~26 funções PL/pgSQL que fazem todo o cálculo estatístico nunca foram commitados, apesar de a documentação interna (`DEPLOY.md`, `README.md`) afirmar que foram entregues.

Não é possível hoje responder, a partir de dados reais, perguntas básicas como "quantas vezes o Gerador foi usado este mês" ou "qual ferramenta mais converte para Premium" — porque nenhuma linha de uso é gravada em lugar nenhum. Construir o Admin Control Center pedido exige, portanto, duas frentes paralelas: (1) instrumentação de produto do zero (eventos, RBAC, error tracking, backup de schema) e (2) o painel administrativo em si, que consome essa instrumentação. Tentar construir o painel antes da instrumentação resultaria em um dashboard bonito mostrando números que não existem — exatamente o que você pediu para evitar.

A boa notícia: a arquitetura atual é simples, sem dívida técnica estrutural grave, e o modelo de negócio (Free generoso + Premium com gates pontuais + Ads) está bem implementado e documentado no próprio código. Isso significa que a base para instrumentar é sólida — falta a camada de medição, não uma reforma de arquitetura.

---

## 2. Current Architecture

- **Framework:** Next.js 16.2.9, App Router, React 19.2.4, TypeScript. Sem Tailwind — CSS puro em `app/globals.css`.
- **Banco de dados:** PostgreSQL, acessado de duas formas distintas e paralelas:
  - **Dados de loteria** (`loteria`, `concurso`, `premiacao_faixa`, e ~26 funções `fn_*` de estatística) via [`lib/db.ts`](../lib/db.ts) com `pg.Pool` direto, usando a credencial `postgres` (superuser do Supabase) — **ignora RLS deliberadamente** (confirmado em `DEPLOY.md`), pois esses dados são públicos.
  - **Dados de usuário** (`profiles`, `subscriptions`, `user_games`, `alert_preferences`, `api_keys`) via `@supabase/supabase-js` com RLS ativo, através de [`lib/supabase/server.ts`](../lib/supabase/server.ts) e [`lib/supabase/client.ts`](../lib/supabase/client.ts).
- **Autenticação:** Supabase Auth. `profiles` estende `auth.users` via trigger. Sessão gerenciada por `@supabase/ssr` em [`proxy.ts`](../proxy.ts) (middleware do Next, protege `/conta/*`; `ROTAS_PREMIUM` existe no código mas está vazio — gating real é feito ponto a ponto nas páginas, não no middleware).
- **Billing:** Stripe (Checkout + Billing Portal + Webhook). Único produto Premium, 3 periodicidades de preço.
- **Deploy/Infra:** Vercel. 3 cron jobs nativos da Vercel (ver seção 25 do pedido original / seção 5 aqui).
- **Dado crítico externo:** a atualização diária dos concursos **não roda na Vercel** — é feita por [`importador.py`](../importador.py), agendado via GitHub Actions ([`.github/workflows/importar-resultados.yml`](../.github/workflows/importar-resultados.yml)), com fallback manual em uma máquina Windows local ([`scripts/rodar-importador-producao.ps1`](../scripts/rodar-importador-producao.ps1)).
- **Ads:** Google AdSense, injetado condicionalmente só para usuários não-Premium (`components/AdsenseGate.tsx`, `components/Anuncio.tsx`).
- **OCR:** Google Cloud Vision API, síncrono, gated Premium + rate limit próprio de 50/dia.
- **E-mail transacional:** Resend, via `fetch` cru (sem SDK), para alertas de resultado e relatório mensal.
- **Observabilidade:** `@vercel/analytics` + `@vercel/speed-insights` — só pageview e Web Vitals automáticos. Nenhum evento customizado. Nenhum error tracking (Sentry etc.). `console.error`/`console.warn` pontuais, sem agregação.
- **Testes:** nenhum. Sem Jest/Vitest/Playwright, sem um único arquivo `*.test.ts`.
- **Admin/RBAC:** nenhum. Zero rotas, colunas ou lógica de papel administrativo hoje.

---

## 3. Product Inventory

### 3.1 As 9 loterias

| Código | Nome | Dezenas | Faixa | Mecânica especial |
|---|---|---|---|---|
| `lotofacil` | Lotofácil | 15 | 1–25 | — |
| `megasena` | Mega-Sena | 6 | 1–60 | — |
| `quina` | Quina | 5 | 1–80 | — |
| `lotomania` | Lotomania | 20 | 0–99 | Aposta fixa de 50 dezenas |
| `diadesorte` | Dia de Sorte | 7 | 1–31 | Mês da Sorte |
| `maismilionaria` | +Milionária | 6 | 1–50 | 2 trevos (1–6) |
| `timemania` | Timemania | 7 | 1–80 | Time do Coração |
| `duplasena` | Dupla Sena | 6 | 1–50 | 2 sorteios por concurso |
| `supersete` | Super Sete | 7 colunas | 0–9 cada | Colunas independentes, acerto por posição |

Achado: a configuração (dezenas/faixa/grid) de **Lotofácil e Mega-Sena não existe em nenhum arquivo do repositório** — foram inseridas manualmente no Supabase antes de as demais 7 loterias adotarem o padrão de `setup_*.sql` versionado.

### 3.2 As 16 ferramentas reais (não 13)

A lista de 13 ferramentas usada como referência inicial está desatualizada. A fonte real de verdade (`components/Subnav.tsx`, espelhada em `lib/abas-loteria.ts` e `app/sitemap.ts`) tem **16 ferramentas navegáveis**:

resultados, destaques, tabelas, gerador, simulador, fechamentos, bolao, conferidor, analisador, heatmap, acumulos, probabilidades, equilibrio, **ineditas**, **data-da-sorte**, **ao-vivo**.

As três em negrito não estavam na lista original mas são ferramentas reais, completas, na navegação principal. Existe ainda `/[loteria]/resultado` (singular) — não é uma 17ª ferramenta, é apenas um redirect 307 para `/resultados/[numero]`, deliberadamente fora do Subnav e do sitemap.

Nenhuma das 16 está incompleta ou é placeholder (sem TODOs/FIXMEs pendentes encontrados).

### 3.3 Matriz ferramenta × loteria

Cobertura é quase total, com exceções deliberadas e documentadas no próprio código (`lib/abas-loteria.ts`, comentado explicitamente):

| Ferramenta | Ausente em |
|---|---|
| fechamentos, bolao | Lotomania, Super Sete |
| ineditas, data-da-sorte | Super Sete |
| tabelas (categorias específicas: moldura-centro, linhas-colunas) | Lotomania, Super Sete (+ ciclos, repetidas, duques-trincas só em Super Sete) |

Quando "ausente", a página não dá 404 — mostra um aviso explicativo (decisão de design consistente, não bug). Subnav e sitemap usam a mesma função `abaAplicavel()`, então navegação e SEO não divergem entre si.

**Ponto frágil identificado:** a exclusão de ferramenta por loteria vive em 3 arquivos mantidos manualmente em paralelo (`lib/abas-loteria.ts`, `lib/bolao-opcoes.ts`, `lib/categorias.ts`) sem checagem em tempo de compilação que force consistência entre eles. Hoje estão sincronizados; adicionar uma 10ª loteria no futuro exigiria lembrar de atualizar os três.

### 3.4 Free vs. Premium — matriz real de paywalls

| Ferramenta/Recurso | Free | Premium |
|---|---|---|
| Gerador | Modo simples | + Modo avançado (10 filtros combináveis) |
| Simulador | Últimos 100 concursos | Histórico completo |
| Conferidor | 1 jogo por sessão | Múltiplos jogos + conferência por foto (OCR) |
| Heatmap | Só "todo o histórico" | 4 períodos (500/100/50/tudo) |
| Exportação CSV de resultados | Bloqueado | Liberado |
| Relatório PDF (sob demanda e mensal por e-mail) | Bloqueado | Liberado |
| Carteira do apostador | Bloqueado (só aviso) | Cálculo real de ganho/gasto |
| API pública (`/api/v1`) | Sem acesso | Até 3 chaves, 1000 req/mês cada |
| E-mail de conferência pós-sorteio | Não recebe | Recebe |
| Anúncios (AdSense) | Exibidos | Removidos (script nem carrega) |

Todas as demais 6 ferramentas (resultados, destaques, tabelas, fechamentos, bolao, analisador, acumulos, probabilidades, equilibrio, ineditas, data-da-sorte, ao-vivo) são **100% gratuitas, sem gate algum**. O free tier é objetivamente generoso.

### 3.5 Conteúdo editorial/SEO (fora das ferramentas por loteria)

14 calculadoras (`app/calculadoras/*`), 24 páginas de matemática (`app/matematica/*`), ~24 artigos de dicas (`app/dicas/*`), análises, glossário, quiz, comparador de loterias, calendário — um corpo de conteúdo SEO grande, avaliado separadamente do produto "ferramenta".

### 3.6 Achados de UX/navegação

- **API pública sem porta de entrada:** `/api-dados` e `/api/v1/*` não aparecem no header principal (`components/Masthead.tsx`) — só é descoberta por quem já é Premium e lê o texto de `/premium`, ou por quem digita a URL. É uma feature completa (autenticação por chave, rate limit real) mas essencialmente escondida.
- **Colisão de nomes:** existe um "/comparador" (compara as 9 loterias entre si) e, separadamente, um "comparador de dois jogos" citado como benefício Premium em `/premium`, que na verdade vive dentro do Simulador — mesmo nome, produtos diferentes, risco de confundir quem lê a página comercial.
- **Inconsistência de implementação da Subnav:** 8 ferramentas recebem a navegação via `layout.tsx`, outras 7 renderizam o mesmo componente direto no `page.tsx`. Resultado visual idêntico, mas o padrão duplicado não tem justificativa documentada — parece histórico (época em que cada ferramenta foi criada).
- **Dois textos comerciais mantidos em paralelo:** `/premium` (tabela comparativa) e `/assinar` (foco em conversão) podem divergir com o tempo por serem editados separadamente.

---

## 4. Data Sources

| Domínio | Onde vive o dado | Como é acessado |
|---|---|---|
| Concursos/resultados/prêmios | Postgres (`loteria`, `concurso`, `premiacao_faixa`) | `pg.Pool` direto (`lib/db.ts`, `lib/queries.ts`) |
| Estatísticas (frequência, atraso, ciclos, etc.) | ~26 funções PL/pgSQL (`fn_*`) no mesmo Postgres | `pool.query("SELECT * FROM fn_...")` |
| Usuários/perfil/plano | Supabase (`profiles`) | `supabase-js` com RLS |
| Assinaturas | Supabase (`subscriptions`) | `supabase-js`, sincronizado por webhook Stripe |
| Jogos salvos/alertas | Supabase (`user_games`, `alert_preferences`) | `supabase-js` |
| Chaves de API | Supabase (`api_keys`) | `supabase-js` |
| Cobrança real (valores, faturas, cupons) | Stripe (fonte única — não replicado localmente) | API do Stripe / painel Stripe |
| Tráfego/pageviews/Web Vitals | Vercel Analytics / Speed Insights | Painel Vercel (não acessível via API para o Admin sem integração adicional) |
| Indexação/busca orgânica | Google Search Console (só verificação de posse hoje) | Manual, fora do produto |
| Uso de ferramentas, funis, eventos de produto | **Não existe hoje** | — |
| Erros de aplicação | Logs de função da Vercel (`console.error`) | Painel Vercel, sem agregação |
| Execução dos cron jobs | **Não existe hoje** (resposta HTTP da própria chamada, não persistida) | — |
| Atualização de dados de concurso (importador) | `importador_loterias.log` local + logs do GitHub Actions | Sem alerta na aplicação |

---

## 5. Existing Analytics

O que já é medido, com evidência:

- **Pageviews e Web Vitals automáticos** — `@vercel/analytics`/`@vercel/speed-insights`, renderizados em `app/layout.tsx`. Zero eventos customizados (`track(...)` não existe em nenhuma ferramenta).
- **Relatório mensal por e-mail** (`app/api/cron/relatorio/route.ts`) — é o desempenho de apostas do próprio usuário (ganhos/gastos calculados sobre `user_games`), não analytics de produto.
- **Verificação de propriedade no Google Search Console** — só a meta tag; nenhuma chamada de API para trazer cliques/impressões/posição para dentro do produto.
- **Contadores ad-hoc, não analytics real:**
  - `profiles.ocr_usage` (JSONB) — contador diário de uso de OCR, sobrescrito todo dia, sem histórico.
  - `api_keys.requests_mes` / `last_used_at` — agregado mensal por chave, sem log por requisição.

---

## 6. Analytics Gaps

- **Nenhuma tabela de eventos de produto.** Impossível saber hoje quantas vezes qualquer ferramenta foi vista, iniciada ou concluída, por quem, com que parâmetros, ou em qual loteria.
- **Nenhum funil de conversão instrumentado** (visitante → cadastro → paywall → checkout → assinante) além do que dá para inferir de pageviews brutos do Vercel Analytics.
- **Nenhum log de auditoria** de ações sensíveis (criação/revogação de API key, mudança de plano, reset de senha).
- **Nenhum log de execução de cron job** — não há como saber, dentro do produto, se `/api/cron/conferir` rodou ontem com sucesso, quantos e-mails enviou ou falhou.
- **Nenhuma integração com Search Console via API** — dados de SEO orgânico (cliques, impressões, posição, queries) não entram no produto.
- **Nenhum error tracking centralizado** — erros só existem como linhas de log dispersas na Vercel.
- **Nenhuma tabela de valor de assinatura** — `subscriptions` guarda `stripe_price_id` mas não o valor cobrado; calcular MRR local hoje exige mapear manualmente `price_id → preço` (os preços estão hardcoded em `app/assinar/page.tsx`, não numa tabela).
- **Nenhum registro de qual ferramenta precedeu um cadastro, um paywall ou uma assinatura** — atribuição de conversão por ferramenta é hoje impossível.

---

## 7. Product Findings

- **Achado positivo:** o conjunto de 16 ferramentas é coerente, sem redundância óbvia, e a régua Free/Premium é bem calibrada (a maioria é grátis; os gates ficam em pontos de alto valor percebido — histórico completo, OCR, exportação, API).
- **Achado crítico de descoberta:** a API pública paga (bundled no Premium) não tem link nenhum na navegação principal — é uma feature construída e monetizável que está, na prática, invisível para quem não sabe que ela existe. **Quick win de produto:** adicionar entrada na navegação/no `/premium` com destaque.
- **Risco de manutenção:** 3 arquivos de configuração paralelos (`abas-loteria.ts`, `bolao-opcoes.ts`, `categorias.ts`) precisam ser atualizados manualmente e em sincronia a cada nova loteria ou ferramenta — candidato a um teste automatizado simples de consistência (não a uma refatoração agora).
- **Confusão potencial de nomenclatura:** "Comparador" nomeia dois recursos diferentes em lugares diferentes — vale um ajuste de copy, não de arquitetura.
- **Conteúdo Markov morto:** `lib/markov.ts`, `lib/markov-actions.ts` e a função SQL `fn_transicao_markov` continuam no código e no banco, mas a feature foi removida da navegação (confirmado por comentário em `DEPLOY.md`: "não rode `transicao_markov.sql` — é da feature removida"). Código morto que ainda é mantido/consultável — candidato a remoção formal, fora do escopo desta auditoria.
- **Config de Lotofácil/Mega-Sena fora do controle de versão:** ponto cego para reconstrução de banco do zero (ver também seção 8).

---

## 8. Technical Findings

Classificados por severidade (P0 = crítico):

| # | Achado | Prioridade | Impacto | Esforço |
|---|---|---|---|---|
| 1 | Schema fundamental (`loteria`, `concurso`, `premiacao_faixa`, ~26 funções `fn_*`) sem `CREATE TABLE`/`CREATE FUNCTION` em nenhum arquivo versionado; 7 arquivos `.sql` citados como "entregues" em `DEPLOY.md`/`README.md` nunca existiram no histórico do git | **P0** | Alto — projeto Supabase é hoje um ponto único de falha irrecuperável a partir do repo | Médio (fazer `pg_dump --schema-only` e commitar) |
| 2 | Aplicação acessa Postgres com credencial `postgres` (superuser), ignorando RLS por padrão — hoje só usado para tabelas públicas de loteria, mas a mesma credencial teria acesso irrestrito a `profiles`/`subscriptions`/`api_keys` se algum código futuro usar `pool.query` nelas por engano | **P1** | Alto (potencial) | Baixo (documentar/isolar, ou criar role dedicado sem acesso às tabelas de usuário) |
| 3 | `user_games.loteria` e `alert_preferences.loteria` têm `CHECK (loteria IN ('lotofacil','megasena'))` — mas o app grava as outras 7 loterias nessas tabelas. Se a constraint ainda estiver ativa em produção, inserts para as demais loterias falhariam silenciosamente ou já falharam | **P0** (precisa verificação urgente em produção) | Alto | Baixo (ALTER TABLE, se confirmado) |
| 4 | `alert_preferences` faz upsert com `onConflict: "user_id,loteria"` sem constraint UNIQUE correspondente no schema conhecido — código já tem fallback defensivo, sinal de que o time sabia do problema | P2 | Médio | Baixo |
| 5 | Zero testes automatizados no projeto inteiro | P1 | Alto (risco de regressão silenciosa, especialmente em cálculo de KPIs futuros) | Médio-Alto (começar pelos pontos críticos: billing, cálculo de plano) |
| 6 | Zero error tracking centralizado — depuração de produção depende de vasculhar logs da Vercel | P1 | Médio-Alto | Baixo (integrar um serviço) |
| 7 | Zero RBAC/admin — qualquer painel administrativo parte do zero em autorização | P0 (pré-requisito do Admin) | Alto | Médio |
| 8 | `app/api/cron/relatorio/route.ts` chama `supabase.auth.admin.listUsers()` dentro do loop por usuário — ineficiente, risco de estourar `maxDuration=300s` conforme a base cresce | P2 | Médio (cresce com a base) | Baixo |
| 9 | Janela de apenas ~10min entre o workflow do importador (21h20 BRT) e o cron de revalidação de cache da Vercel (21h30 BRT) | P2 | Médio | Baixo (ajustar horário ou tornar revalidação orientada a evento, não a horário fixo) |
| 10 | `app/api/stripe/portal/route.ts` não valida no servidor que o `customerId` recebido pertence ao usuário autenticado | P1 | Médio-Alto (falha de autorização) | Baixo |
| 11 | Webhook do Stripe não trata `checkout.session.completed`, nem reembolsos (`charge.refunded`) | P2 | Médio | Baixo-Médio |
| 12 | `importador_loterias.log` cresce sem rotação (já ~1,5MB) | P3 | Baixo | Baixo |
| 13 | Arquivos soltos não versionados na raiz (`Instrument`, `Work`, `coral)`, `__pycache__`) — artefatos acidentais, não fazem parte do app | P3 | Nenhum (limpeza) | Baixo |
| 14 | `proxy.ts` define `ROTAS_PREMIUM` mas o array está vazio — código morto/preparado, gating real é feito ponto a ponto | P3 | Baixo (nenhuma rota desprotegida encontrada) | Baixo |

---

## 9. SEO Findings

**Bem implementado hoje:**
- `app/sitemap.ts` é dinâmico, gerado a partir do banco, cobre todas as páginas estáticas + todas as 16 ferramentas aplicáveis × 9 loterias (respeitando `abaAplicavel()`), com limite deliberado de 500 concursos/loteria para não estourar 50.000 URLs.
- `app/robots.ts` bloqueia `/api/`, aponta corretamente para o sitemap.
- `lib/seo.ts` centraliza metadata (title/description/canonical/OG/Twitter) e JSON-LD (Organization, Website, Article, Breadcrumb) — reuso consistente entre páginas.
- Fallback gracioso: se o banco falhar na geração do sitemap, cai para uma versão parcial em vez de quebrar.

**Gaps:**
- Nenhuma integração de API do Google Search Console — dados de cliques/impressões/posição/queries existem só no console do Google, fora do produto. Isso é 100% dependente de integração externa (OAuth + Search Console API) para entrar no futuro Admin.
- Sem detecção própria de páginas sem tráfego, sem indexação, ou com Core Web Vitals ruins — dependeria da mesma integração de Search Console + o que o Vercel Speed Insights já coleta (mas não exposto via API simples).

---

## 10. Monetization Findings

**Estado atual, com precisão:**
- Modelo estritamente binário: `profiles.plan` é `'free'` ou `'premium'` (CHECK constraint no banco) — **não existem** planos Pro/Business hoje, apesar de a página `/assinar` mostrar 3 opções (são apenas 3 periodicidades de cobrança do mesmo produto).
- Trial de 7 dias para quem nunca teve nenhuma linha em `subscriptions` — checagem própria, não a do Stripe (risco de abuso via novo cadastro, aceitável no estágio atual).
- Ativação de assinatura depende inteiramente de `customer.subscription.created/updated` do webhook — não há tratamento de `checkout.session.completed`.
- `invoice.payment_failed` marca `past_due` mas **não** rebaixa o plano — carência intencional até o Stripe de fato cancelar. Correto por design, mas significa que hoje não há um estado "em atraso" visível de forma proeminente ao usuário além de um texto genérico.
- Reembolsos: sem tratamento algum — se o Stripe processar um refund sem cancelar a assinatura, o sistema local nunca fica sabendo.
- Não há valor monetário (`amount`/`currency`) persistido em `subscriptions` — MRR/ARR/churn de receita não são calculáveis localmente sem ou (a) replicar os preços numa tabela de referência, ou (b) consultar a API do Stripe em tempo real/via webhook adicional.
- **AdSense é uma fonte de receita real e ativa**, condicional ao plano (achado que o usuário não mencionou explicitamente) — deve entrar no `/admin/revenue` como uma linha própria, mesmo que sujeita a dados só disponíveis no painel do AdSense (não há API embutida no código hoje).
- API pública é monetizada **indiretamente** — é um benefício do Premium, não um produto cobrado por uso. Não há tiers de rate limit por plano (todo Premium tem 1000 req/mês/chave).
- "Carteira do apostador" não é sistema de créditos — é um simulador retrospectivo (gasto vs. ganho em jogos salvos), sem saldo real gravado.

**Recomendação futura (não implementar agora, só registrar como direção):** dado que o produto hoje tem exatamente um plano pago, **não há evidência hoje que justifique introduzir Pro/Business** — o primeiro passo de valor é instrumentar o Free/Premium atual (funil, atribuição por ferramenta, MRR/churn reais) antes de considerar segmentação adicional de planos.

---

## 11. Observability Findings

- Erros: só `console.error`/`console.warn`, sem centralização, sem alerta, sem agrupamento de erros equivalentes. Cron jobs não persistem se rodaram, quanto tempo levaram, ou quantos e-mails enviaram com sucesso/erro — a única evidência de execução é a resposta HTTP da própria chamada (não guardada).
- O processo mais crítico do produto (atualização de resultados via `importador.py`) roda **totalmente fora do campo de visão da Vercel/Next.js** — GitHub Actions + fallback manual numa máquina Windows local. Hoje, se ambos falharem, não há nenhum alerta dentro da aplicação — o site simplesmente fica com dados desatualizados silenciosamente.
- Sem testes, sem cobertura de regressão, especialmente preocupante para cálculo de plano/billing e para qualquer KPI financeiro futuro.

---

## 12. Admin Requirements

Com base em tudo acima, o Admin Control Center real precisa, antes de qualquer tela:

1. **RBAC server-side de verdade** — coluna de papel em `profiles` (ex.: `role`), verificação em toda Server Component/Route Handler/Server Action de `/admin`, nunca só no client.
2. **Camada de eventos de produto** — a peça que mais falta. Sem ela, ~70% das perguntas de negócio do pedido original (uso por ferramenta, funis, atribuição, retenção por ferramenta) permanecem impossíveis de responder com dados reais.
3. **Log de execução de jobs** (cron + GitHub Actions do importador) — tabela simples de "rodou às X, durou Y, sucesso/falha, detalhes".
4. **Error tracking centralizado** — ou uma tabela própria de erros agregados, ou integração com um serviço externo (decisão de arquitetura, seção 14).
5. **Backup/versionamento do schema real** (`pg_dump --schema-only` comitado) — pré-requisito de qualquer trabalho sério de banco, incluindo as tabelas de agregação que o próprio Admin vai precisar criar.
6. **Tabela de referência preço↔plano** (ou consulta à API do Stripe) para MRR/ARR real.

---

## 13. Data Architecture

### 13.1 Novo evento de produto — proposta mínima e sustentável

Não recomendamos um "event lake" genérico. Recomendamos uma tabela de eventos direta no Postgres já existente, com agregação diária via rollup (ver seção 14), suficiente para o volume esperado deste produto (não é uma rede social; picos previsíveis em torno dos horários de sorteio).

```sql
CREATE TABLE product_events (
  id BIGSERIAL PRIMARY KEY,
  event_name TEXT NOT NULL,        -- 'tool_view' | 'tool_started' | 'tool_completed' | 'tool_failed' | 'paywall_view' | 'checkout_started' | ...
  user_id UUID REFERENCES profiles(id),   -- null se anônimo
  anonymous_id TEXT,                -- cookie/localStorage id para visitantes não logados
  tool TEXT,                        -- 'gerador' | 'conferidor' | ... | null para eventos não ligados a ferramenta
  lottery TEXT,                     -- código da loteria | null
  plan TEXT,                        -- snapshot do plano no momento do evento
  success BOOLEAN,
  duration_ms INTEGER,
  metadata JSONB,                   -- só o estritamente necessário — nunca dado sensível
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_product_events_name_date ON product_events (event_name, created_at);
CREATE INDEX idx_product_events_tool_date ON product_events (tool, created_at) WHERE tool IS NOT NULL;
CREATE INDEX idx_product_events_user ON product_events (user_id) WHERE user_id IS NOT NULL;
```

Eventos mínimos recomendados para a Fase 2 (não é lista fechada, refinar ao instrumentar):
`tool_view`, `tool_started`, `tool_completed`, `tool_failed`, `paywall_view`, `checkout_started`, `subscription_started`, `subscription_cancelled`, `signup_completed`, `login`.

Retenção sugerida: manter linha a linha por 90 dias; agregar em rollups diários (`tool_usage_daily`) para além disso, e então poder truncar/arquivar o detalhe fino — decisão a confirmar quando houver volume real medido.

### 13.2 Tabela de execução de jobs

```sql
CREATE TABLE job_runs (
  id BIGSERIAL PRIMARY KEY,
  job_name TEXT NOT NULL,           -- 'cron_conferir' | 'cron_relatorio' | 'importador_resultados' | ...
  status TEXT NOT NULL,             -- 'success' | 'failed' | 'partial'
  started_at TIMESTAMPTZ NOT NULL,
  finished_at TIMESTAMPTZ,
  duration_ms INTEGER,
  details JSONB,                    -- ex.: quantos e-mails enviados, quantos concursos importados
  error TEXT
);
```

O importador Python precisaria gravar sua própria execução aqui via `psycopg2` (mesma conexão que já usa) — mudança pequena e de baixo risco nele.

### 13.3 Rollups (Fase 3+, só quando o volume justificar)

`tool_usage_daily`, `revenue_daily`, `error_summary_daily` — agregações batch (via cron próprio ou trigger) para o Admin nunca escanear `product_events` bruto a cada carregamento de página.

---

## 14. Proposed Admin Architecture

- **Rota:** `/admin`, App Router, Server Components por padrão (evita expor lógica sensível ao client).
- **Autorização:** coluna `profiles.role` (`'user' | 'admin'`), checada em um `requireAdmin()` server-only, chamado em cada `layout.tsx`/Route Handler/Server Action sob `/admin`. Nunca `if (user.isAdmin)` em Client Component.
- **Camada de dados:** funções server-only em `lib/admin/*.ts`, análogas ao padrão já existente (`lib/queries.ts`, `lib/plano.ts`) — reaproveitar `lib/db.ts` para leituras agregadas, não introduzir um segundo pool.
- **Cadência por domínio** (ver também seção 39 do pedido): erros/jobs quase real-time (consulta direta), usuários/ferramentas em minutos (cache curto ou ISR de poucos minutos), receita/SEO/retenção diário (rollups).
- **Sem novas dependências pesadas.** Gráficos: `recharts` já está no projeto — reutilizar, não introduzir uma segunda lib de charts. Sem Redis, sem fila, sem serviço de observability pago nesta fase — o volume do produto não justifica ainda.
- **Error tracking:** avaliar Sentry (tier gratuito cobre esse volume) versus uma tabela própria `error_events`. Recomendação: começar com tabela própria (mesma filosofia de `product_events`, sem nova dependência paga) e revisitar se o volume de erros justificar uma ferramenta dedicada depois.

---

## 15. Admin Sitemap

```text
/admin                          Overview (Platform Health + KPIs executivos)
/admin/users                    Overview de usuários (DAU/WAU/MAU, novos, retenção)
/admin/users/[id]                Explorador — linha do tempo de uma conta
/admin/tools                    Ferramentas: uso, conversão, erro, performance
/admin/tools/[slug]              Drill-down por ferramenta × loteria × plano
/admin/lotteries                 Matriz ferramenta × loteria com estado de saúde
/admin/revenue                  MRR/ARR, assinaturas, pagamentos, AdSense
/admin/usage                    OCR, exportações, API — consumo por plano/usuário
/admin/api                      Uso da API pública (requests, endpoints, quota)
/admin/errors                   Erros agrupados, afetados, primeira/última ocorrência
/admin/performance               Web Vitals, duração de rotas/Server Actions, queries
/admin/jobs                     Cron jobs da Vercel + importador (GitHub Actions)
/admin/data-health               Frescor e integridade dos dados por loteria
/admin/acquisition               Tráfego, origem, landing pages, Search Console (quando integrado)
/admin/funnels                   Aquisição, ativação, monetização
/admin/audit-log                 Ações administrativas sensíveis
/admin/settings                  Configuração de thresholds de alerta
```

Ajustada em relação à sugestão do pedido original: mesclei "Infrastructure" dentro de `/admin/jobs` (o importador via GitHub Actions é, na prática, o job mais crítico do produto) e criei `/admin/data-health` como seção própria dado que a atualização de dados de loteria é o núcleo do valor do produto e hoje tem zero visibilidade.

---

## 16. KPI Dictionary (amostra — a definir por completo na Fase 3)

| KPI | Definição | Fonte | Status |
|---|---|---|---|
| Usuários totais | Contagem de linhas em `profiles` | `profiles` | **Disponível hoje** |
| MAU (autenticado) | Usuários com ≥1 `login` ou sessão ativa nos últimos 30 dias | Precisa evento `login`/sessão | **Exige instrumentação** |
| Assinantes ativos | `profiles.plan = 'premium' AND (plan_expires_at IS NULL OR plan_expires_at > now())` | `profiles` | **Disponível hoje** |
| MRR | Soma do valor mensal normalizado de assinaturas ativas | `subscriptions` + tabela de preço (a criar) OU API do Stripe | **Calculável com pequena instrumentação** (tabela preço↔price_id) |
| Churn de assinantes | Cancelamentos no período / assinantes ativos no início do período | `subscriptions.canceled_at` | **Calculável hoje** (dado já existe) |
| Execuções de uma ferramenta | Contagem de `tool_completed` por `tool` | `product_events` | **Exige instrumentação** |
| Taxa de erro de uma ferramenta | `tool_failed` / `tool_started` | `product_events` | **Exige instrumentação** |
| Conversão Free → Premium por ferramenta | Assinaturas cujo `last_tool_before_checkout` = ferramenta X | `product_events` (campo de atribuição) | **Exige instrumentação** |
| Frescor dos dados por loteria | `now() - concurso.data_sorteio` mais recente vs. calendário esperado | `concurso` + `lib/calendario.ts` | **Calculável hoje** |
| Cliques/Impressões orgânicas | Search Console | Integração externa | **Depende de integração** |

---

## 17. Security Model

- Autorização de `/admin` **sempre no servidor**: `role` em `profiles`, verificado em Server Components/Route Handlers/Server Actions.
- Nunca expor `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `CRON_SECRET`, `REVALIDAR_SECRET`, `GOOGLE_CLOUD_VISION_API_KEY`, `RESEND_API_KEY` ao client — todos já são server-only hoje; manter assim no Admin.
- Toda ação administrativa sensível (alterar plano de um usuário, revogar API key de terceiro, reenviar job) grava em `admin_audit_log` (admin, ação, alvo, timestamp, dados relevantes — nunca dado financeiro sensível cru).
- Corrigir, como parte da Fase 1 (não é exclusivo do Admin): `app/api/stripe/portal/route.ts` deve validar que o `customerId` pertence ao usuário autenticado antes de criar a sessão do portal.

---

## 18. Implementation Roadmap

### FASE 0 — Auditoria (esta entrega)
Concluída. Nenhuma alteração estrutural.

### FASE 1 — Fundamentos
- `pg_dump --schema-only` comitado no repo (resolve achado P0 #1).
- Verificar e corrigir a CHECK constraint desatualizada de `user_games`/`alert_preferences` (achado P0 #3).
- Coluna `profiles.role` + `requireAdmin()` server-only + shell de `/admin` (layout, autorização, nada de dados ainda).
- Corrigir validação de posse do `customerId` no portal do Stripe.

### FASE 2 — Telemetria
- Criar `product_events` e `job_runs`.
- Instrumentar `tool_view`/`tool_started`/`tool_completed`/`tool_failed` nas 16 ferramentas (começar pelas com paywall, que já têm o ponto de checagem de plano centralizado — menor esforço marginal).
- Instrumentar o importador Python para gravar em `job_runs`.
- Decidir e implementar error tracking (tabela própria ou serviço externo).

### FASE 3 — Overview
- `/admin` com Platform Health (critérios objetivos por domínio) e KPIs executivos com comparação de período.
- KPI Dictionary completo e formalizado.

### FASE 4 — Product Analytics
- `/admin/tools`, `/admin/lotteries` (matriz de saúde), `/admin/usage`.
- Funis de aquisição/ativação/monetização.

### FASE 5 — Revenue
- Tabela de referência preço↔`stripe_price_id`.
- `/admin/revenue` com MRR/ARR/churn calculados localmente; linha de AdSense (dado manual/painel externo enquanto não houver API integrada).

### FASE 6 — Operations
- `/admin/errors`, `/admin/performance`, `/admin/jobs`, `/admin/api`, `/admin/data-health`.

### FASE 7 — Acquisition
- Integração de API do Google Search Console.
- `/admin/acquisition`.

### FASE 8 — Intelligence
- Alertas por regra (não IA) sobre as métricas já instrumentadas.
- Insights automáticos baseados em regra, só depois de as Fases 2–6 estarem maduras.

Cada fase é entregável e verificável isoladamente — nenhuma depende de over-engineering antecipado.

---

## 19. Risks

- **Risco de dados irrecuperáveis:** enquanto o schema não for versionado (Fase 1), qualquer incidente no projeto Supabase é potencialmente catastrófico e sem caminho de recuperação a partir do repositório.
- **Risco operacional silencioso:** o importador de resultados pode falhar (GitHub Actions + fallback manual) sem qualquer alerta visível hoje — prioridade alta assim que `job_runs` existir.
- **Risco de constraint quebrada em produção:** se o CHECK de `user_games.loteria` ainda estiver ativo, é possível que gravações para 7 das 9 loterias já estejam falhando silenciosamente ou passando por caminho não testado — precisa verificação imediata em produção (fora do escopo desta auditoria read-only, mas urgente).
- **Risco de overengineering:** a tentação natural ao construir um "Admin robusto" é introduzir fila/streaming/data warehouse. Nada no volume atual do produto justifica isso — a recomendação é Postgres + rollups, sempre.
- **Risco de métrica financeira incorreta:** sem tabela de preço↔`price_id` e sem tratamento de reembolso no webhook, um MRR calculado hoje seria enganoso — não implementar `/admin/revenue` antes de fechar esses gaps.

---

## 20. Opportunities

Além do que foi pedido explicitamente:

- **AdSense como linha de receita própria no Admin** — hoje é um canal de receita real e ativo que nem estava no escopo original do pedido; vale considerar uma integração com a API do AdSense na Fase 5/7.
- **Expor a API pública na navegação** — é uma feature Premium completa e monetizável hoje invisível; quick win de produto fora do escopo do Admin, mas descoberto durante a auditoria.
- **Testes automatizados mínimos para billing e cálculo de plano** — não pedido explicitamente, mas essencial antes de qualquer KPI financeiro ser exibido no Admin (uma métrica de MRR errada é pior do que nenhuma métrica).
- **Formalizar a remoção do código morto do Markov** — pequena redução de superfície de manutenção.
- **Consolidar a configuração ferramenta×loteria em uma única fonte** (hoje 3 arquivos paralelos) — reduz risco ao adicionar a 10ª loteria no futuro.

---

## Matriz de Métricas (resumo executivo)

| Métrica | Disponível hoje? | Fonte | Nova instrumentação? | Prioridade |
|---|---|---|---|---|
| Total users | Sim | `profiles` | Não | P0 |
| Assinantes ativos | Sim | `profiles` | Não | P0 |
| MAU / DAU / WAU | Não | — | Sim (evento de sessão/login) | P0 |
| Tool views/executions/failures | Não | — | Sim (`product_events`) | P0 |
| Conversão Free→Premium por ferramenta | Não | — | Sim (atribuição em `product_events`) | P1 |
| MRR / ARR | Parcial (dado bruto existe, valor não) | `subscriptions` + tabela de preço | Sim (pequena) | P1 |
| Churn de assinantes | Sim | `subscriptions.canceled_at` | Não | P1 |
| Erros por ferramenta/rota | Não | — | Sim (error tracking) | P1 |
| Status de execução de jobs (cron + importador) | Não | — | Sim (`job_runs`) | P0 |
| Frescor de dados por loteria | Sim (calculável) | `concurso` + `lib/calendario.ts` | Não | P0 |
| Cliques/impressões SEO (Search Console) | Não | — | Sim (integração de API externa) | P2 |
| Consumo de OCR | Parcial (só contador diário sem histórico) | `profiles.ocr_usage` | Sim (histórico) | P2 |
| Uso da API pública por endpoint | Parcial (agregado mensal, sem detalhe por request) | `api_keys` | Sim (log por request) | P2 |
| AdSense — receita | Não | Painel AdSense externo | Sim (integração ou manual) | P3 |

---

## Matriz Data Source → KPI

```text
Supabase (profiles, subscriptions, user_games, alert_preferences, api_keys)
→ total users, assinantes por status, churn, jogos salvos, consumo de API agregado

Postgres direto (loteria, concurso, premiacao_faixa, fn_*)
→ frescor de dados por loteria, estatísticas exibidas nas ferramentas, base para "tool views"
   quando instrumentado

Stripe (via webhook, hoje parcial)
→ status de assinatura; MRR/ARR real exige tabela de preço local ou consulta à API do Stripe

product_events (a criar)
→ tool_views/executions/failures, funis, atribuição de conversão, DAU/MAU

job_runs (a criar)
→ saúde dos cron jobs da Vercel e do importador via GitHub Actions

Google Search Console (integração a criar)
→ cliques, impressões, CTR, posição média, queries, landing pages

Vercel Analytics/Speed Insights (painel externo, sem API simples hoje)
→ pageviews e Web Vitals agregados (fora do produto por ora)

AdSense (painel externo, sem integração hoje)
→ receita de anúncios
```
