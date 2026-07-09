"use client";

import Link from "next/link";
import { useState } from "react";

function SimuladorDesconto() {
  const [preco, setPreco] = useState(100);
  const [aumento, setAumento] = useState(100);
  const [desconto, setDesconto] = useState(50);

  const apos_aumento = preco * (1 + aumento / 100);
  const apos_desconto = apos_aumento * (1 - desconto / 100);
  const diferenca = apos_desconto - preco;
  const volta = Math.abs(diferenca) < 0.01;

  return (
    <div className="mat-interativo">
      <p className="mat-interativo__titulo">🏷️ Aumento seguido de desconto</p>
      <div className="mat-interativo__controles">
        <div className="mat-interativo__campo">
          <label>Preço original (R$)</label>
          <div className="mat-interativo__slider-wrap">
            <input type="range" min={10} max={500} value={preco}
              onChange={e => setPreco(+e.target.value)} />
            <span className="mat-interativo__valor">R${preco}</span>
          </div>
        </div>
        <div className="mat-interativo__campo">
          <label>Aumento (%)</label>
          <div className="mat-interativo__slider-wrap">
            <input type="range" min={1} max={200} value={aumento}
              onChange={e => setAumento(+e.target.value)} />
            <span className="mat-interativo__valor">{aumento}%</span>
          </div>
        </div>
        <div className="mat-interativo__campo">
          <label>Desconto depois (%)</label>
          <div className="mat-interativo__slider-wrap">
            <input type="range" min={1} max={99} value={desconto}
              onChange={e => setDesconto(+e.target.value)} />
            <span className="mat-interativo__valor">{desconto}%</span>
          </div>
        </div>
      </div>
      <div className="mat-interativo__resultado">
        <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "0.78rem", color: "var(--ink-faint)", fontFamily: "var(--font-mono)" }}>Preço original</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 700, fontFamily: "var(--font-mono)" }}>R${preco.toFixed(2)}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "0.78rem", color: "var(--ink-faint)", fontFamily: "var(--font-mono)" }}>Após +{aumento}%</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--rust)" }}>R${apos_aumento.toFixed(2)}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "0.78rem", color: "var(--ink-faint)", fontFamily: "var(--font-mono)" }}>Após −{desconto}%</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: diferenca < -0.01 ? "var(--pine)" : diferenca > 0.01 ? "var(--rust)" : "var(--ink)" }}>R${apos_desconto.toFixed(2)}</div>
          </div>
        </div>
        <div className="mat-resultado-extra" style={{ marginTop: 12 }}>
          {volta ? "✓ Voltou exatamente ao preço original!" :
           diferenca < 0 ? `Ficou R$${Math.abs(diferenca).toFixed(2)} mais barato que o original` :
           `Ficou R$${diferenca.toFixed(2)} mais caro que o original`}
        </div>
      </div>
    </div>
  );
}

