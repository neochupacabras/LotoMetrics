-- Corrige a migration 20261027000000_boloes.sql: o trigger de boloes reusava
-- public.set_updated_at(), que grava NEW.updated_at — mas a coluna de boloes
-- se chama atualizado_em. Resultado: QUALQUER UPDATE em boloes falhava
-- ('record "new" has no field "updated_at"'), o que quebrava o editor
-- (atualizar total de cotas, fechar/reabrir bolão), o webhook do Bolão Pro
-- (pro_ate) e a conferência automática (status 'conferido'). O dry-run da
-- migration original só testou INSERT, nunca UPDATE.
--
-- Função própria pra coluna atualizado_em; set_updated_at() não é tocada
-- (outras tabelas dependem dela).

CREATE OR REPLACE FUNCTION public.set_boloes_atualizado_em()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_boloes_atualizado_em ON public.boloes;

CREATE TRIGGER set_boloes_atualizado_em BEFORE UPDATE ON public.boloes
  FOR EACH ROW EXECUTE FUNCTION public.set_boloes_atualizado_em();
