import { describe, expect, it } from "vitest";
import { caminhoInternoSeguro } from "./caminho-seguro";

describe("caminhoInternoSeguro", () => {
  it("aceita caminho interno com query", () => {
    expect(caminhoInternoSeguro("/megasena/bolao?retomar=1")).toBe("/megasena/bolao?retomar=1");
  });

  it("recusa destino fora do site", () => {
    for (const ruim of ["https://mal.com", "//mal.com", "/\\mal.com", "@mal.com", "", null, undefined, 42]) {
      expect(caminhoInternoSeguro(ruim)).toBe("/conta");
    }
  });
});
