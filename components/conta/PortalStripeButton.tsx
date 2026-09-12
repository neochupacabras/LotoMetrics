"use client";

import { useState } from "react";

export default function PortalStripeButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Não foi possível abrir o portal. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className="botao-gerar"
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? "Abrindo portal…" : "Gerenciar assinatura →"}
    </button>
  );
}
