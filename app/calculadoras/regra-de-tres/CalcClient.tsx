"use client";
import { useState } from "react";

export function CalcRegraDeTres() {
  const [tipo, setTipo] = useState<"direta" | "inversa">("direta");
  const [a, setA] = useState(""); const [b, setB] = useState(""); const [c, setC] = useState("");

  const va = parseFloat(a.replace(",", ".")), vb = parseFloat(b.replace(",", ".")), vc = parseFloat(c.replace(",", "."));

  let d: number | null = null;
  if (!isNaN(va) && !isNaN(vb) && !isNaN(vc) && va !== 0) {
    d = tipo === "direta" ? (vb * vc) / va : (va * vb) / vc;
  }

  const fmt = (v: number) => Number.isInteger(v) ? v.toLocaleString("pt-BR") : v.toLocaleString("pt-BR", { maximumFractionDigits: 6 });

  return (
    <div className="calc-painel">
      <div className="calc-painel__corpo">
        <div className="calc-modos">
          <button type="button" className="calc-modo-btn" data-ativo={tipo === "direta"} onClick={() => setTipo("direta")}>Direta (+ A → + D)</button>
          <button type="button" className="calc-modo-btn" data-ativo={tipo === "inversa"} onClick={() => setTipo("inversa")}>Inversa (+ A → − D)</button>
        </div>
        <p style={{ fontSize: "0.82rem", color: "var(--ink-soft)", marginBottom: 16 }}>
          {tipo === "direta" ? "Quando A aumenta, D aumenta proporcionalmente. Ex: mais horas trabalhadas → mais produto fabricado." : "Quando A aumenta, D diminui. Ex: mais operários → menos dias para terminar a obra."}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr auto 1fr", alignItems: "center", gap: 8 }}>
          <div className="calc-campo"><label>A</label><input className="calc-input calc-input--destaque" type="number" placeholder="—" value={a} onChange={e => setA(e.target.value)} /></div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.3rem", color: "var(--ink-faint)", paddingTop: 20, textAlign: "center" }}>→</div>
          <div className="calc-campo"><label>B</label><input className="calc-input calc-input--destaque" type="number" placeholder="—" value={b} onChange={e => setB(e.target.value)} /></div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.1rem", color: "var(--ink-faint)", paddingTop: 20, textAlign: "center" }}>{tipo === "direta" ? "∝" : "1/∝"}</div>
          <div className="calc-campo"><label>C</label><input className="calc-input calc-input--destaque" type="number" placeholder="—" value={c} onChange={e => setC(e.target.value)} /></div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.3rem", color: "var(--ink-faint)", paddingTop: 20, textAlign: "center" }}>→</div>
          <div className="calc-campo"><label>D (resultado)</label><input className="calc-input calc-input--destaque" type="text" readOnly value={d !== null ? fmt(d) : ""} placeholder="?" style={{ background: "color-mix(in srgb, var(--pine) 5%, transparent)", fontWeight: 700, color: "var(--pine)" }} /></div>
        </div>
      </div>
      <div className="calc-painel__resultado calc-painel__resultado--rust">
        {d !== null ? (
          <>
            <div className="calc-resultado-label">D =</div>
            <div className="calc-resultado-numero calc-resultado-numero--rust">{fmt(d)}</div>
            <div className="calc-resultado-extra" style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", marginTop: 8 }}>
              {tipo === "direta" ? `${fmt(va)} → ${fmt(vb)}   /   ${fmt(vc)} → ${fmt(d)}` : `${fmt(va)} × ${fmt(vb)} = ${fmt(vc)} × ${fmt(d)}`}
            </div>
          </>
        ) : (
          <div style={{ color: "var(--ink-faint)", fontFamily: "var(--font-mono)", fontSize: "0.9rem" }}>Preencha A, B e C para encontrar D</div>
        )}
      </div>
    </div>
  );
}
