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
              aria-pressed={ativo}
              aria-label={ativo ? "Conferência por e-mail ativa — pausar" : "Conferência por e-mail pausada — ativar"}
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
            aria-label={`Remover jogo${label ? ` “${label}”` : ""} da ${nomeLoteria(jogo.loteria)}`}
          >
            <span aria-hidden>✕</span>
          </button>
        </div>
      </div>

      <div className="jogo-card__dezenas">
        {/* key por posição: no Super Sete os dígitos se repetem entre colunas */}
        {jogo.dezenas.map((d, i) => (
          <span key={i} className="jogo-card__dezena">{jogo.loteria === "supersete" ? d : formatarDezena(d)}</span>
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
            {label ? `“${label}”` : "Adicionar nome"}
          </button>
        )}
      </div>
    </div>
  );
}

// Fora do componente pai: declarado dentro, ele era recriado a cada render
// e remontava todos os cartões (perdendo o estado de edição do nome).
function Grupo({ titulo, lista, isPremium }: { titulo: string; lista: Jogo[]; isPremium: boolean }) {
  if (lista.length === 0) return null;
  return (
    <section className="jogos-grupo">
      <h2 className="jogos-grupo__titulo">{titulo}</h2>
      <div className="jogos-grade">
        {lista.map(j => (
          <JogoCard key={j.id} jogo={j} isPremium={isPremium} />
        ))}
      </div>
    </section>
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

  return (
    <div className="jogos-lista">
      {loteriasCodigos.map(codigo => (
        <Grupo
          key={codigo}
          titulo={nomeLoteria(codigo)}
          lista={jogos.filter(j => j.loteria === codigo)}
          isPremium={isPremium}
        />
      ))}
    </div>
  );
}
