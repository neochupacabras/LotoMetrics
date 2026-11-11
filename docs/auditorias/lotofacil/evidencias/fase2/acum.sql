WITH dados AS (SELECT c.numero, c.data_sorteio, pf.qtd_ganhadores, pf.valor_premio, LAG(pf.qtd_ganhadores,1,1) OVER (ORDER BY c.numero) AS prev
  FROM concurso c JOIN premiacao_faixa pf ON pf.concurso_id=c.id AND pf.faixa=1 WHERE c.loteria_id=1),
grupos AS (SELECT *, SUM(CASE WHEN prev>0 THEN 1 ELSE 0 END) OVER (ORDER BY numero) AS gid FROM dados),
g AS (SELECT MIN(numero) i, MAX(numero) f, COUNT(*) d, MAX(qtd_ganhadores) w, ROUND(MAX(CASE WHEN qtd_ganhadores>0 THEN valor_premio ELSE 0 END),2) p FROM grupos GROUP BY gid HAVING MAX(qtd_ganhadores)>0)
SELECT json_agg(json_build_object('i',i,'f',f,'d',d,'w',w,'p',p) ORDER BY f) AS a FROM g;
