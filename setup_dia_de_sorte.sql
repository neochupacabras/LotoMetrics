-- =============================================================
-- setup_dia_de_sorte.sql
-- Rodar no Supabase SQL Editor para adicionar Dia de Sorte
-- =============================================================

-- 1. Adicionar coluna mes_sorte na tabela concurso (nullable — só usada pelo Dia de Sorte)
ALTER TABLE public.concurso
  ADD COLUMN IF NOT EXISTS mes_sorte TEXT DEFAULT NULL;

-- 2. Inserir Dia de Sorte na tabela loteria
-- Dia de Sorte: 7 dezenas de 1-31, grid 7 colunas
INSERT INTO public.loteria (codigo, nome, dezena_min, dezena_max, qtd_dezenas_sorteadas, grid_colunas)
VALUES ('diadesorte', 'Dia de Sorte', 1, 31, 7, 7)
ON CONFLICT (codigo) DO UPDATE SET
  nome                  = EXCLUDED.nome,
  dezena_min            = EXCLUDED.dezena_min,
  dezena_max            = EXCLUDED.dezena_max,
  qtd_dezenas_sorteadas = EXCLUDED.qtd_dezenas_sorteadas,
  grid_colunas          = EXCLUDED.grid_colunas;

-- 3. Confirmar
SELECT codigo, nome, dezena_min, dezena_max, qtd_dezenas_sorteadas, grid_colunas
FROM public.loteria ORDER BY id;

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'concurso' AND column_name = 'mes_sorte';
