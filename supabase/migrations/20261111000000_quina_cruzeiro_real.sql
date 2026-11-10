-- Quina, concursos 1 a 28 (13/03/1994 a 26/06/1994): os valores vieram da
-- Caixa em cruzeiros reais (CR$), a moeda anterior ao Real, e foram gravados
-- como se fossem reais. Resultado: "prêmios" de até R$ 579 milhões em 1994,
-- que distorciam o ranking de maiores prêmios do resumo do concurso, o
-- simulador no histórico completo e a página de recordes.
--
-- Conversão oficial na criação do Real (1º/07/1994): R$ 1,00 = CR$ 2.750,00.
-- Vale por data do sorteio, não por loteria: só a Quina tem sorteio antes de
-- julho de 1994 (Mega-Sena começou em 1996).
--
-- O importador (importador.py, converter_moeda_antiga) passa a fazer a mesma
-- conversão ao gravar, para uma reimportação desses concursos não trazer os
-- valores antigos de volta.
--
-- Levantamento antes da correção (produção, 10/11/2026, só leitura): 28
-- concursos; 76 linhas de premiacao_faixa com valor maior que zero (as outras
-- 8 são faixas sem ganhador, com 0); 8 concursos com valor_acumulado_proximo
-- (até CR$ 735.323.913); nenhum com valor_arrecadado ou valor_estimado_proximo
-- (esses dois UPDATEs ficam como garantia).

UPDATE public.premiacao_faixa pf
SET valor_premio = round(pf.valor_premio / 2750, 2)
FROM public.concurso c
WHERE pf.concurso_id = c.id
  AND c.data_sorteio < DATE '1994-07-01'
  AND pf.valor_premio > 0;

UPDATE public.concurso
SET valor_arrecadado = round(valor_arrecadado / 2750, 2)
WHERE data_sorteio < DATE '1994-07-01' AND valor_arrecadado > 0;

UPDATE public.concurso
SET valor_acumulado_proximo = round(valor_acumulado_proximo / 2750, 2)
WHERE data_sorteio < DATE '1994-07-01' AND valor_acumulado_proximo > 0;

UPDATE public.concurso
SET valor_estimado_proximo = round(valor_estimado_proximo / 2750, 2)
WHERE data_sorteio < DATE '1994-07-01' AND valor_estimado_proximo > 0;
