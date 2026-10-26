"use client";

import { useState, useTransition } from "react";
import { pedirAvisoBolaoAction } from "@/lib/bolao-publico-actions";

interface Props {
  slug: string;
  // Só participantes ainda sem e-mail (o servidor também rejeita o resto).
  participantes: { id: string; nome: string }[];
}

export default function AvisoBolaoForm({ slug, participantes }: Props) {
  const [participanteId, setParticipanteId] = useState("");
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [pending, startTransition] = useTransition();

  if (participantes.length === 0) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMensagem(null);
    startTransition(async () => {
      const r = await pedirAvisoBolaoAction(slug, participanteId, email);
      if (r.ok) {
        setMensagem({ tipo: "ok", texto: "Pronto! Você receberá o resultado deste bolão por e-mail." });
        setEmail("");
      } else {
        setMensagem({ tipo: "erro", texto: r.erro ?? "Não foi possível salvar." });
      }
    });
  }

  if (mensagem?.tipo === "ok") {
    return <p className="auth-mensagem auth-mensagem--ok">{mensagem.texto}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form bolao-publico__aviso">
      <p className="bloco__nota">
        Quer receber o resultado por e-mail? Escolha o seu nome e deixe seu e-mail — só usamos para
        avisar sobre este bolão.
      </p>
      {mensagem && <p className="auth-mensagem auth-mensagem--erro">{mensagem.texto}</p>}
      <div className="auth-campo">
        <label htmlFor="aviso-participante" className="auth-label">Sou</label>
        <select
          id="aviso-participante"
          className="auth-input"
          value={participanteId}
          onChange={(e) => setParticipanteId(e.target.value)}
          required
        >
          <option value="">Escolha seu nome…</option>
          {participantes.map((p) => (
            <option key={p.id} value={p.id}>{p.nome}</option>
          ))}
        </select>
      </div>
      <div className="auth-campo">
        <label htmlFor="aviso-email" className="auth-label">Seu e-mail</label>
        <input
          id="aviso-email"
          type="email"
          required
          className="auth-input"
          placeholder="voce@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <button type="submit" disabled={pending} className="botao-gerar auth-submit">
        {pending ? "Enviando…" : "Avisar-me do resultado"}
      </button>
    </form>
  );
}
