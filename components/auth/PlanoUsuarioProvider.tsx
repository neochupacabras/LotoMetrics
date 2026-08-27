"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface PlanoUsuario {
  carregando: boolean;
  logado: boolean;
  isPremium: boolean;
}

const PlanoUsuarioContext = createContext<PlanoUsuario>({
  carregando: true,
  logado: false,
  isPremium: false,
});

// Busca o login e o plano UMA VEZ no cliente e compartilha entre quem
// precisar (UserMenu, AdsenseGate) — em vez de cada um consultar o
// Supabase separadamente. Existe como Client Component porque ler isso no
// servidor (cookies) força a rota inteira a renderizar dinamicamente; ver
// o comentário em components/auth/UserMenu.tsx.
export function PlanoUsuarioProvider({ children }: { children: React.ReactNode }) {
  const [estado, setEstado] = useState<PlanoUsuario>({
    carregando: true,
    logado: false,
    isPremium: false,
  });

  useEffect(() => {
    let ativo = true;
    const supabase = createClient();

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!ativo) return;

      if (!user) {
        setEstado({ carregando: false, logado: false, isPremium: false });
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single();

      if (!ativo) return;
      setEstado({ carregando: false, logado: true, isPremium: profile?.plan === "premium" });
    })();

    return () => {
      ativo = false;
    };
  }, []);

  return (
    <PlanoUsuarioContext.Provider value={estado}>
      {children}
    </PlanoUsuarioContext.Provider>
  );
}

export function usePlanoUsuario(): PlanoUsuario {
  return useContext(PlanoUsuarioContext);
}
