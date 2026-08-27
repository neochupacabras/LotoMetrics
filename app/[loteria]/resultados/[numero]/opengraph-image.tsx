import { ImageResponse } from "next/og";
import { getConcursoPorNumero, getLoteriaPorCodigo } from "@/lib/queries";
import { formatarData, isCodigoLoteriaValido } from "@/lib/format";
import { NOME_LOTERIA } from "@/lib/seo";

export const alt = "Resultado do concurso";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Mesmo motivo do page.tsx nesta pasta: concurso já sorteado é imutável, e
// sem generateStaticParams um segmento dinâmico aninhado nunca é elegível
// pra cache — reprocessaria a imagem (renderização via Satori) a cada
// preview gerado por WhatsApp/Twitter/etc.
export const revalidate = 86400;
export async function generateStaticParams() {
  return [];
}

// Mesmas cores de app/globals.css — Satori não entende var(), então os
// valores hex precisam estar repetidos aqui (ver app/opengraph-image.tsx).
const PAPER = "#f3f1ea";
const INK = "#17171a";
const INK_SOFT = "#4a4a45";
const PINE = "#c23b22";
const OCHRE = "#b9802c";
const RUST = "#7a2e1f";
const LINE = "#d4d2c8";

export default async function Image({
  params,
}: {
  params: Promise<{ loteria: string; numero: string }>;
}) {
  const { loteria: codigoLoteria, numero: numeroParam } = await params;

  const numero = Number(numeroParam);
  const loteria = isCodigoLoteriaValido(codigoLoteria)
    ? await getLoteriaPorCodigo(codigoLoteria)
    : null;
  const concurso =
    loteria && Number.isInteger(numero) ? await getConcursoPorNumero(loteria.id, numero) : null;

  const nomeLoteria = NOME_LOTERIA[codigoLoteria] ?? loteria?.nome ?? codigoLoteria;

  // Sem concurso (número inválido, ainda não importado) — cai pro card
  // genérico da loteria, sem inventar dezenas que não existem.
  if (!loteria || !concurso) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            backgroundColor: PAPER,
            padding: "72px",
          }}
        >
          <div style={{ display: "flex", fontSize: 28, fontFamily: "monospace", color: INK_SOFT, marginBottom: 20 }}>
            LOTOANALÍTICA
          </div>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 700, color: INK }}>
            Resultados da {nomeLoteria}
          </div>
        </div>
      ),
      { ...size }
    );
  }

  const dezenas = concurso.dezenas;
  // Grades grandes (Lotomania: 20 dezenas) precisam de bolinhas menores
  // pra caber em uma imagem de 1200×630 sem quebrar layout.
  const tamanhoBolinha = dezenas.length > 15 ? 58 : dezenas.length > 7 ? 70 : 84;
  const fonteBolinha = dezenas.length > 15 ? 24 : dezenas.length > 7 ? 28 : 32;

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
          padding: "64px 72px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 26, fontFamily: "monospace", color: INK_SOFT, marginBottom: 16 }}>
            LOTOANALÍTICA · {nomeLoteria.toUpperCase()}
          </div>
          <div style={{ display: "flex", fontSize: 68, fontWeight: 700, color: INK, alignItems: "baseline" }}>
            <span>Concurso {concurso.numero}</span>
          </div>
          <div style={{ display: "flex", fontSize: 30, color: INK_SOFT, marginTop: 12 }}>
            Sorteado em {formatarData(concurso.dataSorteio)}
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, maxWidth: 1050 }}>
          {dezenas.map((d) => (
            <div
              key={d}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: tamanhoBolinha,
                height: tamanhoBolinha,
                borderRadius: "50%",
                border: `3px solid ${INK}`,
                backgroundColor: PAPER,
                color: INK,
                fontSize: fonteBolinha,
                fontWeight: 700,
              }}
            >
              {String(d).padStart(2, "0")}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `2px solid ${LINE}`,
            paddingTop: 28,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 28,
              fontWeight: 700,
              color: concurso.acumulado ? RUST : PINE,
              textTransform: "uppercase",
            }}
          >
            {concurso.acumulado ? "Acumulou" : "Teve ganhador"}
          </div>
          {concurso.valorEstimadoProximo && (
            <div style={{ display: "flex", fontSize: 26, color: OCHRE, fontWeight: 700 }}>
              Próximo: {concurso.valorEstimadoProximo.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
