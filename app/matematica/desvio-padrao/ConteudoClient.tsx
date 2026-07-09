"use client";

import Link from "next/link";
import { useState, useMemo } from "react";

export function VisualizadorDP() {
  const [dispersao, setDispersao] = useState(15);
  const media = 170;
  const dados = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < 60; i++) {
      let v = 0;
      for (let j = 0; j < 6; j++) v += Math.random();
      arr.push(Math.round(media + (v - 3) * dispersao / 1.5));
    }
    return arr;
  }, [dispersao]);

  const dp = Math.sqrt(dados.reduce((s, v) => s + (v - media) ** 2, 0) / dados.length);
  const min = Math.min(...dados), max = Math.max(...dados);
  const range = max - min || 1;

  return (
    <div className="mat-interativo">
      <p className="mat-interativo__titulo">📉 Altura de 60 pessoas (cm)</p>
      <div className="mat-interativo__controles">
        <div className="mat-interativo__campo">
          <label>Dispersão do grupo</label>
          <div className="mat-interativo__slider-wrap">
            <input type="range" min={3} max={30} value={dispersao}
              onChange={e => setDispersao(+e.target.value)} />
            <span className="mat-interativo__valor">{dispersao === 3 ? "Uniforme" : dispersao < 15 ? "Compacto" : dispersao < 25 ? "Normal" : "Disperso"}</span>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 80, marginBottom: 8, padding: "0 4px" }}>
        {dados.map((v, i) => {
          const h = ((v - min) / range) * 70 + 10;
          const dentro1dp = Math.abs(v - media) <= dp;
          return (
            <div key={i} style={{
              flex: 1, height: h, borderRadius: "2px 2px 0 0",
              background: dentro1dp ? "var(--pine)" : "var(--ochre)",
              opacity: 0.8, minWidth: 3,
            }} title={`${v} cm`} />
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", fontSize: "0.78rem", color: "var(--ink-soft)", marginBottom: 12 }}>
        <span>🟢 Dentro de 1 DP da média</span>
        <span>🟡 Fora de 1 DP</span>
      </div>
      <div className="mat-interativo__resultado">
        <div className="mat-resultado-numero">σ = {dp.toFixed(1)} cm</div>
        <div className="mat-resultado-desc">desvio padrão</div>
        <div className="mat-resultado-extra">
          {dp < 8 ? "Grupo muito uniforme — alturas parecidas" : dp < 18 ? "Dispersão normal" : "Grupo muito variado — alturas bem diferentes"}
        </div>
      </div>
    </div>
  );
}

