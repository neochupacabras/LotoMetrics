import { formatarDezena } from "@/lib/format";

function corDoCalor(t: number): string {
  // t entre 0 (frio/azul) e 1 (quente/vermelho), passando por amarelo no meio.
  const clamped = Math.max(0, Math.min(1, t));
  const frio = [37, 99, 235]; // azul
  const meio = [250, 204, 21]; // amarelo
  const quente = [220, 38, 38]; // vermelho

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
}: {
  dezenaMin: number;
  dezenaMax: number;
  gridColunas: number;
  valores: Record<number, number>;
  rotuloValor: string;
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
          const t = (valor - min) / intervalo;
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
                color: t > 0.55 || t < 0.18 ? "#fff" : "#1a1a1a",
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
            background: "linear-gradient(to right, rgb(37,99,235), rgb(250,204,21), rgb(220,38,38))",
          }}
        />
        <span>mais</span>
        <span style={{ marginLeft: "8px" }}>({rotuloValor})</span>
      </div>
    </div>
  );
}
