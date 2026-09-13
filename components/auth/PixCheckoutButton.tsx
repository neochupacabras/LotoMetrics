"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { PlanoPix } from "@/lib/mercadopago/planos";

interface PixData {
  qrCode: string;
  qrCodeBase64: string;
  paymentId: string;
}

export default function PixCheckoutButton({
  plano,
  userId,
}: {
  plano: PlanoPix;
  userId?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  function pararPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  function iniciarPolling(paymentId: string) {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/mercadopago/status/${paymentId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === "approved") {
          pararPolling();
          router.push("/conta?checkout=sucesso");
        }
      } catch {
        // Falha de rede momentânea — tenta de novo no próximo intervalo.
      }
    }, 3000);
  }

  async function handleClick() {
    if (!userId) {
      router.push("/cadastrar?next=/assinar");
      return;
    }

    setLoading(true);
    setErro(null);
    try {
      const res = await fetch("/api/mercadopago/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plano }),
      });

      const data = await res.json();

      if (res.ok && data.qrCode && data.qrCodeBase64 && data.paymentId) {
        setPixData(data);
        iniciarPolling(data.paymentId);
      } else {
        setErro(data.error || "Não foi possível gerar o Pix. Tente novamente.");
      }
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function fecharModal() {
    pararPolling();
    setPixData(null);
    setErro(null);
  }

  async function copiarCodigo() {
    if (!pixData) return;
    try {
      await navigator.clipboard.writeText(pixData.qrCode);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // clipboard indisponível — o campo abaixo continua selecionável manualmente.
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="botao-gerar assinar-checkout-btn assinar-checkout-btn--sec assinar-checkout-btn--pix"
      >
        {loading ? "Gerando Pix..." : "Pagar com Pix"}
      </button>

      {pixData && (
        <div className="pix-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="pix-modal-titulo">
          <div className="pix-modal">
            <button type="button" className="pix-modal-fechar" onClick={fecharModal} aria-label="Fechar">
              ×
            </button>
            <h2 id="pix-modal-titulo" className="pix-modal-titulo">Pague com Pix</h2>
            <p className="pix-modal-subtitulo">
              Escaneie o QR code no app do seu banco ou copie o código abaixo.
            </p>
            <img
              src={`data:image/png;base64,${pixData.qrCodeBase64}`}
              alt="QR code do Pix"
              className="pix-modal-qrcode"
            />
            <label htmlFor="pix-copia-cola" className="pix-modal-label">Pix copia e cola</label>
            <div className="pix-modal-copia-cola">
              <input
                id="pix-copia-cola"
                type="text"
                readOnly
                value={pixData.qrCode}
                onFocus={(e) => e.currentTarget.select()}
              />
              <button type="button" onClick={copiarCodigo} className="botao-gerar">
                {copiado ? "Copiado!" : "Copiar"}
              </button>
            </div>
            <p className="pix-modal-aguardando">Aguardando confirmação do pagamento…</p>
          </div>
        </div>
      )}

      {erro && !pixData && <p className="pix-erro">{erro}</p>}
    </>
  );
}
