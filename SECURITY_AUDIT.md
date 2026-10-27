# SECURITY AUDIT — LotoAnalítica (loterias-web)

> Documento gerado por auditoria de segurança pré-lançamento em modo **read-only**.
> Nenhum código, migration, configuração ou credencial foi alterado durante a auditoria.
> Nenhum segredo é reproduzido aqui — apenas o **nome** das variáveis.

---

## Security Audit Summary

- **Data da auditoria:** 2026-10-27
- **Stack identificada:** Next.js **16.2.9** (App Router, React 19, TypeScript), rotas Route Handlers + Server Actions, Node runtime; Supabase (Postgres 17.6 + Auth + Storage) via `@supabase/ssr` e `pg` (Transaction Pooler); Stripe (assinatura) + Mercado Pago (Pix avulso); Google Cloud Vision (OCR); Resend (e-mail); Vercel (hosting + cron); GitHub Actions (importador Python).
- **Superfície analisada:** 31 Route Handlers/API, 12 arquivos de Server Actions, middleware (`proxy.ts`), 20 tabelas Postgres com RLS, 1 bucket de Storage, 2 webhooks de pagamento, 3 cron/jobs, painel `/admin`, API pública v1 com API keys, histórico git completo (280 commits).
- **Método:** análise estática do código + consulta **somente leitura** ao catálogo do banco de produção (RLS, policies, grants por coluna, funções, roles) autorizada pelo usuário; um teste de baseline local não destrutivo em `/admin`. `npm audit`.

### Contagem de vulnerabilidades

| Severidade | Qtd |
|---|---:|
| CRÍTICA | 1 |
| ALTA | 1 |
| MÉDIA | 3 |
| BAIXA | 4 |
| INFORMATIVA | 3 |

### Riscos mais importantes

1. **Next.js 16.2.9 com múltiplos CVEs críticos** (RCE em `next/og`/Image Optimization, bypass de middleware, SSRF, cache poisoning) — a versão em uso está dentro da faixa afetada por avisos CRÍTICOS.
2. **Privilégios default do Postgres sobrando** em tabelas antigas (`api_keys`, `alert_preferences`, etc.): para `api_keys` a policy `FOR ALL` permite que um usuário autenticado grave a própria linha e **burle o limite de chaves e a quota mensal da API** escrevendo direto pelo supabase-js.
3. **Ausência total de security headers** (sem CSP, HSTS, anti-clickjacking) — `next.config.ts` está vazio.

### Áreas que NÃO puderam ser verificadas (exigem acesso a produção/staging)

- Headers HTTP efetivamente servidos em produção (hoje não há config no código — ver SEC-003).
- Rate limits reais do Supabase Auth (login/cadastro/reset) e limites de SMTP/Resend.
- Variáveis de ambiente de produção na Vercel e se alguma `NEXT_PUBLIC_*` sensível foi adicionada fora do código auditado.
- Rotação efetiva de credenciais (não há evidência de vazamento, mas não pôde ser confirmada a rotação).
- Comportamento de página de erro em **produção** (o teste de erro foi feito só em `next dev`).

---

## Launch Blockers

Itens que **precisam ser corrigidos antes do lançamento**:

- **SEC-001 — Atualizar Next.js** para a última versão corrigida da linha 16.x (hoje 16.2.9 está sujeita a avisos CRÍTICOS, incluindo RCE em `next/og`, que é usado pelos `opengraph-image.tsx`/`app/b/[slug]/opengraph-image.tsx`, e Image Optimization). **P0.**
- **SEC-002 — Revogar os GRANTs default do Postgres** nas tabelas legadas e, em particular, fechar a escrita direta de `api_keys` por `authenticated` (hoje permite burlar quota/limites da API). **P1.**

> Observação: o achado mais perigoso de versões anteriores (mass-assignment em `profiles.role/plan`) **já foi corrigido** e confirmado no banco de produção durante esta auditoria — ver seção "Verificado".

Isto **não** é uma garantia absoluta de segurança: é o resultado da análise estática e dos testes não destrutivos realizados.

---

## 1. Mapa da arquitetura (Attack Surface Map)

