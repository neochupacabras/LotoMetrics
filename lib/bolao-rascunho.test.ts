import { describe, expect, it } from "vitest";
import { lerRascunho, serializarRascunho, type RascunhoBolao } from "./bolao-rascunho";

const r: RascunhoBolao = {
  orcamento: "500",
  preco: "6,00",
  participantes: "10",
  tamanhoPool: 10,
  garantia: 4,
  selecionadas: [1, 5, 10, 15, 20, 25, 30, 35, 40, 45],
  origem: "bolao_publico",
};

describe("rascunho do bolão", () => {
  it("volta igual dentro de 24 h", () => {
    const agora = 1_000_000;
    expect(lerRascunho(serializarRascunho(r, agora), agora + 23 * 3600_000)).toEqual(r);
  });

  it("vence depois de 24 h", () => {
    expect(lerRascunho(serializarRascunho(r, 0), 25 * 3600_000)).toBeNull();
  });

  it("ignora rascunho ausente, corrompido ou do formato antigo (sem data)", () => {
    expect(lerRascunho(null, 0)).toBeNull();
    expect(lerRascunho("{quebrado", 0)).toBeNull();
    expect(lerRascunho(JSON.stringify({ ...r }), 0)).toBeNull();
    expect(lerRascunho(JSON.stringify({ ...r, salvoEm: 0, selecionadas: ["x"] }), 0)).toBeNull();
  });
});
