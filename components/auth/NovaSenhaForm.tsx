"use client";

import { useState, useTransition } from "react";
import { updatePassword } from "@/lib/auth-actions";

const MINIMO = 6; // mesma regra do Supabase Auth (ver traduzirErroAuth)

// Formulário da nova senha (destino do link de "esqueci a senha"). Usa a
// sessão que /auth/callback acabou de abrir; em caso de sucesso, a action
// updatePassword redireciona para /conta.
export default function NovaSenhaForm() {
  const [erro, setErro] = useState<string | null>(null);
  const [mostrar, setMostrar] = useState(false);
  const [pendente, iniciar] = useTransition();

  return (
    <form
      className="auth-form"
      onSubmit={(e) => {
        e.preventDefault();
        const dados = new FormData(e.currentTarget);
        const senha = String(dados.get("password") ?? "");
        if (senha.length < MINIMO) {
          setErro(`A senha precisa ter pelo menos ${MINIMO} caracteres.`);
          return;
        }
        if (senha !== String(dados.get("confirmacao") ?? "")) {
          setErro("As duas senhas não são iguais.");
          return;
        }
        setErro(null);
        iniciar(async () => {
          const r = await updatePassword(dados);
          if (r?.error) setErro(r.error);
        });
      }}
    >
      {erro && (
        <p className="auth-mensagem auth-mensagem--erro" role="alert">
          {erro}
        </p>
      )}

      <div className="auth-campo">
        <label htmlFor="password" className="auth-label">Nova senha</label>
        <div className="auth-senha">
          <input
            id="password"
            name="password"
            type={mostrar ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={MINIMO}
            placeholder="Mínimo 6 caracteres"
            className="auth-input auth-input--senha"
          />
          <button
            type="button"
            className="auth-senha__toggle"
            onClick={() => setMostrar((v) => !v)}
            aria-pressed={mostrar}
            aria-label={mostrar ? "Ocultar senha" : "Mostrar senha"}
          >
            {mostrar ? "Ocultar" : "Mostrar"}
          </button>
        </div>
      </div>

      <div className="auth-campo">
        <label htmlFor="confirmacao" className="auth-label">Repita a nova senha</label>
        <input
          id="confirmacao"
          name="confirmacao"
          type={mostrar ? "text" : "password"}
          autoComplete="new-password"
          required
          minLength={MINIMO}
          className="auth-input"
        />
      </div>

      <button type="submit" className="botao-gerar auth-submit" disabled={pendente}>
        {pendente ? "Salvando…" : "Salvar nova senha"}
      </button>
    </form>
  );
}
