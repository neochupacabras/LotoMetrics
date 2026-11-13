WITH c AS (SELECT * FROM concurso WHERE loteria_id=2)
SELECT 'faixas' AS q, json_agg(x) FROM (
  SELECT pf.faixa, pf.descricao_faixa, count(*) n, min(c.numero) de, max(c.numero) ate
  FROM c JOIN premiacao_faixa pf ON pf.concurso_id=c.id GROUP BY 1,2 ORDER BY 1,2) x
UNION ALL
SELECT 'nfaixas', json_agg(x) FROM (
  SELECT nf, count(*) n, min(numero) de, max(numero) ate FROM (
    SELECT c.numero, (SELECT count(*) FROM premiacao_faixa p WHERE p.concurso_id=c.id) nf FROM c) t GROUP BY nf) x
UNION ALL
SELECT 'por_ano', json_agg(x) FROM (
  SELECT extract(year FROM data_sorteio)::int ano, count(*) n,
   count(*) FILTER (WHERE extract(dow FROM data_sorteio)=0) dom,
   count(*) FILTER (WHERE extract(dow FROM data_sorteio)=2) ter,
   count(*) FILTER (WHERE extract(dow FROM data_sorteio)=3) qua,
   count(*) FILTER (WHERE extract(dow FROM data_sorteio)=4) qui,
   count(*) FILTER (WHERE extract(dow FROM data_sorteio)=6) sab,
   count(*) FILTER (WHERE extract(dow FROM data_sorteio) IN (1,5)) outros
  FROM c GROUP BY 1 ORDER BY 1) x
UNION ALL
SELECT 'nulos', json_agg(x) FROM (
  SELECT count(*) FILTER (WHERE valor_arrecadado IS NULL OR valor_arrecadado=0) arrec_nulo,
         count(*) FILTER (WHERE dezenas_ordem_sorteio IS NULL) ordem_nula,
         count(*) FILTER (WHERE acumulado) acumulados,
         count(*) FILTER (WHERE valor_estimado_proximo IS NULL) est_nulo
  FROM c) x
UNION ALL
SELECT 'virada', json_agg(x) FROM (
  SELECT numero, data_sorteio::text, acumulado, valor_arrecadado,
   (SELECT qtd_ganhadores FROM premiacao_faixa p WHERE p.concurso_id=c.id AND p.faixa=1) g1
  FROM c WHERE (extract(month FROM data_sorteio)=12 AND extract(day FROM data_sorteio)=31) OR (extract(month FROM data_sorteio)=1 AND extract(day FROM data_sorteio)=1) ORDER BY numero) x;
