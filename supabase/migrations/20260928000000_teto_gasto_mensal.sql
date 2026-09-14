-- Tarefa da Fase 3 adiantada (28/09/2026): teto de gasto mensal na
-- Carteira do apostador — recurso de jogo responsável, não depende de
-- nenhum dado do bolão da Mega da Virada pra fazer sentido.
--
-- NULL = sem teto configurado (comportamento atual, sem mudança visível
-- pra quem não configurar nada). O valor é só uma referência que o
-- próprio usuário define para comparar contra o gasto simulado dos jogos
-- salvos — o site não processa apostas reais, então isso é uma ferramenta
-- de reflexão, nunca um bloqueio.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS teto_gasto_mensal NUMERIC(10,2);

-- Mesmo padrão de receber_emails (migration 20260915000000_notificacoes.sql):
-- authenticated só pode editar essa coluna específica da própria linha —
-- a política "Usuário atualiza próprio perfil" (USING auth.uid() = id)
-- já cobre o resto.
GRANT UPDATE (teto_gasto_mensal) ON public.profiles TO authenticated;
