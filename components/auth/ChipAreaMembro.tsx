"use client";

import Link from "next/link";

// Entrada para a área de membros no topo do site público (decisão A do
// redesign — docs/membros/REDESIGN_AREA_MEMBROS.md). É um "pedaço da
// lombada": fundo tinta, losango ocre, o mesmo vocabulário da moldura de
// /conta. Decidido no cliente (PlanoUsuarioProvider), então as páginas
// públicas continuam saindo do cache (ISR).
//
// Só assinante vê "Área do assinante"; quem está logado no plano gratuito
// vê "Minha área" (chamar de assinante seria falso).
export default function ChipAreaMembro({
  isPremium,
  compacto = false,
}: {
  isPremium: boolean;
  compacto?: boolean;
}) {
  const rotulo = isPremium ? "Área do assinante" : "Minha área";
  return (
    <Link
      href="/conta"
      className="chip-area-membro"
      data-premium={isPremium}
      data-compacto={compacto}
      aria-label={compacto ? rotulo : undefined}
    >
      {isPremium && (
        <svg width="9" height="9" viewBox="0 0 24 24" aria-hidden focusable="false" className="chip-area-membro__selo">
          <path d="M12 2 22 12 12 22 2 12z" fill="currentColor" />
        </svg>
      )}
      <span className="chip-area-membro__rotulo">{compacto && !isPremium ? "Conta" : compacto ? "Área" : rotulo}</span>
    </Link>
  );
}
