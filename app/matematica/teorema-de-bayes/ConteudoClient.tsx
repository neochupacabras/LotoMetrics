"use client";

import { useState, useMemo } from "react";

export function SimuladorBayes() {
  const [prevalencia, setPrevalencia] = useState(1); // % da população com a doença
  const sensibilidade = 0.99; // acerta 99% dos doentes
  const especificidade = 0.95; // acerta 95% dos saudáveis

  const resultado = useMemo(() => {
    const p = prevalencia / 100;
    const doentes = p;
    const saudaveis = 1 - p;

    const verdadeirosPositivos = doentes * sensibilidade;
    const falsosPositivos = saudaveis * (1 - especificidade);
    const totalPositivos = verdadeirosPositivos + falsosPositivos;

    const probDoenteDadoPositivo = verdadeirosPositivos / totalPositivos;

    return {
      verdadeirosPositivos: verdadeirosPositivos * 10000,
      falsosPositivos: falsosPositivos * 10000,
      probDoenteDadoPositivo: probDoenteDadoPositivo * 100,
    };
  }, [prevalencia]);

  return (
    <div className="mat-interativo">
      <p className="mat-interativo__titulo">🧪 Exame com 99% de sensibilidade e 95% de especificidade</p>
      <div className="mat-interativo__controles">
        <div className="mat-interativo__campo">
          <label>Prevalência da doença na população</label>
          <div className="mat-interativo__slider-wrap">
            <input type="range" min={0.1} max={20} step={0.1} value={prevalencia}
              onChange={e => setPrevalencia(+e.target.value)} />
            <span className="mat-interativo__valor">{prevalencia.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", margin: "12px 0", fontSize: "0.82rem", color: "var(--ink-soft)" }}>
        <span>Em 10.000 pessoas testadas:</span>
        <span style={{ color: "var(--pine)", fontWeight: 600 }}>
          {resultado.verdadeirosPositivos.toFixed(0)} positivos verdadeiros
        </span>
        <span style={{ color: "var(--rust)", fontWeight: 600 }}>
          {resultado.falsosPositivos.toFixed(0)} falsos positivos
        </span>
      </div>

      <div className="mat-interativo__resultado">
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.9rem", color: "var(--ink-soft)", marginBottom: 4 }}>
          Se você testou positivo, a chance de estar doente é:
        </div>
        <div className="mat-resultado-numero">{resultado.probDoenteDadoPositivo.toFixed(1)}%</div>
        <div className="mat-resultado-extra">
          {resultado.probDoenteDadoPositivo < 30
            ? "Mesmo com 99% de sensibilidade, a maioria dos positivos é falsa — a doença é rara demais"
            : resultado.probDoenteDadoPositivo < 70
            ? "Zona intermediária: o resultado ajuda, mas não é conclusivo sozinho"
            : "Com prevalência mais alta, o exame se torna bem mais confiável"}
        </div>
      </div>
    </div>
  );
}
