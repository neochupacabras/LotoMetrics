"use client";

import { useState, useTransition } from "react";
import { atualizarNomeAction } from "@/lib/perfil-actions";

export default function FormNome({ nomeAtual }: { nomeAtual: string }) {
  const [nome, setNome] = useState(nomeAtual);
  const [salvo, setSalvo] = useState(nomeAtual);
  const [mensagem, setMensagem] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [pendente, iniciar] = useTransition();

  const alterado = nome.trim() !== salvo;

  return (
    <form
      className="m-form"
      onSubmit={(e) => {
        e.preventDefault();
        setMensagem(null);
        iniciar(async () => {
          const r = await atualizarNomeAction(nome);
          if (r.ok) {
            setSalvo(r.nome);
            setNome(r.nome);
            setMensagem({ tipo: "ok", texto: "Nome atualizado." });
          } else {
            setMensagem({ tipo: "erro", texto: r.erro });
          }
        });
      }}
    >
      <label className="m-campo">
        <span className="m-campo__rotulo">Como quer ser chamado</span>
        <input
          className="m-campo__entrada"
          name="nome"
          value={nome}
          maxLength={40}
          autoComplete="nickname"
          onChange={(e) => {
            setNome(e.target.value);
            setMensagem(null);
          }}
          aria-describedby="form-nome-msg"
        />
      </label>
      <div className="m-form__rodape">
        <button type="submit" className="m-botao m-botao--secundario" disabled={pendente || !alterado}>
          {pendente ? "Salvando…" : "Salvar nome"}
        </button>
        <p id="form-nome-msg" className="m-form__msg" data-tipo={mensagem?.tipo} role="status" aria-live="polite">
          {mensagem?.texto}
        </p>
      </div>
    </form>
  );
}
