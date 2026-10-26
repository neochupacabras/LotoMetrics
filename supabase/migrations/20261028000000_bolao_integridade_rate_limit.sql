-- Duas pendências do bolão (Fase 3):
--
-- 1) Integridade de cotas no banco. Até aqui a soma das cotas dos
--    participantes só era validada na Server Action; duas requisições
--    simultâneas ou um bug futuro poderiam estourar qtd_cotas. Agora o banco
--    recusa. O trigger de participantes trava a linha do bolão (FOR UPDATE)
--    pra serializar inserções concorrentes; o de boloes impede reduzir
--    qtd_cotas abaixo do que já foi atribuído.
--
-- 2) Rate limit genérico (rate_limits + consumir_rate_limit), usado pelo
--    opt-in de e-mail da página pública do bolão. Só o service role
--    executa; chaves guardam hash (nunca IP puro).

CREATE OR REPLACE FUNCTION public.bolao_validar_cotas_participante()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  limite integer;
  atribuidas integer;
BEGIN
  SELECT qtd_cotas INTO limite FROM public.boloes WHERE id = NEW.bolao_id FOR UPDATE;
  SELECT COALESCE(SUM(cotas), 0) INTO atribuidas
    FROM public.bolao_participantes
    WHERE bolao_id = NEW.bolao_id AND id <> NEW.id;
  IF atribuidas + NEW.cotas > limite THEN
    RAISE EXCEPTION 'cotas dos participantes (%) excedem o total do bolão (%)',
      atribuidas + NEW.cotas, limite
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER bolao_participantes_validar_cotas
  BEFORE INSERT OR UPDATE OF cotas, bolao_id ON public.bolao_participantes
  FOR EACH ROW EXECUTE FUNCTION public.bolao_validar_cotas_participante();

CREATE OR REPLACE FUNCTION public.bolao_validar_total_cotas()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  atribuidas integer;
BEGIN
  SELECT COALESCE(SUM(cotas), 0) INTO atribuidas
    FROM public.bolao_participantes WHERE bolao_id = NEW.id;
  IF NEW.qtd_cotas < atribuidas THEN
    RAISE EXCEPTION 'qtd_cotas (%) menor que as cotas já atribuídas (%)', NEW.qtd_cotas, atribuidas
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER boloes_validar_total_cotas
  BEFORE UPDATE OF qtd_cotas ON public.boloes
  FOR EACH ROW EXECUTE FUNCTION public.bolao_validar_total_cotas();

-- Rate limit genérico.
CREATE TABLE public.rate_limits (
  id BIGSERIAL PRIMARY KEY,
  chave TEXT NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_rate_limits_chave ON public.rate_limits (chave, criado_em DESC);
CREATE INDEX idx_rate_limits_criado_em ON public.rate_limits (criado_em);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.rate_limits FROM anon, authenticated;

-- true = dentro do limite (e já registra a tentativa); false = estourou.
-- O advisory lock por chave evita que duas chamadas simultâneas passem
-- juntas pelo mesmo limite. Limpa o que tem mais de 1 dia de vez em quando.
CREATE OR REPLACE FUNCTION public.consumir_rate_limit(
  p_chave text,
  p_max integer,
  p_janela_segundos integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recentes integer;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(p_chave));

  IF random() < 0.02 THEN
    DELETE FROM public.rate_limits WHERE criado_em < now() - interval '1 day';
  END IF;

  SELECT count(*) INTO recentes
    FROM public.rate_limits
    WHERE chave = p_chave
      AND criado_em > now() - make_interval(secs => p_janela_segundos);

  IF recentes >= p_max THEN
    RETURN false;
  END IF;

  INSERT INTO public.rate_limits (chave) VALUES (p_chave);
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.consumir_rate_limit(text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consumir_rate_limit(text, integer, integer) TO service_role;
