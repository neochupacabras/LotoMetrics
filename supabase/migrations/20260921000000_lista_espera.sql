-- Tarefa 2.2 do plano de implementação (21/09/2026): lista de espera do
-- guia "Bolão da Mega da Virada 2026" — captura o e-mail de quem quer
-- organizar um bolão, sem exigir cadastro. É o primeiro sinal de demanda
-- real pra tese do bolão (ver auditoria de 13/09/2026, seção "money path").
--
-- Mesma filosofia de product_events/job_runs/notificacoes_enviadas: RLS
-- ativo sem nenhuma política — só o service role grava e lê. O formulário
-- público nunca insere direto pelo client; sempre via Server Action
-- (lib/lista-espera-actions.ts) usando o service role.
--
-- UNIQUE (email, origem): a mesma pessoa pode entrar na lista de espera de
-- mais de uma origem (ex.: bolão da Virada E um futuro recurso separado)
-- sem duplicar linha se enviar o formulário duas vezes na mesma origem.

CREATE TABLE public.lista_espera (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  origem TEXT NOT NULL, -- ex.: 'bolao-mega-virada-2026'
  loteria TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (email, origem)
);

CREATE INDEX idx_lista_espera_origem ON public.lista_espera (origem, criado_em DESC);

ALTER TABLE public.lista_espera ENABLE ROW LEVEL SECURITY;

-- Defesa em profundidade além do RLS: o Supabase concede
-- SELECT/INSERT/UPDATE/DELETE/TRUNCATE a anon/authenticated em toda tabela
-- nova por padrão (o mesmo padrão encontrado em profiles na Fase 0 da
-- auditoria de 13/09/2026). Sem nenhuma política aqui, o RLS já nega tudo
-- de qualquer forma (SELECT devolve 0 linhas, INSERT lança "new row
-- violates row-level security policy" — confirmado num teste em
-- transação antes de aplicar), mas revogar o GRANT deixa isso explícito
-- em vez de depender só do RLS.
REVOKE ALL ON public.lista_espera FROM anon, authenticated;
