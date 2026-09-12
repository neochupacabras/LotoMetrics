import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AdminUser {
  id: string;
  email: string | null;
}

// Única porta de entrada de autorização do /admin. Sempre server-only —
// nunca decidir acesso administrativo em Client Component. Chamado no
// layout de /admin, então cobre toda a árvore de rotas por baixo dele.
export async function requireAdmin(): Promise<AdminUser> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/entrar?next=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  return { id: user.id, email: user.email ?? null };
}
