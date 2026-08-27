// Gera o PDF do bolão inteiramente no navegador, na hora em que o
// usuário clica em baixar — sem round-trip ao servidor. Usa pdf-lib,
// que funciona em qualquer ambiente JS, incluindo o browser.
//
// Paleta e tipografia seguem o mesmo sistema "Editorial de Dados" do
// site (ver app/globals.css): serifa grande pra manchete, mono pros
// dados/rótulos, terracota como única cor de destaque. As dezenas são
// desenhadas como selos com borda — o mesmo desenho de .dezena-bola —
// em vez de texto corrido, porque este PDF é feito pra ser copiado
// dezena por dezena pra um bilhete de papel de verdade.

import { PDFDocument, StandardFonts, rgb, PDFFont } from "pdf-lib";
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
const USABLE_WIDTH = PAGE_WIDTH - MARGIN * 2;

// Direto de app/globals.css — mesmos hex, convertidos pra 0..1.
const COR_PAPEL = rgb(0xf3 / 255, 0xf1 / 255, 0xea / 255);
const COR_PAPEL_ELEVADO = rgb(0xfa / 255, 0xf9 / 255, 0xf4 / 255);
const COR_INK = rgb(0x17 / 255, 0x17 / 255, 0x1a / 255);
const COR_INK_SOFT = rgb(0x4a / 255, 0x4a / 255, 0x45 / 255);
const COR_INK_FAINT = rgb(0x6b / 255, 0x6a / 255, 0x63 / 255);
const COR_PINE = rgb(0xc2 / 255, 0x3b / 255, 0x22 / 255); // terracota — não verde
const COR_PINE_DEEP = rgb(0x8f / 255, 0x24 / 255, 0x14 / 255);
const COR_OCHRE = rgb(0xb9 / 255, 0x80 / 255, 0x2c / 255);
const COR_LINE = rgb(0xd4 / 255, 0xd2 / 255, 0xc8 / 255);
const COR_LINE_STRONG = rgb(0xb0 / 255, 0xac / 255, 0x9c / 255);

