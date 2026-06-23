import { createClient } from "@/lib/supabase/server";

export interface PlanoUsuario {
  logado: boolean;
  premium: boolean;
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

    const premium =
      profile?.plan === "premium" &&
      (!profile.plan_expires_at ||
        new Date(profile.plan_expires_at) > new Date());

    return { logado: true, premium };
  } catch {
    return { logado: false, premium: false };
  }
}
