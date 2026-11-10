import { describe, expect, it } from "vitest";
import { jogoParaTexto, lerJogoDigitado, type ConfigJogo } from "./jogo-digitado";

const MEGA: ConfigJogo = { dezenaMin: 1, dezenaMax: 60, qtd: 6, ondeLoteria: "na Mega-Sena" };
const LOTOMANIA: ConfigJogo = { dezenaMin: 0, dezenaMax: 99, qtd: 20, ondeLoteria: "na Lotomania" };
const SUPER7: ConfigJogo = { dezenaMin: 0, dezenaMax: 9, qtd: 7, superSete: true, ondeLoteria: "no Super Sete" };

describe("lerJogoDigitado", () => {
  it.each([
    "05 12 23 34 41 60",
    "5, 12, 23, 34, 41, 60",
    "05-12-23-34-41-60",
    "05.12.23.34.41.60",
    "051223344160",
    "  5 12\n23;34 / 41 60 ",
  ])("aceita %j", (texto) => {
    expect(lerJogoDigitado(texto, MEGA)).toEqual({ numeros: [5, 12, 23, 34, 41, 60], erro: null, completo: true });
  });

  it("incompleto não é erro", () => {
    expect(lerJogoDigitado("5 12", MEGA)).toEqual({ numeros: [5, 12], erro: null, completo: false });
    expect(lerJogoDigitado("", MEGA)).toEqual({ numeros: [], erro: null, completo: false });
  });

  it("número fora da faixa: explica a faixa e mantém os válidos", () => {
    const r = lerJogoDigitado("5 61 12", MEGA);
    expect(r.erro).toBe("O 61 não existe na Mega-Sena: os números vão de 01 a 60.");
    expect(r.numeros).toEqual([5, 12]);
    expect(r.completo).toBe(false);
    expect(lerJogoDigitado("0 1 2 3 4 5", MEGA).erro).toContain("O 00 não existe");
  });

  it("repetido", () => {
    const r = lerJogoDigitado("5 12 5", MEGA);
    expect(r.erro).toBe("O 05 aparece duas vezes.");
    expect(r.numeros).toEqual([5, 12]);
  });

  it("números demais", () => {
    const r = lerJogoDigitado("1 2 3 4 5 6 7", MEGA);
    expect(r.erro).toBe("O jogo na Mega-Sena tem 6 números; você digitou 7.");
    expect(r.numeros).toEqual([1, 2, 3, 4, 5, 6]);
    expect(r.completo).toBe(false);
  });

  it("número de 3 algarismos é ambíguo", () => {
    expect(lerJogoDigitado("123 5", MEGA).erro).toContain('Não entendi "123"');
  });

  it("Lotomania aceita 00", () => {
    const texto = Array.from({ length: 20 }, (_, i) => i * 5).join(" ");
    const r = lerJogoDigitado(texto, LOTOMANIA);
    expect(r.completo).toBe(true);
    expect(r.numeros[0]).toBe(0);
  });

  it("Super Sete: cada algarismo é uma coluna, com ou sem espaço", () => {
    expect(lerJogoDigitado("1 0 9 3 3 7 2", SUPER7)).toEqual({ numeros: [1, 0, 9, 3, 3, 7, 2], erro: null, completo: true });
    expect(lerJogoDigitado("1093372", SUPER7).completo).toBe(true);
    expect(lerJogoDigitado("10933725", SUPER7).erro).toBe("São 7 colunas no Super Sete, uma por algarismo; você digitou 8.");
  });
});

describe("jogoParaTexto", () => {
  it("ordena e põe zero à esquerda", () => {
    expect(jogoParaTexto([60, 5, 12])).toBe("05 12 60");
  });
  it("Super Sete mantém a ordem das colunas", () => {
    expect(jogoParaTexto([1, 0, 9], true)).toBe("1 0 9");
  });
});
