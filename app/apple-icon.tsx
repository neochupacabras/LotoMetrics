import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const INK = "#17171a";
const PAPER = "#f3f1ea";
const PINE = "#c23b22";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: INK,
        }}
      >
        {/* Chip quadrado com borda de tinta — o mesmo motivo usado nas
            dezenas em todo o site (heatmap, resultados, gerador) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 108,
            height: 108,
            border: `4px solid ${PINE}`,
            backgroundColor: PAPER,
          }}
        >
          <span style={{ color: INK, fontSize: 56, fontWeight: 700, letterSpacing: -1, lineHeight: 1 }}>
            L
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
