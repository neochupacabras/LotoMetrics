# SECURITY REMEDIATION PLAN — LotoAnalítica

Plano de correção priorizado derivado de `SECURITY_AUDIT.md`. **Nenhuma alteração foi aplicada** — este é o plano para execução incremental e verificável.

Ordem recomendada: **Fase 0 → Fase 1 → Fase 2 → Fase 3**. SEC-001 e SEC-002 são independentes e podem ser feitos em paralelo.

---

## Fase 0 — Emergencial (bloqueia o lançamento)

### 0.1 — SEC-001: Atualizar Next.js (P0)
- **Resolve:** RCE em `next/og`/Image Optimization, bypass de middleware, SSRF, cache poisoning, DoS.
- **Arquivos:** `package.json`, `package-lock.json`, `eslint-config-next`.
- **Banco/migration:** nenhum.
- **Passos:** `npm i next@latest eslint-config-next@latest` (dentro da linha 16.x corrigida) → `npm audit` (esperado: sumirem os avisos de `next`) → `npm run build` → fumaça nos `opengraph-image.tsx` e na home.
- **Risco de regressão:** Médio — upgrade de minor pode mudar comportamento de cache/imagem. Testar OG images, `/`, `/[loteria]/resultados`, `/conta`, `/admin`.
- **Testes necessários:** build verde; render das 3 rotas de OG; login + `/conta`; `/admin` como admin e como anônimo (307).

---

## Fase 1 — Pré-lançamento obrigatório

### 1.1 — SEC-002: Menor privilégio no Postgres + fechar escrita de `api_keys` (P1)
- **Resolve:** burla de quota/limite da API v1; footgun de `TRUNCATE`; fragilidade de `subscriptions`/`pix_payments`.
- **Arquivos:** nova migration `supabase/migrations/2026XXXX_least_privilege_tabelas_legadas.sql`; opcionalmente `lib/api-key-actions.ts` (usar service role).
- **Banco/migration:** sim.
  - `REVOKE ALL ON public.api_keys, public.subscriptions, public.pix_payments, public.product_events, public.error_events, public.job_runs, public.notificacoes_enviadas FROM anon, authenticated;`
  - `REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.concurso, public.loteria, public.premiacao_faixa FROM anon, authenticated;` (manter só `SELECT`).
  - `user_games` e `alert_preferences`: manter `SELECT, INSERT, UPDATE, DELETE` para `authenticated` (o client escreve), mas revogar `TRUNCATE, REFERENCES, TRIGGER`.
  - `api_keys`: trocar a escrita para service role — revogar `INSERT, UPDATE, DELETE` de `authenticated` e ajustar a policy para `FOR SELECT`. Ajustar `lib/api-key-actions.ts` para `createAdminClient()` (checagem de sessão/premium já existe no servidor).
- **Risco de regressão:** Médio — se algum client escrevia direto numa dessas tabelas, quebra. Confirmado por análise: só `user_games`/`alert_preferences` são escritos pelo client da sessão; `api_keys` é escrito por Server Action (pode ir pra service role sem perda).
- **Ordem:** aplicar migration → deploy do `api-key-actions` service-role no mesmo PR → testar criar/revogar chave e usar a API v1.
- **Testes necessários:** teste de autorização SQL (ver `SECURITY_CHECKLIST.md`) garantindo que `authenticated` **não** consegue `INSERT`/`UPDATE` em `api_keys`/`subscriptions`/`pix_payments`; fluxo de criar/revogar API key pela UI; chamada autenticada à API v1 respeitando quota.

### 1.2 — SEC-004: Validar `next` (open redirect) (P2, barato — fazer já)
- **Resolve:** phishing por redirect externo pós-login.
- **Arquivos:** `lib/auth-actions.ts` (helper `caminhoInternoSeguro(next)`), aplicar em `signIn` e no fallback.
- **Banco:** nenhum.
- **Risco de regressão:** Baixo.
- **Testes:** `next=/conta/jogos` → ok; `next=https://evil.com`, `//evil.com`, `/\evil.com` → cai no default `/conta`.

---

## Fase 2 — Hardening

### 2.1 — SEC-003: Security headers (P2)
- **Arquivos:** `next.config.ts` (`async headers()`).
- **Conteúdo:** `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` restritiva, `frame-ancestors 'none'` (ou `X-Frame-Options: DENY`) e **CSP em report-only** primeiro, depois enforce.
- **Risco de regressão:** Médio (CSP pode quebrar inline/Vercel Analytics/AdSense) — subir report-only, medir, então enforce.
- **Testes:** headers presentes (securityheaders.com / `curl -I`); páginas carregam sem violações de CSP relevantes.

### 2.2 — SEC-005: Mensagem neutra no cadastro (P3)
- **Arquivos:** `lib/auth-actions.ts` (`signUp`/`traduzirErroAuth`).
- **Risco:** Baixo. **Testes:** cadastro com e-mail novo e existente devolvem a mesma mensagem neutra.

### 2.3 — SEC-006: Rate limit de auth (P3)
- **Arquivos:** painel Supabase Auth (config) + opcional `rate_limits`/`consumir_rate_limit` no `signUp`/reset por IP; CAPTCHA/Turnstile.
- **Risco:** Médio (UX). **Testes:** rajada de cadastros do mesmo IP é barrada após N.

### 2.4 — SEC-007: Higiene de arquivos (P3)
- **Arquivos:** `.gitignore` (`*.log`, `__pycache__/`), remover `Instrument`, `Work`, `coral)`; confirmar que nenhum `.log` com dados vai pro repo.
- **Risco:** Baixo.

---

## Fase 3 — Monitoramento contínuo

### 3.1 — SEC-009: Confirmar erros sanitizados em produção
- Verificar que 500 em produção não vaza stack/paths; manter `logError` server-side.

### 3.2 — Observabilidade de segurança
- Alertas (ver `SECURITY_CHECKLIST.md`): picos de 401/403/429, falhas repetidas de login, muitos resets, picos de uso de Vision/e-mail, mudanças em `profiles.role`/`plan`.

### 3.3 — LGPD / retenção
- Revisar retenção de `product_events` (anonymous_id/UTM), e-mails de participantes e logs; definir política de expurgo.

---

## Dependências entre correções

- **1.1** deve ser aplicada com o ajuste de `api-key-actions` **no mesmo deploy** (migration primeiro, depois/junto o código) para não quebrar a criação de chaves.
- **2.1 (CSP)** depende de inventariar scripts inline/terceiros (AdSense, Vercel Analytics) — fazer em report-only antes do enforce.
- **0.1 (Next upgrade)** é independente, mas deve preceder a rodada final de testes porque muda comportamento de imagem/cache.
