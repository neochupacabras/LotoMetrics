import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const INK = "#17171a";
const PINE = "#c23b22";

export default function Icon() {
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
        {/* "L" de LotoAnalítica — mesma cor de destaque (coral) usada
            em todo o site, sobre tinta, sem cantos arredondados */}
        <span style={{ color: PINE, fontSize: 20, fontWeight: 700, lineHeight: 1 }}>
          L
        </span>
      </div>
    ),
    { ...size }
  );
}
