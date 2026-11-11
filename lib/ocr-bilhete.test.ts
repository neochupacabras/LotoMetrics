import { describe, expect, it } from "vitest";
import { CONFIG_OCR, lerBilhete, limparLinha } from "./ocr-bilhete";

const CABECALHO = [
  "CAIXA",
  "LOTERIAS CAIXA",
  "CONCURSO: 3215  24/10/2026",
  "DATA: 24/10/2026 HORA: 18:42:07",
  "TERMINAL 123456-7  NSU 000987",
];
const RODAPE = ["VALOR APOSTA R$ 3,50", "TOTAL: 3,50", "PROTOCOLO 9876543210"];

function bilhete(...jogo: string[]): string {
  return [...CABECALHO, ...jogo, ...RODAPE].join("\n");
}

describe("CONFIG_OCR", () => {
  it("tem as 9 loterias com a faixa e o tamanho da aposta", () => {
    expect(Object.keys(CONFIG_OCR).sort()).toEqual(
      ["diadesorte", "duplasena", "lotofacil", "lotomania", "maismilionaria", "megasena", "quina", "supersete", "timemania"]
    );
    expect(CONFIG_OCR.lotomania).toEqual({ min: 0, max: 99, qtd: 50 });
    expect(CONFIG_OCR.timemania).toEqual({ min: 1, max: 80, qtd: 10 });
    expect(CONFIG_OCR.supersete).toEqual({ min: 0, max: 9, qtd: 7, porColuna: true });
    expect(CONFIG_OCR.diadesorte.qtd).toBe(7);
    expect(CONFIG_OCR.quina).toEqual({ min: 1, max: 80, qtd: 5 });
  });
});

describe("limparLinha", () => {
  it("tira data, hora, valor e números longos", () => {
    const l = limparLinha("24/10/2026 18:42 R$ 3,50 3215 07");
    expect(l.match(/\b\d{1,2}\b/g)).toEqual(["07"]);
  });
  it("não confunde um jogo separado por hífen com data", () => {
    expect(limparLinha("01-02-03-04-05-06").match(/\d{2}/g)).toHaveLength(6);
  });
  it("corrige O lido no lugar de zero", () => {
    expect(limparLinha("O5 1O OO")).toContain("05 10 00");
  });
});

describe("lerBilhete", () => {
  it("Mega-Sena: ignora data, hora, concurso e valor", () => {
    const r = lerBilhete(bilhete("A: 04 11 23 37 45 58"), CONFIG_OCR.megasena);
    expect(r).toEqual({ dezenas: [4, 11, 23, 37, 45, 58], confianca: "alta" });
  });

  it("Lotofácil em duas linhas", () => {
    const r = lerBilhete(bilhete("01 02 04 05 07 09 10 12", "13 15 18 20 22 24 25"), CONFIG_OCR.lotofacil);
    expect(r.dezenas).toEqual([1, 2, 4, 5, 7, 9, 10, 12, 13, 15, 18, 20, 22, 24, 25]);
    expect(r.confianca).toBe("alta");
  });

  it("bilhete com vários jogos: lê o primeiro", () => {
    const r = lerBilhete(bilhete("A 05 12 33 41 50 60", "B 01 02 03 04 05 06"), CONFIG_OCR.megasena);
    expect(r.dezenas).toEqual([5, 12, 33, 41, 50, 60]);
  });

  it("Quina: leitura parcial vira confiança média", () => {
    const r = lerBilhete(bilhete("12 34 56"), CONFIG_OCR.quina);
    expect(r).toEqual({ dezenas: [12, 34, 56], confianca: "media" });
  });

  it("Lotomania: 50 números de 00 a 99 em 5 linhas", () => {
    const linhas: string[] = [];
    for (let i = 0; i < 5; i++) {
      linhas.push(Array.from({ length: 10 }, (_, j) => String(i * 20 + j * 2).padStart(2, "0")).join(" "));
    }
    const r = lerBilhete(bilhete(...linhas), CONFIG_OCR.lotomania);
    expect(r.dezenas).toHaveLength(50);
    expect(r.dezenas[0]).toBe(0);
    expect(r.dezenas[49]).toBe(98);
    expect(r.confianca).toBe("alta");
  });

  it("Timemania: 10 dezenas, ignora o Time do Coração", () => {
    const r = lerBilhete(
      bilhete("03 11 17 22 30 41 52 66 71 80", "TIME DO CORACAO: 12 FLAMENGO/RJ"),
      CONFIG_OCR.timemania
    );
    expect(r.dezenas).toEqual([3, 11, 17, 22, 30, 41, 52, 66, 71, 80]);
    expect(r.confianca).toBe("alta");
  });

  it("Dia de Sorte: ignora o Mês da Sorte", () => {
    const r = lerBilhete(bilhete("02 05 09 14 21 27 31", "MES DA SORTE: 05 MAIO"), CONFIG_OCR.diadesorte);
    expect(r.dezenas).toEqual([2, 5, 9, 14, 21, 27, 31]);
  });

  it("+Milionária: só as dezenas, os trevos ficam de fora", () => {
    const r = lerBilhete(bilhete("07 13 22 34 41 49", "TREVOS: 2 5"), CONFIG_OCR.maismilionaria);
    expect(r).toEqual({ dezenas: [7, 13, 22, 34, 41, 49], confianca: "alta" });
  });

  it("Dupla Sena: fora da faixa é descartado", () => {
    const r = lerBilhete(bilhete("05 10 15 20 25 30 77"), CONFIG_OCR.duplasena);
    expect(r.dezenas).toEqual([5, 10, 15, 20, 25, 30]);
  });

  it("Super Sete: linha com 7 algarismos, na ordem das colunas (repete)", () => {
    const r = lerBilhete(bilhete("5 3 8 0 1 3 9"), CONFIG_OCR.supersete);
    expect(r).toEqual({ dezenas: [5, 3, 8, 0, 1, 3, 9], confianca: "alta" });
  });

  it("Super Sete: colunas rotuladas, fora de ordem no texto", () => {
    const r = lerBilhete(
      bilhete("COL 2: 4", "COL 1: 7", "COL 3: 0", "COL 4: 0", "COL 5: 9", "COL 6: 2", "COL 7: 6"),
      CONFIG_OCR.supersete
    );
    expect(r).toEqual({ dezenas: [7, 4, 0, 0, 9, 2, 6], confianca: "alta" });
  });

  it("texto sem jogo: nada lido e confiança baixa", () => {
    expect(lerBilhete(CABECALHO.join("\n"), CONFIG_OCR.megasena)).toEqual({ dezenas: [], confianca: "baixa" });
  });
});
