import { describe, expect, it } from "vitest";
import { BOLAO_PRO_PIX, valorBolaoProPix } from "./planos";

describe("valorBolaoProPix", () => {
  it("admin com a env de teste paga o valor de teste", () => {
    expect(valorBolaoProPix("admin", "1")).toBe(1);
    expect(valorBolaoProPix("admin", "1,50")).toBe(1.5);
  });
  it("não-admin sempre paga o preço oficial, mesmo com a env definida", () => {
    expect(valorBolaoProPix("user", "1")).toBe(BOLAO_PRO_PIX.amount);
    expect(valorBolaoProPix(null, "1")).toBe(BOLAO_PRO_PIX.amount);
    expect(valorBolaoProPix(undefined, "1")).toBe(BOLAO_PRO_PIX.amount);
  });
  it("sem env, env inválida ou fora do intervalo: preço oficial", () => {
    expect(valorBolaoProPix("admin", undefined)).toBe(BOLAO_PRO_PIX.amount);
    expect(valorBolaoProPix("admin", "")).toBe(BOLAO_PRO_PIX.amount);
    expect(valorBolaoProPix("admin", "abc")).toBe(BOLAO_PRO_PIX.amount);
    expect(valorBolaoProPix("admin", "0")).toBe(BOLAO_PRO_PIX.amount);
    expect(valorBolaoProPix("admin", "-5")).toBe(BOLAO_PRO_PIX.amount);
    expect(valorBolaoProPix("admin", "99")).toBe(BOLAO_PRO_PIX.amount);
  });
});
