// Gera o PDF do bolão inteiramente no navegador, na hora em que o
// usuário clica em baixar — sem round-trip ao servidor. Usa pdf-lib,
// que funciona em qualquer ambiente JS, incluindo o browser.

import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from "pdf-lib";
import { formatarDezena } from "./format";

export interface DadosPdfBolao {
  nomeLoteria: string;
  tamanhoPool: number;
  garantia: number;
  poolDezenas: number[];
  tickets: number[][];
  custoTotal: number;
  precoAposta: number;
  qtdParticipantes: number | null;
}

const PAGE_WIDTH = 595.28; // A4 em pontos
const PAGE_HEIGHT = 841.89;
const MARGIN = 48;

const COR_PINE = rgb(0x1e / 255, 0x4b / 255, 0x3c / 255);
const COR_OCHRE = rgb(0xb9 / 255, 0x80 / 255, 0x2c / 255);
const COR_INK = rgb(0x1c / 255, 0x1b / 255, 0x17 / 255);
const COR_INK_SOFT = rgb(0x5b / 255, 0x58 / 255, 0x47 / 255);
const COR_LINE = rgb(0xd8 / 255, 0xd4 / 255, 0xc5 / 255);

function formatarMoedaPdf(valor: number): string {
  return "R$ " + valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export async function gerarPdfBolao(dados: DadosPdfBolao): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(`Bolão ${dados.nomeLoteria} — LotoMetrics`);
  pdfDoc.setProducer("LotoMetrics");

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;
  let numeroPagina = 1;

  function rodape() {
    page.drawText(`LotoMetrics — gerado em ${new Date().toLocaleDateString("pt-BR")} — página ${numeroPagina}`, {
      x: MARGIN,
      y: 24,
      size: 7,
      font: fontRegular,
      color: COR_INK_SOFT,
    });
  }

  function novaPagina() {
    rodape();
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    numeroPagina++;
    y = PAGE_HEIGHT - MARGIN;
  }

  function garantirEspaco(altura: number) {
    if (y - altura < MARGIN + 20) {
      novaPagina();
    }
  }

  function texto(
    conteudo: string,
    opts: { size?: number; font?: PDFFont; color?: ReturnType<typeof rgb>; x?: number } = {}
  ) {
    const size = opts.size ?? 10;
    const font = opts.font ?? fontRegular;
    const color = opts.color ?? COR_INK;
    page.drawText(conteudo, { x: opts.x ?? MARGIN, y, size, font, color });
  }

  // ---------- Cabeçalho ----------
  texto("LotoMetrics", { size: 18, font: fontBold, color: COR_PINE });
  y -= 8;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_WIDTH - MARGIN, y },
    thickness: 1.5,
    color: COR_OCHRE,
  });
  y -= 28;

  texto(`Bolão — ${dados.nomeLoteria}`, { size: 20, font: fontBold });
  y -= 26;
  texto(`Gerado em ${new Date().toLocaleDateString("pt-BR")}`, { size: 9, color: COR_INK_SOFT });
  y -= 28;

  // ---------- Resumo ----------
  const linhasResumo: [string, string][] = [
    ["Pool de dezenas", `${dados.tamanhoPool} dezenas`],
    ["Garantia", `pelo menos ${dados.garantia} pontos, se ${dados.garantia} das dezenas do pool saírem`],
    ["Total de jogos gerados", `${dados.tickets.length}`],
    ["Preço por jogo simples", formatarMoedaPdf(dados.precoAposta)],
    ["Custo total do bolão", formatarMoedaPdf(dados.custoTotal)],
  ];
  if (dados.qtdParticipantes && dados.qtdParticipantes > 0) {
    linhasResumo.push([
      "Custo por participante",
      `${formatarMoedaPdf(dados.custoTotal / dados.qtdParticipantes)} (${dados.qtdParticipantes} participantes)`,
    ]);
  }

  for (const [rotulo, valor] of linhasResumo) {
    texto(rotulo, { size: 9, font: fontBold, color: COR_INK_SOFT });
    texto(valor, { size: 11, x: MARGIN + 190 });
    y -= 20;
  }

  y -= 8;
  texto("Dezenas do pool:", { size: 9, font: fontBold, color: COR_INK_SOFT });
  y -= 16;
  const poolTexto = dados.poolDezenas.map(formatarDezena).join("  ·  ");
  texto(poolTexto, { size: 11, font: fontBold, color: COR_PINE });
  y -= 30;

  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_WIDTH - MARGIN, y },
    thickness: 0.75,
    color: COR_LINE,
  });
  y -= 24;

  // ---------- Lista de jogos ----------
  texto(`Todos os ${dados.tickets.length} jogos`, { size: 13, font: fontBold });
  y -= 20;

  dados.tickets.forEach((ticket, i) => {
    garantirEspaco(16);
    const numeroStr = String(i + 1).padStart(String(dados.tickets.length).length, "0");
    const dezenasStr = ticket.map(formatarDezena).join("-");
    texto(`${numeroStr}`, { size: 9, font: fontBold, color: COR_OCHRE, x: MARGIN });
    texto(dezenasStr, { size: 9, font: fontRegular, x: MARGIN + 42 });
    y -= 15;
  });

  // ---------- Rodapé final ----------
  garantirEspaco(60);
  y -= 10;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_WIDTH - MARGIN, y },
    thickness: 0.75,
    color: COR_LINE,
  });
  y -= 18;
  texto(
    "Conteúdo informativo e organizacional. A garantia descrita só vale se as dezenas do",
    { size: 8, color: COR_INK_SOFT }
  );
  y -= 11;
  texto(
    "pool realmente contiverem a quantidade indicada das dezenas sorteadas — isso não muda",
    { size: 8, color: COR_INK_SOFT }
  );
  y -= 11;
  texto(
    "a probabilidade de isso acontecer. Resultados oficiais são sempre os da Caixa.",
    { size: 8, color: COR_INK_SOFT }
  );

  rodape();

  return pdfDoc.save();
}

export function baixarPdfBolao(bytes: Uint8Array, nomeArquivo: string) {
  const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  a.click();
  URL.revokeObjectURL(url);
}
