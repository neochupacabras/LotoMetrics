"use client";
import { useMemo, useState } from "react";

interface Ponto { x: number; y: number; dentro: boolean; }

function gerarPontos(qtd: number): Ponto[] {
  const pontos: Ponto[] = [];
  for (let i = 0; i < qtd; i++) {
    const x = Math.random();
    const y = Math.random();
    const dentro = x * x + y * y <= 1;
    pontos.push({ x, y, dentro });
  }
  return pontos;
}

export function SimuladorMonteCarlo() {
  const [pontos, setPontos] = useState<Ponto[]>(() => gerarPontos(200));

  const dentro = pontos.filter(p => p.dentro).length;
  const estimativaPi = (dentro / pontos.length) * 4;
  const erro = Math.abs(estimativaPi - Math.PI);

  function adicionarPontos(qtd: number) {
    setPontos(prev => [...prev, ...gerarPontos(qtd)].slice(-4000));
  }

  function reiniciar() {
    setPontos(gerarPontos(200));
  }

  const tamanhoSvg = 220;

  return (
    <div className="mat-interativo">
      <p className="mat-interativo__titulo">🎲 Estimando π com pontos aleatórios</p>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center", justifyContent: "center" }}>
        <svg viewBox={`0 0 ${tamanhoSvg} ${tamanhoSvg}`} width={tamanhoSvg} height={tamanhoSvg} style={{ background: "var(--paper)", borderRadius: 6, border: "1px solid var(--line)" }}>
          <path d={`M 0 ${tamanhoSvg} A ${tamanhoSvg} ${tamanhoSvg} 0 0 0 ${tamanhoSvg} 0 L 0 0 Z`} fill="color-mix(in srgb, var(--pine) 10%, transparent)" stroke="var(--pine)" strokeWidth="1" />
          {pontos.map((p, i) => (
            <circle
              key={i}
              cx={p.x * tamanhoSvg}
              cy={tamanhoSvg - p.y * tamanhoSvg}
              r={1.4}
              fill={p.dentro ? "var(--pine)" : "var(--rust)"}
              opacity={0.75}
            />
          ))}
        </svg>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 160 }}>
          <button type="button" className="botao-copiar" onClick={() => adicionarPontos(200)} style={{ fontSize: "0.82rem" }}>+ 200 pontos</button>
          <button type="button" className="botao-copiar" onClick={() => adicionarPontos(1000)} style={{ fontSize: "0.82rem" }}>+ 1.000 pontos</button>
          <button type="button" className="botao-copiar" onClick={reiniciar} style={{ fontSize: "0.82rem" }}>↺ Reiniciar</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, justifyContent: "center", fontSize: "0.78rem", color: "var(--ink-soft)", marginTop: 12 }}>
        <span>🟢 Dentro do quarto de círculo</span>
        <span>🔴 Fora</span>
      </div>

      <div className="mat-interativo__resultado">
        <div className="mat-resultado-numero" style={{ fontSize: "1.7rem" }}>π ≈ {estimativaPi.toFixed(4)}</div>
        <div className="mat-resultado-desc">com {pontos.length.toLocaleString("pt-BR")} pontos simulados</div>
        <div className="mat-resultado-extra">
          Valor real de π = 3,14159... — erro de {erro.toFixed(4)}. Quanto mais pontos, mais a estimativa converge para o valor real (Lei dos Grandes Números).
        </div>
      </div>
    </div>
  );
}
