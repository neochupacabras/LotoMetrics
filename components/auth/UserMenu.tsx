import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

// Server Component — lê a sessão no servidor, sem flash de conteúdo
export default async function UserMenu() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="usermenu">
        <Link href="/entrar" className="usermenu-entrar">
          Entrar
        </Link>
        <Link href="/cadastrar" className="usermenu-cadastrar botao-gerar">
          Criar conta
        </Link>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, plan")
    .eq("id", user.id)
    .single();

  const isPremium = profile?.plan === "premium";
  const inicial = (profile?.display_name ?? user.email ?? "U")[0].toUpperCase();

  return (
    <div className="usermenu">
      {!isPremium && (
        <Link href="/assinar" className="usermenu-upgrade">
          ✦ Premium
        </Link>
      )}
      <Link href="/conta" className="usermenu-avatar" title="Minha conta">
        {inicial}
        {isPremium && <span className="usermenu-badge" aria-label="Premium" />}
      </Link>
    </div>
  );
}
