-- Favoritos da área de membros (redesign, decisão B de
-- docs/membros/REDESIGN_AREA_MEMBROS.md): ficam no banco para valer no
-- celular e no computador. "Recentes" NÃO estão aqui — ficam no
-- localStorage de cada aparelho.
--
-- ferramentas_favoritas: ids de lib/ferramentas.ts (ex.: 'gerador').
-- loterias_favoritas:    códigos de loteria (ex.: 'megasena') — usado pela
--                        Central de loterias.
--
-- Escrita pelo client da sessão (server actions em lib/favoritos-actions.ts),
-- como display_name/receber_emails/teto_gasto_mensal: GRANT UPDATE só nestas
-- colunas, e a RLS de profiles limita à própria linha.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ferramentas_favoritas text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS loterias_favoritas text[] NOT NULL DEFAULT '{}';

-- Limites no próprio banco: a action já valida contra o registro, mas o
-- grant permite UPDATE direto pela API do Supabase com a chave anônima +
-- sessão, então o formato precisa ser garantido aqui também.
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_ferramentas_favoritas_formato CHECK (
    cardinality(ferramentas_favoritas) <= 40
    AND array_to_string(ferramentas_favoritas, ',') ~ '^([a-z-]{1,40}(,|$))*$'
  ),
  ADD CONSTRAINT profiles_loterias_favoritas_formato CHECK (
    loterias_favoritas <@ ARRAY[
      'lotofacil', 'megasena', 'quina', 'lotomania', 'diadesorte',
      'maismilionaria', 'timemania', 'duplasena', 'supersete'
    ]::text[]
  );

GRANT UPDATE (ferramentas_favoritas, loterias_favoritas) ON public.profiles TO authenticated;
