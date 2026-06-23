"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutButton({
  priceId,
  userId,
  destaque,
}: {
  priceId: string;
  userId?: string;
  destaque?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    if (!userId) {
      // Usuário não está logado — redireciona para cadastro
      router.push("/cadastrar?next=/assinar");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Não foi possível iniciar o pagamento. Tente novamente.");
        setLoading(false);
      }
    } catch {
      alert("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`botao-gerar assinar-checkout-btn ${destaque ? "" : "assinar-checkout-btn--sec"}`}
    >
      {loading ? "Redirecionando..." : userId ? "Assinar agora" : "Criar conta e assinar"}
    </button>
  );
}
