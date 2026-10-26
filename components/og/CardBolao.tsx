// Cartão do bolão para o ImageResponse (Satori não entende var(), então as
// cores repetem as de app/globals.css). Separado da rota pra poder ser
// renderizado com dados de teste.
const PAPER = "#f3f1ea";
const INK = "#17171a";
const INK_SOFT = "#4a4a45";
const PINE = "#c23b22";
const OCHRE = "#b9802c";
const LINE = "#d4d2c8";

export interface CardBolaoProps {
  etiqueta: string;
  titulo: string;
  linha1: string;
  linha2: string;
  destaque: boolean;
}

export default function CardBolao({ etiqueta, titulo, linha1, linha2, destaque }: CardBolaoProps) {
  return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: PAPER,
          padding: "64px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              fontFamily: "monospace",
              color: OCHRE,
              marginBottom: 24,
            }}
          >
            {etiqueta}
          </div>
          <div style={{ display: "flex", fontSize: 84, fontWeight: 700, color: INK, lineHeight: 1.05 }}>
            {titulo}
          </div>
          <div style={{ display: "flex", fontSize: 40, color: INK_SOFT, marginTop: 36 }}>{linha1}</div>
          <div
            style={{
              display: "flex",
              fontSize: 46,
              fontWeight: 700,
              color: destaque ? PINE : INK,
              marginTop: 14,
            }}
          >
            {linha2}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `2px solid ${LINE}`,
            paddingTop: 32,
          }}
        >
          <div style={{ display: "flex", fontSize: 44, fontWeight: 700 }}>
            <span style={{ color: INK }}>Loto</span>
            <span style={{ color: PINE }}>Analítica</span>
          </div>
          <div style={{ display: "flex", fontSize: 26, fontFamily: "monospace", color: INK_SOFT }}>
            lotoanalitica.com.br
          </div>
        </div>
      </div>
  );
}
