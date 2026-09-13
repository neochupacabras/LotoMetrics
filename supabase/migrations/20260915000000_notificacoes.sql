-- Fase 1 do plano de implementação (tarefa 1.1): base de dados para o
-- e-mail pós-sorteio, os alertas de acúmulo e o relatório mensal
-- funcionarem de verdade — hoje nenhum dos três é enviado (ver achados
-- críticos #2 da auditoria de 13/09/2026, confirmados em produção:
-- app/api/cron/conferir/route.ts falha ao buscar o e-mail do usuário via
-- embed `auth_user:user_id(email)`, que o PostgREST não resolve).
--
-- =============================================================
-- 1) profiles.email — mantido em sincronia com auth.users, nunca editável
--    pelo client (fica de fora do GRANT UPDATE que a migration anterior
--    já restringiu a só display_name/receber_emails).
-- =============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS receber_emails boolean NOT NULL DEFAULT true;

-- Backfill das contas existentes.
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE u.id = p.id AND p.email IS DISTINCT FROM u.email;

-- handle_new_user() já existe (cria o profile no signup) — estende pra
-- preencher email também, sem mudar o comportamento pra quem já usa essa
-- trigger hoje.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Nova trigger: mantém profiles.email atualizado se o usuário trocar o
-- e-mail de login (handle_new_user só cobre o INSERT inicial).
CREATE OR REPLACE FUNCTION public.sync_profile_email()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.profiles SET email = NEW.email WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;
CREATE TRIGGER on_auth_user_email_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  WHEN (NEW.email IS DISTINCT FROM OLD.email)
  EXECUTE FUNCTION public.sync_profile_email();

-- Só authenticated pode desativar o recebimento dos próprios e-mails —
-- email continua fora de qualquer GRANT de UPDATE (só a trigger, via
-- SECURITY DEFINER, escreve nessa coluna).
GRANT UPDATE (receber_emails) ON public.profiles TO authenticated;

-- =============================================================
-- 2) notificacoes_enviadas — idempotência de todo envio (e-mail ou,
--    futuramente, outro canal). Sem RLS/política pra client nenhum: só o
--    service role grava e lê (mesma filosofia de product_events/job_runs
--    na migration de telemetria).
--
--    `chave` é o identificador de deduplicação de verdade — evita a
--    armadilha de UNIQUE com colunas nullable (NULL nunca conflita com
--    NULL em Postgres, então uma UNIQUE (user_id, tipo, loteria, concurso)
--    direta deixaria passar duplicatas sempre que loteria/concurso fossem
--    NULL, como no relatório mensal ou no lembrete de Pix). `loteria` e
--    `concurso` continuam gravados, sem participar da constraint, só pra
--    consulta/filtro no admin depois.
--
--    Convenção de `chave` por tipo:
--      resultado_jogos / bolao_resultado : "<loteria>:<numero_concurso>"
--      alerta_acumulo                    : "<loteria>:<numero_concurso>"
--      pix_vencendo                      : "pix:<plan_expires_at AAAA-MM-DD>:<5|1>"
--      relatorio_mensal                  : "relatorio:<AAAA-MM>"
-- =============================================================

CREATE TABLE public.notificacoes_enviadas (
  id BIGSERIAL PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN (
    'resultado_jogos', 'alerta_acumulo', 'pix_vencendo',
    'relatorio_mensal', 'bolao_resultado'
  )),
  loteria TEXT,
  concurso INTEGER,
  chave TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'enviado' CHECK (status IN ('enviado', 'falhou')),
  erro TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, tipo, chave)
);

CREATE INDEX idx_notificacoes_enviadas_user ON public.notificacoes_enviadas (user_id, tipo);
CREATE INDEX idx_notificacoes_enviadas_criado ON public.notificacoes_enviadas (criado_em);

ALTER TABLE public.notificacoes_enviadas ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- 3) UNIQUE real em alert_preferences — lib/jogo-actions.ts já faz upsert
--    com onConflict: "user_id,loteria" com um fallback de INSERT "se a
--    constraint não existir" (achado P2 da auditoria de 12/09/2026: sinal
--    de que o time já suspeitava que a constraint estava faltando).
-- =============================================================

ALTER TABLE public.alert_preferences
  ADD CONSTRAINT alert_preferences_user_loteria_key UNIQUE (user_id, loteria);
