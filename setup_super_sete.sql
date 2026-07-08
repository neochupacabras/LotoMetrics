-- =============================================================
-- setup_super_sete.sql
-- Rodar no Supabase SQL Editor para adicionar a Super Sete
-- =============================================================

-- Nota: nenhuma coluna nova necessária na tabela concurso.
-- A Super Sete usa apenas o campo 'dezenas' (7 valores de 0 a 9).
-- Dezenas repetidas são possíveis (cada coluna é independente).

-- 1. Inserir Super Sete na tabela loteria
--    7 dezenas de 0-9, grid de 7 colunas (uma por coluna do volante)
INSERT INTO public.loteria (codigo, nome, dezena_min, dezena_max, qtd_dezenas_sorteadas, grid_colunas)
VALUES ('supersete', 'Super Sete', 0, 9, 7, 7)
ON CONFLICT (codigo) DO UPDATE SET
  nome                  = EXCLUDED.nome,
  dezena_min            = EXCLUDED.dezena_min,
  dezena_max            = EXCLUDED.dezena_max,
  qtd_dezenas_sorteadas = EXCLUDED.qtd_dezenas_sorteadas,
  grid_colunas          = EXCLUDED.grid_colunas;

-- 2. Confirmar
SELECT codigo, nome, dezena_min, dezena_max, qtd_dezenas_sorteadas, grid_colunas
FROM public.loteria ORDER BY id;
