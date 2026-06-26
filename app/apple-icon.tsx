import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const PINE  = "#1e4b3c";
const OCHRE = "#b9802c";
const WHITE = "#ffffff";

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
          backgroundColor: PINE,
          borderRadius: 36,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 0 }}>
          <span style={{ color: WHITE, fontSize: 88, fontWeight: 800, letterSpacing: -4, lineHeight: 1 }}>
            L
          </span>
          <span style={{ color: OCHRE, fontSize: 88, fontWeight: 800, letterSpacing: -4, lineHeight: 1 }}>
            A
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
