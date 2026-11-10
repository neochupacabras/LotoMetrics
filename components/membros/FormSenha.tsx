"use client";

import { useState, useTransition } from "react";
import { updatePassword } from "@/lib/auth-actions";

const MINIMO = 6; // mesma regra do Supabase Auth (ver traduzirErroAuth)

// Troca de senha com a sessão atual. Serve tanto para quem chegou pelo link
// de "esqueci a senha" (/conta/nova-senha) quanto para quem quer trocar a
// senha em Perfil e segurança. Em caso de sucesso, a action redireciona.
export default function FormSenha({ rotuloBotao = "Salvar nova senha" }: { rotuloBotao?: string }) {
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();

  return (
    <form
      className="m-form"
      onSubmit={(e) => {
        e.preventDefault();
        const dados = new FormData(e.currentTarget);
        const senha = String(dados.get("password") ?? "");
        const confirmacao = String(dados.get("confirmacao") ?? "");
        if (senha.length < MINIMO) {
          setErro(`A senha precisa ter pelo menos ${MINIMO} caracteres.`);
          return;
        }
        if (senha !== confirmacao) {
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
      <label className="m-campo">
        <span className="m-campo__rotulo">Nova senha</span>
        <input
          className="m-campo__entrada"
          type="password"
          name="password"
          autoComplete="new-password"
          minLength={MINIMO}
          required
          aria-describedby="form-senha-msg"
        />
      </label>
      <label className="m-campo">
        <span className="m-campo__rotulo">Repita a nova senha</span>
        <input
          className="m-campo__entrada"
          type="password"
          name="confirmacao"
          autoComplete="new-password"
          minLength={MINIMO}
          required
          aria-describedby="form-senha-msg"
        />
      </label>
      <div className="m-form__rodape">
        <button type="submit" className="m-botao" disabled={pendente}>
          {pendente ? "Salvando…" : rotuloBotao}
        </button>
        <p id="form-senha-msg" className="m-form__msg" data-tipo={erro ? "erro" : undefined} role="status" aria-live="polite">
          {erro}
        </p>
      </div>
    </form>
  );
}
