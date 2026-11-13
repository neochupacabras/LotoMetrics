SELECT l.id, l.codigo, l.nome, l.dezena_min, l.dezena_max, l.qtd_dezenas_sorteadas, l.grid_colunas,
 (SELECT count(*) FROM concurso c WHERE c.loteria_id=l.id) AS qtd,
 (SELECT min(numero) FROM concurso c WHERE c.loteria_id=l.id) AS minimo,
 (SELECT max(numero) FROM concurso c WHERE c.loteria_id=l.id) AS maximo,
 (SELECT min(data_sorteio)::text FROM concurso c WHERE c.loteria_id=l.id) AS primeira,
 (SELECT max(data_sorteio)::text FROM concurso c WHERE c.loteria_id=l.id) AS ultima,
 (SELECT count(*) FROM concurso c WHERE c.loteria_id=l.id AND (array_length(c.dezenas,1)<>6)) AS tam_errado,
 (SELECT count(*) FROM concurso c WHERE c.loteria_id=l.id AND EXISTS (SELECT 1 FROM unnest(c.dezenas) d WHERE d<1 OR d>60)) AS fora_faixa,
 (SELECT count(*) FROM concurso c WHERE c.loteria_id=l.id AND (SELECT count(DISTINCT d) FROM unnest(c.dezenas) d)<>6) AS duplic,
 (SELECT count(*) FROM concurso c WHERE c.loteria_id=l.id AND NOT EXISTS (SELECT 1 FROM premiacao_faixa p WHERE p.concurso_id=c.id)) AS sem_premiacao
FROM loteria l WHERE l.codigo='megasena';
