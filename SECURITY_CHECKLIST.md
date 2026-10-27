# SECURITY CHECKLIST — LotoAnalítica

## Checklist pré-lançamento

- [ ] **Next.js atualizado** para versão corrigida (SEC-001) e `npm audit` sem avisos críticos/altos de `next`
- [ ] Nenhum segredo exposto (verificado: histórico git limpo, `.env*` ignorados)
- [ ] Credenciais sensíveis confirmadas como server-only (service role, Stripe/MP/Vision/Resend/DB)
- [ ] Nenhuma `NEXT_PUBLIC_*` sensível adicionada fora do código auditado (conferir env da Vercel)
- [ ] **GRANTs do Postgres reduzidos ao mínimo** (SEC-002); `authenticated` sem INSERT/UPDATE em `api_keys`/`subscriptions`/`pix_payments`
- [ ] Autenticação revisada (login/logout/reset/confirmação)
- [ ] Autorização revisada (ownership por sessão nas Server Actions)
- [ ] IDOR testado (usuário A não acessa recurso de B → 403/404)
- [ ] Admin protegido (`requireAdmin()` no layout; anônimo → 307 /entrar)
- [ ] Mass-assignment: `role`/`plan`/`plan_expires_at` não graváveis pelo client (confirmado)
- [ ] Inputs validados server-side (Server Actions e Route Handlers)
- [ ] SQL Injection verificada (queries parametrizadas)
- [ ] XSS verificado (sem `dangerouslySetInnerHTML` com input de usuário)
- [ ] **Open redirect `next` corrigido** (SEC-004)
- [ ] CSRF: Server Actions/cookies `SameSite` revisados
- [ ] SSRF: upgrade do Next (SEC-001) fecha os avisos; sem fetch de URL fornecida por usuário
- [ ] CORS revisado (API v1 Bearer, sem credenciais)
- [ ] Rate limiting: OCR/bilhete/API/opt-in presentes; **auth confirmado no Supabase** (SEC-006)
- [ ] Rotas pagas protegidas (Vision/e-mail gated por auth+plano+secret)
- [ ] Uploads protegidos (bucket privado, magic bytes, nome server-side, signed URLs)
- [ ] Webhooks validados (Stripe `constructEvent`; MP HMAC `timingSafeEqual`)
- [ ] **Security headers configurados** (SEC-003)
- [ ] Banco protegido (RLS em todas as tabelas; policies por `auth.uid()`)
- [ ] Dependências auditadas (`npm audit`; sharp/postcss/source-map-js avaliados)
- [ ] Logs revisados (sem segredos/PII desnecessária)
- [ ] Erros de produção sanitizados (confirmar 500 sem stack/paths — SEC-009)
- [ ] Testes de autorização existentes no CI
- [ ] Backup/recovery considerados (Supabase)
- [ ] Monitoramento configurado (ver abaixo)
- [ ] Mensagem de cadastro neutra (SEC-005)
- [ ] Arquivos locais higienizados (`*.log`, `__pycache__`, arquivos soltos — SEC-007)

## Testes de regressão de segurança a automatizar

1. **Autorização de coluna/tabela (SQL):** em transação com `SET LOCAL ROLE authenticated` + `request.jwt.claims`, garantir que `INSERT/UPDATE` em `api_keys.limite_mes`, `subscriptions`, `pix_payments` **falham**; e que `profiles` só aceita UPDATE de `display_name`/`receber_emails`/`teto_gasto_mensal`.
2. **IDOR:** usuário A chamando Server Action com `bolaoId`/`jogoId`/`participanteId` de B → erro (não encontrado).
3. **Admin:** requisição anônima a `/admin/*` → redirect `/entrar`; usuário não-admin → redirect `/`.
4. **Open redirect:** `signIn` com `next` externo → vai para `/conta`.
5. **Webhook MP:** assinatura inválida → 401; válida com status forjado no corpo → ignora corpo e consulta API.
6. **Checkout Stripe:** `priceId` fora da allowlist → 400.
7. **API v1:** sem Bearer → 401; não-premium → 403; acima da quota → 429.

## Controles de segurança permanentes no CI/CD

- `npm audit --omit=dev` (falhar em CRÍTICO/ALTO) a cada PR
- Secret scanning (gitleaks/trufflehog) em push e PR
- Static analysis / `eslint` com regras de segurança; `tsc --noEmit`
- `vitest run` incluindo os testes de regressão de segurança acima
- Dependabot/Renovate para atualizações de dependências
- Verificação de que `.env*` nunca entra no diff (bloqueio por hook — já existe hook do plugin mercadopago)

## Eventos a monitorar em produção

- Falhas repetidas de login; muitos resets de senha; criação anormal de contas
- Excesso de 401/403 (sondagem de autorização) e de 429 (abuso/rate limit)
- Mudanças em `profiles.role`/`plan` (trilha de auditoria)
- Picos de uso de Vision (OCR/bilhete) e de e-mails enviados (`job_runs`)
- Reembolsos (`charge.refunded`, Pix `refunded`) e divergências de entitlement
- Erros em `error_events` por `source` (stripe_webhook, mercadopago_webhook, ocr)
