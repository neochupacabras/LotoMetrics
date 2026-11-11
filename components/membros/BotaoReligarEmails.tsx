"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { religarEmailsAction } from "@/lib/perfil-actions";

export default function BotaoReligarEmails() {
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();
  const router = useRouter();

  return (
    <span className="m-aviso__acao">
      <button
        type="button"
        className="m-botao m-botao--secundario"
        disabled={pendente}
        onClick={() =>
          iniciar(async () => {
            const r = await religarEmailsAction();
            if (r.ok) router.refresh();
            else setErro(r.erro);
          })
        }
      >
        {pendente ? "Religando…" : "Voltar a receber e-mails"}
      </button>
      {erro && <span role="alert">{erro}</span>}
    </span>
  );
}
