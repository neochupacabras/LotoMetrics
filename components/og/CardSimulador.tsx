// Card "meu jogo teria ganho" para o ImageResponse (Satori não entende var(),
// então as cores repetem as de app/globals.css). O texto vem de
// lib/card-simulador.ts; aqui só o layout.
import type { TextoCard } from "@/lib/card-simulador";

const PAPER = "#f3f1ea";
const INK = "#17171a";
const INK_SOFT = "#4a4a45";
const PINE = "#c23b22";
const OCHRE = "#b9802c";
const LINE = "#d4d2c8";

export type FormatoCard = "quadrado" | "og";
export const TAMANHO_CARD: Record<FormatoCard, { width: number; height: number }> = {
  // Imagem enviada no WhatsApp/Stories.
  quadrado: { width: 1080, height: 1080 },
  // Prévia do link (og:image).
  og: { width: 1200, height: 630 },
};

export interface CardSimuladorProps {
  nomeLoteria: string;
  numeros: string[];
  trevos: string[];
  texto: TextoCard;
  formato: FormatoCard;
  enderecoSimulador: string; // "lotoanalitica.com.br/megasena/simulador"
}

function tamanhoBolinha(qtd: number, formato: FormatoCard): { lado: number; fonte: number } {
  const og = formato === "og";
  if (qtd > 30) return og ? { lado: 40, fonte: 17 } : { lado: 70, fonte: 26 };
  if (qtd > 15) return og ? { lado: 50, fonte: 21 } : { lado: 82, fonte: 30 };
  if (qtd > 7) return og ? { lado: 60, fonte: 24 } : { lado: 96, fonte: 36 };
  return og ? { lado: 72, fonte: 28 } : { lado: 118, fonte: 44 };
}

export default function CardSimulador({
  nomeLoteria, numeros, trevos, texto, formato, enderecoSimulador,
}: CardSimuladorProps) {
  const og = formato === "og";
  const { lado, fonte } = tamanhoBolinha(numeros.length, formato);
  const bolinha = (n: string, cor: string, fundo: string) => (
    <div
      key={`${cor}-${n}`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: lado,
        height: lado,
        borderRadius: "50%",
        border: `3px solid ${cor}`,
        backgroundColor: fundo,
        color: cor,
        fontSize: fonte,
        fontWeight: 700,
      }}
    >
      {n}
    </div>
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: PAPER,
        padding: og ? "48px 64px" : "72px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontSize: og ? 22 : 30, fontFamily: "monospace", color: INK_SOFT, marginBottom: og ? 12 : 24 }}>
          LOTOANALÍTICA · {nomeLoteria.toUpperCase()}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: og ? 54 : 76,
            fontWeight: 700,
            lineHeight: 1.1,
            color: texto.premiado ? PINE : INK,
          }}
        >
          {texto.titulo}
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: og ? 10 : 16 }}>
        {numeros.map((n) => bolinha(n, INK, PAPER))}
        {trevos.map((t) => bolinha(t, OCHRE, "#f7ecd9"))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: og ? 6 : 14 }}>
        {texto.destaque && (
          <div style={{ display: "flex", fontSize: og ? 26 : 36, fontWeight: 700, color: INK }}>
            {texto.destaque}
          </div>
        )}
        <div style={{ display: "flex", fontSize: og ? 24 : 32, color: INK_SOFT, lineHeight: 1.3 }}>
          {texto.resumo}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          borderTop: `2px solid ${LINE}`,
          paddingTop: og ? 14 : 28,
          gap: og ? 4 : 10,
        }}
      >
        <div style={{ display: "flex", fontSize: og ? 24 : 32, fontWeight: 700, color: PINE }}>
          Confira o seu: {enderecoSimulador}
        </div>
        <div style={{ display: "flex", fontSize: og ? 17 : 22, color: INK_SOFT }}>
          Simulação com os prêmios reais pagos. O passado não muda as chances do próximo sorteio.
        </div>
      </div>
    </div>
  );
}
