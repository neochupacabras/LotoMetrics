-- Corrige CHECK constraints desatualizadas em user_games.loteria e
-- alert_preferences.loteria: só permitiam 'lotofacil'/'megasena' (as duas
-- primeiras loterias do produto), mas o site suporta 9 loterias desde a
-- expansão (setup_novas_loterias.sql, setup_dia_de_sorte.sql, etc).
--
-- Bug confirmado em produção em 2026-09-12: 0 linhas em user_games e
-- alert_preferences para qualquer uma das outras 7 loterias — todo
-- salvarJogoAction/salvarAlertaAction (lib/jogo-actions.ts) para Quina,
-- Lotomania, Dia de Sorte, +Milionária, Timemania, Dupla Sena ou Super Sete
-- falha na constraint e é reportado ao usuário como erro genérico.
--
-- Códigos canônicos confirmados na tabela public.loteria em produção.

ALTER TABLE public.user_games
  DROP CONSTRAINT user_games_loteria_check,
  ADD CONSTRAINT user_games_loteria_check
    CHECK (loteria = ANY (ARRAY[
      'lotofacil', 'megasena', 'quina', 'lotomania', 'diadesorte',
      'maismilionaria', 'timemania', 'duplasena', 'supersete'
    ]));

ALTER TABLE public.alert_preferences
  DROP CONSTRAINT alert_preferences_loteria_check,
  ADD CONSTRAINT alert_preferences_loteria_check
    CHECK (loteria = ANY (ARRAY[
      'lotofacil', 'megasena', 'quina', 'lotomania', 'diadesorte',
      'maismilionaria', 'timemania', 'duplasena', 'supersete'
    ]));

-- lib/jogo-actions.ts:110-119,147-156 faz upsert com
-- onConflict: "user_id,loteria" em alert_preferences, mas nenhuma constraint
-- UNIQUE correspondente existia — o código já tinha um fallback defensivo
-- (insert simples se o upsert falhar) para esse caso. Adiciona a constraint
-- que faltava para que o upsert funcione como o código sempre pressupôs.
ALTER TABLE public.alert_preferences
  ADD CONSTRAINT alert_preferences_user_id_loteria_key UNIQUE (user_id, loteria);
