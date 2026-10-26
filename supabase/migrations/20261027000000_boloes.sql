-- Fase 3 (bolão MVP, 27/10/2026): organizador de bolão com link público,
-- controle de pagamento, conferência/rateio e Bolão Pro por Pix.
--
-- Modelo de acesso: tudo é gravado pelo servidor (service role) depois de
-- validar dono e limites do plano (cotas, bolões ativos, pro_ate). O client
-- do usuário só LÊ os próprios bolões (SELECT + política por dono) — assim
-- nenhuma coluna sensível (pro_ate, qtd_cotas além do limite) pode ser
-- gravada direto pela chave pública. A página pública /b/[slug] também lê
-- via servidor. Mesma lição de profiles na Fase 0: os GRANTs padrão do
-- Supabase vazam, então revogamos tudo explicitamente e concedemos só o
-- mínimo.

CREATE TABLE public.boloes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE CHECK (char_length(slug) = 10),
  titulo text NOT NULL CHECK (char_length(titulo) BETWEEN 1 AND 80),
  loteria text NOT NULL CHECK (loteria = ANY (ARRAY[
    'lotofacil','megasena','quina','diadesorte','maismilionaria','timemania','duplasena'
  ])),
  -- 'proximo' = próximo concurso ao salvar; 'virada' = Mega da Virada;
  -- 'numero' = concurso escolhido. concurso_alvo é preenchido pelo servidor
  -- quando conhecido (null enquanto a Virada ainda não tem número).
  alvo text NOT NULL DEFAULT 'proximo' CHECK (alvo = ANY (ARRAY['proximo','virada','numero'])),
  concurso_alvo integer,
  pool_dezenas integer[] NOT NULL,
  tamanho_pool integer NOT NULL,
  garantia integer NOT NULL,
  preco_aposta_cents integer NOT NULL CHECK (preco_aposta_cents > 0),
  valor_cota_cents integer NOT NULL CHECK (valor_cota_cents >= 0),
  qtd_cotas integer NOT NULL CHECK (qtd_cotas BETWEEN 1 AND 100),
  status text NOT NULL DEFAULT 'aberto' CHECK (status = ANY (ARRAY['aberto','fechado','conferido'])),
  pro_ate timestamptz,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_boloes_owner ON public.boloes (owner_id, criado_em DESC);
-- Usado pelo processador de concursos novos (bolões ainda não conferidos).
CREATE INDEX idx_boloes_pendentes ON public.boloes (loteria, concurso_alvo) WHERE status <> 'conferido';

CREATE TRIGGER set_boloes_atualizado_em BEFORE UPDATE ON public.boloes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.bolao_jogos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bolao_id uuid NOT NULL REFERENCES public.boloes(id) ON DELETE CASCADE,
  ordem integer NOT NULL,
  dezenas integer[] NOT NULL,
  trevos integer[],
  UNIQUE (bolao_id, ordem)
);

CREATE TABLE public.bolao_participantes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bolao_id uuid NOT NULL REFERENCES public.boloes(id) ON DELETE CASCADE,
  nome text NOT NULL CHECK (char_length(nome) BETWEEN 1 AND 60),
  -- E-mail só entra por opt-in do próprio participante (ou do organizador
  -- com o consentimento dele) e só recebe aviso em bolão Pro.
  email text,
  recebe_resultado boolean NOT NULL DEFAULT false,
  cotas integer NOT NULL DEFAULT 1 CHECK (cotas BETWEEN 1 AND 100),
  pago_em timestamptz,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_bolao_participantes_bolao ON public.bolao_participantes (bolao_id);

CREATE TABLE public.bolao_resultados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bolao_id uuid NOT NULL REFERENCES public.boloes(id) ON DELETE CASCADE,
  concurso integer NOT NULL,
  acertos_por_jogo jsonb NOT NULL,
  premio_total_cents bigint NOT NULL DEFAULT 0,
  por_cota_cents bigint NOT NULL DEFAULT 0,
  criado_em timestamptz NOT NULL DEFAULT now(),
  UNIQUE (bolao_id, concurso)
);

ALTER TABLE public.boloes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bolao_jogos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bolao_participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bolao_resultados ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.boloes, public.bolao_jogos, public.bolao_participantes, public.bolao_resultados
  FROM anon, authenticated;
GRANT SELECT ON public.boloes, public.bolao_jogos, public.bolao_participantes, public.bolao_resultados
  TO authenticated;

CREATE POLICY "Dono lê os próprios bolões" ON public.boloes
  FOR SELECT TO authenticated USING (owner_id = auth.uid());

CREATE POLICY "Dono lê jogos do bolão" ON public.bolao_jogos
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.boloes b WHERE b.id = bolao_id AND b.owner_id = auth.uid()));

CREATE POLICY "Dono lê participantes do bolão" ON public.bolao_participantes
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.boloes b WHERE b.id = bolao_id AND b.owner_id = auth.uid()));

CREATE POLICY "Dono lê resultados do bolão" ON public.bolao_resultados
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.boloes b WHERE b.id = bolao_id AND b.owner_id = auth.uid()));

-- Bolão Pro por Pix: o mesmo pagamento avulso passa a ter um produto.
-- 'plano' = crédito Premium (comportamento atual, plano obrigatório);
-- 'bolao_pro' = estende boloes.pro_ate do bolão em ref_id. Linhas
-- existentes viram produto='plano' pelo DEFAULT. ref_id sem FK de
-- propósito: o histórico de pagamento sobrevive à exclusão do bolão.
ALTER TABLE public.pix_payments
  ADD COLUMN produto text NOT NULL DEFAULT 'plano'
    CHECK (produto = ANY (ARRAY['plano','bolao_pro'])),
  ADD COLUMN ref_id uuid,
  ALTER COLUMN plano DROP NOT NULL,
  ADD CONSTRAINT pix_payments_produto_consistente CHECK (
    (produto = 'plano' AND plano IS NOT NULL)
    OR (produto = 'bolao_pro' AND ref_id IS NOT NULL)
  );
