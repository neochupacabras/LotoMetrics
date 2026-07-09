"use client";
import { useState, useMemo } from "react";

const EXEMPLOS = [
  {
    label: "Chocolate × Nobel",
    xLabel: "Consumo de chocolate (kg/pessoa/ano)",
    yLabel: "Prêmios Nobel per capita",
    pontos: [[1.8,0.1],[2.5,0.3],[3.1,0.4],[4.2,0.8],[5.0,1.2],[5.6,1.9],[6.3,2.1],[7.1,2.8],[8.2,3.2],[9.0,4.1],[10.2,5.0],[11.8,5.5]],
    correlacao: 0.79,
    causal: false,
    explicacao: "Países ricos tendem a consumir mais chocolate E ganhar mais Nobel. A variável oculta é riqueza — não o chocolate.",
  },
  {
    label: "Treino × Desempenho",
    xLabel: "Horas de treino por semana",
    yLabel: "Desempenho (pontos)",
    pontos: [[1,20],[2,30],[3,38],[4,55],[5,62],[6,71],[7,79],[8,85],[9,90],[10,94]],
    correlacao: 0.99,
    causal: true,
    explicacao: "Aqui há causalidade real: treinar mais melhora o desempenho. A correlação alta reflete uma relação de causa e efeito.",
  },
  {
    label: "Afogamentos × Sorvete",
    xLabel: "Vendas de sorvete (unidades)",
    yLabel: "Afogamentos no mês",
    pontos: [[100,5],[200,8],[500,15],[800,22],[1200,31],[1500,38],[1800,45],[2200,55],[2600,65],[3000,78]],
    correlacao: 0.98,
    causal: false,
    explicacao: "Calor causa tanto mais vendas de sorvete quanto mais afogamentos. Correlação altíssima, mas o sorvete não afoga ninguém.",
  },
];

export function VisualizadorCorrelacao() {
  const [ex, setEx] = useState(0);
  const exemplo = EXEMPLOS[ex];

  const xs = exemplo.pontos.map(p => p[0]);
  const ys = exemplo.pontos.map(p => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const W = 300, H = 200, pad = 30;

  const toSvgX = (x: number) => pad + ((x - minX) / (maxX - minX)) * (W - 2 * pad);
  const toSvgY = (y: number) => H - pad - ((y - minY) / (maxY - minY)) * (H - 2 * pad);

  return (
    <div className="mat-interativo">
      <p className="mat-interativo__titulo">🍫 Correlação não é causalidade</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {EXEMPLOS.map((e, i) => (
          <button key={i} type="button"
            className={i === ex ? "botao-gerar" : "botao-copiar"}
            onClick={() => setEx(i)}
            style={{ fontSize: "0.82rem", padding: "6px 12px" }}>
            {e.label}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 400, display: "block", margin: "0 auto" }}>
        {/* Eixos */}
        <line x1={pad} y1={H-pad} x2={W-pad} y2={H-pad} stroke="var(--line-strong)" strokeWidth={1}/>
        <line x1={pad} y1={pad} x2={pad} y2={H-pad} stroke="var(--line-strong)" strokeWidth={1}/>
        {/* Labels */}
        <text x={W/2} y={H-4} textAnchor="middle" fontSize={8} fill="var(--ink-faint)" fontFamily="var(--font-mono)">{exemplo.xLabel}</text>
        <text x={8} y={H/2} textAnchor="middle" fontSize={8} fill="var(--ink-faint)" fontFamily="var(--font-mono)" transform={`rotate(-90, 8, ${H/2})`}>{exemplo.yLabel}</text>
        {/* Pontos */}
        {exemplo.pontos.map(([x, y], i) => (
          <circle key={i} cx={toSvgX(x)} cy={toSvgY(y)} r={5}
            fill={exemplo.causal ? "var(--pine)" : "var(--rust)"} opacity={0.8} />
        ))}
      </svg>

      <div className="mat-interativo__resultado" style={{ marginTop: 12 }}>
        <div style={{ display: "flex", gap: 24, justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div className="mat-resultado-numero" style={{ fontSize: "1.8rem", color: exemplo.correlacao > 0.7 ? "var(--pine)" : "var(--ochre)" }}>
              r = {exemplo.correlacao.toFixed(2)}
            </div>
            <div className="mat-resultado-desc">coeficiente de correlação</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div className="mat-resultado-numero" style={{ fontSize: "1.4rem", color: exemplo.causal ? "var(--pine)" : "var(--rust)" }}>
              {exemplo.causal ? "✓ Causal" : "✗ Não causal"}
            </div>
            <div className="mat-resultado-desc">relação de causa</div>
          </div>
        </div>
        <div className="mat-resultado-extra" style={{ marginTop: 10 }}>{exemplo.explicacao}</div>
      </div>
    </div>
  );
}
