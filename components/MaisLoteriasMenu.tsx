"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LOTERIAS } from "@/lib/format";
import { CodigoLoteria } from "@/lib/types";

// As duas loterias que já ganham link de atalho fixo nos cards da home —
// as demais aparecem neste menu, pra deixar claro que a ferramenta não é
// exclusiva de Lotofácil/Mega-Sena.
const JA_TEM_ATALHO: CodigoLoteria[] = ["lotofacil", "megasena"];

export default function MaisLoteriasMenu({ ferramentaSlug }: { ferramentaSlug: string }) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function aoClicarFora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false);
    }
    if (aberto) document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, [aberto]);

  const outras = (Object.keys(LOTERIAS) as CodigoLoteria[]).filter(
    (codigo) => !JA_TEM_ATALHO.includes(codigo)
  );

  return (
    <div className="mais-loterias" ref={ref}>
      <button
        type="button"
        className="mais-loterias__btn"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
      >
        +{outras.length} loterias ▾
      </button>
      {/* Sempre no HTML (não só quando `aberto`) — os links das outras 7
          loterias precisam existir no SSR pra serem rastreados/seguidos
          pelo Google, não só depois de um clique. A visibilidade é só CSS
          (ver .mais-loterias__painel[data-aberto]). */}
      <div className="mais-loterias__painel" data-aberto={aberto}>
        {outras.map((codigo) => (
          <Link
            key={codigo}
            href={`/${codigo}/${ferramentaSlug}`}
            className="mais-loterias__item"
            onClick={() => setAberto(false)}
          >
            {LOTERIAS[codigo].nome}
          </Link>
        ))}
      </div>
    </div>
  );
}
