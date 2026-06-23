"use client";

import { useState, useTransition } from "react";
import { signIn, signUp, forgotPassword } from "@/lib/auth-actions";

type Modo = "entrar" | "cadastrar" | "esqueci-senha";

export default function AuthForm({
  modo,
  next,
}: {
  modo: Modo;
  next?: string;
}) {
  const [mensagem, setMensagem] = useState<{ tipo: "erro" | "ok"; texto: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensagem(null);
    const fd = new FormData(e.currentTarget);
    if (next) fd.set("next", next);

    startTransition(async () => {
      let resultado: { error?: string; success?: string } = {};

      if (modo === "entrar")        resultado = await signIn(fd);
      else if (modo === "cadastrar") resultado = await signUp(fd);
      else                           resultado = await forgotPassword(fd);

      if (resultado?.error)   setMensagem({ tipo: "erro", texto: resultado.error });
      if (resultado?.success) setMensagem({ tipo: "ok",   texto: resultado.success });
    });
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {mensagem && (
        <p className={`auth-mensagem auth-mensagem--${mensagem.tipo}`}>
          {mensagem.texto}
        </p>
      )}

      {modo === "cadastrar" && (
        <div className="auth-campo">
          <label htmlFor="name" className="auth-label">Nome</label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder="Seu nome"
            className="auth-input"
          />
        </div>
      )}

      <div className="auth-campo">
        <label htmlFor="email" className="auth-label">E-mail</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="seu@email.com"
          className="auth-input"
        />
      </div>

      {modo !== "esqueci-senha" && (
        <div className="auth-campo">
          <label htmlFor="password" className="auth-label">Senha</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={modo === "entrar" ? "current-password" : "new-password"}
            required
            minLength={6}
            placeholder={modo === "cadastrar" ? "Mínimo 6 caracteres" : "••••••••"}
            className="auth-input"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="botao-gerar auth-submit"
      >
        {isPending
          ? "Aguarde..."
          : modo === "entrar"
          ? "Entrar"
          : modo === "cadastrar"
          ? "Criar conta"
          : "Enviar instruções"}
      </button>
    </form>
  );
}
