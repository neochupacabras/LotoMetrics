"use client";

import { useState, useTransition } from "react";
import { entrarNaListaEsperaAction } from "@/lib/lista-espera-actions";

interface Props {
  origem: string;
  loteria?: string;
  titulo?: string;
  descricao?: string;
}

// Captura de e-mail sem login (tarefa 2.2 do plano de implementação) —
// mesmo padrão visual de components/auth/AuthForm.tsx (auth-form/auth-
// campo/auth-input), reaproveitado aqui em vez de criar classes novas.
export default function ListaEsperaBolao({
  origem,
  loteria,
  titulo = "Quero organizar meu bolão",
  descricao = "Deixe seu e-mail e avisamos assim que o link de bolão compartilhável estiver pronto — sem spam, um e-mail só quando lançar.",
}: Props) {
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState<{ tipo: "erro" | "ok"; texto: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensagem(null);
    startTransition(async () => {
      const resultado = await entrarNaListaEsperaAction(email, origem, loteria ?? null);
      if (resultado.ok) {
        setMensagem({ tipo: "ok", texto: "Pronto! Você está na lista — avisamos por e-mail assim que lançar." });
        setEmail("");
      } else {
        setMensagem({ tipo: "erro", texto: resultado.erro ?? "Não foi possível salvar. Tente de novo." });
      }
    });
  }

  return (
    <div className="lista-espera-bolao">
      <p className="lista-espera-bolao__titulo">{titulo}</p>
      <p className="lista-espera-bolao__desc">{descricao}</p>

      {mensagem?.tipo === "ok" ? (
        <p className="auth-mensagem auth-mensagem--ok">{mensagem.texto}</p>
      ) : (
        <form onSubmit={handleSubmit} className="auth-form lista-espera-bolao__form">
          {mensagem && <p className="auth-mensagem auth-mensagem--erro">{mensagem.texto}</p>}
          <div className="auth-campo">
            <label htmlFor={`lista-espera-email-${origem}`} className="auth-label">
              Seu e-mail
            </label>
            <input
              id={`lista-espera-email-${origem}`}
              type="email"
              required
              placeholder="voce@exemplo.com"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button type="submit" disabled={isPending} className="botao-gerar auth-submit">
            {isPending ? "Enviando…" : "Quero entrar na lista →"}
          </button>
        </form>
      )}
    </div>
  );
}