function formatarMoedaPdf(valor: number): string {
  return "R$ " + valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export async function gerarPdfBolao(dados: DadosPdfBolao): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(`Bolão ${dados.nomeLoteria} — LotoAnalítica`);
  pdfDoc.setProducer("LotoAnalítica");
  pdfDoc.setSubject(`${dados.tickets.length} jogos, garantia de ${dados.garantia} pontos`);

  // Três papéis, igual ao site: serifa pra manchete, sans pro corpo,
  // mono pros dados e rótulos. Todas fontes padrão do PDF — nenhum
  // arquivo de fonte pra baixar/incorporar.
  const serif = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const serifBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const sans = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const sansBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const mono = await pdfDoc.embedFont(StandardFonts.Courier);
  const monoBold = await pdfDoc.embedFont(StandardFonts.CourierBold);

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;
  let numeroPagina = 1;
  const totalPaginasEstimado = Math.max(1, Math.ceil(dados.tickets.length / 28) + 1);

  function pintarFundo() {
    page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: COR_PAPEL });
  }
  pintarFundo();

  function rodape() {
    page.drawLine({
      start: { x: MARGIN, y: 34 },
      end: { x: PAGE_WIDTH - MARGIN, y: 34 },
      thickness: 0.5,
      color: COR_LINE,
    });
    page.drawText("LOTOANALITICA.COM.BR", {
      x: MARGIN,
      y: 22,
      size: 7,
      font: monoBold,
      color: COR_INK_FAINT,
    });
    const paginaTxt = `PAGINA ${numeroPagina} DE ${totalPaginasEstimado}`;
    const largura = mono.widthOfTextAtSize(paginaTxt, 7);
    page.drawText(paginaTxt, {
      x: PAGE_WIDTH - MARGIN - largura,
      y: 22,
      size: 7,
      font: mono,
      color: COR_INK_FAINT,
    });
  }

  function novaPagina() {
    rodape();
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pintarFundo();
    numeroPagina++;
    y = PAGE_HEIGHT - MARGIN;
  }

  function garantirEspaco(altura: number) {
    if (y - altura < MARGIN + 30) {
      novaPagina();
    }
  }

  function texto(
    conteudo: string,
    opts: { size?: number; font?: PDFFont; color?: ReturnType<typeof rgb>; x?: number } = {}
  ) {
    const size = opts.size ?? 10;
    const font = opts.font ?? sans;
    const color = opts.color ?? COR_INK;
    page.drawText(conteudo, { x: opts.x ?? MARGIN, y, size, font, color });
  }

  // Um "selo" — mesmo desenho de .dezena-bola: quadrado de borda fina,
  // número mono em negrito centralizado. cor customiza a borda/texto
  // (ex.: ochre pros trevos, se um dia precisar).
  function selo(
    valor: string,
    x: number,
    yBase: number,
    tamanho: number,
    corBorda: ReturnType<typeof rgb> = COR_INK,
    corTexto: ReturnType<typeof rgb> = COR_INK,
    fundo: ReturnType<typeof rgb> = COR_PAPEL
  ) {
    page.drawRectangle({
      x,
      y: yBase,
      width: tamanho,
      height: tamanho,
      color: fundo,
      borderColor: corBorda,
      borderWidth: 1,
    });
    const fontSize = Math.max(7, tamanho * 0.42);
    const largura = monoBold.widthOfTextAtSize(valor, fontSize);
    page.drawText(valor, {
      x: x + (tamanho - largura) / 2,
      y: yBase + (tamanho - fontSize) / 2 + 1,
      size: fontSize,
      font: monoBold,
      color: corTexto,
    });
  }

  // ---------- Cabeçalho ----------
  texto("LOTOANALITICA", { size: 10, font: monoBold, color: COR_PINE, x: MARGIN });
  y -= 26;
  texto(`Bolão — ${dados.nomeLoteria}`, { size: 27, font: serifBold });
  y -= 6;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: MARGIN + 120, y },
    thickness: 2,
    color: COR_PINE,
  });
  y -= 20;
  texto(
    `Gerado em ${new Date().toLocaleDateString("pt-BR")} · ${dados.tickets.length} jogos · pool de ${dados.tamanhoPool} dezenas`,
    { size: 9, font: mono, color: COR_INK_FAINT }
  );
  y -= 30;

  // ---------- Cartão-resumo ----------
  const linhasResumo: [string, string][] = [
    ["GARANTIA", `pelo menos ${dados.garantia} pontos, se ${dados.garantia} das dezenas do pool saírem`],
    ["TOTAL DE JOGOS", `${dados.tickets.length}`],
    ["PRECO POR JOGO SIMPLES", formatarMoedaPdf(dados.precoAposta)],
    ["CUSTO TOTAL DO BOLAO", formatarMoedaPdf(dados.custoTotal)],
  ];
  if (dados.qtdParticipantes && dados.qtdParticipantes > 0) {
    linhasResumo.push([
      "CUSTO POR PARTICIPANTE",
      `${formatarMoedaPdf(dados.custoTotal / dados.qtdParticipantes)}  (${dados.qtdParticipantes} participantes)`,
    ]);
  }

  const alturaLinha = 20;
  const alturaResumo = linhasResumo.length * alturaLinha + 20;
  garantirEspaco(alturaResumo);
  page.drawRectangle({
    x: MARGIN,
    y: y - alturaResumo,
    width: USABLE_WIDTH,
    height: alturaResumo,
    color: COR_PAPEL_ELEVADO,
    borderColor: COR_LINE,
    borderWidth: 1,
  });
  y -= 16;
  for (const [rotulo, valor] of linhasResumo) {
    texto(rotulo, { size: 8, font: monoBold, color: COR_INK_FAINT, x: MARGIN + 16 });
    texto(valor, { size: 11, font: sans, x: MARGIN + 210 });
    y -= alturaLinha;
  }
  y -= 24;

  // ---------- Dezenas do pool ----------
  texto("DEZENAS DO POOL", { size: 8, font: monoBold, color: COR_INK_FAINT });
  y -= 16;
  const seloPoolTamanho = 24;
  const seloPoolGap = 6;
  let xPool = MARGIN;
  for (const d of dados.poolDezenas) {
    if (xPool + seloPoolTamanho > MARGIN + USABLE_WIDTH) {
      xPool = MARGIN;
      y -= seloPoolTamanho + seloPoolGap;
    }
    selo(formatarDezena(d), xPool, y - seloPoolTamanho, seloPoolTamanho, COR_PINE_DEEP, COR_PINE, COR_PAPEL_ELEVADO);
    xPool += seloPoolTamanho + seloPoolGap;
  }
  y -= seloPoolTamanho + 30;

  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_WIDTH - MARGIN, y }, thickness: 1, color: COR_INK });
  y -= 26;

  // ---------- Lista de jogos ----------
  texto(`Todos os ${dados.tickets.length} jogos`, { size: 15, font: serifBold });
  y -= 8;
  texto("Cada linha é um bilhete separado — confira dezena por dezena ao apostar.", {
    size: 8,
    font: sans,
    color: COR_INK_FAINT,
  });
  y -= 22;

  // Tamanho do selo de dezena se adapta à quantidade por jogo, pra
  // caber em uma linha só mesmo em loterias com mais dezenas por
  // aposta (ex.: fechamentos de 18-20 dezenas).
  const larguraBadgeIndice = 34;
  const gapBadgeDezenas = 10;
  const gapEntreSelos = 3;
  const maiorTicket = Math.max(1, ...dados.tickets.map((t) => t.length));
  const areaDezenas = USABLE_WIDTH - larguraBadgeIndice - gapBadgeDezenas;
  const seloTicketTamanho = Math.max(13, Math.min(19, areaDezenas / maiorTicket - gapEntreSelos));
  const alturaLinhaTicket = seloTicketTamanho + 9;

  dados.tickets.forEach((ticket, i) => {
    garantirEspaco(alturaLinhaTicket);

    // Zebrado: mesma ideia do .fechamento-ticket na tela — sem isso,
    // uma lista de dezenas de jogos é fácil de perder a linha ao
    // copiar pro bilhete de papel.
    if (i % 2 === 1) {
      page.drawRectangle({
        x: MARGIN - 6,
        y: y - alturaLinhaTicket + 4,
        width: USABLE_WIDTH + 12,
        height: alturaLinhaTicket,
        color: COR_PAPEL_ELEVADO,
      });
    }

    const numeroStr = `#${String(i + 1).padStart(String(dados.tickets.length).length, "0")}`;
    const yBaseSelo = y - seloTicketTamanho + 2;

    // Etiqueta do índice do bilhete — mesma linguagem visual das
    // dezenas, só que em ochre, pra não ser confundida com uma dezena.
    page.drawRectangle({
      x: MARGIN,
      y: yBaseSelo,
      width: larguraBadgeIndice,
      height: seloTicketTamanho,
      color: COR_OCHRE,
    });
    const numFontSize = Math.max(7, seloTicketTamanho * 0.38);
    const numLargura = monoBold.widthOfTextAtSize(numeroStr, numFontSize);
    page.drawText(numeroStr, {
      x: MARGIN + (larguraBadgeIndice - numLargura) / 2,
      y: yBaseSelo + (seloTicketTamanho - numFontSize) / 2 + 1,
      size: numFontSize,
      font: monoBold,
      color: COR_PAPEL,
    });

    let xDezena = MARGIN + larguraBadgeIndice + gapBadgeDezenas;
    for (const d of ticket) {
      selo(formatarDezena(d), xDezena, yBaseSelo, seloTicketTamanho, COR_INK, COR_INK, COR_PAPEL);
      xDezena += seloTicketTamanho + gapEntreSelos;
    }

    y -= alturaLinhaTicket;
  });

  // ---------- Rodapé final ----------
  garantirEspaco(70);
  y -= 6;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_WIDTH - MARGIN, y }, thickness: 0.75, color: COR_LINE });
  y -= 18;
  texto("Conteúdo informativo e organizacional. A garantia descrita só vale se as dezenas do pool", {
    size: 8,
    font: sans,
    color: COR_INK_SOFT,
  });
  y -= 12;
  texto("realmente contiverem a quantidade indicada das dezenas sorteadas — isso não muda a", {
    size: 8,
    font: sans,
    color: COR_INK_SOFT,
  });
  y -= 12;
  texto("probabilidade de isso acontecer. Resultados oficiais são sempre os divulgados pela Caixa.", {
    size: 8,
    font: sans,
    color: COR_INK_SOFT,
  });

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
