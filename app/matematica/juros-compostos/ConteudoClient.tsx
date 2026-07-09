"use client";
import { useState } from "react";

export function SimuladorJuros() {
  const [capital, setCapital] = useState(1000);
  const [taxa, setTaxa] = useState(10);
  const [anos, setAnos] = useState(10);
  const [tipo, setTipo] = useState<"composto" | "simples">("composto");

  const simples   = capital * (1 + (taxa / 100) * anos);
  const composto  = capital * Math.pow(1 + taxa / 100, anos);
  const diferenca = composto - simples;

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  const anos_arr = Array.from({ length: Math.min(anos, 40) + 1 }, (_, i) => i);
  const maxVal = capital * Math.pow(1 + taxa / 100, Math.min(anos, 40));

  return (
    <div className="mat-interativo">
      <p className="mat-interativo__titulo">📈 Juros simples vs compostos</p>
      <div className="mat-interativo__controles">
        <div className="mat-interativo__campo">
          <label>Capital inicial (R$)</label>
          <div className="mat-interativo__slider-wrap">
            <input type="range" min={100} max={100000} step={100} value={capital}
              onChange={e => setCapital(+e.target.value)} />
            <span className="mat-interativo__valor">{fmt(capital)}</span>
          </div>
        </div>
        <div className="mat-interativo__campo">
          <label>Taxa ao ano (%)</label>
          <div className="mat-interativo__slider-wrap">
            <input type="range" min={1} max={100} value={taxa}
              onChange={e => setTaxa(+e.target.value)} />
            <span className="mat-interativo__valor">{taxa}%</span>
          </div>
        </div>
        <div className="mat-interativo__campo">
          <label>Período (anos)</label>
          <div className="mat-interativo__slider-wrap">
            <input type="range" min={1} max={40} value={anos}
              onChange={e => setAnos(+e.target.value)} />
            <span className="mat-interativo__valor">{anos} anos</span>
          </div>
        </div>
      </div>

      {/* Gráfico comparativo */}
      <div style={{ position: "relative", height: 100, marginBottom: 12, display: "flex", alignItems: "flex-end", gap: 1 }}>
        {anos_arr.map(a => {
          const hs = ((capital * (1 + (taxa/100) * a)) / maxVal) * 90;
          const hc = ((capital * Math.pow(1 + taxa/100, a)) / maxVal) * 90;
          return (
            <div key={a} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: 100 }}>
              <div style={{ width: "100%", background: "var(--ochre)", opacity: 0.5, height: hs, borderRadius: "2px 2px 0 0" }} />
            </div>
          );
        })}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", alignItems: "flex-end", gap: 1 }}>
          {anos_arr.map(a => {
            const hc = ((capital * Math.pow(1 + taxa/100, a)) / maxVal) * 90;
            return (
              <div key={a} style={{ flex: 1, height: hc, background: "var(--pine)", opacity: 0.7, borderRadius: "2px 2px 0 0" }} />
            );
          })}
        </div>
      </div>
      <div style={{ display: "flex", gap: 16, fontSize: "0.75rem", color: "var(--ink-soft)", marginBottom: 16 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 12, height: 12, background: "var(--pine)", borderRadius: 2, display: "inline-block" }} />
          Juros compostos
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 12, height: 12, background: "var(--ochre)", borderRadius: 2, display: "inline-block", opacity: 0.7 }} />
          Juros simples
        </span>
      </div>

      <div className="mat-interativo__resultado">
        <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--ink-faint)", fontFamily: "var(--font-mono)", marginBottom: 4 }}>Juros simples</div>
            <div style={{ fontSize: "1.3rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--ochre)" }}>{fmt(simples)}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--ink-faint)", fontFamily: "var(--font-mono)", marginBottom: 4 }}>Juros compostos</div>
            <div style={{ fontSize: "1.3rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--pine)" }}>{fmt(composto)}</div>
          </div>
        </div>
        {diferenca > 0 && (
          <div className="mat-resultado-extra" style={{ marginTop: 10 }}>
            Compostos rendem {fmt(diferenca)} a mais que simples após {anos} anos
          </div>
        )}
      </div>
    </div>
  );
}
