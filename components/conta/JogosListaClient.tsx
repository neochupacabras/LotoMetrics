"use client";

import { useState, useTransition } from "react";
import { removerJogoAction, atualizarLabelAction, toggleAtivoAction } from "@/lib/jogo-actions";

interface Jogo {
  id: string;
  loteria: string;
  dezenas: number[];
  label: string | null;
  ativo: boolean;
  criadoEm: string;
}

function formatarDezena(n: number) {
  return String(n).padStart(2, "0");
}

const NOMES_LOTERIA: Record<string, string> = {
  lotofacil:     "Lotofácil",
  megasena:      "Mega-Sena",
  quina:         "Quina",
  lotomania:     "Lotomania",
  diadesorte:    "Dia de Sorte",
  maismilionaria:"+Milionária",
  timemania:     "Timemania",
  duplasena:     "Dupla Sena",
  supersete:     "Super Sete",
};
function nomeLoteria(codigo: string) {
  return NOMES_LOTERIA[codigo] ?? codigo;
}

function JogoCard({ jogo, isPremium }: { jogo: Jogo; isPremium: boolean }) {
  const [editando, setEditando] = useState(false);
  const [label, setLabel] = useState(jogo.label ?? "");
  const [ativo, setAtivo] = useState(jogo.ativo);
  const [removido, setRemovido] = useState(false);
  const [pending, startTransition] = useTransition();

  if (removido) return null;

  function handleToggle() {
    const novoAtivo = !ativo;
    setAtivo(novoAtivo);
    startTransition(async () => {
      await toggleAtivoAction(jogo.id, novoAtivo);
    });
  }

  function handleSalvarLabel() {
    startTransition(async () => {
      await atualizarLabelAction(jogo.id, label);
      setEditando(false);
    });
  }

  function handleRemover() {
    if (!confirm("Remover este jogo? Esta ação não pode ser desfeita.")) return;
    startTransition(async () => {
      const res = await removerJogoAction(jogo.id);
      if (res.ok) setRemovido(true);
    });
  }

  return (
    <div className={`jogo-card ${!ativo ? "jogo-card--inativo" : ""}`}>
      <div className="jogo-card__header">
        <div className="jogo-card__meta">
          <span className="jogo-card__loteria">{nomeLoteria(jogo.loteria)}</span>
          <span className="jogo-card__data">{jogo.criadoEm}</span>
        </div>
        <div className="jogo-card__acoes">
          {isPremium && (
            <button
              type="button"
              className={`jogo-card__toggle ${ativo ? "" : "jogo-card__toggle--off"}`}
              onClick={handleToggle}
              disabled={pending}
              title={ativo ? "Desativar rastreamento" : "Ativar rastreamento"}
            >
              {ativo ? "Ativo" : "Pausado"}
            </button>
          )}
          <button
            type="button"
            className="jogo-card__btn-remover"
            onClick={handleRemover}
            disabled={pending}
            title="Remover jogo"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="jogo-card__dezenas">
        {jogo.dezenas.map(d => (
          <span key={d} className="jogo-card__dezena">{formatarDezena(d)}</span>
        ))}
      </div>

      <div className="jogo-card__footer">
        {editando ? (
          <div className="jogo-card__editar-label">
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="Nome do jogo (ex: Jogo da família)"
              className="auth-input jogo-card__label-input"
              maxLength={60}
              autoFocus
            />
            <button
              type="button"
              className="botao-copiar"
              onClick={handleSalvarLabel}
              disabled={pending}
            >
              Salvar
            </button>
            <button
              type="button"
              className="botao-copiar"
              onClick={() => { setLabel(jogo.label ?? ""); setEditando(false); }}
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="jogo-card__label-btn"
            onClick={() => setEditando(true)}
          >
            {label ? `"${label}"` : "Adicionar nome →"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function JogosListaClient({
  jogos,
  isPremium,
}: {
  jogos: Jogo[];
  isPremium: boolean;
}) {
  // Agrupar jogos por loteria dinamicamente
  const loteriasCodigos = [...new Set(jogos.map(j => j.loteria))];

  function Grupo({ titulo, lista }: { titulo: string; lista: Jogo[] }) {
    if (lista.length === 0) return null;
    return (
      <div className="jogos-grupo">
        <h2 className="jogos-grupo__titulo">{titulo}</h2>
        <div className="jogos-grade">
          {lista.map(j => (
            <JogoCard key={j.id} jogo={j} isPremium={isPremium} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="jogos-lista">
      {loteriasCodigos.map(codigo => (
        <Grupo
          key={codigo}
          titulo={nomeLoteria(codigo)}
          lista={jogos.filter(j => j.loteria === codigo)}
        />
      ))}
    </div>
  );
}
