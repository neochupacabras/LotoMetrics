-- =============================================================
-- LotoAnalítica — Fase 0: Tabelas de usuários e assinaturas
-- Rodar no SQL Editor do Supabase APÓS os scripts de loteria.
-- =============================================================

-- profiles: extensão do auth.users do Supabase
-- Uma linha por usuário; criada automaticamente por trigger.
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  TEXT,
  plan          TEXT        NOT NULL DEFAULT 'free'
                            CHECK (plan IN ('free', 'premium')),
  plan_expires_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- subscriptions: histórico de assinaturas Stripe
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT       UNIQUE,
  stripe_price_id       TEXT,
  status                TEXT        NOT NULL
                                    CHECK (status IN (
                                      'active', 'canceled', 'past_due',
                                      'trialing', 'incomplete', 'incomplete_expired'
                                    )),
  current_period_start  TIMESTAMPTZ,
  current_period_end    TIMESTAMPTZ,
  canceled_at           TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- user_games: jogos cadastrados pelo usuário (Rastreador — Fase 2)
-- Já criamos a tabela agora para o "salve seus jogos" do plano free.
CREATE TABLE IF NOT EXISTS public.user_games (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  loteria     TEXT        NOT NULL CHECK (loteria IN ('lotofacil', 'megasena')),
  dezenas     INTEGER[]   NOT NULL,
  label       TEXT,                        -- nome dado pelo usuário, ex: "Jogo da família"
  ativo       BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- alert_preferences: configurações de alertas de acúmulo (Fase 2)
CREATE TABLE IF NOT EXISTS public.alert_preferences (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  loteria       TEXT        NOT NULL CHECK (loteria IN ('lotofacil', 'megasena')),
  threshold_brl NUMERIC(15,2),            -- ex: 80000000.00 para R$80M
  sorteios_sem_ganhador INTEGER,          -- ex: alertar após 5 sorteios acumulados
  ativo         BOOLEAN     NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================
-- Trigger: cria profile automaticamente ao confirmar e-mail
-- =============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: atualiza updated_at nos profiles
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================
-- RLS (Row Level Security)
-- Cada usuário só acessa seus próprios dados.
-- =============================================================
ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_games       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_preferences ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Usuário lê próprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuário atualiza próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- subscriptions
CREATE POLICY "Usuário lê próprias assinaturas"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- user_games
CREATE POLICY "Usuário lê próprios jogos"
  ON public.user_games FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuário insere jogos"
  ON public.user_games FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuário atualiza jogos"
  ON public.user_games FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuário deleta jogos"
  ON public.user_games FOR DELETE
  USING (auth.uid() = user_id);

-- alert_preferences
CREATE POLICY "Usuário gerencia alertas"
  ON public.alert_preferences FOR ALL
  USING (auth.uid() = user_id);

-- =============================================================
-- Índices
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id  ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_games_user_id      ON public.user_games(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_prefs_user_id     ON public.alert_preferences(user_id);

-- Adicionar coluna para rate limiting do OCR (contador diário)
-- Formato: { "data": "2026-06-24", "count": 3 }
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ocr_usage JSONB NOT NULL DEFAULT '{"data":"","count":0}'::jsonb;
