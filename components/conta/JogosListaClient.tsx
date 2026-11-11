"use client";

import { useId, useState, useTransition } from "react";
import Dezenas from "@/components/Dezenas";
import { IcFechar } from "@/components/membros/Icones";
import { removerJogoAction, atualizarLabelAction, toggleAtivoAction } from "@/lib/jogo-actions";
import { LOTERIAS, isCodigoLoteriaValido } from "@/lib/format";

// Lista de jogos salvos (/conta/jogos), nos padrões da área de membros
// (app/conta/membros.css, classes .m-*). A lógica é a mesma de antes —
// remover com confirmação, nomear, pausar a conferência por e-mail
// (Premium) —, agora com o erro do servidor mostrado e o status desfeito
// quando a ação falha.

interface Jogo {
  id: string;
  loteria: string;
  dezenas: number[];
  label: string | null;
  ativo: boolean;
  criadoEm: string;
}

function nomeLoteria(codigo: string) {
  return isCodigoLoteriaValido(codigo) ? LOTERIAS[codigo].nome : codigo;
}

function CartaoJogo({ jogo, isPremium }: { jogo: Jogo; isPremium: boolean }) {
  const idNome = useId();
  const [editando, setEditando] = useState(false);
  const [label, setLabel] = useState(jogo.label ?? "");
  const [labelSalvo, setLabelSalvo] = useState(jogo.label ?? "");
  const [ativo, setAtivo] = useState(jogo.ativo);
  const [removido, setRemovido] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();

  if (removido) return null;
  const nome = nomeLoteria(jogo.loteria);

  function alternarAtivo() {
    const novo = !ativo;
    setAtivo(novo);
    setErro(null);
    iniciar(async () => {
      const r = await toggleAtivoAction(jogo.id, novo);
      if (!r.ok) {
        setAtivo(!novo);
        setErro(r.erro ?? "Não foi possível mudar agora.");
      }
    });
  }

  function salvarNome() {
    setErro(null);
    iniciar(async () => {
      const r = await atualizarLabelAction(jogo.id, label);
      if (r.ok) {
        setLabelSalvo(label.trim());
        setEditando(false);
      } else {
        setErro(r.erro ?? "Não foi possível salvar o nome.");
      }
    });
  }

  function remover() {
    if (!confirm("Remover este jogo? Esta ação não pode ser desfeita.")) return;
    setErro(null);
    iniciar(async () => {
      const r = await removerJogoAction(jogo.id);
      if (r.ok) setRemovido(true);
      else setErro(r.erro ?? "Não foi possível remover agora.");
    });
  }

  return (
    <li className="m-jogo-cartao" data-ativo={ativo}>
      <div className="m-jogo-cartao__topo">
        <span className="m-jogo-cartao__meta">
          <span className="m-jogo__loteria">{nome}</span>
          <span className="m-jogo-cartao__data">salvo em {jogo.criadoEm}</span>
        </span>
        <span className="m-jogo-cartao__acoes">
          {isPremium && (
            <button
              type="button"
              className="m-jogo-cartao__status"
              onClick={alternarAtivo}
              disabled={pendente}
              aria-pressed={ativo}
              aria-label={ativo ? "Conferência por e-mail ativa — pausar" : "Conferência por e-mail pausada — ativar"}
              title={ativo ? "Pausar a conferência por e-mail" : "Retomar a conferência por e-mail"}
            >
              {ativo ? "Ativo" : "Pausado"}
            </button>
          )}
          <button
            type="button"
            className="m-icone-botao"
            onClick={remover}
            disabled={pendente}
            title="Remover jogo"
            aria-label={`Remover jogo${labelSalvo ? ` “${labelSalvo}”` : ""} da ${nome}`}
          >
            <IcFechar />
          </button>
        </span>
      </div>

      {jogo.loteria === "supersete" ? (
        <p className="m-numero m-jogo-cartao__colunas">{jogo.dezenas.join(" · ")}</p>
      ) : (
        <Dezenas dezenas={jogo.dezenas} tamanho="pequena" />
      )}

      <div className="m-jogo-cartao__rodape">
        {editando ? (
          <form
            className="m-jogo-cartao__form"
            onSubmit={(e) => {
              e.preventDefault();
              salvarNome();
            }}
          >
            <label htmlFor={idNome} className="m-sr">
              Nome do jogo
            </label>
            <input
              id={idNome}
              className="m-campo__entrada"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ex.: jogo da família"
              maxLength={60}
              autoFocus
            />
            <button type="submit" className="m-botao m-botao--secundario" disabled={pendente}>
              Salvar
            </button>
            <button
              type="button"
              className="m-link-botao"
              onClick={() => {
                setLabel(labelSalvo);
                setEditando(false);
              }}
            >
              Cancelar
            </button>
          </form>
        ) : (
          <button type="button" className="m-link-botao" onClick={() => setEditando(true)}>
            {labelSalvo ? `“${labelSalvo}” · editar nome` : "Dar um nome a este jogo"}
          </button>
        )}
        {erro && (
          <p className="m-form__msg" data-tipo="erro" role="alert">
            {erro}
          </p>
        )}
      </div>
    </li>
  );
}

function Grupo({ titulo, lista, isPremium }: { titulo: string; lista: Jogo[]; isPremium: boolean }) {
  if (lista.length === 0) return null;
  return (
    <section className="m-grupo-jogos" aria-label={titulo}>
      <h2 className="m-grupo-jogos__titulo">{titulo}</h2>
      <ul className="m-jogos">
        {lista.map((j) => (
          <CartaoJogo key={j.id} jogo={j} isPremium={isPremium} />
        ))}
      </ul>
    </section>
  );
}

export default function JogosListaClient({ jogos, isPremium }: { jogos: Jogo[]; isPremium: boolean }) {
  // Agrupa por loteria, na ordem em que aparecem (mais recentes primeiro).
  const codigos = [...new Set(jogos.map((j) => j.loteria))];
  return (
    <div className="m-lista-jogos">
      {codigos.map((codigo) => (
        <Grupo
          key={codigo}
          titulo={nomeLoteria(codigo)}
          lista={jogos.filter((j) => j.loteria === codigo)}
          isPremium={isPremium}
        />
      ))}
    </div>
  );
}
