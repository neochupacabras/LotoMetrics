import { describe, expect, it } from "vitest";
import { qtdDezenasAposta } from "./format";
import { faixaLotomania } from "./probabilidades";

describe("qtdDezenasAposta", () => {
  it("Lotomania: marca 50, sorteia 20", () => {
    expect(qtdDezenasAposta("lotomania", 20)).toBe(50);
  });
  it("demais loterias: igual à quantidade sorteada", () => {
    expect(qtdDezenasAposta("megasena", 6)).toBe(6);
    expect(qtdDezenasAposta("lotofacil", 15)).toBe(15);
    expect(qtdDezenasAposta("quina", 5)).toBe(5);
  });
});


describe("faixaLotomania", () => {
  it("20 a 16 acertos: faixas 1 a 5 nos dois períodos", () => {
    for (const novo of [true, false]) {
      expect([20, 19, 18, 17, 16].map((a) => faixaLotomania(a, novo))).toEqual([1, 2, 3, 4, 5]);
    }
  });
  it("concurso novo (tem faixa 7): 15 -> 6 e 0 -> 7", () => {
    expect(faixaLotomania(15, true)).toBe(6);
    expect(faixaLotomania(0, true)).toBe(7);
  });
  it("concurso antigo: 0 -> 6 e 15 sem prêmio", () => {
    expect(faixaLotomania(0, false)).toBe(6);
    expect(faixaLotomania(15, false)).toBeUndefined();
  });
  it("1 a 14 acertos não premiam", () => {
    expect(faixaLotomania(14, true)).toBeUndefined();
    expect(faixaLotomania(1, false)).toBeUndefined();
  });
});
