"use client";

import { useState } from "react";

export default function BotaoCopiar({
  texto,
  className = "botao-copiar",
  labelPadrao = "Copiar",
  labelCopiado = "Copiado ✓",
}: {
  texto: string;
  className?: string;
  labelPadrao?: string;
  labelCopiado?: string;
}) {
  const [copiado, setCopiado] = useState(false);

  function handleClick() {
    navigator.clipboard?.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  }

  return (
    <button
      type="button"
      className={className}
      data-copiado={copiado}
      onClick={handleClick}
    >
      {copiado ? labelCopiado : labelPadrao}
    </button>
  );
}
