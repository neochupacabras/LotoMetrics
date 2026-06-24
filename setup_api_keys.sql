-- =============================================================
-- LotoAnalítica — Tabela de API Keys
-- Rodar no SQL Editor do Supabase após setup_premium.sql
-- =============================================================

CREATE TABLE IF NOT EXISTS public.api_keys (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  key_hash      TEXT        NOT NULL UNIQUE,   -- SHA-256 da chave (nunca guardar a chave em texto)
  key_prefix    TEXT        NOT NULL,           -- primeiros 8 chars para identificação (ex: "la_1a2b3c")
  label         TEXT,                           -- nome dado pelo usuário
  requests_mes  INTEGER     NOT NULL DEFAULT 0, -- contador do mês atual
  limite_mes    INTEGER     NOT NULL DEFAULT 1000,
  mes_referencia TEXT       NOT NULL DEFAULT TO_CHAR(NOW(), 'YYYY-MM'), -- para resetar o contador
  ativo         BOOLEAN     NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at  TIMESTAMPTZ
);

-- RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário gerencia próprias API keys"
  ON public.api_keys FOR ALL
  USING (auth.uid() = user_id);

-- Índices
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id   ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash  ON public.api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix    ON public.api_keys(key_prefix);
