"use client";

import Link from "next/link";
import { useState, useCallback } from "react";

export function SimuladorLGN() {
  const [resultados, setResultados] = useState<number[]>([]);
  const [rodando, setRodando] = useState(false);

  const simular = useCallback(async (total: number) => {
    setRodando(true);
    setResultados([]);
    const lote = 50;
    let soma = 0;
    const novos: number[] = [];
    for (let i = 0; i < total; i += lote) {
      const ate = Math.min(i + lote, total);
      for (let j = i; j < ate; j++) {
        soma += Math.random() < 1/6 ? 1 : 0;
        if (j % Math.max(1, Math.floor(total/40)) === 0 || j === total - 1) {
          novos.push(soma / (j + 1));
        }
      }
      setResultados([...novos]);
      await new Promise(r => setTimeout(r, 10));
    }
    setRodando(false);
  }, []);

  const ultimo = resultados[resultados.length - 1];
  const pct = ultimo !== undefined ? (ultimo * 100).toFixed(2) : "—";

  return (
    <div className="mat-interativo">
      <p className="mat-interativo__titulo">🎲 Dado honesto — frequência do número 1</p>
      <p style={{ fontSize: "0.85rem", color: "var(--ink-soft)", marginBottom: 14 }}>
        A chance teórica de sair 1 num dado é 1/6 ≈ 16,67%. Veja como a frequência
        real converge para esse valor conforme o número de lançamentos aumenta.
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {[100, 1000, 10000, 100000].map(n => (
          <button key={n} type="button" className="botao-copiar"
            onClick={() => simular(n)} disabled={rodando}
            style={{ fontSize: "0.82rem" }}>
            {n.toLocaleString("pt-BR")} lançamentos
          </button>
        ))}
      </div>
      {resultados.length > 0 && (
        <>
          <div style={{ position: "relative", height: 120, background: "color-mix(in srgb, var(--pine) 5%, transparent)", borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
            {/* Linha de referência 1/6 */}
            <div style={{ position: "absolute", left: 0, right: 0, top: `${(1 - 1/6) * 100}%`, borderTop: "2px dashed var(--pine)", opacity: 0.5 }} />
            <div style={{ position: "absolute", right: 8, top: `${(1 - 1/6) * 100}%`, transform: "translateY(-14px)", fontSize: "0.7rem", color: "var(--pine)", fontFamily: "var(--font-mono)" }}>16,67%</div>
            {/* Linha do histórico */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} preserveAspectRatio="none" viewBox={`0 0 ${resultados.length} 1`}>
              <polyline
                points={resultados.map((v, i) => `${i},${1 - v}`).join(" ")}
                fill="none" stroke="var(--rust)" strokeWidth="0.015"
              />
            </svg>
          </div>
          <div className="mat-interativo__resultado">
            <div className="mat-resultado-numero" style={{ color: Math.abs((ultimo ?? 0) - 1/6) < 0.01 ? "var(--pine)" : "var(--ochre)" }}>
              {pct}%
            </div>
            <div className="mat-resultado-desc">frequência do 1 (esperado: 16,67%)</div>
          </div>
        </>
      )}
    </div>
  );
}

