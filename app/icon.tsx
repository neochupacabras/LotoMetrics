import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const PINE = "#1e4b3c";
const PAPER = "#efeee6";

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
          borderRadius: 7,
          color: PAPER,
          fontSize: 22,
          fontWeight: 700,
        }}
      >
        L
      </div>
    ),
    { ...size }
  );
}
