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
    // Sem permissão (ou fora de HTTPS) o writeText rejeita; não há o que
    // fazer além de não deixar a promessa sem tratamento.
    navigator.clipboard?.writeText(texto).catch(() => {});
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
