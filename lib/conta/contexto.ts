import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { calcularIsPremium } from "@/lib/plano";

// Contexto da área de membros (/conta): quem é o usuário e qual o plano.
// Envolvido em cache() do React, então o layout de /conta e a página que
// ele renderiza compartilham UMA ida ao Supabase por requisição — antes
// cada página repetia getUser() + select em profiles por conta própria.
//
// Isto NÃO substitui a proteção de cada página: o layout usa o contexto
// só para desenhar a navegação. Toda página continua chamando
// getContaContexto() e redirecionando para /entrar quando vem null, e as
// server actions/rotas de API seguem com as próprias verificações.

export interface ContaContexto {
  userId: string;
  email: string;
  nome: string;
  isPremium: boolean;
  // Validade gravada no perfil (Pix soma crédito aqui; Stripe também
  // atualiza). null = sem data (Premium sem validade, ou plano free).
  premiumAte: string | null;
}

export const getContaContexto = cache(async (): Promise<ContaContexto | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, plan, plan_expires_at")
    .eq("id", user.id)
    .single();

  const isPremium = calcularIsPremium(profile);
  const email = user.email ?? "";

  return {
    userId: user.id,
    email,
    nome: profile?.display_name?.trim() || email.split("@")[0] || "você",
    isPremium,
    premiumAte: isPremium ? (profile?.plan_expires_at ?? null) : null,
  };
});

// "23/12/2026" — para espaços estreitos (selo do plano na lombada).
export function formatarDataCurta(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

export function formatarDataLonga(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  });
}
