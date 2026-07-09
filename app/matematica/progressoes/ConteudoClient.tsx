"use client";
import { useState } from "react";

export function SimuladorProgressoes() {
  const [valor, setValor] = useState(100);
  const [razao, setRazao] = useState(100);
  const [periodos, setPeriodos] = useState(10);

  const pa = Array.from({ length: periodos }, (_, i) => valor + razao * i);
  const pg = Array.from({ length: periodos }, (_, i) => valor * Math.pow(1 + razao / 100, i));

  const maxPA = pa[pa.length - 1];
  const maxPG = pg[pg.length - 1];
  const maxVal = Math.max(maxPA, maxPG);

  const fmt = (v: number) =>
    v >= 1e9 ? `R$${(v / 1e9).toFixed(1)}B`
    : v >= 1e6 ? `R$${(v / 1e6).toFixed(1)}M`
    : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  return (
    <div className="mat-interativo">
      <p className="mat-interativo__titulo">🪜 PA vs PG — crescimento linear vs exponencial</p>
      <div className="mat-interativo__controles">
        <div className="mat-interativo__campo">
          <label>Valor inicial (R$)</label>
          <div className="mat-interativo__slider-wrap">
            <input type="range" min={10} max={1000} step={10} value={valor}
              onChange={e => setValor(+e.target.value)} />
            <span className="mat-interativo__valor">{fmt(valor)}</span>
          </div>
        </div>
        <div className="mat-interativo__campo">
          <label>PA: soma fixa por período (R$) / PG: % de aumento</label>
          <div className="mat-interativo__slider-wrap">
            <input type="range" min={1} max={200} value={razao}
              onChange={e => setRazao(+e.target.value)} />
            <span className="mat-interativo__valor">{razao}</span>
          </div>
        </div>
        <div className="mat-interativo__campo">
          <label>Períodos (meses)</label>
          <div className="mat-interativo__slider-wrap">
            <input type="range" min={2} max={24} value={periodos}
              onChange={e => setPeriodos(+e.target.value)} />
            <span className="mat-interativo__valor">{periodos}</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 100, marginBottom: 8 }}>
        {pa.map((v, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, alignItems: "stretch", justifyContent: "flex-end", height: 100 }}>
            <div style={{ background: "var(--ochre)", opacity: 0.8, borderRadius: "2px 2px 0 0",
              height: `${(v / maxVal) * 90}px` }} title={`PA ${i+1}: ${fmt(v)}`} />
            <div style={{ background: "var(--pine)", opacity: 0.8, borderRadius: "2px 2px 0 0",
              height: `${(pg[i] / maxVal) * 90}px`, marginTop: -((v / maxVal) * 90) - 2 }} title={`PG ${i+1}: ${fmt(pg[i])}`} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 16, fontSize: "0.75rem", color: "var(--ink-soft)", marginBottom: 12 }}>
        <span><span style={{ color: "var(--ochre)", fontWeight: 700 }}>▪</span> PA (linear)</span>
        <span><span style={{ color: "var(--pine)", fontWeight: 700 }}>▪</span> PG (exponencial)</span>
      </div>

      <div className="mat-interativo__resultado">
        <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--ink-faint)", marginBottom: 4 }}>PA após {periodos} períodos</div>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--ochre)" }}>{fmt(maxPA)}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--ink-faint)", marginBottom: 4 }}>PG após {periodos} períodos</div>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--pine)" }}>{fmt(maxPG)}</div>
          </div>
        </div>
        {maxPG > maxPA * 2 && (
          <div className="mat-resultado-extra" style={{ marginTop: 10 }}>
            A PG é {(maxPG / maxPA).toFixed(0)}× maior que a PA após {periodos} períodos
          </div>
        )}
      </div>
    </div>
  );
}
