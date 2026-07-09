"use client";

import Link from "next/link";
import { useState, useMemo } from "react";

function SimuladorAniversario() {
  const [pessoas, setPessoas] = useState(23);
  const prob = useMemo(() => {
    let p = 1;
    for (let i = 0; i < pessoas; i++) p *= (365 - i) / 365;
    return (1 - p) * 100;
  }, [pessoas]);

  const cor = prob > 70 ? "var(--rust)" : prob > 50 ? "var(--ochre)" : "var(--pine)";

  return (
    <div className="mat-interativo">
      <p className="mat-interativo__titulo">🎂 Probabilidade de dois aniversários iguais</p>
      <div className="mat-interativo__controles">
        <div className="mat-interativo__campo">
          <label>Número de pessoas na sala</label>
          <div className="mat-interativo__slider-wrap">
            <input type="range" min={2} max={80} value={pessoas}
              onChange={e => setPessoas(+e.target.value)} />
            <span className="mat-interativo__valor">{pessoas}</span>
          </div>
        </div>
      </div>
      <div className="mat-interativo__resultado">
        <div className="mat-resultado-numero" style={{ color: cor }}>{prob.toFixed(1)}%</div>
        <div className="mat-resultado-desc">chance de pelo menos duas pessoas fazerem aniversário no mesmo dia</div>
        {pessoas === 23 && <div className="mat-resultado-extra">← mais de 50%! Parece impossível, mas é verdade.</div>}
        {pessoas >= 57 && <div className="mat-resultado-extra">← praticamente certo ({prob.toFixed(1)}%)</div>}
      </div>
      <div style={{ height: 12, background: "var(--line)", borderRadius: 6, overflow: "hidden", marginTop: 12 }}>
        <div style={{ height: "100%", width: `${Math.min(prob, 100)}%`, background: cor, transition: "width 0.3s, background 0.3s" }} />
      </div>
    </div>
  );
}

