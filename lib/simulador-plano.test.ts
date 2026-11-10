import { describe, expect, it } from "vitest";
import { LIMITE_HISTORICO_FREE, limiteHistoricoPorPlano, recortarHistorico } from "./simulador-plano";

describe("limiteHistoricoPorPlano", () => {
  it("Free fica nos últimos 100 concursos", () => {
    expect(limiteHistoricoPorPlano(false)).toBe(100);
    expect(LIMITE_HISTORICO_FREE).toBe(100);
  });

  it("Premium usa o histórico completo", () => {
    expect(limiteHistoricoPorPlano(true)).toBeNull();
  });
});

describe("recortarHistorico", () => {
  const draws = Array.from({ length: 250 }, (_, i) => i + 1);

  it("Free recebe só os 100 concursos mais recentes", () => {
    const recorte = recortarHistorico(draws, limiteHistoricoPorPlano(false));
    expect(recorte).toHaveLength(100);
    expect(recorte[0]).toBe(151);
    expect(recorte.at(-1)).toBe(250);
  });

  it("Premium recebe tudo", () => {
    expect(recortarHistorico(draws, limiteHistoricoPorPlano(true))).toHaveLength(250);
  });

  it("histórico menor que o limite fica inteiro", () => {
    expect(recortarHistorico([1, 2, 3], LIMITE_HISTORICO_FREE)).toEqual([1, 2, 3]);
  });
});
