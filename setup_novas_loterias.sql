-- =============================================================
-- setup_novas_loterias.sql
-- Rodar no Supabase SQL Editor para adicionar Quina e Lotomania
-- =============================================================

-- 1. Inserir loterias
INSERT INTO public.loteria (codigo, nome, dezena_min, dezena_max, qtd_dezenas_sorteadas, grid_colunas)
VALUES
  ('quina',     'Quina',     1,  80,  5,  10),
  ('lotomania', 'Lotomania', 0,  99,  20, 10)
ON CONFLICT (codigo) DO UPDATE SET
  nome                  = EXCLUDED.nome,
  dezena_min            = EXCLUDED.dezena_min,
  dezena_max            = EXCLUDED.dezena_max,
  qtd_dezenas_sorteadas = EXCLUDED.qtd_dezenas_sorteadas,
  grid_colunas          = EXCLUDED.grid_colunas;

-- 2. Confirmar inserção
SELECT codigo, nome, dezena_min, dezena_max, qtd_dezenas_sorteadas, grid_colunas
FROM public.loteria
ORDER BY id;
