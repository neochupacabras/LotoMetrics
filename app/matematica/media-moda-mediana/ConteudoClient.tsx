"use client";

import Link from "next/link";
import { useState, useMemo } from "react";

function SimuladorSalarios() {
  const [funcionarios, setFuncionarios] = useState([3000, 3200, 2800, 4000, 3500, 3100, 2900, 150000]);

  const sorted = useMemo(() => [...funcionarios].sort((a, b) => a - b), [funcionarios]);
  const media = funcionarios.reduce((a, b) => a + b, 0) / funcionarios.length;
  const mediana = funcionarios.length % 2 === 0
    ? (sorted[funcionarios.length / 2 - 1] + sorted[funcionarios.length / 2]) / 2
    : sorted[Math.floor(funcionarios.length / 2)];
  const mapa = new Map<number, number>();
  funcionarios.forEach(v => mapa.set(v, (mapa.get(v) ?? 0) + 1));
  const moda = [...mapa.entries()].sort((a, b) => b[1] - a[1])[0][0];

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  return (
    <div className="mat-interativo">
      <p className="mat-interativo__titulo">📏 Uma empresa com 8 funcionários</p>
      <p style={{ fontSize: "0.85rem", color: "var(--ink-soft)", marginBottom: 12 }}>
        7 funcionários ganham entre R$2.800 e R$4.000. O dono ganha R$150.000.
        Observe como cada medida se comporta.
      </p>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", marginBottom: 16 }}>
        {[
          { label: "Média", valor: fmt(media), desc: "puxa para cima pelo salário do dono", cor: "var(--rust)" },
          { label: "Mediana", valor: fmt(mediana), desc: "valor do meio — ignora extremos", cor: "var(--pine)" },
          { label: "Moda", valor: fmt(moda), desc: "valor mais frequente", cor: "var(--ochre)" },
        ].map(item => (
          <div key={item.label} style={{ textAlign: "center", minWidth: 160 }}>
            <div style={{ fontSize: "0.78rem", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--ink-faint)", marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: item.cor }}>{item.valor}</div>
            <div style={{ fontSize: "0.72rem", color: "var(--ink-soft)", maxWidth: 160, margin: "4px auto 0" }}>{item.desc}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "center" }}>
        {sorted.map((s, i) => (
          <div key={i} style={{
            padding: "6px 10px", borderRadius: 4, fontFamily: "var(--font-mono)", fontSize: "0.82rem",
            background: s > 10000 ? "color-mix(in srgb, var(--rust) 15%, transparent)" : "color-mix(in srgb, var(--pine) 10%, transparent)",
            border: `1px solid ${s > 10000 ? "var(--rust)" : "var(--pine)"}`,
            color: s > 10000 ? "var(--rust)" : "var(--pine)",
          }}>
            {fmt(s)}
          </div>
        ))}
      </div>
    </div>
  );
}

