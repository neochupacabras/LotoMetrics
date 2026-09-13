-- Corrige o achado crítico da auditoria de 2026-09-13: a política de UPDATE
-- em profiles ("Usuário atualiza próprio perfil", USING auth.uid() = id)
-- restringe a LINHA (só a própria), mas não a COLUNA. Combinada com o GRANT
-- padrão do Supabase (UPDATE/INSERT/DELETE/TRUNCATE em todas as colunas
-- para anon/authenticated, aplicado automaticamente a toda tabela nova),
-- qualquer usuário logado conseguia gravar plan='premium', role='admin',
-- plan_expires_at=null ou stripe_customer_id de si mesmo via supabase-js no
-- navegador, sem passar por nenhuma rota do servidor. requireAdmin() (ver
-- lib/admin-auth.ts) lê exatamente a coluna role para liberar /admin.
--
-- Confirmado em produção em 2026-09-13 (leitura, sem exploração):
-- information_schema.column_privileges mostrava UPDATE liberado nas 4
-- colunas sensíveis para authenticated e anon; information_schema.
-- role_table_grants mostrava também INSERT/DELETE/TRUNCATE liberados na
-- tabela inteira (RLS sem política de INSERT/DELETE já bloqueava essas
-- duas, mas o grant desnecessário fica revogado por princípio de menor
-- privilégio).
--
-- O app hoje não faz nenhum UPDATE de profiles a partir do client (nem de
-- display_name) -- toda escrita passa por Route Handlers/Server Actions,
-- que agora usam o service role (ver app/api/ocr/route.ts e
-- app/api/stripe/checkout/route.ts, corrigidos no mesmo commit). Mesmo
-- assim, mantemos UPDATE(display_name) para authenticated porque a
-- política já existente pressupõe esse caso de uso e é o único campo cuja
-- edição pela própria pessoa é segura.
--
-- anon perde todo acesso à tabela: nenhuma tela pública lê profiles sem
-- sessão -- todo SELECT hoje acontece com o usuário já autenticado
-- (role efetivo "authenticated" mesmo usando a anon key no client, porque
-- o PostgREST troca o role a partir do JWT da sessão).

revoke all on public.profiles from anon, authenticated;

grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;
