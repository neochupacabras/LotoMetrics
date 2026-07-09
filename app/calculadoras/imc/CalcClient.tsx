"use client";
import { useState } from "react";

const FAIXAS = [
  { max: 16,   label: "Magreza grave",    cor: "#8e3a2a", bg: "color-mix(in srgb, #8e3a2a 15%, transparent)" },
  { max: 17,   label: "Magreza moderada", cor: "#b9802c", bg: "color-mix(in srgb, #b9802c 15%, transparent)" },
  { max: 18.5, label: "Magreza leve",     cor: "#b9802c", bg: "color-mix(in srgb, #b9802c 10%, transparent)" },
  { max: 25,   label: "Peso normal",      cor: "#1e4b3c", bg: "color-mix(in srgb, #1e4b3c 15%, transparent)" },
  { max: 30,   label: "Sobrepeso",        cor: "#b9802c", bg: "color-mix(in srgb, #b9802c 15%, transparent)" },
  { max: 35,   label: "Obesidade grau I", cor: "#8e3a2a", bg: "color-mix(in srgb, #8e3a2a 12%, transparent)" },
  { max: 40,   label: "Obesidade grau II",cor: "#8e3a2a", bg: "color-mix(in srgb, #8e3a2a 18%, transparent)" },
  { max: 999,  label: "Obesidade grau III",cor:"#8e3a2a", bg: "color-mix(in srgb, #8e3a2a 25%, transparent)" },
];

export function CalcIMC() {
  const [peso, setPeso] = useState(""); const [altura, setAltura] = useState("");
  const vp = parseFloat(peso.replace(",",".")), va = parseFloat(altura.replace(",","."));
  const imc = (!isNaN(vp)&&!isNaN(va)&&va>0) ? vp/(va*va) : null;
  const faixa = imc !== null ? FAIXAS.find(f => imc < f.max)! : null;

  return (
    <div className="calc-painel">
      <div className="calc-painel__corpo">
        <div className="calc-campos">
          <div className="calc-campo"><label>Peso (kg)</label><input className="calc-input calc-input--destaque" type="number" step="0.1" placeholder="70" value={peso} onChange={e => setPeso(e.target.value)} /></div>
          <div className="calc-campo"><label>Altura (m) — ex: 1.75</label><input className="calc-input calc-input--destaque" type="number" step="0.01" placeholder="1.75" value={altura} onChange={e => setAltura(e.target.value)} /></div>
        </div>
      </div>
      <div className="calc-painel__resultado calc-painel__resultado--rust" style={{ background: faixa?.bg }}>
        {imc !== null && faixa ? (
          <>
            <div className="calc-resultado-label">Seu IMC</div>
            <div className="calc-resultado-numero" style={{ color: faixa.cor }}>{imc.toLocaleString("pt-BR",{minimumFractionDigits:1,maximumFractionDigits:1})}</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: faixa.cor, marginTop: 8 }}>{faixa.label}</div>
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 4 }}>
              {FAIXAS.map(f => (
                <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 8, opacity: f.label === faixa.label ? 1 : 0.45 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: f.cor, flexShrink: 0 }} />
                  <span style={{ fontSize: "0.8rem", fontFamily: "var(--font-mono)", fontWeight: f.label === faixa.label ? 700 : 400 }}>{f.label} {f.label === faixa.label ? "← você" : ""}</span>
                  <span style={{ fontSize: "0.72rem", color: "var(--ink-faint)", marginLeft: "auto" }}>&lt; {f.max === 999 ? "∞" : f.max}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ color: "var(--ink-faint)", fontFamily: "var(--font-mono)", fontSize: "0.9rem" }}>Preencha peso e altura para calcular o IMC</div>
        )}
      </div>
    </div>
  );
}
