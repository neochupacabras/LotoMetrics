import { ImageResponse } from "next/og";
import { getBolaoPublico, ultimoResumo } from "@/lib/bolao-publico";
import { descreverResultado, formatarMoedaCents } from "@/lib/bolao-compartilhar";
import { NOME_LOTERIA } from "@/lib/seo";
import CardBolao from "@/components/og/CardBolao";

export const alt = "Bolão no LotoAnalítica";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Card de pré-visualização do link do bolão (WhatsApp, Telegram, etc.):
// antes do sorteio mostra o título, as cotas pagas e o valor da cota; depois
// da conferência, o resultado do bolão. Nunca expõe participantes nem
// e-mails.
function truncar(texto: string, max: number): string {
  return texto.length > max ? `${texto.slice(0, max - 1)}…` : texto;
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const bolao = await getBolaoPublico(slug);

  const nomeLoteria = bolao ? (NOME_LOTERIA[bolao.loteria] ?? bolao.loteria) : "";
  const resumo = bolao ? ultimoResumo(bolao) : null;
  const cotasPagas = bolao
    ? bolao.participantes.filter((p) => p.pago).reduce((s, p) => s + p.cotas, 0)
    : 0;

  const linha1 = bolao
    ? resumo
      ? `Resultado — concurso ${resumo.concurso}`
      : `${nomeLoteria} · ${bolao.qtdCotas} cotas de ${formatarMoedaCents(bolao.valorCotaCents)}`
    : "Organize o bolão do seu grupo";
  const linha2 = bolao
    ? resumo
      ? descreverResultado(resumo)
      : `${cotasPagas} de ${bolao.qtdCotas} cotas pagas`
    : "Link para o grupo, controle de pagamento e conferência automática";

  return new ImageResponse(
    (
      <CardBolao
        etiqueta={bolao ? `BOLÃO · ${nomeLoteria.toUpperCase()}` : "BOLÃO"}
        titulo={bolao ? truncar(bolao.titulo, 60) : "Bolão"}
        linha1={linha1}
        linha2={linha2}
        destaque={!!resumo && resumo.premiados > 0}
      />
    ),
    { ...size }
  );
}
