-- RBAC mínimo para o Admin Control Center (/admin). Não existia nenhum papel
-- administrativo no produto até aqui — toda ocorrência de "admin" no código
-- era o service-role client do Supabase (infraestrutura), não um papel de
-- usuário da aplicação.
--
-- 'user' é o papel padrão de todo mundo; 'admin' é concedido manualmente
-- (não há autoatribuição nem fluxo de signup para admin).

ALTER TABLE public.profiles
  ADD COLUMN role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Concede admin à conta que está conduzindo esta implementação
-- (alexandrecesarr@gmail.com, id da0ccf57-5cf5-4c98-84a7-e8c8b57cbdac).
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'da0ccf57-5cf5-4c98-84a7-e8c8b57cbdac';
