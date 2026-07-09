"use client";
import { useState } from "react";

export function ComparadorPizza() {
  const [diam1, setDiam1] = useState(25);
  const [preco1, setPreco1] = useState(25);
  const [diam2, setDiam2] = useState(35);
  const [preco2, setPreco2] = useState(45);

  const area1 = Math.PI * (diam1 / 2) ** 2;
  const area2 = Math.PI * (diam2 / 2) ** 2;
  const custoPorCm1 = preco1 / area1;
  const custoPorCm2 = preco2 / area2;
  const melhor = custoPorCm1 <= custoPorCm2 ? 1 : 2;
  const economiaP = melhor === 2
    ? ((custoPorCm1 - custoPorCm2) / custoPorCm1 * 100).toFixed(0)
    : ((custoPorCm2 - custoPorCm1) / custoPorCm2 * 100).toFixed(0);

  const maxArea = Math.max(area1, area2);
  const r1svg = Math.sqrt(area1 / maxArea) * 80;
  const r2svg = Math.sqrt(area2 / maxArea) * 80;

  return (
    <div className="mat-interativo">
      <p className="mat-interativo__titulo">🍕 Qual pizza é melhor negócio?</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div>
          <p style={{ fontWeight: 600, marginBottom: 8, fontSize: "0.9rem" }}>Pizza P</p>
          <div className="mat-interativo__campo">
            <label>Diâmetro (cm)</label>
            <div className="mat-interativo__slider-wrap">
              <input type="range" min={15} max={40} value={diam1}
                onChange={e => setDiam1(+e.target.value)} />
              <span className="mat-interativo__valor">{diam1}cm</span>
            </div>
          </div>
          <div className="mat-interativo__campo">
            <label>Preço (R$)</label>
            <div className="mat-interativo__slider-wrap">
              <input type="range" min={10} max={80} value={preco1}
                onChange={e => setPreco1(+e.target.value)} />
              <span className="mat-interativo__valor">R${preco1}</span>
            </div>
          </div>
        </div>
        <div>
          <p style={{ fontWeight: 600, marginBottom: 8, fontSize: "0.9rem" }}>Pizza G</p>
          <div className="mat-interativo__campo">
            <label>Diâmetro (cm)</label>
            <div className="mat-interativo__slider-wrap">
              <input type="range" min={15} max={50} value={diam2}
                onChange={e => setDiam2(+e.target.value)} />
              <span className="mat-interativo__valor">{diam2}cm</span>
            </div>
          </div>
          <div className="mat-interativo__campo">
            <label>Preço (R$)</label>
            <div className="mat-interativo__slider-wrap">
              <input type="range" min={10} max={120} value={preco2}
                onChange={e => setPreco2(+e.target.value)} />
              <span className="mat-interativo__valor">R${preco2}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visualização circular proporcional */}
      <svg viewBox="0 0 300 180" style={{ width: "100%", maxWidth: 300, display: "block", margin: "0 auto 12px" }}>
        <circle cx={80} cy={90} r={r1svg}
          fill={melhor === 1 ? "var(--pine)" : "var(--ochre)"} opacity={0.3} />
        <circle cx={80} cy={90} r={r1svg}
          fill="none" stroke={melhor === 1 ? "var(--pine)" : "var(--ochre)"} strokeWidth={2} />
        <text x={80} y={90} textAnchor="middle" dominantBaseline="middle"
          fontSize={10} fill="var(--ink)" fontFamily="var(--font-mono)">P</text>

        <circle cx={210} cy={90} r={r2svg}
          fill={melhor === 2 ? "var(--pine)" : "var(--ochre)"} opacity={0.3} />
        <circle cx={210} cy={90} r={r2svg}
          fill="none" stroke={melhor === 2 ? "var(--pine)" : "var(--ochre)"} strokeWidth={2} />
        <text x={210} y={90} textAnchor="middle" dominantBaseline="middle"
          fontSize={10} fill="var(--ink)" fontFamily="var(--font-mono)">G</text>
      </svg>

      <div className="mat-interativo__resultado">
        <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}>R$/cm² — Pizza P</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: melhor === 1 ? "var(--pine)" : "var(--rust)" }}>
              R${(custoPorCm1 * 100).toFixed(2)}/100cm²
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}>R$/cm² — Pizza G</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: melhor === 2 ? "var(--pine)" : "var(--rust)" }}>
              R${(custoPorCm2 * 100).toFixed(2)}/100cm²
            </div>
          </div>
        </div>
        <div className="mat-resultado-extra" style={{ marginTop: 10, color: "var(--pine)" }}>
          ✓ Pizza {melhor === 1 ? "P" : "G"} é {economiaP}% mais barata por cm² de pizza
        </div>
      </div>
    </div>
  );
}
