"use client";

import { useEffect, useState } from "react";

export default function AnelProgresso({
  percentual,
  texto,
  legenda = "DO CICLO",
  sufixo = "%",
  cor = "var(--pine)",
}: {
  percentual: number;
  texto: React.ReactNode;
  legenda?: string;
  sufixo?: string;
  cor?: string;
}) {
  const raio = 54;
  const circunferencia = 2 * Math.PI * raio;

  // O traço nasce em 0 e anima até o valor real ao montar — reaproveita a
  // mesma ideia do grifo do hero da home (Fase 1), só que aqui a duração
  // real do dado (não um SVG decorativo) justifica animar via estado em
  // vez de só CSS, pra também poder contar o número junto com o traço.
  const [animado, setAnimado] = useState(0);

  useEffect(() => {
    const prefereReduzido =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefereReduzido) {
      setAnimado(percentual);
      return;
    }
    const frame = requestAnimationFrame(() => setAnimado(percentual));
    return () => cancelAnimationFrame(frame);
  }, [percentual]);

  const offset = circunferencia * (1 - animado / 100);

  return (
    <div className="anel-progresso">
      <svg
        className="anel-progresso__svg"
        width="140"
        height="140"
        viewBox="0 0 140 140"
        role="img"
        aria-label={`${percentual}${sufixo} ${legenda.toLowerCase()}`}
      >
        <circle className="anel-progresso__circulo-fundo" cx="70" cy="70" r={raio} />
        <circle
          className="anel-progresso__circulo-valor"
          cx="70"
          cy="70"
          r={raio}
          strokeDasharray={circunferencia}
          strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
          style={{ stroke: cor }}
        />
        <text x="70" y="66" textAnchor="middle" className="anel-progresso__numero">
          {Math.round(animado)}{sufixo}
        </text>
        <text x="70" y="86" textAnchor="middle" className="anel-progresso__legenda">
          {legenda}
        </text>
      </svg>
      <div className="anel-progresso__texto">{texto}</div>
    </div>
  );
}
