import { formatarDezena } from "@/lib/format";

function corDoCalor(t: number): string {
  // t entre 0 (menos) e 1 (mais). Usa a paleta do próprio site em vez de
  // uma escala genérica azul-amarelo-vermelho: pinho (--pine) → ocre
  // (--ochre) → terracota (--rust), mantendo o mapa de calor consistente
  // com o resto da identidade visual.
  const clamped = Math.max(0, Math.min(1, t));
  const frio = [30, 75, 60];    // --pine
  const meio = [185, 128, 44];  // --ochre
  const quente = [142, 58, 42]; // --rust

  let r: number, g: number, b: number;
  if (clamped < 0.5) {
    const k = clamped * 2;
    r = frio[0] + (meio[0] - frio[0]) * k;
    g = frio[1] + (meio[1] - frio[1]) * k;
    b = frio[2] + (meio[2] - frio[2]) * k;
  } else {
    const k = (clamped - 0.5) * 2;
    r = meio[0] + (quente[0] - meio[0]) * k;
    g = meio[1] + (quente[1] - meio[1]) * k;
    b = meio[2] + (quente[2] - meio[2]) * k;
  }
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

export default function HeatmapVolante({
  dezenaMin,
  dezenaMax,
  gridColunas,
  valores,
  rotuloValor,
  invertido = false,
}: {
  dezenaMin: number;
  dezenaMax: number;
  gridColunas: number;
  valores: Record<number, number>;
  rotuloValor: string;
  invertido?: boolean;
}) {
  const todasDezenas = Array.from({ length: dezenaMax - dezenaMin + 1 }, (_, i) => dezenaMin + i);
  const valoresNumeros = todasDezenas.map((d) => valores[d] ?? 0);
  const min = Math.min(...valoresNumeros);
  const max = Math.max(...valoresNumeros);
  const intervalo = max - min || 1;

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${gridColunas}, 1fr)`,
          gap: "6px",
          maxWidth: gridColunas <= 6 ? "420px" : "560px",
          margin: "16px 0",
        }}
      >
        {todasDezenas.map((d) => {
          const valor = valores[d] ?? 0;
          const tBase = (valor - min) / intervalo;
          const t = invertido ? 1 - tBase : tBase;
          return (
            <div
              key={d}
              title={`${formatarDezena(d)}: ${valor} ${rotuloValor}`}
              style={{
                aspectRatio: "1",
                borderRadius: "4px",
                background: corDoCalor(t),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#fff",
                textShadow: "0 1px 2px rgba(0,0,0,0.35)",
              }}
            >
              {formatarDezena(d)}
            </div>
          );
        })}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontFamily: "var(--font-mono)",
          fontSize: "0.72rem",
          color: "var(--ink-faint)",
        }}
      >
        <span>menos</span>
        <div
          style={{
            width: "120px",
            height: "10px",
            borderRadius: "4px",
            background: "linear-gradient(to right, rgb(30,75,60), rgb(185,128,44), rgb(142,58,42))",
          }}
        />
        <span>mais</span>
        <span style={{ marginLeft: "8px" }}>({rotuloValor})</span>
      </div>
    </div>
  );
}
