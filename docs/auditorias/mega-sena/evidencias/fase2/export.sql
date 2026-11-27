SELECT c.numero, c.data_sorteio::text AS data, c.dezenas, c.dezenas_ordem_sorteio AS ordem, c.acumulado,
 c.valor_arrecadado AS arrec, c.valor_acumulado_proximo AS acum_prox, c.valor_estimado_proximo AS est_prox,
 (SELECT json_agg(json_build_object('f',pf.faixa,'d',pf.descricao_faixa,'g',pf.qtd_ganhadores,'v',pf.valor_premio) ORDER BY pf.faixa)
   FROM premiacao_faixa pf WHERE pf.concurso_id=c.id) AS pf
FROM concurso c WHERE c.loteria_id=2 ORDER BY c.numero;
