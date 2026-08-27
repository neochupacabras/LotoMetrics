import { createClient } from "@/lib/supabase/server";

export interface PlanoUsuario {
  logado: boolean;
  premium: boolean;
}

interface PerfilComPlano {
  plan?: string | null;
  plan_expires_at?: string | null;
}

// Única fonte de verdade para "esse perfil é premium?" — antes essa mesma
// expressão estava duplicada em ~10 arquivos (rotas de API, cron jobs,
// páginas de /conta), com o risco real de alguma cópia ficar defasada se a
// regra mudasse. Usada tanto aqui quanto em qualquer lugar que já tenha o
// perfil carregado por outro motivo (evitando um segundo round-trip via
// getPlanoPremium, que busca a sessão atual).
export function calcularIsPremium(perfil: PerfilComPlano | null | undefined): boolean {
  if (perfil?.plan !== "premium") return false;
  return !perfil.plan_expires_at || new Date(perfil.plan_expires_at) > new Date();
}

// Chame em Server Components para saber o plano do visitante atual.
// Nunca lança exceção — retorna { logado: false, premium: false } em caso de erro.
export async function getPlanoPremium(): Promise<PlanoUsuario> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { logado: false, premium: false };

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, plan_expires_at")
      .eq("id", user.id)
      .single();

    return { logado: true, premium: calcularIsPremium(profile) };
  } catch {
    return { logado: false, premium: false };
  }
}
