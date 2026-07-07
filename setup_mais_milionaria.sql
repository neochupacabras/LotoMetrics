-- =============================================================
-- setup_mais_milionaria.sql
-- Rodar no Supabase SQL Editor para adicionar a +Milionária
-- =============================================================

-- 1. Adicionar coluna trevos na tabela concurso
--    (nullable — só usada pela +Milionária)
ALTER TABLE public.concurso
  ADD COLUMN IF NOT EXISTS trevos INTEGER[] DEFAULT NULL;

-- 2. Inserir +Milionária na tabela loteria
--    6 dezenas de 1-50, grid de 10 colunas
INSERT INTO public.loteria (codigo, nome, dezena_min, dezena_max, qtd_dezenas_sorteadas, grid_colunas)
VALUES ('maismilionaria', '+Milionária', 1, 50, 6, 10)
ON CONFLICT (codigo) DO UPDATE SET
  nome                  = EXCLUDED.nome,
  dezena_min            = EXCLUDED.dezena_min,
  dezena_max            = EXCLUDED.dezena_max,
  qtd_dezenas_sorteadas = EXCLUDED.qtd_dezenas_sorteadas,
  grid_colunas          = EXCLUDED.grid_colunas;

-- 3. Confirmar
SELECT codigo, nome, dezena_min, dezena_max, qtd_dezenas_sorteadas
FROM public.loteria ORDER BY id;

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'concurso'
  AND column_name IN ('mes_sorte', 'trevos')
ORDER BY column_name;
