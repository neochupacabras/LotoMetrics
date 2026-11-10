-- Semana 4 do roadmap de growth, entrega (c): "Quer saber se esse jogo ganha
-- no próximo sorteio? Receba um aviso". Depois de simular um jogo, a pessoa
-- se inscreve, sem conta e sem senha, para receber a conferência daquele
-- jogo a cada sorteio da loteria, até se descadastrar.
--
-- Uma linha por jogo inscrito, por um de dois canais:
--   push  : ligada a uma inscrição de push_inscricoes (o navegador/aparelho).
--           Confirmada na hora: só o próprio navegador cria a inscrição.
--   email : confirmada por link (opt-in duplo). Até confirmar, não recebe
--           nada e não conta como inscrito. Os links de confirmar e de
--           descadastrar são HMAC sobre o id da linha (mesmo esquema de
--           lib/notificacoes/unsubscribe.ts), então nenhum token é guardado.
--
-- Descadastro apaga a linha (não guarda e-mail de quem saiu).
-- Inscrição por push some junto com a inscrição do navegador (CASCADE).
--
-- Mesma filosofia de push_inscricoes, lista_espera e rate_limits: RLS ativo
-- sem nenhuma política e sem GRANT para anon/authenticated. Só o servidor
-- (pool pg / service role) lê e grava.

CREATE TABLE public.alertas_jogo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loteria text NOT NULL CHECK (loteria = ANY (ARRAY[
    'lotofacil', 'megasena', 'quina', 'lotomania', 'diadesorte',
    'maismilionaria', 'timemania', 'duplasena', 'supersete'
  ]::text[])),
  -- Dezenas do jogo, ordenadas (Super Sete: os 7 algarismos na ordem das
  -- colunas). Até 50 por causa da Lotomania.
  dezenas integer[] NOT NULL CHECK (cardinality(dezenas) BETWEEN 1 AND 50),
  -- Só +Milionária: exatamente 2 trevos.
  trevos integer[] CHECK (trevos IS NULL OR cardinality(trevos) = 2),
  canal text NOT NULL CHECK (canal IN ('push', 'email')),
  push_inscricao_id bigint REFERENCES public.push_inscricoes(id) ON DELETE CASCADE,
  email text CHECK (email IS NULL OR (char_length(email) <= 200 AND email = lower(email))),
  -- push: preenchido na criação; email: ao clicar no link de confirmação.
  confirmado_em timestamptz,
  -- Último concurso desta loteria já avisado. A inscrição reivindica o
  -- concurso com UPDATE ... WHERE ultimo_concurso_avisado < n antes de
  -- enviar, então o mesmo concurso nunca é avisado duas vezes (cron diário
  -- e disparo do importador podem rodar para o mesmo concurso).
  ultimo_concurso_avisado integer,
  -- Medição do funil: de onde veio e o anonymous_id (cookie la_aid) para
  -- ligar ao visit_landing e aos eventos do simulador.
  origem text NOT NULL DEFAULT 'simulador' CHECK (char_length(origem) <= 40),
  anonymous_id uuid,
  criado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT alertas_jogo_canal_coerente CHECK (
    (canal = 'push'  AND push_inscricao_id IS NOT NULL AND email IS NULL) OR
    (canal = 'email' AND email IS NOT NULL AND push_inscricao_id IS NULL)
  )
);

-- O mesmo jogo não é inscrito duas vezes no mesmo destino.
CREATE UNIQUE INDEX alertas_jogo_unico_email
  ON public.alertas_jogo (email, loteria, dezenas, coalesce(trevos, '{}'))
  WHERE canal = 'email';
CREATE UNIQUE INDEX alertas_jogo_unico_push
  ON public.alertas_jogo (push_inscricao_id, loteria, dezenas, coalesce(trevos, '{}'))
  WHERE canal = 'push';

-- Consulta do envio: inscrições confirmadas de uma loteria.
CREATE INDEX idx_alertas_jogo_envio
  ON public.alertas_jogo (loteria)
  WHERE confirmado_em IS NOT NULL;

-- Limpeza de e-mails nunca confirmados (feita pelo cron diário).
CREATE INDEX idx_alertas_jogo_pendentes
  ON public.alertas_jogo (criado_em)
  WHERE confirmado_em IS NULL;

ALTER TABLE public.alertas_jogo ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.alertas_jogo FROM anon, authenticated;
