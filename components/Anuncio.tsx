"use client";

import { usePlanoUsuario } from "@/components/auth/PlanoUsuarioProvider";
import AnuncioDisplay from "./AnuncioDisplay";

interface Props {
  slot: string;
  formato?: "auto" | "rectangle" | "horizontal";
  className?: string;
}

// Client Component — checa o plano no navegador (ver PlanoUsuarioProvider).
// Se o usuário for premium (ou o plano ainda estiver carregando), não
// renderiza nada e o AdSense nunca é chamado para esse slot. Antes lia o
// plano no servidor, o que forçava a página inteira a renderizar
// dinamicamente mesmo sem nenhum outro motivo pra isso.
export default function Anuncio({ slot, formato, className }: Props) {
  const { carregando, isPremium } = usePlanoUsuario();

  if (carregando || isPremium) return null;

  return <AnuncioDisplay slot={slot} formato={formato} className={className} />;
}
