-- Adiciona suporte a pagamento avulso via Pix (Mercado Pago), sem mexer no
-- fluxo de assinatura recorrente do Stripe. Pix aqui é "acesso pré-pago": o
-- usuário paga um período fixo (30/180/365 dias) e o crédito é aplicado uma
-- única vez em profiles.plan_expires_at quando o pagamento é aprovado.
--
-- Tabela separada de `subscriptions` de propósito: lib/admin/revenue.ts
-- calcula MRR olhando só subscriptions.stripe_price_id (assinatura
-- recorrente); misturar pagamentos avulsos de Pix ali distorceria essa
-- métrica.

CREATE TABLE public.pix_payments (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mp_payment_id text NOT NULL,
  plano text NOT NULL CHECK (plano = ANY (ARRAY['mensal'::text, 'semestral'::text, 'anual'::text])),
  amount_cents integer NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text
    CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'cancelled'::text, 'refunded'::text])),
  period_days integer NOT NULL,
  applied_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT pix_payments_mp_payment_id_key UNIQUE (mp_payment_id)
);

CREATE INDEX idx_pix_payments_user_id ON public.pix_payments USING btree (user_id);
CREATE INDEX idx_pix_payments_mp_payment_id ON public.pix_payments USING btree (mp_payment_id);

CREATE TRIGGER set_pix_payments_updated_at BEFORE UPDATE ON public.pix_payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.pix_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário lê próprios pagamentos Pix" ON public.pix_payments
  FOR SELECT USING ((auth.uid() = user_id));
