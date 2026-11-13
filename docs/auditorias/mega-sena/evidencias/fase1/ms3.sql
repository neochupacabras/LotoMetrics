WITH c AS (SELECT * FROM concurso WHERE loteria_id=2)
SELECT 'sena0_nao_acum' q, json_agg(x) FROM (SELECT c.numero, c.data_sorteio::text d, c.acumulado,
  (SELECT json_agg(json_build_object('f',p.faixa,'g',p.qtd_ganhadores,'v',p.valor_premio) ORDER BY p.faixa) FROM premiacao_faixa p WHERE p.concurso_id=c.id) pf
 FROM c WHERE NOT c.acumulado AND (SELECT qtd_ganhadores FROM premiacao_faixa p WHERE p.concurso_id=c.id AND faixa=1)=0) x
UNION ALL
SELECT 'acum_inconsist', json_agg(x) FROM (SELECT c.numero, c.acumulado, (SELECT qtd_ganhadores FROM premiacao_faixa p WHERE p.concurso_id=c.id AND faixa=1) g1
 FROM c WHERE c.acumulado AND (SELECT qtd_ganhadores FROM premiacao_faixa p WHERE p.concurso_id=c.id AND faixa=1)>0) x
UNION ALL
SELECT 'mesma_data', json_agg(x) FROM (SELECT data_sorteio::text d, array_agg(numero) ns FROM c GROUP BY data_sorteio HAVING count(*)>1) x
UNION ALL
SELECT 'quina_quadra_zero', json_agg(x) FROM (SELECT p.faixa, count(*) n, min(c.numero) de, max(c.numero) ate FROM c JOIN premiacao_faixa p ON p.concurso_id=c.id WHERE p.faixa>1 AND p.qtd_ganhadores=0 GROUP BY 1) x
UNION ALL
SELECT 'arrec_nula_faixa', json_agg(x) FROM (SELECT min(numero) de, max(numero) ate, count(*) n FROM c WHERE valor_arrecadado IS NULL OR valor_arrecadado=0) x
UNION ALL
SELECT 'mar2026', json_agg(x) FROM (SELECT numero, data_sorteio::text d, acumulado, valor_arrecadado FROM c WHERE data_sorteio BETWEEN '2026-03-01' AND '2026-03-31' ORDER BY numero) x;
