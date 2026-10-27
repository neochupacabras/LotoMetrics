-- Fase 1 (SEC-002 da auditoria de 27/10/2026): menor privilégio nas tabelas
-- legadas. As tabelas criadas antes da Fase 0 (profiles/boloes/…) mantiveram
-- os GRANTs default do Supabase — todos os comandos (SELECT/INSERT/UPDATE/
-- DELETE/TRUNCATE/REFERENCES/TRIGGER) para anon e authenticated. A RLS
-- neutraliza a maioria por não haver policy de escrita, MAS api_keys e
-- alert_preferences têm policy FOR ALL, cujo USING vale como WITH CHECK:
-- um usuário autenticado conseguia INSERT/UPDATE da própria linha de
-- api_keys via supabase-js, criando chaves à vontade, elevando o próprio
-- limite_mes e zerando requests_mes — burlando o limite de 3 chaves e a
-- quota mensal da API v1 (ambos enforçados só na Server Action).
--
-- Reaplica aqui o mesmo padrão de REVOKE ALL já usado em
-- 20261027000000_boloes.sql e 20260914000000_restrict_profiles_update.sql.
-- Nada disso afeta os roles `postgres` (pool server-side, lib/db.ts) nem
-- `service_role` (createAdminClient) — ambos bypassam RLS e mantêm seus
-- grants, então toda escrita server-side continua funcionando.

-- 1) Leitura pública (resultados): só SELECT para o client.
revoke insert, update, delete, truncate, references, trigger
  on public.concurso, public.loteria, public.premiacao_faixa
  from anon, authenticated;

-- 2) Tabelas server-only (telemetria/jobs): o client nunca toca nelas
--    diretamente — tudo passa por lib/telemetry.ts (role postgres) ou pelo
--    service role. Sem nenhuma policy, a RLS já bloqueava; revogar o grant
--    deixa explícito o menor privilégio.
revoke all on public.product_events, public.error_events, public.job_runs,
              public.notificacoes_enviadas
  from anon, authenticated;

-- 3) subscriptions e pix_payments: o client autenticado só LÊ as próprias
--    linhas (polling do Pix e tela de assinatura). Escrita é 100% server-side
--    (webhooks Stripe/MP via service role). Revoga toda escrita e tira o anon.
revoke insert, update, delete, truncate, references, trigger
  on public.subscriptions, public.pix_payments
  from anon, authenticated;
revoke all on public.subscriptions, public.pix_payments from anon;

-- 4) api_keys: a listagem em /conta/api lê pelo client da sessão (RLS por
--    dono), mas a escrita passa a ser exclusivamente service role (ver
--    lib/api-key-actions.ts, migrado no mesmo PR). Fecha o buraco de o
--    usuário gravar/alterar a própria chave.
revoke insert, update, delete, truncate, references, trigger
  on public.api_keys from anon, authenticated;
revoke all on public.api_keys from anon;

drop policy if exists "Usuário gerencia próprias API keys" on public.api_keys;
create policy "Usuário lê próprias API keys"
  on public.api_keys for select to authenticated
  using (auth.uid() = user_id);

-- 5) user_games e alert_preferences continuam graváveis pelo PRÓPRIO dono
--    (Server Actions usam o client da sessão: salvarJogoAction,
--    salvarAlertaAction etc.), então SELECT/INSERT/UPDATE/DELETE ficam.
--    Só remove os comandos que o client nunca deveria ter.
revoke truncate, references, trigger
  on public.user_games, public.alert_preferences
  from anon, authenticated;
revoke all on public.user_games, public.alert_preferences from anon;
