"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { salvarJogoAction } from "@/lib/jogo-actions";

const LOTERIAS = [
  { codigo: "lotofacil",     nome: "Lotofácil",   min: 1,  max: 25, qtd: 15 },
  { codigo: "megasena",      nome: "Mega-Sena",   min: 1,  max: 60, qtd: 6  },
  { codigo: "quina",         nome: "Quina",        min: 1,  max: 80, qtd: 5  },
  { codigo: "lotomania",     nome: "Lotomania",    min: 0,  max: 99, qtd: 50 },
  { codigo: "diadesorte",    nome: "Dia de Sorte", min: 1,  max: 31, qtd: 7  },
  { codigo: "maismilionaria",nome: "+Milionária",  min: 1,  max: 50, qtd: 6  },
  { codigo: "timemania",     nome: "Timemania",    min: 1,  max: 80, qtd: 10 },
  { codigo: "duplasena",     nome: "Dupla Sena",   min: 1,  max: 50, qtd: 6  },
  { codigo: "supersete",     nome: "Super Sete",   min: 0,  max: 9,  qtd: 7  },
];

// Loterias com mecânica especial que exige nota na interface
const NOTAS: Record<string, string> = {
  lotomania: "Na Lotomania você marca 50 dezenas — a Caixa sorteia 20. Selecione exatamente 50.",
  supersete: "Na Super Sete cada dezena representa uma coluna (C1 a C7). Dezenas podem se repetir.",
  maismilionaria: "O jogo tem 6 dezenas (1–50). Os 2 trevos (1–6) são sorteados automaticamente.",
};

function formatarDezena(n: number, max: number) {
  return max > 9 ? String(n).padStart(2, "0") : String(n);
}

export default function NovoJogoClient() {
  const [loteria, setLoteria] = useState(LOTERIAS[0]);
  const [selecionadas, setSelecionadas] = useState<Set<number>>(new Set());
  const [label, setLabel] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const todas = useMemo(
    () => Array.from({ length: loteria.max - loteria.min + 1 }, (_, i) => i + loteria.min),
    [loteria]
  );

  function selecionarLoteria(codigo: string) {
    const l = LOTERIAS.find(l => l.codigo === codigo)!;
    setLoteria(l);
    setSelecionadas(new Set());
    setErro(null);
  }

  function toggle(d: number) {
    setSelecionadas(prev => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d);
      else if (next.size < loteria.qtd) next.add(d);
      return next;
    });
  }

  function handleSalvar() {
    if (selecionadas.size !== loteria.qtd) {
      setErro(`Selecione exatamente ${loteria.qtd} dezenas.`);
      return;
    }
    setErro(null);
    const dezenas = Array.from(selecionadas).sort((a, b) => a - b);
    startTransition(async () => {
      const res = await salvarJogoAction(loteria.codigo, dezenas, label);
      if (res.ok) {
        router.push("/conta/jogos");
      } else {
        setErro(res.erro ?? "Erro ao salvar.");
      }
    });
  }

  const completo = selecionadas.size === loteria.qtd;
  const nota = NOTAS[loteria.codigo];

  return (
    <div className="novo-jogo-form">
      {/* Seletor de loteria */}
      <div className="novo-jogo-loterias">
        {LOTERIAS.map(l => (
          <button
            key={l.codigo}
            type="button"
            className="modo-toggle__botao"
            data-ativo={loteria.codigo === l.codigo}
            onClick={() => selecionarLoteria(l.codigo)}
          >
            {l.nome}
          </button>
        ))}
      </div>

      {/* Nota especial */}
      {nota && (
        <p className="aviso-legal" style={{ marginBottom: 16, marginTop: 4 }}>
          {nota}
        </p>
      )}

      {/* Grade de dezenas */}
      <div className="grade-dezenas">
        {todas.map(d => (
          <button
            key={d}
            type="button"
            className="dezena-selecionavel"
            data-selecionada={selecionadas.has(d)}
            disabled={!selecionadas.has(d) && selecionadas.size >= loteria.qtd}
            onClick={() => toggle(d)}
          >
            {formatarDezena(d, loteria.max)}
          </button>
        ))}
      </div>

      {/* Progresso */}
      <div className="analisador-progresso-wrapper">
        <div className="analisador-progresso-fundo">
          <div
            className="analisador-progresso-fill"
            data-completo={completo}
            style={{ width: `${(selecionadas.size / loteria.qtd) * 100}%` }}
          />
        </div>
        <span className="analisador-progresso-label">
          {selecionadas.size} de {loteria.qtd} dezenas
        </span>
      </div>

      {/* Nome do jogo (opcional) */}
      <div className="auth-campo" style={{ maxWidth: 340, marginTop: 20 }}>
        <label htmlFor="label" className="auth-label">Nome do jogo (opcional)</label>
        <input
          id="label"
          type="text"
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder="ex: Jogo da família, Números da sorte…"
          className="auth-input"
          maxLength={60}
        />
      </div>

      {erro && <p className="simulador-erro">{erro}</p>}

      <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
        <button
          type="button"
          className="botao-gerar"
          disabled={!completo || pending}
          onClick={handleSalvar}
        >
          {pending ? "Salvando…" : "Salvar jogo →"}
        </button>
        <button
          type="button"
          className="botao-copiar"
          onClick={() => setSelecionadas(new Set())}
        >
          Limpar
        </button>
      </div>
    </div>
  );
}