| Camada | Tecnologia | Observações de segurança |
|---|---|---|
| Frontend | React 19 / Next App Router | Dados de usuário renderizados via JSX (escapado). `dangerouslySetInnerHTML` só com JSON-LD e conteúdo estático. |
| Middleware | `proxy.ts` | Redireciona `/conta` (exige login) e `/admin` (precaução). **Não é** a fonte de verdade de autorização. |
| Backend | Route Handlers + Server Actions (Node runtime) | Toda escrita sensível usa service role **após** checar sessão/ownership. |
| Banco | Supabase Postgres 17.6 | RLS habilitado em todas as 20 tabelas. App server-side usa role `postgres` (bypassa RLS) com SQL parametrizado. |
| Auth | Supabase Auth (cookies SSR) | Sessão em cookie gerenciada por `@supabase/ssr`; `getUser()` valida no servidor. |
| Storage | bucket `bolao-bilhetes` (privado) | Limite 5 MB, MIME allowlist, signed URLs de 1h, nomes server-side. |
| Pagamentos | Stripe + Mercado Pago (Pix) | Webhooks com verificação de assinatura; valores server-authoritative. |
| IA/OCR | Google Cloud Vision | Via API key server-side; gated por plano + rate limit. |
| E-mail | Resend | Disparo só por cron (secret) ou eventos autenticados; link de descadastro com HMAC. |
| Hosting/Cron | Vercel + `vercel.json` crons | `/api/cron/*` protegido por `CRON_SECRET`. |
| Pipeline | GitHub Actions (`importador.py`) | Segredos via GitHub Secrets; chama `/api/revalidar` e `/api/eventos/concursos-novos` com `REVALIDAR_SECRET`. |

### Pontos de entrada de dados externos
Forms de auth; Server Actions (bolão, jogos, API keys, simulador, conferidor, carteira); Route Handlers (OCR, bilhete, checkout Stripe/MP, portal, relatório, exportar, eventos, revalidar); webhooks Stripe/MP; callback OAuth/e-mail (`/auth/callback`); link de descadastro; API pública v1 (Bearer); upload de imagem; query strings (`next`, `mes/ano`, `period`, `dryRun`, `janelaHoras`).

---

## 2. Inventário de rotas sensíveis

| Rota | Tipo | Auth | Autorização | Custo | Rate limit |
|---|---|---|---|---|---|
| `/admin/*` | Página | Sim | `requireAdmin()` no layout (role=admin) | Não | — |
| Server Actions `lib/*-actions.ts` | Action | Sim (`getUser`) | owner/user_id da sessão | Não | parcial |
| `POST /api/stripe/checkout` | API | Sim | priceId allowlist | Stripe | — |
| `POST /api/stripe/portal` | API | Sim | customerId do perfil | Stripe | — |
| `POST /api/stripe/webhook` | Webhook | Assinatura | `constructEvent` | — | — |
| `POST /api/mercadopago/checkout` | API | Sim | dono do bolão / plano | MP | — |
| `POST /api/mercadopago/webhook` | Webhook | HMAC | timingSafeEqual + status autoritativo | — | — |
| `GET /api/mercadopago/status/[id]` | API | Sim | user_id da sessão | Não | — |
| `POST /api/ocr` | API | Sim | Premium | **Vision ($)** | 100/mês por usuário |
| `POST /api/bolao/bilhete` | API | Sim | dono + Bolão Pro | **Vision ($)** | 20/dia por usuário |
| `GET /api/relatorio` | API | Sim | Premium | DB pesado | — |
| `GET /api/[loteria]/exportar` | API | Sim | Premium | DB | — |
| `GET /api/[loteria]/ultimo-concurso` | API | Não | pública | DB leve | cache 30s |
| `GET /api/v1/resultados|estatisticas` | API | API key | Premium + quota | DB | 1000/mês por chave |
| `POST /api/eventos` | API | Não | filtro bot/allowlist | DB insert | — |
| `POST /api/revalidar` | API | `REVALIDAR_SECRET` | token | — | — |
| `POST /api/eventos/concursos-novos` | API | `REVALIDAR_SECRET` | token | **e-mail ($)** | — |
| `GET /api/cron/conferir` | Cron | `CRON_SECRET` | token | **e-mail ($)** | — |
| `GET /api/cron/relatorio` | Cron | `CRON_SECRET` | token | **e-mail ($)** | — |
| `GET /api/notificacoes/descadastrar` | API | token HMAC | por userId/participante | — | — |

---

## 3. Matriz de rotas que podem gerar custo (Denial-of-Wallet)

