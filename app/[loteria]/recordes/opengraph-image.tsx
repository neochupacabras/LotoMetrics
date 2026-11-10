import { ImageResponse } from "next/og";
import { getLoteriaPorCodigo } from "@/lib/queries";
import { getRecordesLoteria } from "@/lib/recordes";
import { formatarMoedaCompacta } from "@/lib/resumo-concurso";
import { formatarData, isCodigoLoteriaValido, preposicaoLoteria } from "@/lib/format";
import { NOME_LOTERIA } from "@/lib/seo";

// Card dos recordes de cada loteria: prévia do link e imagem para a imprensa.
// Mesmas cores de app/globals.css (Satori não entende var()).
export const alt = "Recordes da loteria";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 3600;

const PAPER = "#f3f1ea";
const INK = "#17171a";
const INK_SOFT = "#4a4a45";
const PINE = "#c23b22";
const LINE = "#d4d2c8";

export default async function Image({ params }: { params: Promise<{ loteria: string }> }) {
  const { loteria: codigo } = await params;
  const loteria = isCodigoLoteriaValido(codigo) ? await getLoteriaPorCodigo(codigo) : null;
  const r = loteria ? await getRecordesLoteria(loteria.id, codigo) : null;
  const nome = NOME_LOTERIA[codigo] ?? loteria?.nome ?? codigo;
  const { de } = preposicaoLoteria(codigo);
  const maior = r?.maioresPremios[0] ?? null;

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
          padding: "60px 72px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 26, fontFamily: "monospace", color: INK_SOFT, marginBottom: 16 }}>
            LOTOANALÍTICA · RECORDES
          </div>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 700, color: INK }}>
            Recordes {de} {nome}
          </div>
        </div>

        {maior ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 30, color: INK_SOFT }}>Maior prêmio por aposta</div>
            <div style={{ display: "flex", fontSize: 92, fontWeight: 700, color: PINE, lineHeight: 1.1 }}>
              {formatarMoedaCompacta(maior.valor)}
            </div>
            <div style={{ display: "flex", fontSize: 30, color: INK }}>
              Concurso {maior.numero}, {formatarData(maior.data)}
              {maior.ganhadores > 1 ? ` · ${maior.ganhadores} ganhadores` : ""}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", fontSize: 40, color: INK_SOFT }}>Os maiores prêmios e as dezenas campeãs</div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: `2px solid ${LINE}`,
            paddingTop: 22,
            fontSize: 24,
            color: INK_SOFT,
          }}
        >
          <div style={{ display: "flex" }}>{r ? `Atualizado até o concurso ${r.ultimo.numero}` : "Dados oficiais da Caixa"}</div>
          <div style={{ display: "flex" }}>Valores da época, sem correção</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
