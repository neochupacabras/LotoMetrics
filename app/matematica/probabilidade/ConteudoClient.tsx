"use client";

import Link from "next/link";
import { useState, useCallback } from "react";

function SimuladorMoeda() {
  const [lancamentos, setLancamentos] = useState(0);
  const [caras, setCaras] = useState(0);
  const [historico, setHistorico] = useState<("cara" | "coroa")[]>([]);

  const lancar = useCallback((n: number) => {
    let novaCaras = caras;
    const novos: ("cara" | "coroa")[] = [];
    for (let i = 0; i < n; i++) {
      const r = Math.random() < 0.5 ? "cara" : "coroa";
      if (r === "cara") novaCaras++;
      novos.push(r);
    }
    setCaras(novaCaras);
    setLancamentos(l => l + n);
    setHistorico(h => [...novos.slice(-20), ...h].slice(0, 40));
  }, [caras]);

  const reiniciar = () => { setLancamentos(0); setCaras(0); setHistorico([]); };

  const pct = lancamentos > 0 ? (caras / lancamentos * 100).toFixed(1) : "—";
  const corPct = lancamentos > 0
    ? Math.abs(caras / lancamentos - 0.5) < 0.05 ? "var(--pine)"
    : Math.abs(caras / lancamentos - 0.5) < 0.1 ? "var(--ochre)"
    : "var(--rust)"
    : "var(--ink-faint)";

  return (
    <div className="mat-interativo">
      <p className="mat-interativo__titulo">🪙 Simulador de moeda justa</p>
      <p style={{ fontSize: "0.85rem", color: "var(--ink-soft)", marginBottom: 16 }}>
        Lance a moeda e observe como a proporção de caras se aproxima de 50%
        conforme o número de lançamentos aumenta.
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {[1, 10, 100, 1000].map(n => (
          <button key={n} type="button" className="botao-copiar"
            onClick={() => lancar(n)} style={{ fontSize: "0.85rem" }}>
            +{n} lançamento{n > 1 ? "s" : ""}
          </button>
        ))}
        <button type="button" className="botao-copiar"
          onClick={reiniciar} style={{ fontSize: "0.85rem", color: "var(--rust)" }}>
          Reiniciar
        </button>
      </div>
      <div className="mat-interativo__resultado">
        <div style={{ display: "flex", gap: 32, justifyContent: "center", flexWrap: "wrap" }}>
          <div style={{ textAlign: "center" }}>
            <div className="mat-resultado-numero" style={{ fontSize: "2rem" }}>{lancamentos.toLocaleString("pt-BR")}</div>
            <div className="mat-resultado-desc">lançamentos</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div className="mat-resultado-numero" style={{ fontSize: "2rem", color: corPct }}>{pct}%</div>
            <div className="mat-resultado-desc">caras</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div className="mat-resultado-numero" style={{ fontSize: "2rem" }}>{(lancamentos - caras).toLocaleString("pt-BR")}</div>
            <div className="mat-resultado-desc">coroas</div>
          </div>
        </div>
        {lancamentos > 0 && (
          <div style={{ marginTop: 12 }}>
            <div style={{ height: 12, background: "var(--line)", borderRadius: 6, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${caras/lancamentos*100}%`, background: "var(--pine)", transition: "width 0.3s" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--ink-faint)", marginTop: 4 }}>
              <span>0%</span><span>50%</span><span>100%</span>
            </div>
          </div>
        )}
      </div>
      {historico.length > 0 && (
        <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 4 }}>
          {historico.slice(0, 30).map((r, i) => (
            <span key={i} style={{
              width: 28, height: 28, borderRadius: "50%", display: "inline-flex",
              alignItems: "center", justifyContent: "center",
              background: r === "cara" ? "var(--pine)" : "var(--ochre)",
              color: "#fff", fontSize: "0.65rem", fontFamily: "var(--font-mono)",
            }}>
              {r === "cara" ? "C" : "K"}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

