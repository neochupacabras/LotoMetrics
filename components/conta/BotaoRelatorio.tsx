"use client";

import { useState } from "react";

interface Props {
  mes?: number;
  ano?: number;
  label?: string;
}

export default function BotaoRelatorio({ mes, ano, label }: Props) {
  const [status, setStatus] = useState<"idle" | "gerando" | "erro">("idle");

  async function handleDownload() {
    setStatus("gerando");

    const params = new URLSearchParams();
    if (mes) params.set("mes", String(mes));
    if (ano) params.set("ano", String(ano));

    try {
      const res = await fetch(`/api/relatorio?${params}`);

      if (!res.ok) {
        const data = await res.json();
        alert(data.erro ?? "Não foi possível gerar o relatório.");
        setStatus("erro");
        setTimeout(() => setStatus("idle"), 3000);
        return;
      }

      // Dispara o download
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lotoanalitica-relatorio-${String(mes ?? "").padStart(2, "0")}-${ano ?? ""}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus("idle");
    } catch {
      setStatus("erro");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  return (
    <button
      type="button"
      className="botao-copiar relatorio-btn"
      onClick={handleDownload}
      disabled={status === "gerando"}
    >
      {status === "idle"    && `↓ ${label ?? "Baixar relatório PDF"}`}
      {status === "gerando" && "Gerando PDF…"}
      {status === "erro"    && "Erro — tente novamente"}
    </button>
  );
}
