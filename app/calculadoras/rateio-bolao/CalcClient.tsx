"use client";
import { useState, useMemo } from "react";

interface Participante {
  id: string;
  nome: string;
  cotas: number;
}

function fmtBRL(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

let proximoId = 4;

export function CalcRateioBolao() {
  const [valorPremio, setValorPremio] = useState("100000");
  const [participantes, setParticipantes] = useState<Participante[]>([
    { id: "1", nome: "Participante 1", cotas: 1 },
    { id: "2", nome: "Participante 2", cotas: 1 },
    { id: "3", nome: "Participante 3", cotas: 1 },
  ]);

  const premio = parseFloat(valorPremio.replace(",", ".")) || 0;
  const totalCotas = useMemo(() => participantes.reduce((s, p) => s + (p.cotas || 0), 0), [participantes]);
  const valorPorCota = totalCotas > 0 ? premio / totalCotas : 0;

  function addParticipante() {
    const id = String(proximoId++);
    setParticipantes(p => [...p, { id, nome: `Participante ${p.length + 1}`, cotas: 1 }]);
  }

  function removerParticipante(id: string) {
    setParticipantes(p => p.filter(x => x.id !== id));
  }

  function atualizar(id: string, campo: "nome" | "cotas", valor: string) {
    setParticipantes(p => p.map(x =>
      x.id === id
        ? { ...x, [campo]: campo === "cotas" ? Math.max(0, +valor || 0) : valor }
        : x
    ));
  }

  return (
    <div className="calc-painel">
      <div className="calc-painel__corpo">
        <div className="calc-campo">
          <label>Valor total do prêmio (R$)</label>
          <input
            className="calc-input calc-input--destaque"
            type="text"
            inputMode="decimal"
            value={valorPremio}
            onChange={e => setValorPremio(e.target.value)}
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <label style={{ display: "block", marginBottom: 8, fontSize: "0.85rem", color: "var(--ink-soft)" }}>
            Participantes e cotas
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {participantes.map(p => (
              <div key={p.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  className="calc-input"
                  type="text"
                  value={p.nome}
                  onChange={e => atualizar(p.id, "nome", e.target.value)}
                  style={{ flex: 2 }}
                />
                <input
                  className="calc-input"
                  type="number"
                  min={0}
                  value={p.cotas}
                  onChange={e => atualizar(p.id, "cotas", e.target.value)}
                  style={{ flex: 1, minWidth: 60 }}
                  title="Número de cotas"
                />
                <button
                  type="button"
                  onClick={() => removerParticipante(p.id)}
                  className="botao-copiar"
                  style={{ fontSize: "0.78rem", padding: "6px 10px" }}
                  aria-label="Remover participante"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addParticipante} className="botao-copiar" style={{ marginTop: 10, fontSize: "0.82rem" }}>
            + Adicionar participante
          </button>
        </div>
      </div>

      <div className="calc-painel__resultado calc-painel__resultado--pine">
        <div className="calc-resultado-label">Valor por cota</div>
        <div className="calc-resultado-numero calc-resultado-numero--pine">{fmtBRL(valorPorCota)}</div>
        <div className="calc-resultado-extra">{totalCotas} cotas no total, prêmio de {fmtBRL(premio)}</div>

        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
          {participantes.map(p => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", padding: "6px 0", borderBottom: "1px solid var(--line)" }}>
              <span>{p.nome || "—"} ({p.cotas} {p.cotas === 1 ? "cota" : "cotas"})</span>
              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{fmtBRL(p.cotas * valorPorCota)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
