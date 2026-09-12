-- Fase 2 do Admin Control Center: camada mínima de telemetria de produto.
-- Antes desta migration não existia NENHUMA tabela de eventos/uso/jobs/erros
-- (ver docs/ADMIN_AUDIT.md, seção 6 "Analytics Gaps") — sem ela era
-- impossível responder "quantas vezes essa ferramenta foi usada" ou "o
-- importador rodou com sucesso ontem".
--
-- Design deliberadamente simples (Postgres puro, sem fila/stream/warehouse):
-- o volume esperado deste produto não justifica mais que isso. RLS habilitado
-- sem nenhuma policy — bloqueia a chave anônima/authenticated por padrão;
-- escrita e leitura acontecem só via service role ou via lib/db.ts (pool com
-- credencial de superuser), nunca do client.

CREATE TABLE public.product_events (
  id BIGSERIAL PRIMARY KEY,
  event_name TEXT NOT NULL,          -- 'tool_view' | 'tool_started' | 'tool_completed' | 'tool_failed' | 'paywall_view' | ...
  tool TEXT,                          -- slug da ferramenta ('gerador', 'conferidor', ...) ou null
  lottery TEXT,                       -- código da loteria ou null
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  anonymous_id TEXT,                  -- reservado para uso futuro (visitante não logado); não emitido ainda
  plan TEXT,                          -- snapshot do plano no momento do evento ('free' | 'premium' | null)
  success BOOLEAN,
  duration_ms INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_events_name_date ON public.product_events (event_name, created_at);
CREATE INDEX idx_product_events_tool_date ON public.product_events (tool, created_at) WHERE tool IS NOT NULL;
CREATE INDEX idx_product_events_user ON public.product_events (user_id) WHERE user_id IS NOT NULL;

ALTER TABLE public.product_events ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.job_runs (
  id BIGSERIAL PRIMARY KEY,
  job_name TEXT NOT NULL,             -- 'cron_conferir' | 'cron_relatorio' | 'revalidar' | 'importador_resultados'
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'partial')),
  started_at TIMESTAMPTZ NOT NULL,
  finished_at TIMESTAMPTZ,
  duration_ms INTEGER,
  details JSONB,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_job_runs_name_date ON public.job_runs (job_name, started_at DESC);

ALTER TABLE public.job_runs ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.error_events (
  id BIGSERIAL PRIMARY KEY,
  source TEXT NOT NULL,               -- 'cron_conferir' | 'stripe_webhook' | 'ocr' | 'tool:<slug>' | ...
  message TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_error_events_source_date ON public.error_events (source, created_at DESC);

ALTER TABLE public.error_events ENABLE ROW LEVEL SECURITY;
