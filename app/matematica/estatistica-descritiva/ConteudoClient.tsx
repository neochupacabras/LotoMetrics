"use client";
import { useState, useMemo } from "react";

const DATASETS = {
  "Salários (empresa)": [2800, 2900, 3000, 3100, 3200, 3300, 3500, 4000, 4500, 150000],
  "Notas de turma": [45, 55, 60, 65, 68, 70, 72, 75, 78, 80, 82, 85, 88, 90, 95],
  "Tempo de entrega (dias)": [1, 1, 2, 2, 2, 3, 3, 3, 3, 4, 4, 5, 7, 15, 30],
};

export function BoxplotInterativo() {
  const [dataset, setDataset] = useState<keyof typeof DATASETS>("Salários (empresa)");
  const dados = useMemo(() => [...DATASETS[dataset]].sort((a, b) => a - b), [dataset]);

  const n = dados.length;
  const q1 = dados[Math.floor(n * 0.25)];
  const mediana = n % 2 === 0 ? (dados[n/2-1] + dados[n/2]) / 2 : dados[Math.floor(n/2)];
  const q3 = dados[Math.floor(n * 0.75)];
  const iqr = q3 - q1;
  const minSem = Math.max(dados[0], q1 - 1.5 * iqr);
  const maxSem = Math.min(dados[dados.length-1], q3 + 1.5 * iqr);
  const outliers = dados.filter(v => v < minSem || v > maxSem);
  const media = dados.reduce((a, b) => a + b, 0) / n;

  const fmt = (v: number) => v >= 1000
    ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
    : v.toFixed(1);

  const min = dados[0], max = dados[dados.length - 1];
  const range = max - min || 1;
  const toX = (v: number) => ((v - min) / range) * 280 + 20;

  return (
    <div className="mat-interativo">
      <p className="mat-interativo__titulo">📦 Boxplot — resumo de cinco números</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {(Object.keys(DATASETS) as (keyof typeof DATASETS)[]).map(k => (
          <button key={k} type="button"
            className={k === dataset ? "botao-gerar" : "botao-copiar"}
            onClick={() => setDataset(k)} style={{ fontSize: "0.82rem" }}>
            {k}
          </button>
        ))}
      </div>

      <svg viewBox="0 0 320 100" style={{ width: "100%", maxWidth: 400, display: "block", margin: "0 auto 16px" }}>
        {/* Eixo */}
        <line x1={20} y1={70} x2={300} y2={70} stroke="var(--line-strong)" strokeWidth={1} />
        {/* Whiskers */}
        <line x1={toX(minSem)} y1={50} x2={toX(q1)} y2={50} stroke="var(--pine)" strokeWidth={2} />
        <line x1={toX(q3)} y1={50} x2={toX(maxSem)} y2={50} stroke="var(--pine)" strokeWidth={2} />
        <line x1={toX(minSem)} y1={42} x2={toX(minSem)} y2={58} stroke="var(--pine)" strokeWidth={2} />
        <line x1={toX(maxSem)} y1={42} x2={toX(maxSem)} y2={58} stroke="var(--pine)" strokeWidth={2} />
        {/* Caixa IQR */}
        <rect x={toX(q1)} y={35} width={toX(q3)-toX(q1)} height={30}
          fill="color-mix(in srgb, var(--pine) 20%, transparent)"
          stroke="var(--pine)" strokeWidth={2} />
        {/* Mediana */}
        <line x1={toX(mediana)} y1={35} x2={toX(mediana)} y2={65} stroke="var(--pine)" strokeWidth={3} />
        {/* Média */}
        <line x1={toX(media)} y1={35} x2={toX(media)} y2={65} stroke="var(--rust)" strokeWidth={2} strokeDasharray="4 2" />
        {/* Outliers */}
        {outliers.map((v, i) => (
          <circle key={i} cx={toX(v)} cy={50} r={5} fill="var(--rust)" opacity={0.8} />
        ))}
        {/* Labels */}
        <text x={toX(mediana)} y={28} textAnchor="middle" fontSize={8} fill="var(--pine)" fontFamily="var(--font-mono)">Md</text>
        <text x={toX(media)} y={28} textAnchor="middle" fontSize={8} fill="var(--rust)" fontFamily="var(--font-mono)">μ</text>
      </svg>

      <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
        {[
          { label: "Mín", valor: fmt(minSem), cor: "var(--ink-soft)" },
          { label: "Q1", valor: fmt(q1), cor: "var(--pine)" },
          { label: "Mediana", valor: fmt(mediana), cor: "var(--pine)" },
          { label: "Média", valor: fmt(media), cor: "var(--rust)" },
          { label: "Q3", valor: fmt(q3), cor: "var(--pine)" },
          { label: "Máx", valor: fmt(maxSem), cor: "var(--ink-soft)" },
        ].map(({ label, valor, cor }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "0.68rem", fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}>{label}</div>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: cor }}>{valor}</div>
          </div>
        ))}
      </div>
      {outliers.length > 0 && (
        <div className="mat-resultado-extra" style={{ marginTop: 10 }}>
          ⚠️ {outliers.length} outlier{outliers.length > 1 ? "s" : ""}: {outliers.map(fmt).join(", ")}
        </div>
      )}
    </div>
  );
}
