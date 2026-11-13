import { describe, expect, it } from "vitest";
import { cicloEsperado } from "./ciclo-esperado";

describe("cicloEsperado", () => {
  it("Mega-Sena: 45,2 concursos (auditoria, 01-ficha-matematica)", () => {
    expect(cicloEsperado(60, 6)).toBeCloseTo(45.23, 1);
  });

  it("caso trivial: sortear todas as dezenas fecha o ciclo em 1 concurso", () => {
    expect(cicloEsperado(10, 10)).toBe(1);
  });

  it("uma dezena por concurso é o problema do colecionador: n·H(n)", () => {
    const n = 10;
    let h = 0;
    for (let i = 1; i <= n; i++) h += 1 / i;
    expect(cicloEsperado(n, 1)).toBeCloseTo(n * h, 10);
  });

  it("Lotofácil: 4,8 concursos", () => {
    expect(cicloEsperado(25, 15)).toBeCloseTo(4.77, 2);
  });
});
