import { describe, expect, it } from "vitest";
import { detectarTipoImagem, unirEncontrados, verificarJogosNoTexto } from "./bolao-bilhete";

// Texto no formato que o OCR devolve de um bilhete da Mega-Sena (concurso,
// data e códigos misturados aos jogos).
const TEXTO_MEGA = `MEGA-SENA
CONCURSO 3074 24/10/2026
A) 02 03 20 25 39 57
B) 01 02 10 25 39 57
C) 05 11 16 28 44 60
CONTROLE 123456`;

describe("verificarJogosNoTexto", () => {
  it("acha os jogos presentes e ignora os ausentes", () => {
    const jogos = [
      [2, 3, 20, 25, 39, 57],
      [1, 2, 10, 25, 39, 57],
      [7, 8, 9, 10, 11, 12],
    ];
    const r = verificarJogosNoTexto(TEXTO_MEGA, jogos);
    expect(r.encontrados).toEqual([0, 1]);
    expect(r.numerosLidos).toBeGreaterThan(18);
  });

  it("ordem das dezenas no jogo ou no bilhete não importa", () => {
    const r = verificarJogosNoTexto("57 39 25 20 03 02", [[2, 3, 20, 25, 39, 57]]);
    expect(r.encontrados).toEqual([0]);
  });

  it("OCR quebrando linhas no meio do jogo continua achando", () => {
    const r = verificarJogosNoTexto("A)\n02 03 20\n25 39\n57", [[2, 3, 20, 25, 39, 57]]);
    expect(r.encontrados).toEqual([0]);
  });

  it("um número lido errado derruba o jogo (comparação estrita)", () => {
    const r = verificarJogosNoTexto("02 03 20 25 39 58", [[2, 3, 20, 25, 39, 57]]);
    expect(r.encontrados).toEqual([]);
  });

  it("não confunde números de 3+ dígitos (concurso, controle) com dezenas", () => {
    const r = verificarJogosNoTexto("3074 123456 2026", [[30, 74, 12, 34, 56, 20]]);
    expect(r.encontrados).toEqual([]);
    expect(r.numerosLidos).toBe(0);
  });

  it("funciona com jogos de 15 dezenas (Lotofácil)", () => {
    const jogo = [1, 2, 3, 5, 6, 8, 10, 11, 13, 14, 16, 18, 20, 23, 25];
    const texto = "LOTOFACIL\n" + jogo.map((n) => String(n).padStart(2, "0")).join(" ");
    expect(verificarJogosNoTexto(texto, [jogo]).encontrados).toEqual([0]);
  });

  it("entradas vazias não quebram", () => {
    expect(verificarJogosNoTexto("", [[1, 2, 3, 4, 5, 6]])).toEqual({ encontrados: [], numerosLidos: 0 });
    expect(verificarJogosNoTexto("01 02", [[1, 2, 3, 4, 5, 6]]).encontrados).toEqual([]);
    expect(verificarJogosNoTexto(TEXTO_MEGA, []).encontrados).toEqual([]);
  });
});

describe("unirEncontrados", () => {
  it("une e ordena sem repetir", () => {
    expect(unirEncontrados([[3, 1], [1, 2], []])).toEqual([1, 2, 3]);
  });
});

describe("detectarTipoImagem", () => {
  it("reconhece JPEG, PNG e WebP pelos bytes", () => {
    expect(detectarTipoImagem(new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0]))).toBe("image/jpeg");
    expect(detectarTipoImagem(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]))).toBe("image/png");
    expect(
      detectarTipoImagem(new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]))
    ).toBe("image/webp");
  });
  it("rejeita o que não é imagem suportada (ex.: PDF, SVG, texto)", () => {
    expect(detectarTipoImagem(new TextEncoder().encode("%PDF-1.4"))).toBeNull();
    expect(detectarTipoImagem(new TextEncoder().encode("<svg xmlns="))).toBeNull();
    expect(detectarTipoImagem(new Uint8Array([]))).toBeNull();
  });
});
