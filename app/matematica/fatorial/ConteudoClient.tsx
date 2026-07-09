"use client";

import Link from "next/link";
import { useState } from "react";

export function CalculadoraFatorial() {
  const [n, setN] = useState(5);
  function fat(x: number): bigint {
    if (x <= 1) return BigInt(1);
    return BigInt(x) * fat(x - 1);
  }
  const resultado = fat(n);
  const str = resultado.toString();
  const legivel = str.length > 15
    ? `${str.slice(0, 4)}... (${str.length} dígitos!)`
    : Number(resultado).toLocaleString("pt-BR");
  const contexto = n === 52 ? "← formas de embaralhar um baralho"
    : n === 7 ? "← combinações de dias da semana"
    : n === 10 ? "← senhas com dígitos 0-9 sem repetição"
    : "";
  return (
    <div className="mat-interativo">
      <p className="mat-interativo__titulo">💥 Quanto é n! ?</p>
      <div className="mat-interativo__controles">
        <div className="mat-interativo__campo">
          <label>n =</label>
          <div className="mat-interativo__slider-wrap">
            <input type="range" min={0} max={60} value={n}
              onChange={e => setN(+e.target.value)} />
            <span className="mat-interativo__valor">{n}</span>
          </div>
        </div>
      </div>
      <div className="mat-interativo__resultado">
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.9rem", color: "var(--ink-soft)", marginBottom: 4 }}>{n}! =</div>
        <div className="mat-resultado-numero" style={{ fontSize: str.length > 10 ? "1.4rem" : "2rem" }}>{legivel}</div>
        {contexto && <div className="mat-resultado-extra">{contexto}</div>}
      </div>
    </div>
  );
}