| Rota/ação | Serviço | Auth | Rate limit | Risco de abuso |
|---|---|---|---|---|
| `/api/ocr` | Google Vision | Premium | 100/mês/usuário | **Baixo** (gated por plano pago) |
| `/api/bolao/bilhete` | Google Vision | Pro | 20/dia/usuário | **Baixo** |
| `/api/eventos/concursos-novos`, `/api/cron/*` | Resend (e-mail) | secret | — | **Baixo** (secret server-server) |
| Cadastro/reset de senha | Supabase/SMTP | — | Supabase (a confirmar) | **Médio** (ver SEC-006) |
| `/api/stripe|mercadopago/checkout` | Stripe/MP | login | — | **Baixo** (cria objeto, exige conta) |
| `/api/v1/*` | DB | API key | 1000/mês/chave | **Médio** se SEC-002 não corrigido (quota burlável) |

---

## 4. Vulnerabilidades

### SEC-001 — Next.js desatualizado com CVEs críticos
- **Severidade:** CRÍTICA · **OWASP:** A06:2021 Vulnerable and Outdated Components · **Prioridade:** P0
- **Localização:** `package.json` (`next: 16.2.9`), uso de `next/og` em `app/opengraph-image.tsx`, `app/[loteria]/resultados/[numero]/opengraph-image.tsx`, `app/b/[slug]/opengraph-image.tsx`, `components/og/CardBolao.tsx`.
- **Descrição:** `npm audit` aponta a linha instalada dentro da faixa de avisos **críticos** do Next.js, incluindo: RCE em `next/og ImageResponse` (GHSA-vcvr-r3jv-pc5j), RCE na Image Optimization com SVG/AVIF, bypass de middleware/proxy em App Router (GHSA-6gpp-xcg3-4w24 — relevante porque há `proxy.ts`), SSRF em Server Actions/rewrites, cache poisoning de SSG/ISR e vários DoS.
- **Cenário de exploração:** uma requisição a uma rota de OG image / otimização de imagem com payload especialmente construído pode, conforme o aviso, levar a execução de código no servidor; o bypass de middleware pode anular o redirecionamento de `proxy.ts`.
- **Impacto:** potencial RCE no servidor de produção, SSRF para rede interna/metadata, e DoS.
- **Evidência:** `npm audit` → `next 9.3.4-canary.0 - 16.4.0 … Severity: critical`. A autorização real de `/admin` está no layout (`requireAdmin`), então o bypass de middleware isoladamente **não** concede admin — mas os CVEs de RCE/SSRF independem disso.
- **Correção recomendada:** atualizar `next` (e `eslint-config-next`) para a última versão corrigida da linha 16.x; rodar `npm audit` novamente; revalidar build e os `opengraph-image.tsx`.
- **Complexidade:** Baixa.

### SEC-002 — GRANTs default do Postgres sobrando; escrita direta de `api_keys` por usuário
- **Severidade:** ALTA · **OWASP:** A01:2021 Broken Access Control / A05 Misconfiguration · **Prioridade:** P1
- **Localização:** banco de produção — tabelas `api_keys`, `user_games`, `alert_preferences`, `subscriptions`, `pix_payments`, `product_events`, `error_events`, `job_runs`, `concurso`, `loteria`, `premiacao_faixa`, `notificacoes_enviadas`. Policy `setup_api_keys.sql:23` / `supabase/schema.sql:1333`.
- **Descrição:** essas tabelas mantêm os GRANTs default do Supabase (`SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER` para `anon` e `authenticated`). O padrão de menor privilégio aplicado a `profiles`/`boloes`/`lista_espera`/`rate_limits`/`bolao_bilhetes` (via `REVOKE ALL`) **não** foi aplicado às tabelas mais antigas. Na maioria delas a RLS neutraliza a escrita por **não haver policy** de INSERT/UPDATE/DELETE — mas `api_keys` e `alert_preferences` têm policy `FOR ALL USING (auth.uid() = user_id)`, cujo `USING` serve de `WITH CHECK` implícito.
- **Cenário de exploração:** um usuário Premium autenticado chama o supabase-js no navegador: `supabase.from('api_keys').insert({ user_id: <meu id>, key_hash: <hash que eu escolho>, key_prefix:'la_...', limite_mes: 999999999, ativo:true })` — ou `update({ requests_mes: 0, limite_mes: 999999999 })` na própria chave. Como `validarApiKey` só exige que o usuário seja Premium, a chave passa a ter quota praticamente ilimitada e o limite de "3 chaves ativas" (enforçado só na Server Action) é ignorado.
- **Impacto:** burla da quota mensal (1000) e do limite de chaves da API v1; `TRUNCATE` concedido é um footgun. Risco financeiro baixo (API é leitura de dados públicos), mas é Broken Access Control real. Além disso, deixar `subscriptions`/`pix_payments` apenas "protegidos pela ausência de policy" é frágil: adicionar no futuro qualquer policy de escrita abriria um caminho de **premium sem pagar**.
- **Evidência (consulta read-only ao catálogo de produção):** `information_schema.role_table_grants` mostra `authenticated:api_keys:DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE`; `column_privileges` confirma UPDATE/INSERT de `api_keys.limite_mes`, `requests_mes`, `ativo`, `key_hash` por `authenticated`; policy `api_keys` = `ALL ... using=(auth.uid() = user_id) check=-`.
- **Correção recomendada:** migration com `REVOKE ALL ON <tabelas legadas> FROM anon, authenticated;` e GRANT mínimo só onde o client realmente escreve (ex.: `user_games`, `alert_preferences`). Para `api_keys`, mover toda escrita para o service role (a Server Action já roda no servidor) e revogar INSERT/UPDATE/DELETE de `authenticated`; ou, se mantida, adicionar `WITH CHECK` que fixe `limite_mes`/`requests_mes`.
- **Complexidade:** Média (apenas grants/policies; sem mudança de app se a escrita de `api_keys` passar a service role).

