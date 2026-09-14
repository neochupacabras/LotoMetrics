-- Fase 3 adiantada (28/09/2026, terceiro e último item escolhido pelo
-- usuário): "Meu ano na loteria", retrospectiva anual enviada em
-- dezembro pra assinantes Premium com jogos salvos. Depois de "Carteira
-- com teto de gasto" (migration 20260928000000) e "Newsletter semanal"
-- (migration 20260929000000).
--
-- Adiciona o tipo 'retrospectiva_anual' à CHECK de
-- notificacoes_enviadas.tipo.
--
-- Convenção de `chave` pra esse tipo: "retrospectiva:<AAAA>" — uma vez
-- por ano por usuário, disparada em dezembro (piggyback no cron mensal
-- de relatório, app/api/cron/relatorio, mesmo motivo do pix_vencendo e
-- da newsletter: o plano Hobby da Vercel limita o número de crons).

ALTER TABLE public.notificacoes_enviadas DROP CONSTRAINT notificacoes_enviadas_tipo_check;

ALTER TABLE public.notificacoes_enviadas ADD CONSTRAINT notificacoes_enviadas_tipo_check
  CHECK (tipo IN (
    'resultado_jogos', 'alerta_acumulo', 'pix_vencendo',
    'relatorio_mensal', 'bolao_resultado', 'newsletter_semanal',
    'retrospectiva_anual'
  ));
