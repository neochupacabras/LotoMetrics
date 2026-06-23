import { ImageResponse } from "next/og";

export const alt = "LotoAnalítica — Resultados e estatísticas de loteria";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Mesmas cores de app/globals.css — Satori (o motor por trás do
// ImageResponse) não entende var(), então os valores hex precisam
// estar repetidos aqui.
const PAPER = "#efeee6";
const INK = "#1c1b17";
const INK_SOFT = "#5b5847";
const PINE = "#1e4b3c";
const OCHRE = "#b9802c";
const LINE = "#d8d4c5";

const DEZENAS_DECORATIVAS = [3, 8, 12, 17, 21, 25];

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: PAPER,
          padding: "72px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              fontFamily: "monospace",
              color: INK_SOFT,
              marginBottom: 28,
            }}
          >
            RESULTADOS E ESTATÍSTICAS DE LOTERIA
          </div>
          <div style={{ display: "flex", fontSize: 116, fontWeight: 700 }}>
            <span style={{ color: INK }}>Loto</span>
            <span style={{ color: PINE }}>Metrics</span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 32,
              color: INK_SOFT,
              marginTop: 28,
              maxWidth: 820,
            }}
          >
            Lotofácil e Mega-Sena: frequência, atraso, ciclos, gerador de jogos e
            probabilidades reais
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            borderTop: `2px solid ${LINE}`,
            paddingTop: 40,
          }}
        >
          {DEZENAS_DECORATIVAS.map((d) => (
            <div
              key={d}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 76,
                height: 76,
                borderRadius: 999,
                backgroundColor: OCHRE,
                color: INK,
                fontSize: 32,
                fontWeight: 700,
                marginRight: 18,
              }}
            >
              {String(d).padStart(2, "0")}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
