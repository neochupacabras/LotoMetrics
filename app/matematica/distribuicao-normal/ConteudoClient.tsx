"use client";

import Link from "next/link";
import { useState, useMemo } from "react";

export function CurvaGaussiana() {
  const [media, setMedia] = useState(170);
  const [dp, setDp] = useState(10);

  const gaussian = (x: number) =>
    Math.exp(-0.5 * ((x - media) / dp) ** 2) / (dp * Math.sqrt(2 * Math.PI));

  const xs = useMemo(() => {
    const arr: number[] = [];
    for (let x = media - 4 * dp; x <= media + 4 * dp; x += dp / 10) arr.push(x);
    return arr;
  }, [media, dp]);

  const maxY = gaussian(media);
  const viewW = 400, viewH = 140;
  const xToSvg = (x: number) => ((x - (media - 4 * dp)) / (8 * dp)) * viewW;
  const yToSvg = (y: number) => viewH - (y / maxY) * (viewH - 10) - 5;

  const pontos = xs.map(x => `${xToSvg(x).toFixed(1)},${yToSvg(gaussian(x)).toFixed(1)}`).join(" ");

  const regioes = [
    { from: media - dp,  to: media + dp,  cor: "var(--pine)",  label: "68%",  opacity: 0.3 },
    { from: media - 2*dp,to: media + 2*dp,cor: "var(--ochre)", label: "95%",  opacity: 0.2 },
    { from: media - 3*dp,to: media + 3*dp,cor: "var(--rust)",  label: "99,7%",opacity: 0.1 },
  ];

  return (
    <div className="mat-interativo">
      <p className="mat-interativo__titulo">🔔 Curva em sino — distribuição normal</p>
      <div className="mat-interativo__controles">
        <div className="mat-interativo__campo">
          <label>Média (μ)</label>
          <div className="mat-interativo__slider-wrap">
            <input type="range" min={100} max={250} value={media}
              onChange={e => setMedia(+e.target.value)} />
            <span className="mat-interativo__valor">{media} cm</span>
          </div>
        </div>
        <div className="mat-interativo__campo">
          <label>Desvio padrão (σ)</label>
          <div className="mat-interativo__slider-wrap">
            <input type="range" min={3} max={30} value={dp}
              onChange={e => setDp(+e.target.value)} />
            <span className="mat-interativo__valor">{dp} cm</span>
          </div>
        </div>
      </div>
      <svg viewBox={`0 0 ${viewW} ${viewH}`} style={{ width: "100%", maxWidth: 480 }}>
        {regioes.slice().reverse().map((r, i) => {
          const x1 = xToSvg(r.from), x2 = xToSvg(r.to);
          const pts = xs.filter(x => x >= r.from && x <= r.to)
            .map(x => `${xToSvg(x).toFixed(1)},${yToSvg(gaussian(x)).toFixed(1)}`).join(" ");
          const baseline = yToSvg(0);
          return (
            <g key={i}>
              <polygon points={`${x1},${baseline} ${pts} ${x2},${baseline}`}
                fill={r.cor} opacity={r.opacity} />
              <text x={(x1+x2)/2} y={yToSvg(gaussian(media)*0.15)}
                textAnchor="middle" fontSize="9" fill={r.cor} fontFamily="var(--font-mono)" fontWeight="bold">
                {r.label}
              </text>
            </g>
          );
        })}
        <polyline points={pontos} fill="none" stroke="var(--pine)" strokeWidth="2" />
        <line x1={xToSvg(media)} y1={5} x2={xToSvg(media)} y2={viewH}
          stroke="var(--pine)" strokeWidth="1" strokeDasharray="4 2" opacity="0.5" />
        <text x={xToSvg(media)} y={viewH - 2} textAnchor="middle"
          fontSize="9" fill="var(--pine)" fontFamily="var(--font-mono)">μ={media}</text>
      </svg>
      <div className="mat-interativo__resultado" style={{ marginTop: 8 }}>
        <div className="mat-resultado-extra">
          {media - dp}–{media + dp} cm: 68% das pessoas &nbsp;|&nbsp;
          {media - 2*dp}–{media + 2*dp} cm: 95% das pessoas
        </div>
      </div>
    </div>
  );
}

