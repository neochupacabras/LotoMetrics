"use client";
import { useState, useMemo } from "react";

function logC(n: number, k: number): number {
  if (k > n || k < 0) return -Infinity;
  if (k === 0 || k === n) return 0;
  let r = 0;
  for (let i = 0; i < Math.min(k, n - k); i++) r += Math.log(n - i) - Math.log(i + 1);
  return r;
}

function C(n: number, k: number): number {
  const l = logC(n, k);
  if (l === -Infinity) return 0;
  return Math.round(Math.exp(l));
}

function fmtGrande(v: number): string {
  if (v >= 1e18) return `${(v / 1e18).toFixed(2)} quintilhões`;
  if (v >= 1e15) return `${(v / 1e15).toFixed(2)} quatrilhões`;
  if (v >= 1e12) return `${(v / 1e12).toFixed(2)} trilhões`;
  if (v >= 1e9)  return `${(v / 1e9).toFixed(2)} bilhões`;
  if (v >= 1e6)  return `${(v / 1e6).toFixed(2)} milhões`;
  return v.toLocaleString("pt-BR");
}

export function CalcCombinacoes() {
  const [n, setN] = useState("25");
  const [k, setK] = useState("15");
  const vn = parseInt(n), vk = parseInt(k);
  const valid = !isNaN(vn) && !isNaN(vk) && vn >= 0 && vk >= 0 && vk <= vn;
  const resultado = valid ? C(vn, vk) : null;
  const logR = valid ? logC(vn, vk) : null;

  const EXEMPLOS = [
    { n: 25, k: 15, label: "Lotofácil" },
    { n: 60, k: 6,  label: "Mega-Sena" },
    { n: 52, k: 5,  label: "Mão no pôquer" },
    { n: 10, k: 3,  label: "3 sabores de 10" },
  ];

  return (
    <div className="calc-painel">
      <div className="calc-painel__corpo">
        <div className="calc-campos">
          <div className="calc-campo"><label>n — total de opções</label><input className="calc-input calc-input--destaque" type="number" min={0} max={1000} value={n} onChange={e => { setN(e.target.value); if (parseInt(e.target.value) < vk) setK(e.target.value); }} /></div>
          <div className="calc-campo"><label>k — quantos escolher</label><input className="calc-input calc-input--destaque" type="number" min={0} max={vn || 0} value={k} onChange={e => setK(e.target.value)} /></div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {EXEMPLOS.map(ex => (
            <button key={ex.label} type="button" className="botao-copiar"
              onClick={() => { setN(ex.n.toString()); setK(ex.k.toString()); }}
              style={{ fontSize: "0.78rem" }}>
              {ex.label} ({ex.n},{ex.k})
            </button>
          ))}
        </div>
      </div>
      <div className="calc-painel__resultado calc-painel__resultado--ochre">
        {resultado !== null && logR !== null ? (
          <>
            <div className="calc-resultado-label">C({vn}, {vk}) =</div>
            <div className="calc-resultado-numero calc-resultado-numero--ochre">{fmtGrande(resultado)}</div>
            {resultado > 1e15 && <div className="calc-resultado-extra">≈ 10^{logR.toFixed(1)} (número muito grande)</div>}
            <div className="calc-metricas" style={{ marginTop: 16 }}>
              <div className="calc-metrica"><div className="calc-metrica__valor" style={{ color: "var(--ochre)" }}>{fmtGrande(resultado)}</div><div className="calc-metrica__label">Combinações</div></div>
              <div className="calc-metrica"><div className="calc-metrica__valor">{(1 / resultado * 100).toFixed(resultado > 1e6 ? 10 : 4)}%</div><div className="calc-metrica__label">Chance de acertar</div></div>
              <div className="calc-metrica"><div className="calc-metrica__valor">{Math.round(logR / Math.log(10))}</div><div className="calc-metrica__label">Dígitos do resultado</div></div>
            </div>
          </>
        ) : (
          <div style={{ color: "var(--ink-faint)", fontFamily: "var(--font-mono)", fontSize: "0.9rem" }}>
            {!valid && vk > vn ? "k não pode ser maior que n" : "Preencha n e k para calcular"}
          </div>
        )}
      </div>
    </div>
  );
}
