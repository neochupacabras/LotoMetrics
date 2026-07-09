"use client";
import { useState } from "react";

const AFIRMACOES = [
  { texto: "Todos os cachorros são animais.", verdadeiro: true },
  { texto: "Logo, todos os animais são cachorros.", verdadeiro: false, erro: "Subconjunto não implica igualdade!" },
  { texto: "Se chove, o chão fica molhado. O chão está molhado. Logo, choveu.", verdadeiro: false, erro: "Falácia da afirmação do consequente — pode ter sido uma torneira." },
  { texto: "Se chove, o chão fica molhado. O chão não está molhado. Logo, não choveu.", verdadeiro: true },
  { texto: "Todo número par é divisível por 2. 8 é par. Logo, 8 é divisível por 2.", verdadeiro: true },
];

export function TesteLogica() {
  const [respostas, setRespostas] = useState<(boolean | null)[]>(Array(AFIRMACOES.length).fill(null));

  const responder = (i: number, v: boolean) => {
    setRespostas(prev => { const novo = [...prev]; novo[i] = v; return novo; });
  };

  const corretas = respostas.filter((r, i) => r === AFIRMACOES[i].verdadeiro).length;
  const respondidas = respostas.filter(r => r !== null).length;

  return (
    <div className="mat-interativo">
      <p className="mat-interativo__titulo">🔵 Verdadeiro ou Falso? — teste de lógica</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {AFIRMACOES.map((a, i) => {
          const resp = respostas[i];
          const correta = resp === a.verdadeiro;
          return (
            <div key={i} style={{ padding: "12px 16px", borderRadius: 4,
              background: resp === null ? "var(--paper-raised)" :
                correta ? "color-mix(in srgb, var(--pine) 10%, transparent)" :
                "color-mix(in srgb, var(--rust) 10%, transparent)",
              border: `1px solid ${resp === null ? "var(--line-strong)" : correta ? "var(--pine)" : "var(--rust)"}` }}>
              <p style={{ fontSize: "0.9rem", marginBottom: 10 }}>{a.texto}</p>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => responder(i, true)}
                  style={{ padding: "4px 14px", borderRadius: 3, border: "1px solid var(--pine)",
                    background: resp === true ? "var(--pine)" : "transparent",
                    color: resp === true ? "#fff" : "var(--pine)", cursor: "pointer", fontSize: "0.82rem" }}>
                  Verdadeiro
                </button>
                <button type="button" onClick={() => responder(i, false)}
                  style={{ padding: "4px 14px", borderRadius: 3, border: "1px solid var(--rust)",
                    background: resp === false ? "var(--rust)" : "transparent",
                    color: resp === false ? "#fff" : "var(--rust)", cursor: "pointer", fontSize: "0.82rem" }}>
                  Falso
                </button>
                {resp !== null && !correta && a.erro && (
                  <span style={{ fontSize: "0.78rem", color: "var(--rust)", alignSelf: "center" }}>⚠️ {a.erro}</span>
                )}
                {resp !== null && correta && (
                  <span style={{ fontSize: "0.78rem", color: "var(--pine)", alignSelf: "center" }}>✓ Correto!</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {respondidas === AFIRMACOES.length && (
        <div className="mat-interativo__resultado" style={{ marginTop: 16 }}>
          <div className="mat-resultado-numero">{corretas}/{AFIRMACOES.length}</div>
          <div className="mat-resultado-desc">acertos</div>
          <div className="mat-resultado-extra">
            {corretas === AFIRMACOES.length ? "Perfeito! Você domina lógica proposicional." :
             corretas >= 3 ? "Bom! Revise os que errou acima." :
             "Não se preocupe — lógica formal tem armadilhas para todos."}
          </div>
        </div>
      )}
    </div>
  );
}
