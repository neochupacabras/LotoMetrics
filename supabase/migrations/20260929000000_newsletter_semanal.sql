-- Fase 3 adiantada (28/09/2026, segundo item escolhido pelo usuário):
-- newsletter semanal por e-mail. Não depende de nenhum dado do bolão da
-- Mega da Virada, por isso pode ser adiantada como a Carteira com teto de
-- gasto (migration 20260928000000_teto_gasto_mensal.sql).
--
-- Adiciona o tipo 'newsletter_semanal' à CHECK original de
-- notificacoes_enviadas.tipo (migration 20260915000000_notificacoes.sql
-- só previa os tipos da Fase 1).
--
-- Convenção de `chave` pra esse tipo: "newsletter:<AAAA-MM-DD>" — a data
-- do envio (sempre uma segunda-feira, ver
-- lib/notificacoes/newsletter-semanal.ts). Como o job só roda 1x/dia
-- (piggyback no cron de segurança, mesmo motivo do pix_vencendo: o plano
-- Hobby da Vercel limita o número de crons) e só envia de verdade às
-- segundas, a própria data já basta como chave de deduplicação semanal —
-- não precisa calcular número de semana ISO.

ALTER TABLE public.notificacoes_enviadas DROP CONSTRAINT notificacoes_enviadas_tipo_check;

ALTER TABLE public.notificacoes_enviadas ADD CONSTRAINT notificacoes_enviadas_tipo_check
  CHECK (tipo IN (
    'resultado_jogos', 'alerta_acumulo', 'pix_vencendo',
    'relatorio_mensal', 'bolao_resultado', 'newsletter_semanal'
  ));