### SEC-003 — Ausência de security headers
- **Severidade:** MÉDIA · **OWASP:** A05:2021 Security Misconfiguration · **Prioridade:** P2
- **Localização:** `next.config.ts` (vazio, sem `headers()`).
- **Descrição:** não há `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`/`frame-ancestors`, `Referrer-Policy` nem `Permissions-Policy` definidos no código.
- **Impacto:** clickjacking em páginas autenticadas (`/conta`, `/admin`), ausência de defesa-em-profundidade contra XSS, sem HSTS forçado.
- **Correção recomendada:** adicionar `async headers()` no `next.config.ts` com HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `frame-ancestors 'none'` e uma CSP (começar em report-only). Evitar `unsafe-eval`; `unsafe-inline` só se estritamente necessário.
- **Complexidade:** Média (ajuste fino da CSP para não quebrar inline/Vercel Analytics).

### SEC-004 — Open redirect via parâmetro `next`
- **Severidade:** MÉDIA · **OWASP:** A01:2021 · **Prioridade:** P2
- **Localização:** `lib/auth-actions.ts:39,48` (`const next = formData.get("next")`, depois `redirect(next)`); origem em `app/entrar/page.tsx:16,34` + `components/auth/AuthForm.tsx`.
- **Descrição:** `next` vem da query string sem validação e é passado direto a `redirect()`. Um link `/entrar?next=https://site-malicioso/...` redireciona o usuário para fora do domínio após o login. (O `/auth/callback` **não** é afetado: ele monta `${origin}${next}`.)
- **Cenário de exploração:** phishing — a vítima entra no domínio legítimo, autentica, e é levada a um site controlado pelo atacante (que pode imitar a área logada).
- **Correção recomendada:** aceitar apenas caminhos internos — rejeitar se `next` não começar com `/` ou se começar com `//`/`/\`; default `/conta`.
- **Complexidade:** Baixa.

### SEC-005 — User enumeration no cadastro
- **Severidade:** BAIXA · **OWASP:** A07:2021 · **Prioridade:** P3
- **Localização:** `lib/auth-actions.ts:94` (`"Já existe uma conta com esse e-mail."`).
- **Descrição:** o cadastro revela se um e-mail já está registrado. (A recuperação de senha já usa mensagem genérica — correto.)
- **Impacto:** enumeração de e-mails cadastrados. Mitigado em parte pela confirmação de e-mail do Supabase.
- **Correção recomendada:** mensagem neutra no cadastro ("Enviamos um e-mail para concluir o cadastro, se o endereço estiver disponível.") e tratar o caso de e-mail existente pelo fluxo de confirmação.
- **Complexidade:** Baixa.

### SEC-006 — Rate limiting de auth delegado ao Supabase (não verificado)
- **Severidade:** BAIXA · **OWASP:** A07:2021 · **Prioridade:** P3
- **Localização:** `lib/auth-actions.ts` (login/cadastro/reset) — sem rate limit próprio.
- **Descrição:** brute-force, credential stuffing e e-mail bombing de cadastro/reset dependem inteiramente dos limites embutidos do Supabase Auth e do provedor SMTP.
- **Correção recomendada:** confirmar e, se preciso, endurecer os limites no painel do Supabase Auth; considerar CAPTCHA/Turnstile no cadastro e reset; reusar a tabela `rate_limits`/`consumir_rate_limit` para proteger o cadastro por IP.
- **Complexidade:** Média.

### SEC-007 — Arquivos locais sensíveis fora do versionamento, não ignorados
- **Severidade:** BAIXA · **Prioridade:** P3
- **Localização:** raiz do projeto — `.env.local`, `.env.producao.local` (gitignored, **não** commitados — ok), e `importador_loterias.log` (~1.6 MB), `__pycache__/`, e arquivos vazios soltos `Instrument`, `Work`, `coral)` (**não** cobertos pelo `.gitignore`).
- **Descrição:** o `.gitignore` cobre `.env*` e credenciais soltas, mas não o `.log` do importador (pode conter dados/erros) nem lixo de build Python. Risco de commit acidental.
- **Correção recomendada:** adicionar `*.log`, `__pycache__/`, e remover os arquivos vazios acidentais; confirmar que nenhum `.log` com dados seja publicado.
- **Complexidade:** Baixa.

### SEC-008 — CORS `*` na API v1
- **Severidade:** INFORMATIVA · **OWASP:** A05
- **Localização:** `lib/api-auth.ts:122` (`Access-Control-Allow-Origin: *`).
- **Descrição:** aceitável — a API usa **Bearer token** e **não** envia credenciais/cookies, então `*` não expõe dados de sessão. Documentado por completude.
- **Correção recomendada:** manter; nunca combinar `*` com `Access-Control-Allow-Credentials: true`.

### SEC-009 — Página de erro expõe stack trace em dev (confirmar produção)
- **Severidade:** INFORMATIVA · **OWASP:** A05 · **Prioridade:** P3
- **Localização:** comportamento do `next dev` (teste local retornou stack trace e caminho de FS num 500).
- **Descrição:** em desenvolvimento o Next expõe stack/paths — esperado. Em produção o Next sanitiza por padrão. **Não verificado em produção.**
- **Correção recomendada:** confirmar em produção que 500 não vaza stack/paths; manter `logError` server-side sem devolver detalhe ao cliente (já é o padrão nas rotas).

### SEC-010 — Rate limit de opt-in "fail-open"
- **Severidade:** INFORMATIVA/BAIXA · **Prioridade:** P3
- **Localização:** `lib/bolao-publico-actions.ts:462` e `app/api/bolao/bilhete/route.ts:344`.
- **Descrição:** se o RPC `consumir_rate_limit` falhar, o código deixa passar (decisão consciente, comentada). Aceitável para não bloquear usuários legítimos, mas registra abuso potencial em caso de indisponibilidade do RPC.
- **Correção recomendada:** manter o log; opcionalmente aplicar um limite secundário mais permissivo em memória.

---

## 5. Áreas verificadas — sem problema identificado

- **VERIFICADO — Segredos/histórico git:** nenhuma credencial em arquivos rastreados nem no histórico (280 commits varridos com `git log -S`/regex). `.gitignore` cobre `.env*` e arquivos de chave soltos. As `NEXT_PUBLIC_*` enviadas ao browser são só valores públicos (URL/anon key do Supabase, price IDs públicos do Stripe, URL do site). `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `MERCADOPAGO_ACCESS_TOKEN`, `GOOGLE_CLOUD_VISION_API_KEY`, `RESEND_API_KEY`, `DATABASE_URL`, `*_SECRET` só server-side.
- **VERIFICADO — Mass assignment de `profiles`:** corrigido e **confirmado no banco de produção** — `authenticated` só tem `UPDATE` em `display_name`, `receber_emails`, `teto_gasto_mensal`; `role`, `plan`, `plan_expires_at`, `stripe_customer_id`, `ocr_usage` não são graváveis pelo client. `role=admin` não pode ser auto-atribuído.
- **VERIFICADO — Pagamentos:** Stripe usa `constructEvent` (assinatura); Mercado Pago valida HMAC-SHA256 com `timingSafeEqual` e busca o status autoritativo na API do MP (nunca confia no corpo). Preços e `priceId` são server-authoritative (allowlist). `customerId` nunca vem do corpo. Idempotência atômica no webhook (claim por `status`).
- **VERIFICADO — SQL Injection:** todas as `pool.query` usam placeholders `$1..$n`; nenhuma concatenação/template com input de usuário. RPCs via supabase-js.
- **VERIFICADO — IDOR/ownership:** Server Actions cruzam `owner_id`/`user_id` da **sessão** (não do corpo) em todo UPDATE/DELETE; RLS por `auth.uid()` nas tabelas de usuário.
- **VERIFICADO — Admin:** `requireAdmin()` roda no **layout** de `/admin`, cobrindo toda a subárvore; baseline anônimo retornou `307 → /entrar`. Não há Server Action de mutação no `/admin`.
- **VERIFICADO — Upload:** bucket privado, limite de tamanho, validação por **magic bytes** (`detectarTipoImagem`), nome gerado server-side (`randomUUID`), URLs assinadas de 1h, MIME allowlist no bucket.
- **VERIFICADO — Webhooks:** assinatura verificada nos dois provedores; replay mitigado por idempotência de estado.
- **VERIFICADO — XSS:** `dangerouslySetInnerHTML` só com `JSON.stringify` (JSON-LD) e strings estáticas (calculadoras/artigos de `lib/artigos.ts`). Conteúdo de usuário (título/nome do bolão) renderizado via JSX (auto-escapado).
- **VERIFICADO — Funções SECURITY DEFINER:** `handle_new_user`, `sync_profile_email`, `consumir_rate_limit` com `search_path` fixado; `consumir_rate_limit` com EXECUTE só para `service_role`.
- **PARCIALMENTE VERIFICADO — Rate limiting:** há limites por usuário em OCR/bilhete/API e por IP/slug no opt-in; auth depende do Supabase (ver SEC-006).

