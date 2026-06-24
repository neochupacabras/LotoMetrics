// Gera o relatório mensal do assinante em PDF no servidor.
// Usa pdf-lib com fontes padrão (sem embed externo) para manter
// o bundle pequeno e a geração rápida.

import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from "pdf-lib";

// ── Cores do design system ────────────────────────────────────────────────────
const PINE   = rgb(0x1e/255, 0x4b/255, 0x3c/255);
const OCHRE  = rgb(0xb9/255, 0x80/255, 0x2c/255);
const RUST   = rgb(0x8e/255, 0x3a/255, 0x2a/255);
const INK    = rgb(0x1c/255, 0x1b/255, 0x17/255);
const INK_SOFT = rgb(0x5b/255, 0x58/255, 0x47/255);
const PAPER  = rgb(0xef/255, 0xee/255, 0xe6/255);
const LINE   = rgb(0xd8/255, 0xd4/255, 0xc5/255);
const WHITE  = rgb(1, 1, 1);
const GREEN  = rgb(0x16/255, 0x65/255, 0x34/255);

const W = 595.28;  // A4 largura em pontos
const H = 841.89;  // A4 altura em pontos
const M = 48;      // margem lateral

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface JogoRelatorio {
  id: string;
  loteria: string;
  dezenas: number[];
  label: string | null;
  // Resultados no período
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
  mes: number;      // 1-12
  ano: number;
  geradoEm: Date;
  resumos: ResumoLoteria[];
  jogos: JogoRelatorio[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function moeda(v: number): string {
  const abs = Math.abs(v);
  const sinal = v < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sinal}R$ ${(abs/1_000_000).toFixed(2)}M`;
  return `${sinal}R$ ${abs.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function nomeMes(mes: number): string {
  return ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
          "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"][mes - 1];
}

function dezenaStr(d: number): string {
  return String(d).padStart(2, "0");
}

// Quebra texto longo em linhas com max caracteres
function quebrarTexto(texto: string, maxChars: number): string[] {
  const palavras = texto.split(" ");
  const linhas: string[] = [];
  let atual = "";
  for (const p of palavras) {
    if ((atual + " " + p).trim().length > maxChars) {
      if (atual) linhas.push(atual.trim());
      atual = p;
    } else {
      atual = (atual + " " + p).trim();
    }
  }
  if (atual) linhas.push(atual.trim());
  return linhas;
}

// Desenha uma linha horizontal
function linha(page: PDFPage, y: number, cor = LINE, x1 = M, x2 = W - M) {
  page.drawLine({ start: { x: x1, y }, end: { x: x2, y }, thickness: 0.5, color: cor });
}

// ── Gerador principal ─────────────────────────────────────────────────────────

export async function gerarRelatorioPdf(dados: DadosRelatorio): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Relatório ${nomeMes(dados.mes)} ${dados.ano} — LotoAnalítica`);
  doc.setAuthor("LotoAnalítica");
  doc.setProducer("LotoAnalítica — lotoanalitica.com.br");
  doc.setCreationDate(dados.geradoEm);

  const bold    = await doc.embedFont(StandardFonts.HelveticaBold);
  const regular = await doc.embedFont(StandardFonts.Helvetica);

  // ── CAPA ─────────────────────────────────────────────────────────────────
  const capa = doc.addPage([W, H]);

  // Faixa verde no topo
  capa.drawRectangle({ x: 0, y: H - 120, width: W, height: 120, color: PINE });

  // Título "LotoAnalítica"
  capa.drawText("Loto", {
    x: M, y: H - 62, size: 36, font: bold, color: WHITE,
  });
  capa.drawText("Analitica", {
    x: M + 78, y: H - 62, size: 36, font: bold, color: OCHRE,
  });

  // Subtítulo
  capa.drawText("RELATORIO MENSAL DE JOGOS", {
    x: M, y: H - 88, size: 10, font: regular, color: rgb(0.8, 0.85, 0.8),
  });

  // Período em destaque
  capa.drawText(`${nomeMes(dados.mes).toUpperCase()} ${dados.ano}`, {
    x: M, y: H - 170, size: 42, font: bold, color: INK,
  });

  // Dados do assinante
  capa.drawText("Preparado para", {
    x: M, y: H - 220, size: 10, font: regular, color: INK_SOFT,
  });
  capa.drawText(dados.nomeUsuario, {
    x: M, y: H - 238, size: 18, font: bold, color: INK,
  });
  capa.drawText(dados.email, {
    x: M, y: H - 258, size: 10, font: regular, color: INK_SOFT,
  });

  linha(capa, H - 278);

  // Resumo rápido na capa
  let capY = H - 310;
  for (const r of dados.resumos) {
    const cor = r.saldoFinal >= 0 ? GREEN : RUST;
    capa.drawText(r.nomeLoteria, { x: M, y: capY, size: 13, font: bold, color: INK });
    capa.drawText(`${r.concursosNoMes} concursos  |  ${r.totalJogos} jogo${r.totalJogos !== 1 ? "s" : ""}`, {
      x: M, y: capY - 16, size: 9, font: regular, color: INK_SOFT,
    });
    capa.drawText(`Gasto: ${moeda(r.totalGasto)}`, { x: M, y: capY - 32, size: 9, font: regular, color: INK_SOFT });
    capa.drawText(`Ganho: ${moeda(r.totalGanho)}`, { x: M + 140, y: capY - 32, size: 9, font: regular, color: INK_SOFT });
    capa.drawText(`Saldo: ${moeda(r.saldoFinal)}`, { x: M + 280, y: capY - 32, size: 10, font: bold, color: cor });
    capY -= 64;
  }

  linha(capa, capY);

  // Rodapé da capa
  const geradoStr = dados.geradoEm.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
  capa.drawText(`Gerado em ${geradoStr}`, { x: M, y: M + 20, size: 8, font: regular, color: INK_SOFT });
  capa.drawText("lotoanalitica.com.br", { x: W - M - 110, y: M + 20, size: 8, font: regular, color: PINE });

  // ── PÁGINA DE RESUMO POR LOTERIA ─────────────────────────────────────────
  for (const r of dados.resumos) {
    const pg = doc.addPage([W, H]);

    // Cabeçalho
    pg.drawRectangle({ x: 0, y: H - 56, width: W, height: 56, color: PINE });
    pg.drawText(r.nomeLoteria.toUpperCase(), {
      x: M, y: H - 36, size: 14, font: bold, color: WHITE,
    });
    pg.drawText(`${nomeMes(dados.mes)} ${dados.ano}`, {
      x: W - M - 120, y: H - 36, size: 11, font: regular, color: rgb(0.7, 0.85, 0.7),
    });

    let y = H - 88;

    // Cards de resumo
    const cardW = (W - 2 * M - 24) / 3;
    const cards = [
      { titulo: "TOTAL GASTO",  valor: moeda(r.totalGasto),  cor: RUST  },
      { titulo: "TOTAL GANHO",  valor: moeda(r.totalGanho),  cor: PINE  },
      { titulo: "SALDO FINAL",  valor: moeda(r.saldoFinal),  cor: r.saldoFinal >= 0 ? GREEN : RUST },
    ];

    cards.forEach((c, i) => {
      const cx = M + i * (cardW + 12);
      pg.drawRectangle({ x: cx, y: y - 52, width: cardW, height: 60, color: PAPER, borderColor: LINE, borderWidth: 0.5 });
      pg.drawText(c.titulo, { x: cx + 10, y: y - 16, size: 7, font: bold, color: INK_SOFT });
      pg.drawText(c.valor,  { x: cx + 10, y: y - 34, size: 12, font: bold, color: c.cor });
    });

    y -= 80;
    pg.drawText(`Retorno: ${r.totalGasto > 0 ? ((r.totalGanho / r.totalGasto) * 100).toFixed(1) : "0.0"}%  |  Concursos: ${r.concursosNoMes}  |  Jogos ativos: ${r.totalJogos}  |  Gasto por jogo: ${moeda(r.precoAposta)}/concurso`, {
      x: M, y, size: 8, font: regular, color: INK_SOFT,
    });

    y -= 28;
    linha(pg, y);
    y -= 20;

    // Tabela de prêmios por faixa
    pg.drawText("PREMIOS POR FAIXA", { x: M, y, size: 9, font: bold, color: INK_SOFT });
    y -= 18;

    // Cabeçalho da tabela
    pg.drawRectangle({ x: M, y: y - 4, width: W - 2*M, height: 18, color: PINE });
    pg.drawText("Faixa",    { x: M + 8,   y: y + 2, size: 8, font: bold, color: WHITE });
    pg.drawText("Acertos",  { x: M + 220, y: y + 2, size: 8, font: bold, color: WHITE });
    pg.drawText("Total ganho", { x: M + 320, y: y + 2, size: 8, font: bold, color: WHITE });
    pg.drawText("Media",    { x: M + 430, y: y + 2, size: 8, font: bold, color: WHITE });
    y -= 20;

    const faixasComPremio = r.porFaixa.filter(f => f.qtd > 0);
    const faixasSemPremio = r.porFaixa.filter(f => f.qtd === 0);

    let linhaIdx = 0;
    for (const f of [...faixasComPremio, ...faixasSemPremio]) {
      if (linhaIdx % 2 === 0) {
        pg.drawRectangle({ x: M, y: y - 4, width: W - 2*M, height: 16, color: PAPER });
      }
      const cor = f.qtd > 0 ? INK : INK_SOFT;
      pg.drawText(f.descricao,      { x: M + 8,   y: y + 2, size: 8, font: f.qtd > 0 ? bold : regular, color: cor });
      pg.drawText(String(f.qtd),    { x: M + 220, y: y + 2, size: 8, font: f.qtd > 0 ? bold : regular, color: cor });
      pg.drawText(f.qtd > 0 ? moeda(f.ganhoTotal) : "—", { x: M + 320, y: y + 2, size: 8, font: f.qtd > 0 ? bold : regular, color: f.qtd > 0 ? PINE : INK_SOFT });
      pg.drawText(f.qtd > 0 ? moeda(f.ganhoTotal / f.qtd) : "—", { x: M + 430, y: y + 2, size: 8, font: regular, color: INK_SOFT });
      y -= 16;
      linhaIdx++;
    }

    // Rodapé
    linha(pg, M + 24);
    pg.drawText("LotoAnalitica — lotoanalitica.com.br", { x: M, y: M + 8, size: 7, font: regular, color: INK_SOFT });
    pg.drawText(`Pagina ${doc.getPageCount()}`, { x: W - M - 50, y: M + 8, size: 7, font: regular, color: INK_SOFT });
  }

  // ── PÁGINA DE JOGOS ───────────────────────────────────────────────────────
  if (dados.jogos.length > 0) {
    let pg = doc.addPage([W, H]);
    let y = H - 56;

    // Cabeçalho
    pg.drawRectangle({ x: 0, y: H - 56, width: W, height: 56, color: PINE });
    pg.drawText("SEUS JOGOS EM DETALHES", { x: M, y: H - 36, size: 14, font: bold, color: WHITE });

    for (const jogo of dados.jogos) {
      // Se não há espaço suficiente, nova página
      if (y < 200) {
        pg = doc.addPage([W, H]);
        y = H - 56;
        pg.drawRectangle({ x: 0, y: H - 56, width: W, height: 56, color: PINE });
        pg.drawText("SEUS JOGOS (continuacao)", { x: M, y: H - 36, size: 14, font: bold, color: WHITE });
      }

      y -= 24;

      // Nome do jogo + loteria
      const nomeJogo = jogo.label ?? `Jogo sem nome`;
      const lotLabel = jogo.loteria === "lotofacil" ? "LOTOFACIL" : "MEGA-SENA";
      pg.drawRectangle({ x: M, y: y - 4, width: W - 2*M, height: 20, color: PINE });
      pg.drawText(nomeJogo, { x: M + 8, y: y + 4, size: 9, font: bold, color: WHITE });
      pg.drawText(lotLabel, { x: W - M - 80, y: y + 4, size: 8, font: bold, color: OCHRE });
      y -= 20;

      // Dezenas
      const dezenasStr = jogo.dezenas.map(dezenaStr).join("  ");
      pg.drawText(dezenasStr, { x: M + 8, y, size: 9, font: bold, color: INK });
      y -= 18;

      // Resumo do jogo no mês
      const saldo = jogo.ganhoTotal - (jogo.concursosNoMes * (jogo.loteria === "lotofacil" ? 3.0 : 5.0));
      pg.drawText(
        `Concursos: ${jogo.concursosNoMes}  |  Premios: ${jogo.premiosNoMes.length}  |  Ganhou: ${moeda(jogo.ganhoTotal)}  |  Saldo: ${moeda(saldo)}`,
        { x: M + 8, y, size: 8, font: regular, color: INK_SOFT }
      );
      y -= 16;

      // Prêmios do mês (se houver)
      if (jogo.premiosNoMes.length > 0) {
        pg.drawText("Premios no mes:", { x: M + 8, y, size: 8, font: bold, color: PINE });
        y -= 14;
        for (const p of jogo.premiosNoMes.slice(0, 5)) {
          pg.drawText(
            `  Concurso #${p.concurso}  ${p.faixa}  ${moeda(p.premio)}`,
            { x: M + 8, y, size: 8, font: regular, color: INK }
          );
          y -= 13;
        }
      }

      linha(pg, y - 4, LINE);
      y -= 10;
    }

    // Rodapé
    linha(pg, M + 24);
    pg.drawText("LotoAnalitica — lotoanalitica.com.br", { x: M, y: M + 8, size: 7, font: regular, color: INK_SOFT });
    pg.drawText(`Pagina ${doc.getPageCount()}`, { x: W - M - 50, y: M + 8, size: 7, font: regular, color: INK_SOFT });
  }

  // ── PÁGINA FINAL — aviso legal ────────────────────────────────────────────
  const ultima = doc.addPage([W, H]);

  ultima.drawRectangle({ x: 0, y: H - 56, width: W, height: 56, color: PINE });
  ultima.drawText("AVISO LEGAL", { x: M, y: H - 36, size: 14, font: bold, color: WHITE });

  let ay = H - 90;
  const avisos = [
    "Este relatorio foi gerado automaticamente pela plataforma LotoAnalitica e destina-se",
    "exclusivamente ao uso pessoal do titular da conta.",
    "",
    "As informacoes apresentadas sao baseadas em resultados historicos oficiais das loterias",
    "da Caixa Economica Federal. Nenhuma analise estatistica, metodo ou ferramenta desta",
    "plataforma garante, aumenta ou influencia a probabilidade de premiacao em sorteios futuros.",
    "Cada concurso e um evento independente e completamente aleatorio.",
    "",
    "Loterias sao uma forma de entretenimento. Jogue com responsabilidade e dentro de seus",
    "limites financeiros. Se o jogo estiver causando problemas, procure ajuda:",
    "Jogadores Anonimos: jogadoresanonimos.org.br",
    "",
    "LotoAnalitica nao e afiliada a Caixa Economica Federal nem ao Governo Federal.",
  ];

  for (const linha_texto of avisos) {
    ultima.drawText(linha_texto, { x: M, y: ay, size: 9, font: regular, color: INK_SOFT });
    ay -= 16;
  }

  ultima.drawText("lotoanalitica.com.br", { x: M, y: M + 8, size: 8, font: bold, color: PINE });

  return await doc.save();
}
