"use client";
import { useMemo, useState } from "react";

export function SimuladorExponencial() {
  const [modo, setModo] = useState<"crescimento" | "decaimento">("crescimento");
  const [taxa, setTaxa] = useState(10); // % por período

  const tempoCaracteristico = useMemo(() => {
    const r = taxa / 100;
    return Math.log(2) / Math.log(1 + r);
  }, [taxa]);

  const pontos = useMemo(() => {
    const r = taxa / 100;
    const valores: number[] = [];
    let v = 100;
    for (let t = 0; t <= 10; t++) {
      valores.push(v);
      v = modo === "crescimento" ? v * (1 + r) : v * (1 - r);
    }
    return valores;
  }, [taxa, modo]);

  const maxValor = Math.max(...pontos, 100);

  return (
    <div className="mat-interativo">
      <p className="mat-interativo__titulo">🦠 {modo === "crescimento" ? "Crescimento" : "Decaimento"} exponencial</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button type="button" className="botao-copiar" onClick={() => setModo("crescimento")}
          style={{ background: modo === "crescimento" ? "var(--pine)" : undefined, color: modo === "crescimento" ? "var(--paper)" : undefined, fontSize: "0.82rem" }}>
          Crescimento
        </button>
        <button type="button" className="botao-copiar" onClick={() => setModo("decaimento")}
          style={{ background: modo === "decaimento" ? "var(--rust)" : undefined, color: modo === "decaimento" ? "var(--paper)" : undefined, fontSize: "0.82rem" }}>
          Decaimento
        </button>
      </div>

      <div className="mat-interativo__controles">
        <div className="mat-interativo__campo">
          <label>Taxa por período</label>
          <div className="mat-interativo__slider-wrap">
            <input type="range" min={1} max={50} value={taxa} onChange={e => setTaxa(+e.target.value)} />
            <span className="mat-interativo__valor">{taxa}%</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 100, marginTop: 16, padding: "0 4px" }}>
        {pontos.map((v, i) => {
          const h = (v / maxValor) * 90 + 5;
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <div style={{
                width: "100%", height: h, borderRadius: "2px 2px 0 0",
                background: modo === "crescimento" ? "var(--pine)" : "var(--rust)", opacity: 0.85,
              }} title={`t=${i}: ${v.toFixed(1)}`} />
              <span style={{ fontSize: "0.65rem", fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}>{i}</span>
            </div>
          );
        })}
      </div>

      <div className="mat-interativo__resultado">
        <div className="mat-resultado-numero" style={{ fontSize: "1.5rem" }}>
          {tempoCaracteristico.toFixed(1)} períodos
        </div>
        <div className="mat-resultado-desc">
          {modo === "crescimento" ? "tempo de duplicação" : "meia-vida"}
        </div>
        <div className="mat-resultado-extra">
          Com {taxa}% por período, o valor {modo === "crescimento" ? "dobra" : "cai pela metade"} a cada {tempoCaracteristico.toFixed(1)} períodos — sempre o mesmo intervalo, não importa o valor de partida.
        </div>
      </div>
    </div>
  );
}
