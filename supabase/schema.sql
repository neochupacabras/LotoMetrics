--
-- PostgreSQL database dump
--

\restrict MqWuofeE0W9AdIldykKRMlJvx6pjnh1CQEWsjb0XQo8dKtvmvwsZvHNixA8uBUn

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: fn_atraso(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_atraso(p_loteria_id integer) RETURNS TABLE(dezena integer, ultimo_concurso integer, atraso integer)
    LANGUAGE sql STABLE
    AS $$
    WITH ultimo_geral AS (
        SELECT MAX(numero) AS numero_atual FROM concurso WHERE loteria_id = p_loteria_id
    ),
    ultima_aparicao AS (
        SELECT dezena, MAX(c.numero) AS ultimo_concurso
        FROM concurso c, unnest(c.dezenas) AS dezena
        WHERE c.loteria_id = p_loteria_id
        GROUP BY dezena
    )
    SELECT ua.dezena, ua.ultimo_concurso, ug.numero_atual - ua.ultimo_concurso AS atraso
    FROM ultima_aparicao ua, ultimo_geral ug
    ORDER BY atraso DESC, dezena;
$$;


--
-- Name: fn_ciclo_atual(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_ciclo_atual(p_loteria_id integer) RETURNS TABLE(concurso_inicio integer, concursos_no_ciclo integer, dezenas_sorteadas integer[], dezenas_faltantes integer[])
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    v_dezena_min INT;
    v_dezena_max INT;
    v_vistas INT[] := '{}';
    v_inicio INT;
    v_ultimo_numero INT;
    rec RECORD;
BEGIN
    SELECT dezena_min, dezena_max INTO v_dezena_min, v_dezena_max
    FROM loteria WHERE id = p_loteria_id;

    FOR rec IN
        SELECT numero, dezenas FROM concurso WHERE loteria_id = p_loteria_id ORDER BY numero
    LOOP
        IF v_inicio IS NULL THEN
            v_inicio := rec.numero;
        END IF;

        v_vistas := ARRAY(SELECT DISTINCT unnest(v_vistas || rec.dezenas));
        v_ultimo_numero := rec.numero;

        IF array_length(v_vistas, 1) >= v_dezena_max THEN
            v_vistas := '{}';
            v_inicio := NULL;
        END IF;
    END LOOP;

    concurso_inicio := v_inicio;
    concursos_no_ciclo := v_ultimo_numero - v_inicio + 1;
    dezenas_sorteadas := (SELECT array_agg(x ORDER BY x) FROM unnest(v_vistas) x);
    dezenas_faltantes := (
        SELECT array_agg(d ORDER BY d)
        FROM generate_series(v_dezena_min, v_dezena_max) d
        WHERE d <> ALL(v_vistas)
    );
    RETURN NEXT;
END;
$$;


--
-- Name: fn_ciclos_historico(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_ciclos_historico(p_loteria_id integer) RETURNS TABLE(ciclo integer, concurso_inicio integer, concurso_fim integer, qtd_concursos integer)
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    v_dezena_max INT;
    v_vistas INT[] := '{}';
    v_ciclo INT := 1;
    v_inicio INT;
    rec RECORD;
BEGIN
    SELECT dezena_max INTO v_dezena_max FROM loteria WHERE id = p_loteria_id;

    FOR rec IN
        SELECT numero, dezenas FROM concurso WHERE loteria_id = p_loteria_id ORDER BY numero
    LOOP
        IF v_inicio IS NULL THEN
            v_inicio := rec.numero;
        END IF;

        v_vistas := ARRAY(SELECT DISTINCT unnest(v_vistas || rec.dezenas));

        IF array_length(v_vistas, 1) >= v_dezena_max THEN
            ciclo := v_ciclo;
            concurso_inicio := v_inicio;
            concurso_fim := rec.numero;
            qtd_concursos := rec.numero - v_inicio + 1;
            RETURN NEXT;

            v_ciclo := v_ciclo + 1;
            v_vistas := '{}';
            v_inicio := NULL;
        END IF;
    END LOOP;
    RETURN;
END;
$$;


--
-- Name: fn_coluna_da_dezena(integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_coluna_da_dezena(p_dezena integer, p_grid_colunas integer) RETURNS integer
    LANGUAGE sql IMMUTABLE
    AS $$
    SELECT ((p_dezena - 1) % p_grid_colunas) + 1;
$$;


--
-- Name: fn_conferir_jogo(integer, integer[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_conferir_jogo(p_loteria_id integer, p_dezenas integer[]) RETURNS TABLE(numero integer, data_sorteio date, pontos integer)
    LANGUAGE sql STABLE
    AS $$
    SELECT
        c.numero,
        c.data_sorteio,
        cardinality(
            ARRAY(SELECT UNNEST(c.dezenas) INTERSECT SELECT UNNEST(p_dezenas))
        ) AS pontos
    FROM concurso c
    WHERE c.loteria_id = p_loteria_id
    ORDER BY c.numero DESC;
$$;


--
-- Name: fn_distribuicao_moldura_centro(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_distribuicao_moldura_centro(p_loteria_id integer) RETURNS TABLE(qtd_moldura integer, qtd_centro integer, ocorrencias bigint, percentual numeric)
    LANGUAGE sql STABLE
    AS $$
    WITH base AS (
        SELECT * FROM fn_moldura_centro_por_concurso(p_loteria_id)
    )
    SELECT qtd_moldura, qtd_centro, COUNT(*) AS ocorrencias,
           ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) AS percentual
    FROM base
    GROUP BY qtd_moldura, qtd_centro
    ORDER BY ocorrencias DESC;
$$;


--
-- Name: fn_distribuicao_par_impar(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_distribuicao_par_impar(p_loteria_id integer) RETURNS TABLE(pares integer, impares integer, ocorrencias bigint, percentual numeric)
    LANGUAGE sql STABLE
    AS $$
    WITH por_concurso AS (
        SELECT
            c.numero,
            COUNT(*) FILTER (WHERE dezena % 2 = 0) AS pares,
            COUNT(*) FILTER (WHERE dezena % 2 <> 0) AS impares
        FROM concurso c, unnest(c.dezenas) AS dezena
        WHERE c.loteria_id = p_loteria_id
        GROUP BY c.numero
    )
    SELECT
        pares,
        impares,
        COUNT(*) AS ocorrencias,
        ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) AS percentual
    FROM por_concurso
    GROUP BY pares, impares
    ORDER BY ocorrencias DESC;
$$;


--
-- Name: fn_distribuicao_repetidas(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_distribuicao_repetidas(p_loteria_id integer) RETURNS TABLE(qtd_repetidas integer, ocorrencias bigint, percentual numeric)
    LANGUAGE sql STABLE
    AS $$
    WITH base AS (
        SELECT * FROM fn_repetidas_concurso_anterior(p_loteria_id)
    )
    SELECT qtd_repetidas, COUNT(*) AS ocorrencias,
           ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) AS percentual
    FROM base
    GROUP BY qtd_repetidas
    ORDER BY ocorrencias DESC;
$$;


--
-- Name: fn_distribuicao_sequencias(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_distribuicao_sequencias(p_loteria_id integer) RETURNS TABLE(maior_sequencia integer, ocorrencias bigint, percentual numeric)
    LANGUAGE sql STABLE
    AS $$
    WITH base AS (
        SELECT * FROM fn_maior_sequencia_por_concurso(p_loteria_id)
    )
    SELECT maior_sequencia, COUNT(*) AS ocorrencias,
           ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) AS percentual
    FROM base
    GROUP BY maior_sequencia
    ORDER BY ocorrencias DESC;
$$;


--
-- Name: fn_duques_mais_frequentes(integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_duques_mais_frequentes(p_loteria_id integer, p_top integer DEFAULT 20) RETURNS TABLE(dezena_1 integer, dezena_2 integer, ocorrencias bigint)
    LANGUAGE sql STABLE
    AS $$
    SELECT d1.dezena AS dezena_1, d2.dezena AS dezena_2, COUNT(*) AS ocorrencias
    FROM concurso c
    JOIN LATERAL unnest(c.dezenas) AS d1(dezena) ON true
    JOIN LATERAL unnest(c.dezenas) AS d2(dezena) ON d2.dezena > d1.dezena
    WHERE c.loteria_id = p_loteria_id
    GROUP BY d1.dezena, d2.dezena
    ORDER BY ocorrencias DESC
    LIMIT p_top;
$$;


--
-- Name: fn_eh_fibonacci(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_eh_fibonacci(p_n integer) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $$
    SELECT p_n = ANY(ARRAY[1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144]);
$$;


--
-- Name: fn_eh_multiplo_3(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_eh_multiplo_3(p_n integer) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $$
    SELECT p_n % 3 = 0;
$$;


--
-- Name: fn_eh_primo(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_eh_primo(p_n integer) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    i INT;
BEGIN
    IF p_n < 2 THEN
        RETURN FALSE;
    END IF;
    IF p_n IN (2, 3) THEN
        RETURN TRUE;
    END IF;
    IF p_n % 2 = 0 THEN
        RETURN FALSE;
    END IF;
    i := 3;
    WHILE i * i <= p_n LOOP
        IF p_n % i = 0 THEN
            RETURN FALSE;
        END IF;
        i := i + 2;
    END LOOP;
    RETURN TRUE;
END;
$$;


--
-- Name: fn_estatisticas_soma(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_estatisticas_soma(p_loteria_id integer) RETURNS TABLE(minimo bigint, maximo bigint, media numeric, mediana numeric)
    LANGUAGE sql STABLE
    AS $$
    WITH somas AS (
        SELECT (SELECT SUM(d) FROM unnest(dezenas) AS d) AS soma
        FROM concurso
        WHERE loteria_id = p_loteria_id
    )
    SELECT
        MIN(soma),
        MAX(soma),
        ROUND(AVG(soma), 2),
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY soma)
    FROM somas;
$$;


--
-- Name: fn_fibonacci_distribuicao(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_fibonacci_distribuicao(p_loteria_id integer) RETURNS TABLE(qtd_fibonacci integer, ocorrencias bigint, percentual numeric)
    LANGUAGE sql STABLE
    AS $$
    WITH por_concurso AS (
        SELECT c.numero, COUNT(*) FILTER (WHERE fn_eh_fibonacci(d.dezena))::INT AS qtd_fibonacci
        FROM concurso c
        CROSS JOIN LATERAL unnest(c.dezenas) AS d(dezena)
        WHERE c.loteria_id = p_loteria_id
        GROUP BY c.numero
    )
    SELECT qtd_fibonacci, COUNT(*) AS ocorrencias,
           ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) AS percentual
    FROM por_concurso
    GROUP BY qtd_fibonacci
    ORDER BY ocorrencias DESC;
$$;


--
-- Name: fn_fibonacci_frequencia(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_fibonacci_frequencia(p_loteria_id integer) RETURNS TABLE(categoria text, frequencia bigint, percentual numeric)
    LANGUAGE sql STABLE
    AS $$
    SELECT CASE WHEN fn_eh_fibonacci(d.dezena) THEN 'fibonacci' ELSE 'nao_fibonacci' END AS categoria,
           COUNT(*) AS frequencia,
           ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) AS percentual
    FROM concurso c
    CROSS JOIN LATERAL unnest(c.dezenas) AS d(dezena)
    WHERE c.loteria_id = p_loteria_id
    GROUP BY categoria;
$$;


--
-- Name: fn_frequencia(integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_frequencia(p_loteria_id integer, p_ultimos_n integer DEFAULT NULL::integer) RETURNS TABLE(dezena integer, frequencia bigint)
    LANGUAGE sql STABLE
    AS $$
    SELECT dezena, COUNT(*) AS frequencia
    FROM concurso c, unnest(c.dezenas) AS dezena
    WHERE c.loteria_id = p_loteria_id
      AND (
            p_ultimos_n IS NULL
            OR c.numero > (SELECT MAX(numero) - p_ultimos_n FROM concurso WHERE loteria_id = p_loteria_id)
          )
    GROUP BY dezena
    ORDER BY frequencia DESC, dezena;
$$;


--
-- Name: fn_frequencia_por_coluna(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_frequencia_por_coluna(p_loteria_id integer) RETURNS TABLE(coluna integer, frequencia bigint)
    LANGUAGE sql STABLE
    AS $$
    SELECT fn_coluna_da_dezena(d.dezena, l.grid_colunas) AS coluna, COUNT(*) AS frequencia
    FROM concurso c
    JOIN loteria l ON l.id = c.loteria_id
    CROSS JOIN LATERAL unnest(c.dezenas) AS d(dezena)
    WHERE c.loteria_id = p_loteria_id
    GROUP BY coluna
    ORDER BY coluna;
$$;


--
-- Name: fn_frequencia_por_linha(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_frequencia_por_linha(p_loteria_id integer) RETURNS TABLE(linha integer, frequencia bigint)
    LANGUAGE sql STABLE
    AS $$
    SELECT fn_linha_da_dezena(d.dezena, l.grid_colunas) AS linha, COUNT(*) AS frequencia
    FROM concurso c
    JOIN loteria l ON l.id = c.loteria_id
    CROSS JOIN LATERAL unnest(c.dezenas) AS d(dezena)
    WHERE c.loteria_id = p_loteria_id
    GROUP BY linha
    ORDER BY linha;
$$;


--
-- Name: fn_histograma_soma(integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_histograma_soma(p_loteria_id integer, p_largura_faixa integer DEFAULT 10) RETURNS TABLE(faixa_inicio bigint, faixa_fim bigint, ocorrencias bigint)
    LANGUAGE sql STABLE
    AS $$
    WITH somas AS (
        SELECT (SELECT SUM(d) FROM unnest(dezenas) AS d) AS soma
        FROM concurso
        WHERE loteria_id = p_loteria_id
    ),
    faixas AS (
        SELECT (soma / p_largura_faixa) * p_largura_faixa AS faixa_inicio
        FROM somas
    )
    SELECT faixa_inicio, faixa_inicio + p_largura_faixa - 1 AS faixa_fim, COUNT(*) AS ocorrencias
    FROM faixas
    GROUP BY faixa_inicio
    ORDER BY faixa_inicio;
$$;


--
-- Name: fn_linha_da_dezena(integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_linha_da_dezena(p_dezena integer, p_grid_colunas integer) RETURNS integer
    LANGUAGE sql IMMUTABLE
    AS $$
    SELECT CEIL(p_dezena::NUMERIC / p_grid_colunas)::INT;
$$;


--
-- Name: fn_maior_atraso_historico(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_maior_atraso_historico(p_loteria_id integer) RETURNS TABLE(dezena integer, maior_atraso integer)
    LANGUAGE sql STABLE
    AS $$
    WITH aparicoes AS (
        SELECT c.numero, dezena
        FROM concurso c, unnest(c.dezenas) AS dezena
        WHERE c.loteria_id = p_loteria_id
    ),
    gaps AS (
        SELECT
            dezena,
            numero - LAG(numero) OVER (PARTITION BY dezena ORDER BY numero) - 1 AS atraso_intervalo
        FROM aparicoes
    )
    SELECT dezena, COALESCE(MAX(atraso_intervalo), 0) AS maior_atraso
    FROM gaps
    GROUP BY dezena
    ORDER BY maior_atraso DESC, dezena;
$$;


--
-- Name: fn_maior_sequencia_consecutiva_dezena(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_maior_sequencia_consecutiva_dezena(p_loteria_id integer) RETURNS TABLE(dezena integer, maior_sequencia_concursos integer)
    LANGUAGE sql STABLE
    AS $$
    WITH aparicoes AS (
        SELECT c.numero, dezena
        FROM concurso c, unnest(c.dezenas) AS dezena
        WHERE c.loteria_id = p_loteria_id
    ),
    marcado AS (
        SELECT dezena, numero,
               numero - ROW_NUMBER() OVER (PARTITION BY dezena ORDER BY numero) AS grupo
        FROM aparicoes
    ),
    grupos AS (
        SELECT dezena, grupo, COUNT(*) AS tamanho
        FROM marcado
        GROUP BY dezena, grupo
    )
    SELECT dezena, MAX(tamanho) AS maior_sequencia_concursos
    FROM grupos
    GROUP BY dezena
    ORDER BY maior_sequencia_concursos DESC, dezena;
$$;


--
-- Name: fn_maior_sequencia_por_concurso(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_maior_sequencia_por_concurso(p_loteria_id integer) RETURNS TABLE(numero integer, maior_sequencia integer)
    LANGUAGE sql STABLE
    AS $$
    WITH dezenas_marcadas AS (
        SELECT c.numero, dezena,
               dezena - ROW_NUMBER() OVER (PARTITION BY c.numero ORDER BY dezena) AS grupo
        FROM concurso c, unnest(c.dezenas) AS dezena
        WHERE c.loteria_id = p_loteria_id
    ),
    tamanhos_grupo AS (
        SELECT numero, grupo, COUNT(*) AS tamanho
        FROM dezenas_marcadas
        GROUP BY numero, grupo
    )
    SELECT numero, MAX(tamanho) AS maior_sequencia
    FROM tamanhos_grupo
    GROUP BY numero
    ORDER BY numero;
$$;


--
-- Name: fn_moldura_centro_frequencia(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_moldura_centro_frequencia(p_loteria_id integer) RETURNS TABLE(zona text, frequencia bigint, percentual numeric)
    LANGUAGE sql STABLE
    AS $$
    SELECT zona, COUNT(*) AS frequencia,
           ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) AS percentual
    FROM (
        SELECT fn_zona_da_dezena(d.dezena, l.dezena_max, l.grid_colunas) AS zona
        FROM concurso c
        JOIN loteria l ON l.id = c.loteria_id
        CROSS JOIN LATERAL unnest(c.dezenas) AS d(dezena)
        WHERE c.loteria_id = p_loteria_id
    ) sub
    GROUP BY zona;
$$;


--
-- Name: fn_moldura_centro_por_concurso(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_moldura_centro_por_concurso(p_loteria_id integer) RETURNS TABLE(numero integer, qtd_moldura integer, qtd_centro integer)
    LANGUAGE sql STABLE
    AS $$
    SELECT
        c.numero,
        COUNT(*) FILTER (WHERE fn_zona_da_dezena(d.dezena, l.dezena_max, l.grid_colunas) = 'moldura')::INT AS qtd_moldura,
        COUNT(*) FILTER (WHERE fn_zona_da_dezena(d.dezena, l.dezena_max, l.grid_colunas) = 'centro')::INT AS qtd_centro
    FROM concurso c
    JOIN loteria l ON l.id = c.loteria_id
    CROSS JOIN LATERAL unnest(c.dezenas) AS d(dezena)
    WHERE c.loteria_id = p_loteria_id
    GROUP BY c.numero
    ORDER BY c.numero;
$$;


--
-- Name: fn_multiplos_3_distribuicao(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_multiplos_3_distribuicao(p_loteria_id integer) RETURNS TABLE(qtd_multiplos integer, ocorrencias bigint, percentual numeric)
    LANGUAGE sql STABLE
    AS $$
    WITH por_concurso AS (
        SELECT c.numero, COUNT(*) FILTER (WHERE fn_eh_multiplo_3(d.dezena))::INT AS qtd_multiplos
        FROM concurso c
        CROSS JOIN LATERAL unnest(c.dezenas) AS d(dezena)
        WHERE c.loteria_id = p_loteria_id
        GROUP BY c.numero
    )
    SELECT qtd_multiplos, COUNT(*) AS ocorrencias,
           ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) AS percentual
    FROM por_concurso
    GROUP BY qtd_multiplos
    ORDER BY ocorrencias DESC;
$$;


--
-- Name: fn_multiplos_3_frequencia(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_multiplos_3_frequencia(p_loteria_id integer) RETURNS TABLE(categoria text, frequencia bigint, percentual numeric)
    LANGUAGE sql STABLE
    AS $$
    SELECT CASE WHEN fn_eh_multiplo_3(d.dezena) THEN 'multiplo_de_3' ELSE 'nao_multiplo_de_3' END AS categoria,
           COUNT(*) AS frequencia,
           ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) AS percentual
    FROM concurso c
    CROSS JOIN LATERAL unnest(c.dezenas) AS d(dezena)
    WHERE c.loteria_id = p_loteria_id
    GROUP BY categoria;
$$;


--
-- Name: fn_primos_distribuicao(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_primos_distribuicao(p_loteria_id integer) RETURNS TABLE(qtd_primos integer, ocorrencias bigint, percentual numeric)
    LANGUAGE sql STABLE
    AS $$
    WITH por_concurso AS (
        SELECT c.numero, COUNT(*) FILTER (WHERE fn_eh_primo(d.dezena))::INT AS qtd_primos
        FROM concurso c
        CROSS JOIN LATERAL unnest(c.dezenas) AS d(dezena)
        WHERE c.loteria_id = p_loteria_id
        GROUP BY c.numero
    )
    SELECT qtd_primos, COUNT(*) AS ocorrencias,
           ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) AS percentual
    FROM por_concurso
    GROUP BY qtd_primos
    ORDER BY ocorrencias DESC;
$$;


--
-- Name: fn_primos_frequencia(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_primos_frequencia(p_loteria_id integer) RETURNS TABLE(categoria text, frequencia bigint, percentual numeric)
    LANGUAGE sql STABLE
    AS $$
    SELECT CASE WHEN fn_eh_primo(d.dezena) THEN 'primo' ELSE 'nao_primo' END AS categoria,
           COUNT(*) AS frequencia,
           ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) AS percentual
    FROM concurso c
    CROSS JOIN LATERAL unnest(c.dezenas) AS d(dezena)
    WHERE c.loteria_id = p_loteria_id
    GROUP BY categoria;
$$;


--
-- Name: fn_repetidas_concurso_anterior(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_repetidas_concurso_anterior(p_loteria_id integer) RETURNS TABLE(numero integer, numero_anterior integer, qtd_repetidas integer)
    LANGUAGE sql STABLE
    AS $$
    WITH ordenados AS (
        SELECT numero, dezenas,
               LAG(dezenas) OVER (ORDER BY numero) AS dezenas_anteriores,
               LAG(numero) OVER (ORDER BY numero) AS numero_anterior
        FROM concurso
        WHERE loteria_id = p_loteria_id
    )
    SELECT
        numero,
        numero_anterior,
        (SELECT COUNT(*)::INT FROM unnest(dezenas) d WHERE d = ANY(dezenas_anteriores)) AS qtd_repetidas
    FROM ordenados
    WHERE dezenas_anteriores IS NOT NULL
    ORDER BY numero;
$$;


--
-- Name: fn_trincas_mais_frequentes(integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_trincas_mais_frequentes(p_loteria_id integer, p_top integer DEFAULT 20) RETURNS TABLE(dezena_1 integer, dezena_2 integer, dezena_3 integer, ocorrencias bigint)
    LANGUAGE sql STABLE
    AS $$
    SELECT d1.dezena AS dezena_1, d2.dezena AS dezena_2, d3.dezena AS dezena_3, COUNT(*) AS ocorrencias
    FROM concurso c
    JOIN LATERAL unnest(c.dezenas) AS d1(dezena) ON true
    JOIN LATERAL unnest(c.dezenas) AS d2(dezena) ON d2.dezena > d1.dezena
    JOIN LATERAL unnest(c.dezenas) AS d3(dezena) ON d3.dezena > d2.dezena
    WHERE c.loteria_id = p_loteria_id
    GROUP BY d1.dezena, d2.dezena, d3.dezena
    ORDER BY ocorrencias DESC
    LIMIT p_top;
$$;


--
-- Name: fn_zona_da_dezena(integer, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_zona_da_dezena(p_dezena integer, p_dezena_max integer, p_grid_colunas integer) RETURNS text
    LANGUAGE sql IMMUTABLE
    AS $$
    SELECT CASE
        WHEN fn_linha_da_dezena(p_dezena, p_grid_colunas) = 1
          OR fn_linha_da_dezena(p_dezena, p_grid_colunas) = CEIL(p_dezena_max::NUMERIC / p_grid_colunas)::INT
          OR fn_coluna_da_dezena(p_dezena, p_grid_colunas) = 1
          OR fn_coluna_da_dezena(p_dezena, p_grid_colunas) = p_grid_colunas
        THEN 'moldura'
        ELSE 'centro'
    END;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alert_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.alert_preferences (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    loteria text NOT NULL,
    threshold_brl numeric(15,2),
    sorteios_sem_ganhador integer,
    ativo boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT alert_preferences_loteria_check CHECK ((loteria = ANY (ARRAY['lotofacil'::text, 'megasena'::text, 'quina'::text, 'lotomania'::text, 'diadesorte'::text, 'maismilionaria'::text, 'timemania'::text, 'duplasena'::text, 'supersete'::text])))
);


--
-- Name: api_keys; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.api_keys (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    key_hash text NOT NULL,
    key_prefix text NOT NULL,
    label text,
    requests_mes integer DEFAULT 0 NOT NULL,
    limite_mes integer DEFAULT 1000 NOT NULL,
    mes_referencia text DEFAULT to_char(now(), 'YYYY-MM'::text) NOT NULL,
    ativo boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    last_used_at timestamp with time zone
);


--
-- Name: concurso; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.concurso (
    id integer NOT NULL,
    loteria_id integer NOT NULL,
    numero integer NOT NULL,
    data_sorteio date NOT NULL,
    dezenas integer[] NOT NULL,
    dezenas_ordem_sorteio integer[] NOT NULL,
    acumulado boolean DEFAULT false NOT NULL,
    local_sorteio character varying(120),
    municipio_uf_sorteio character varying(120),
    valor_arrecadado numeric(14,2),
    valor_acumulado_proximo numeric(14,2),
    valor_estimado_proximo numeric(14,2),
    data_proximo_concurso date,
    criado_em timestamp without time zone DEFAULT now() NOT NULL,
    atualizado_em timestamp without time zone DEFAULT now() NOT NULL,
    mes_sorte text,
    trevos integer[],
    dezenas_segundo_sorteio integer[]
);


--
-- Name: concurso_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.concurso_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: concurso_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.concurso_id_seq OWNED BY public.concurso.id;


--
-- Name: loteria; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.loteria (
    id integer NOT NULL,
    codigo character varying(20) NOT NULL,
    nome character varying(50) NOT NULL,
    dezena_min integer NOT NULL,
    dezena_max integer NOT NULL,
    qtd_dezenas_sorteadas integer NOT NULL,
    grid_colunas integer
);


--
-- Name: loteria_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.loteria_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: loteria_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.loteria_id_seq OWNED BY public.loteria.id;


--
-- Name: premiacao_faixa; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.premiacao_faixa (
    id integer NOT NULL,
    concurso_id integer NOT NULL,
    faixa integer NOT NULL,
    descricao_faixa character varying(60),
    qtd_ganhadores integer DEFAULT 0 NOT NULL,
    valor_premio numeric(14,2) DEFAULT 0 NOT NULL
);


--
-- Name: premiacao_faixa_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.premiacao_faixa_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: premiacao_faixa_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.premiacao_faixa_id_seq OWNED BY public.premiacao_faixa.id;


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    display_name text,
    plan text DEFAULT 'free'::text NOT NULL,
    plan_expires_at timestamp with time zone,
    stripe_customer_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    ocr_usage jsonb DEFAULT '{"data": "", "count": 0}'::jsonb NOT NULL,
    CONSTRAINT profiles_plan_check CHECK ((plan = ANY (ARRAY['free'::text, 'premium'::text])))
);


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    stripe_subscription_id text,
    stripe_price_id text,
    status text NOT NULL,
    current_period_start timestamp with time zone,
    current_period_end timestamp with time zone,
    canceled_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT subscriptions_status_check CHECK ((status = ANY (ARRAY['active'::text, 'canceled'::text, 'past_due'::text, 'trialing'::text, 'incomplete'::text, 'incomplete_expired'::text])))
);


--
-- Name: user_games; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_games (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    loteria text NOT NULL,
    dezenas integer[] NOT NULL,
    label text,
    ativo boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    monitorar_proximo boolean DEFAULT false NOT NULL,
    CONSTRAINT user_games_loteria_check CHECK ((loteria = ANY (ARRAY['lotofacil'::text, 'megasena'::text, 'quina'::text, 'lotomania'::text, 'diadesorte'::text, 'maismilionaria'::text, 'timemania'::text, 'duplasena'::text, 'supersete'::text])))
);


--
-- Name: concurso id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.concurso ALTER COLUMN id SET DEFAULT nextval('public.concurso_id_seq'::regclass);


--
-- Name: loteria id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loteria ALTER COLUMN id SET DEFAULT nextval('public.loteria_id_seq'::regclass);


--
-- Name: premiacao_faixa id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.premiacao_faixa ALTER COLUMN id SET DEFAULT nextval('public.premiacao_faixa_id_seq'::regclass);


--
-- Name: alert_preferences alert_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alert_preferences
    ADD CONSTRAINT alert_preferences_pkey PRIMARY KEY (id);


--
-- Name: alert_preferences alert_preferences_user_id_loteria_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alert_preferences
    ADD CONSTRAINT alert_preferences_user_id_loteria_key UNIQUE (user_id, loteria);


--
-- Name: api_keys api_keys_key_hash_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_key_hash_key UNIQUE (key_hash);


--
-- Name: api_keys api_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_pkey PRIMARY KEY (id);


--
-- Name: concurso concurso_loteria_id_numero_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.concurso
    ADD CONSTRAINT concurso_loteria_id_numero_key UNIQUE (loteria_id, numero);


--
-- Name: concurso concurso_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.concurso
    ADD CONSTRAINT concurso_pkey PRIMARY KEY (id);


--
-- Name: loteria loteria_codigo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loteria
    ADD CONSTRAINT loteria_codigo_key UNIQUE (codigo);


--
-- Name: loteria loteria_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loteria
    ADD CONSTRAINT loteria_pkey PRIMARY KEY (id);


--
-- Name: premiacao_faixa premiacao_faixa_concurso_id_faixa_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.premiacao_faixa
    ADD CONSTRAINT premiacao_faixa_concurso_id_faixa_key UNIQUE (concurso_id, faixa);


--
-- Name: premiacao_faixa premiacao_faixa_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.premiacao_faixa
    ADD CONSTRAINT premiacao_faixa_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_stripe_subscription_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_stripe_subscription_id_key UNIQUE (stripe_subscription_id);


--
-- Name: user_games user_games_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_games
    ADD CONSTRAINT user_games_pkey PRIMARY KEY (id);


--
-- Name: idx_alert_prefs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_alert_prefs_user_id ON public.alert_preferences USING btree (user_id);


--
-- Name: idx_api_keys_key_hash; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_api_keys_key_hash ON public.api_keys USING btree (key_hash);


--
-- Name: idx_api_keys_prefix; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_api_keys_prefix ON public.api_keys USING btree (key_prefix);


--
-- Name: idx_api_keys_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_api_keys_user_id ON public.api_keys USING btree (user_id);


--
-- Name: idx_concurso_loteria_numero; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_concurso_loteria_numero ON public.concurso USING btree (loteria_id, numero);


--
-- Name: idx_subscriptions_stripe_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subscriptions_stripe_id ON public.subscriptions USING btree (stripe_subscription_id);


--
-- Name: idx_subscriptions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions USING btree (user_id);


--
-- Name: idx_user_games_monitorar; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_games_monitorar ON public.user_games USING btree (monitorar_proximo) WHERE (monitorar_proximo = true);


--
-- Name: idx_user_games_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_games_user_id ON public.user_games USING btree (user_id);


--
-- Name: profiles set_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: subscriptions set_subscriptions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: alert_preferences alert_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alert_preferences
    ADD CONSTRAINT alert_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: api_keys api_keys_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: concurso concurso_loteria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.concurso
    ADD CONSTRAINT concurso_loteria_id_fkey FOREIGN KEY (loteria_id) REFERENCES public.loteria(id);


--
-- Name: premiacao_faixa premiacao_faixa_concurso_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.premiacao_faixa
    ADD CONSTRAINT premiacao_faixa_concurso_id_fkey FOREIGN KEY (concurso_id) REFERENCES public.concurso(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: user_games user_games_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_games
    ADD CONSTRAINT user_games_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: concurso Leitura publica; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Leitura publica" ON public.concurso FOR SELECT USING (true);


--
-- Name: loteria Leitura publica; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Leitura publica" ON public.loteria FOR SELECT USING (true);


--
-- Name: premiacao_faixa Leitura publica; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Leitura publica" ON public.premiacao_faixa FOR SELECT USING (true);


--
-- Name: user_games Usuário atualiza jogos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuário atualiza jogos" ON public.user_games FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Usuário atualiza próprio perfil; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuário atualiza próprio perfil" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: user_games Usuário deleta jogos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuário deleta jogos" ON public.user_games FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: alert_preferences Usuário gerencia alertas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuário gerencia alertas" ON public.alert_preferences USING ((auth.uid() = user_id));


--
-- Name: api_keys Usuário gerencia próprias API keys; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuário gerencia próprias API keys" ON public.api_keys USING ((auth.uid() = user_id));


--
-- Name: user_games Usuário insere jogos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuário insere jogos" ON public.user_games FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: subscriptions Usuário lê próprias assinaturas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuário lê próprias assinaturas" ON public.subscriptions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Usuário lê próprio perfil; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuário lê próprio perfil" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: user_games Usuário lê próprios jogos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuário lê próprios jogos" ON public.user_games FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: alert_preferences; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.alert_preferences ENABLE ROW LEVEL SECURITY;

--
-- Name: api_keys; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

--
-- Name: concurso; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.concurso ENABLE ROW LEVEL SECURITY;

--
-- Name: loteria; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.loteria ENABLE ROW LEVEL SECURITY;

--
-- Name: premiacao_faixa; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.premiacao_faixa ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: subscriptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: user_games; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_games ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


--
-- PostgreSQL database dump complete
--

\unrestrict MqWuofeE0W9AdIldykKRMlJvx6pjnh1CQEWsjb0XQo8dKtvmvwsZvHNixA8uBUn

