-- =============================================================
-- setup_timemania.sql
-- Rodar no Supabase SQL Editor para adicionar a Timemania
-- =============================================================

-- Nota: a coluna mes_sorte já existe (criada para o Dia de Sorte)
-- e será reutilizada para armazenar o "Time do Coração" da Timemania.
-- A API da Caixa retorna ambos no campo 'nomeTimeCoracaoMesSorte'.

-- 1. Inserir Timemania na tabela loteria
--    10 dezenas de 1-80, grid de 10 colunas (mesma estrutura da Quina)
INSERT INTO public.loteria (codigo, nome, dezena_min, dezena_max, qtd_dezenas_sorteadas, grid_colunas)
VALUES ('timemania', 'Timemania', 1, 80, 7, 10)
ON CONFLICT (codigo) DO UPDATE SET
  nome                  = EXCLUDED.nome,
  dezena_min            = EXCLUDED.dezena_min,
  dezena_max            = EXCLUDED.dezena_max,
  qtd_dezenas_sorteadas = EXCLUDED.qtd_dezenas_sorteadas,
  grid_colunas          = EXCLUDED.grid_colunas;

-- 2. Confirmar
SELECT codigo, nome, dezena_min, dezena_max, qtd_dezenas_sorteadas, grid_colunas
FROM public.loteria ORDER BY id;
