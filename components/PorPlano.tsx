"use client";

import type { ReactNode } from "react";
import { usePlanoUsuario } from "@/components/auth/PlanoUsuarioProvider";

// Trechos de página que mudam conforme o plano, com o plano lido no
// navegador — assim a página que os usa continua saindo do cache (ISR) e
// não precisa chamar o Supabase Auth no servidor. Só para o que é tela:
// nada aqui pode decidir que dado o servidor envia.

// Só para quem não é Premium. Enquanto o plano carrega, nada: melhor um
// aviso que aparece um instante depois do que um aviso de Free piscando
// para o assinante.
export function SoParaFree({ children }: { children: ReactNode }) {
  const { carregando, isPremium } = usePlanoUsuario();
  if (carregando || isPremium) return null;
  return <>{children}</>;
}

// Texto que varia com o plano. Enquanto carrega, mostra a versão Free,
// que é a da maioria das visitas.
export function TextoPorPlano({ premium, free }: { premium: ReactNode; free: ReactNode }) {
  const { isPremium } = usePlanoUsuario();
  return <>{isPremium ? premium : free}</>;
}
