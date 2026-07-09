"use client";

import Link from "next/link";
import { useState } from "react";

function CalculadoraVE() {
  const [premioM, setPremioM] = useState(50);
  const [probabilidade, setProbabilidade] = useState(1);
  const [custo, setCusto] = useState(6);

  const prob = probabilidade / 1000000;
  const ve = premioM * 1000000 * prob - custo;
  const veFormatado = ve.toFixed(2);
  const positivo = ve > 0;

  return (
    <div className="mat-interativo">
      <p className="mat-interativo__titulo">⚖️ Calculadora de Valor Esperado</p>
      <div className="mat-interativo__controles">
        <div className="mat-interativo__campo">
          <label>Prêmio estimado (R$ milhões)</label>
          <div className="mat-interativo__slider-wrap">
            <input type="range" min={1} max={500} value={premioM}
              onChange={e => setPremioM(+e.target.value)} />
            <span className="mat-interativo__valor">R${premioM}M</span>
          </div>
        </div>
        <div className="mat-interativo__campo">
          <label>Probabilidade (1 em X milhões)</label>
          <div className="mat-interativo__slider-wrap">
            <input type="range" min={1} max={240} value={probabilidade}
              onChange={e => setProbabilidade(+e.target.value)} />
            <span className="mat-interativo__valor">1/{probabilidade}M</span>
          </div>
        </div>
        <div className="mat-interativo__campo">
          <label>Custo da aposta (R$)</label>
          <div className="mat-interativo__slider-wrap">
            <input type="range" min={2} max={10} step={0.5} value={custo}
              onChange={e => setCusto(+e.target.value)} />
            <span className="mat-interativo__valor">R${custo.toFixed(2)}</span>
          </div>
        </div>
      </div>
      <div className="mat-interativo__resultado">
        <div className="mat-resultado-numero" style={{ color: positivo ? "var(--pine)" : "var(--rust)" }}>
          {positivo ? "+" : ""}R${veFormatado}
        </div>
        <div className="mat-resultado-desc">valor esperado por aposta</div>
        <div className="mat-resultado-extra">
          {positivo
            ? "✓ Matematicamente favorável (raro em loterias!)"
            : `✗ Você perde em média R$${Math.abs(+veFormatado).toFixed(2)} por aposta no longo prazo`}
        </div>
      </div>
    </div>
  );
}

