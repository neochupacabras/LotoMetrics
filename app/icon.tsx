import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const PINE  = "#1e4b3c";
const OCHRE = "#b9802c";
const WHITE = "#ffffff";

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
          backgroundColor: PINE,
          borderRadius: 6,
        }}
      >
        {/* "L" em branco + "A" em ocre — iniciais de LotoAnalítica */}
        <span style={{ color: WHITE, fontSize: 16, fontWeight: 800, letterSpacing: -1, lineHeight: 1 }}>
          L
        </span>
        <span style={{ color: OCHRE, fontSize: 16, fontWeight: 800, letterSpacing: -1, lineHeight: 1 }}>
          A
        </span>
      </div>
    ),
    { ...size }
  );
}
