-- PWA: notificações Web Push (Push API + VAPID).
--
-- push_inscricoes: uma linha por navegador/aparelho inscrito. O endpoint é
-- a identidade da inscrição (UNIQUE) e funciona como capacidade: quem tem o
-- endpoint (o próprio navegador) pode consultar/alterar/remover a inscrição
-- — é assim que visitantes sem conta assinam "resultado da Mega-Sena".
-- user_id só é preenchido quando o usuário estava logado ao salvar; as
-- categorias pessoais (meus_jogos, bolao) exigem user_id.
--
-- Sem nenhuma política/GRANT para anon/authenticated: só o servidor
-- (pg pool / service role, nas rotas /api/push/*) lê e grava — mesma
-- filosofia de notificacoes_enviadas e rate_limits. As chaves p256dh/auth
-- nunca saem do servidor.

CREATE TABLE IF NOT EXISTS public.push_inscricoes (
  id BIGSERIAL PRIMARY KEY,
  endpoint TEXT NOT NULL UNIQUE CHECK (char_length(endpoint) <= 1024 AND endpoint LIKE 'https://%'),
  p256dh TEXT NOT NULL CHECK (char_length(p256dh) BETWEEN 80 AND 100),
  auth TEXT NOT NULL CHECK (char_length(auth) BETWEEN 16 AND 32),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  categorias TEXT[] NOT NULL DEFAULT ARRAY['resultado']::text[]
    CHECK (categorias <@ ARRAY['resultado', 'acumulado', 'meus_jogos', 'bolao']::text[]),
  -- Vazio = todas as loterias.
  loterias TEXT[] NOT NULL DEFAULT ARRAY[]::text[]
    CHECK (cardinality(loterias) <= 9),
  user_agent TEXT CHECK (char_length(user_agent) <= 300),
  falhas_consecutivas INTEGER NOT NULL DEFAULT 0,
  ultimo_envio_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Categoria pessoal sem conta não faz sentido (e vazaria dado de outro
  -- usuário se o aparelho trocasse de dono): o banco garante.
  CONSTRAINT push_pessoal_exige_usuario CHECK (
    user_id IS NOT NULL OR NOT (categorias && ARRAY['meus_jogos', 'bolao']::text[])
  )
);

CREATE INDEX IF NOT EXISTS idx_push_inscricoes_user ON public.push_inscricoes (user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_push_inscricoes_categorias ON public.push_inscricoes USING gin (categorias);

ALTER TABLE public.push_inscricoes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.push_inscricoes FROM anon, authenticated;
REVOKE ALL ON SEQUENCE public.push_inscricoes_id_seq FROM anon, authenticated;

-- Idempotência do envio push (análoga a notificacoes_enviadas, que exige
-- user_id e por isso não serve para inscrições anônimas). Chave por tipo:
--   resultado/acumulado : "concurso:<loteria>:<numero>"
--   meus_jogos          : "jogos:<loteria>:<numero>"
--   bolao               : "bolao:<bolao_id>:<numero>"
CREATE TABLE IF NOT EXISTS public.push_envios (
  id BIGSERIAL PRIMARY KEY,
  inscricao_id BIGINT NOT NULL REFERENCES public.push_inscricoes(id) ON DELETE CASCADE,
  chave TEXT NOT NULL CHECK (char_length(chave) <= 200),
  status TEXT NOT NULL DEFAULT 'enviado' CHECK (status IN ('enviado', 'falhou')),
  erro TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (inscricao_id, chave)
);

CREATE INDEX IF NOT EXISTS idx_push_envios_criado ON public.push_envios (criado_em);

ALTER TABLE public.push_envios ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.push_envios FROM anon, authenticated;
REVOKE ALL ON SEQUENCE public.push_envios_id_seq FROM anon, authenticated;
