import { PDFDocument, rgb, PDFFont, PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";

// ── Cores do design system ────────────────────────────────────────────────────
const PINE   = rgb(0x1e/255, 0x4b/255, 0x3c/255);
const OCHRE  = rgb(0xb9/255, 0x80/255, 0x2c/255);
const RUST   = rgb(0x8e/255, 0x3a/255, 0x2a/255);
const INK    = rgb(0x1c/255, 0x1b/255, 0x17/255);
const INK_SOFT = rgb(0x5b/255, 0x58/255, 0x47/255);
const INK_FAINT = rgb(0x8c/255, 0x88/255, 0x74/255);
const PAPER  = rgb(0xef/255, 0xee/255, 0xe6/255);
const PAPER_ALT = rgb(0xf8/255, 0xf7/255, 0xf2/255);
const LINE   = rgb(0xd8/255, 0xd4/255, 0xc5/255);
const WHITE  = rgb(1, 1, 1);
const GREEN  = rgb(0x16/255, 0x65/255, 0x34/255);

const W = 595.28;
const H = 841.89;
const M = 48;

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface JogoRelatorio {
  id: string;
  loteria: string;
  dezenas: number[];
  label: string | null;
  concursosNoMes: number;
  premiosNoMes: { concurso: number; acertos: number; faixa: string; premio: number }[];
  ganhoTotal: number;
}

export interface ResumoLoteria {
  nomeLoteria: string;
  concursosNoMes: number;
  precoAposta: number;
  totalJogos: number;
  totalGasto: number;
  totalGanho: number;
  saldoFinal: number;
  porFaixa: { descricao: string; qtd: number; ganhoTotal: number }[];
}

export interface DadosRelatorio {
  nomeUsuario: string;
  email: string;
  mes: number;
  ano: number;
  geradoEm: Date;
  resumos: ResumoLoteria[];
  jogos: JogoRelatorio[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function moeda(v: number): string {
  const abs = Math.abs(v);
  const s = v < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${s}R$ ${(abs/1_000_000).toFixed(2).replace(".", ",")}M`;
  return `${s}R$ ${abs.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

function nomeMes(mes: number): string {
  return ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
          "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"][mes - 1];
}

function dezStr(d: number): string {
  return String(d).padStart(2, "0");
}

function linhaSep(page: PDFPage, y: number, cor = LINE, x1 = M, x2 = W - M) {
  page.drawLine({ start: { x: x1, y }, end: { x: x2, y }, thickness: 0.5, color: cor });
}

function cabecalhoPagina(
  doc: PDFDocument,
  tituloTexto: string,
  subtituloTexto: string,
  bold: PDFFont,
  regular: PDFFont
): { pg: PDFPage; y: number } {
  const pg = doc.addPage([W, H]);
  pg.drawRectangle({ x: 0, y: H - 56, width: W, height: 56, color: PINE });

  // Logo "Loto" + "Analítica"
  pg.drawText("Loto", { x: M, y: H - 36, size: 18, font: bold, color: WHITE });
  pg.drawText("Analitica", { x: M + 43, y: H - 36, size: 18, font: bold, color: OCHRE });

  pg.drawText(tituloTexto.toUpperCase(), {
    x: M + 130, y: H - 32, size: 9, font: bold, color: WHITE,
  });
  pg.drawText(subtituloTexto, {
    x: M + 130, y: H - 44, size: 8, font: regular, color: rgb(0.7, 0.85, 0.7),
  });

  return { pg, y: H - 80 };
}

function rodapePagina(pg: PDFPage, numPag: number, total: number, regular: PDFFont) {
  linhaSep(pg, M + 20);
  pg.drawText("LotoAnalitica — lotoanalitica.com.br", {
    x: M, y: M + 6, size: 7, font: regular, color: INK_FAINT,
  });
  pg.drawText(`Pagina ${numPag} de ${total}`, {
    x: W - M - 60, y: M + 6, size: 7, font: regular, color: INK_FAINT,
  });
}

// ── Gerador principal ─────────────────────────────────────────────────────────

export async function gerarRelatorioPdf(dados: DadosRelatorio): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  // Carregar fontes do projeto
  const fontsDir = path.join(process.cwd(), "public", "fonts");

  const [
    frauncesBuf,
    plexSansBuf,
    plexSansBoldBuf,
    plexMonoBuf,
  ] = await Promise.all([
    fs.promises.readFile(path.join(fontsDir, "Fraunces-Variable.ttf")),
    fs.promises.readFile(path.join(fontsDir, "IBMPlexSans-Regular.ttf")),
    fs.promises.readFile(path.join(fontsDir, "IBMPlexSans-Bold.ttf")),
    fs.promises.readFile(path.join(fontsDir, "IBMPlexMono-Regular.ttf")),
  ]);

  const fraunces = await doc.embedFont(frauncesBuf);
  const regular  = await doc.embedFont(plexSansBuf);
  const bold     = await doc.embedFont(plexSansBoldBuf);
  const mono     = await doc.embedFont(plexMonoBuf);

  doc.setTitle(`Relatorio ${nomeMes(dados.mes)} ${dados.ano} — LotoAnalitica`);
  doc.setAuthor("LotoAnalitica");
  doc.setCreationDate(dados.geradoEm);

  // ── CAPA ──────────────────────────────────────────────────────────────────
  const capa = doc.addPage([W, H]);
  capa.drawRectangle({ x: 0, y: H - 140, width: W, height: 140, color: PINE });

  // Logo grande
  capa.drawText("Loto", { x: M, y: H - 76, size: 42, font: fraunces, color: WHITE });
  capa.drawText("Analitica", { x: M + 102, y: H - 76, size: 42, font: fraunces, color: OCHRE });
  capa.drawText("RELATORIO MENSAL DE JOGOS", {
    x: M, y: H - 106, size: 9, font: bold, color: rgb(0.65, 0.82, 0.7),
  });

  // Período
  capa.drawText(nomeMes(dados.mes).toUpperCase(), {
    x: M, y: H - 190, size: 48, font: fraunces, color: INK,
  });
  capa.drawText(String(dados.ano), {
    x: M, y: H - 236, size: 28, font: regular, color: INK_SOFT,
  });

  linhaSep(capa, H - 258);

  // Dados do assinante
  capa.drawText("Preparado para", { x: M, y: H - 278, size: 9, font: regular, color: INK_FAINT });
  capa.drawText(dados.nomeUsuario, { x: M, y: H - 296, size: 20, font: fraunces, color: INK });
  capa.drawText(dados.email, { x: M, y: H - 316, size: 9, font: regular, color: INK_SOFT });

  linhaSep(capa, H - 336);

  // Resumo rápido na capa
  let capY = H - 368;
  for (const r of dados.resumos) {
    const cor = r.saldoFinal >= 0 ? GREEN : RUST;
    capa.drawText(r.nomeLoteria, { x: M, y: capY, size: 14, font: fraunces, color: INK });
    capa.drawText(`${r.concursosNoMes} concursos realizados  ·  ${r.totalJogos} jogo${r.totalJogos !== 1 ? "s" : ""} rastreado${r.totalJogos !== 1 ? "s" : ""}`, {
      x: M, y: capY - 18, size: 9, font: regular, color: INK_SOFT,
    });

    // Mini cards na capa
    const cardW = 130;
    const cardH = 38;
    const cardY = capY - 64;
    for (const [i, item] of [
      { label: "Gasto", val: moeda(r.totalGasto), cor: RUST },
      { label: "Ganho", val: moeda(r.totalGanho), cor: PINE },
      { label: "Saldo", val: moeda(r.saldoFinal), cor },
    ].entries()) {
      const cx = M + i * (cardW + 8);
      capa.drawRectangle({ x: cx, y: cardY, width: cardW, height: cardH,
        color: PAPER, borderColor: LINE, borderWidth: 0.5, borderOpacity: 1 });
      capa.drawText(item.label.toUpperCase(), {
        x: cx + 8, y: cardY + cardH - 12, size: 7, font: bold, color: INK_FAINT,
      });
      capa.drawText(item.val, {
        x: cx + 8, y: cardY + 8, size: 11, font: bold, color: item.cor,
      });
    }

    capY -= 100;
  }

  linhaSep(capa, capY);

  // Nota metodológica na capa
  const notaY = capY - 20;
  capa.drawText("Como os valores sao calculados:", { x: M, y: notaY, size: 8, font: bold, color: INK_SOFT });
  capa.drawText("O gasto pressupoe que voce apostou em todos os concursos do mes com todos os jogos ativos.", {
    x: M, y: notaY - 13, size: 7, font: regular, color: INK_FAINT,
  });
  capa.drawText("Se jogou em menos concursos, seu gasto real foi menor. Os premios sao os valores reais pagos pela Caixa.", {
    x: M, y: notaY - 24, size: 7, font: regular, color: INK_FAINT,
  });

  // Data de geração
  const geradoStr = dados.geradoEm.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
  capa.drawText(`Gerado em ${geradoStr}`, { x: M, y: M + 20, size: 8, font: regular, color: INK_FAINT });
  capa.drawText("lotoanalitica.com.br", { x: W - M - 118, y: M + 20, size: 8, font: bold, color: PINE });

  // ── PÁGINAS DE RESUMO POR LOTERIA ─────────────────────────────────────────
  for (const r of dados.resumos) {
    const { pg, y: startY } = cabecalhoPagina(
      doc,
      r.nomeLoteria,
      `${nomeMes(dados.mes)} ${dados.ano}`,
      bold, regular
    );
    let y = startY;

    // Cards de resumo
    const cardW = (W - 2*M - 24) / 3;
    const cards = [
      { label: "TOTAL GASTO",  val: moeda(r.totalGasto),  cor: RUST  },
      { label: "TOTAL GANHO",  val: moeda(r.totalGanho),  cor: PINE  },
      { label: "SALDO FINAL",  val: moeda(r.saldoFinal),  cor: r.saldoFinal >= 0 ? GREEN : RUST },
    ];
    for (const [i, c] of cards.entries()) {
      const cx = M + i * (cardW + 12);
      pg.drawRectangle({ x: cx, y: y - 52, width: cardW, height: 56,
        color: PAPER, borderColor: LINE, borderWidth: 0.5, borderOpacity: 1 });
      pg.drawText(c.label, { x: cx + 10, y: y - 14, size: 7, font: bold, color: INK_FAINT });
      pg.drawText(c.val,   { x: cx + 10, y: y - 34, size: 13, font: bold, color: c.cor });
    }
    y -= 72;

    pg.drawText(
      `Retorno: ${r.totalGasto > 0 ? ((r.totalGanho / r.totalGasto)*100).toFixed(1) : "0.0"}%  |  Concursos: ${r.concursosNoMes}  |  Jogos: ${r.totalJogos}  |  Gasto por jogo: ${moeda(r.precoAposta)}/concurso`,
      { x: M, y, size: 8, font: regular, color: INK_SOFT }
    );
    y -= 16;

    // Nota metodológica
    pg.drawRectangle({ x: M, y: y - 34, width: W - 2*M, height: 40, color: PAPER_ALT });
    pg.drawText("Como os valores sao calculados:", { x: M + 8, y: y - 8, size: 7, font: bold, color: INK_SOFT });
    pg.drawText(
      `O sistema confere cada jogo cadastrado contra as dezenas de cada concurso do mes, conta os acertos,`,
      { x: M + 8, y: y - 19, size: 7, font: regular, color: INK_FAINT }
    );
    pg.drawText(
      `identifica a faixa premiada e soma o premio real. O gasto pressupoe que voce apostou em todos os`,
      { x: M + 8, y: y - 28, size: 7, font: regular, color: INK_FAINT }
    );
    pg.drawText(
      `${r.concursosNoMes} concursos com os ${r.totalJogos} jogos ativos. Se jogou em menos concursos, o gasto real foi menor.`,
      { x: M + 8, y: y - 37, size: 7, font: regular, color: INK_FAINT }
    );
    y -= 54;

    linhaSep(pg, y);
    y -= 20;

    // Tabela de faixas
    pg.drawText("PREMIOS POR FAIXA", { x: M, y, size: 9, font: bold, color: INK_SOFT });
    y -= 18;

    pg.drawRectangle({ x: M, y: y - 4, width: W - 2*M, height: 18, color: PINE });
    for (const [txt, xPos] of [
      ["Faixa", M + 8], ["Acertos", M + 220], ["Total ganho", M + 320], ["Media", M + 430]
    ] as [string, number][]) {
      pg.drawText(txt, { x: xPos, y: y + 2, size: 8, font: bold, color: WHITE });
    }
    y -= 20;

    let idx = 0;
    for (const f of r.porFaixa) {
      if (idx % 2 === 0) {
        pg.drawRectangle({ x: M, y: y - 4, width: W - 2*M, height: 16, color: PAPER });
      }
      const cor = f.qtd > 0 ? INK : INK_FAINT;
      const fn = f.qtd > 0 ? bold : regular;
      pg.drawText(f.descricao, { x: M + 8, y: y + 2, size: 8, font: fn, color: cor });
      pg.drawText(f.qtd > 0 ? String(f.qtd) : "—", { x: M + 220, y: y + 2, size: 8, font: fn, color: cor });
      pg.drawText(f.qtd > 0 ? moeda(f.ganhoTotal) : "—", { x: M + 320, y: y + 2, size: 8, font: fn, color: f.qtd > 0 ? PINE : INK_FAINT });
      pg.drawText(f.qtd > 0 ? moeda(f.ganhoTotal / f.qtd) : "—", { x: M + 430, y: y + 2, size: 8, font: regular, color: INK_FAINT });
      y -= 16;
      idx++;
    }

    rodapePagina(pg, doc.getPageCount(), doc.getPageCount() + dados.jogos.length + 1, regular);
  }

  // ── PÁGINA DE JOGOS ────────────────────────────────────────────────────────
  if (dados.jogos.length > 0) {
    let { pg, y } = cabecalhoPagina(doc, "Seus Jogos em Detalhes", `${nomeMes(dados.mes)} ${dados.ano}`, bold, regular);

    for (const jogo of dados.jogos) {
      if (y < 200) {
        const next = cabecalhoPagina(doc, "Seus Jogos (continuacao)", `${nomeMes(dados.mes)} ${dados.ano}`, bold, regular);
        pg = next.pg; y = next.y;
      }
      y -= 20;

      const nomeJogo = jogo.label ?? "Jogo sem nome";
      const lotLabel = jogo.loteria === "lotofacil" ? "LOTOFACIL" : "MEGA-SENA";

      pg.drawRectangle({ x: M, y: y - 4, width: W - 2*M, height: 20, color: PINE });
      pg.drawText(nomeJogo, { x: M + 8, y: y + 4, size: 9, font: bold, color: WHITE });
      pg.drawText(lotLabel, { x: W - M - 80, y: y + 4, size: 8, font: bold, color: OCHRE });
      y -= 20;

      // Dezenas em mono
      const dezenasStr = jogo.dezenas.map(dezStr).join("   ");
      pg.drawText(dezenasStr, { x: M + 8, y, size: 10, font: mono, color: INK });
      y -= 18;

      const preco = jogo.loteria === "lotofacil" ? 3.0 : 5.0;
      const saldo = jogo.ganhoTotal - (jogo.concursosNoMes * preco);
      pg.drawText(
        `Concursos: ${jogo.concursosNoMes}  ·  Premios: ${jogo.premiosNoMes.length}  ·  Ganhou: ${moeda(jogo.ganhoTotal)}  ·  Saldo: ${moeda(saldo)}`,
        { x: M + 8, y, size: 8, font: regular, color: INK_SOFT }
      );
      y -= 16;

      if (jogo.premiosNoMes.length > 0) {
        pg.drawText("Premios no mes:", { x: M + 8, y, size: 8, font: bold, color: PINE });
        y -= 13;
        for (const p of jogo.premiosNoMes.slice(0, 5)) {
          pg.drawText(
            `  Concurso #${p.concurso}  —  ${p.faixa}  —  ${moeda(p.premio)}`,
            { x: M + 8, y, size: 8, font: regular, color: INK }
          );
          y -= 13;
        }
      }

      linhaSep(pg, y - 4, LINE);
      y -= 10;
    }

    rodapePagina(pg, doc.getPageCount(), doc.getPageCount() + 1, regular);
  }

  // ── PÁGINA FINAL — aviso legal ─────────────────────────────────────────────
  const { pg: ultima, y: ultiY } = cabecalhoPagina(doc, "Aviso Legal e Metodologia", "", bold, regular);
  let ay = ultiY;

  const paragrafos = [
    { titulo: "METODOLOGIA DOS CALCULOS", corpo: null },
    { titulo: null, corpo: "O sistema confere cada jogo cadastrado contra as dezenas de cada concurso do periodo, conta os acertos, identifica a faixa premiada e soma o premio real pago pela Caixa Economica Federal naquele concurso." },
    { titulo: null, corpo: "Os valores de gasto pressupõem que você apostou em todos os concursos do mes com todos os jogos ativos na sua conta. Se na realidade você jogou em menos concursos, seu gasto real foi proporcionalmente menor." },
    { titulo: null, corpo: "Os premios exibidos sao os valores efetivamente pagos pela Caixa — não são estimativas." },
    { titulo: "AVISO LEGAL", corpo: null },
    { titulo: null, corpo: "Este relatorio foi gerado automaticamente pela plataforma LotoAnalitica e destina-se exclusivamente ao uso pessoal do titular da conta." },
    { titulo: null, corpo: "Nenhuma analise estatistica, ferramenta ou metodo desta plataforma garante, aumenta ou influencia a probabilidade de premiacao. Cada concurso e um evento independente e completamente aleatorio." },
    { titulo: null, corpo: "Loterias sao uma forma de entretenimento. Jogue com responsabilidade e dentro dos seus limites financeiros. Se o jogo estiver causando problemas, procure ajuda: Jogadores Anonimos — jogadoresanonimos.org.br" },
    { titulo: null, corpo: "LotoAnalitica nao e afiliada a Caixa Economica Federal nem ao Governo Federal do Brasil." },
  ];

  for (const p of paragrafos) {
    if (p.titulo) {
      ay -= 8;
      ultima.drawText(p.titulo, { x: M, y: ay, size: 9, font: bold, color: INK_SOFT });
      ay -= 18;
    }
    if (p.corpo) {
      // Quebrar em linhas de ~90 chars
      const palavras = p.corpo.split(" ");
      let linha = "";
      for (const palavra of palavras) {
        if ((linha + " " + palavra).trim().length > 88) {
          ultima.drawText(linha.trim(), { x: M, y: ay, size: 8, font: regular, color: INK_FAINT });
          ay -= 13;
          linha = palavra;
        } else {
          linha = (linha + " " + palavra).trim();
        }
      }
      if (linha) {
        ultima.drawText(linha.trim(), { x: M, y: ay, size: 8, font: regular, color: INK_FAINT });
        ay -= 13;
      }
      ay -= 6;
    }
  }

  ultima.drawText("lotoanalitica.com.br", { x: M, y: M + 8, size: 8, font: bold, color: PINE });

  return await doc.save();
}