---

## 6. Threat model resumido (STRIDE)

- **Ativos:** contas de usuário, status Premium/entitlement, dados de pagamento (via Stripe/MP, não armazenados), e-mails de usuários e participantes de bolão, chave service-role, API keys.
- **Atores:** anônimo, usuário autenticado, usuário Premium/Pro, admin, bot, provedor externo (Stripe/MP/Vision/Resend).
- **Trust boundaries:** browser → Route Handler/Server Action (confiança só na sessão validada no servidor); app server (role `postgres`, bypassa RLS) → banco; client supabase-js (role `authenticated`, sujeito a RLS/grants) → banco; webhooks externos → verificação de assinatura.
- **Principais ameaças:** **Elevation of Privilege** (SEC-002, Premium burlando quota; mass-assignment já fechado), **Tampering/RCE** (SEC-001), **Spoofing** (open redirect SEC-004; enumeração SEC-005), **Information Disclosure** (headers SEC-003; erros SEC-009), **DoS/Denial-of-Wallet** (mitigado por auth+rate limit; SEC-006 em auth).

---

## 7. Critério final por categoria

| Categoria | Status |
|---|---|
| Segredos/credenciais | VERIFICADO — nenhum problema |
| Autenticação | PROBLEMAS ENCONTRADOS (SEC-004, SEC-005, SEC-006) |
| Autorização / IDOR / Admin | VERIFICADO (mass-assignment corrigido) |
| Banco / RLS / grants | PROBLEMAS ENCONTRADOS (SEC-002) |
| Input / Injection / XSS | VERIFICADO |
| APIs / abuso / custo | PARCIALMENTE VERIFICADO (SEC-002 afeta quota) |
| Pagamentos / webhooks | VERIFICADO |
| Uploads / storage | VERIFICADO |
| Dependências / supply chain | PROBLEMAS ENCONTRADOS (SEC-001) |
| Security headers / hardening | PROBLEMAS ENCONTRADOS (SEC-003) |
| Config de produção | NÃO FOI POSSÍVEL VERIFICAR |
| Logs / erros em produção | NÃO FOI POSSÍVEL VERIFICAR (SEC-009) |

---

## 8. Riscos residuais (permanecem após correções)

- App server-side roda como role `postgres` (bypassa RLS) — correto para código confiável, mas qualquer SQL dinâmico futuro precisa continuar parametrizado.
- Dependência de serviços externos (Supabase/Stripe/MP/Vision/Resend) — superfície fora do controle do código.
- Rate limits de auth do Supabase e limites de SMTP continuam sendo a principal defesa contra brute-force/e-mail bombing.
- O modelo de atribuição de conversão grava `anonymous_id`/UTM — revisar retenção sob a ótica de LGPD.

Ver `SECURITY_REMEDIATION_PLAN.md` para o plano por fases e `SECURITY_CHECKLIST.md` para o checklist e os controles de CI/CD.
