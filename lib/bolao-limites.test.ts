import { describe, it, expect } from "vitest";
import {
  bolaoEhPro,
  limiteCotas,
  podeCriarBolao,
  podeDefinirCotas,
  podeAdicionarParticipante,
  valorCotaSugeridoCents,
} from "./bolao-limites";

const agora = new Date("2026-11-01T12:00:00Z");

describe("bolaoEhPro", () => {
  it("Premium torna qualquer bolão Pro", () => {
    expect(bolaoEhPro({ pro_ate: null }, true, agora)).toBe(true);
  });
  it("Pix de Bolão Pro válido", () => {
    expect(bolaoEhPro({ pro_ate: "2026-11-15T00:00:00Z" }, false, agora)).toBe(true);
  });
  it("Pix de Bolão Pro vencido ou ausente", () => {
    expect(bolaoEhPro({ pro_ate: "2026-10-31T00:00:00Z" }, false, agora)).toBe(false);
    expect(bolaoEhPro({ pro_ate: null }, false, agora)).toBe(false);
    expect(bolaoEhPro(null, false, agora)).toBe(false);
  });
});

describe("limites", () => {
  it("limiteCotas", () => {
    expect(limiteCotas(false)).toBe(10);
    expect(limiteCotas(true)).toBe(100);
  });
  it("grátis: 1 bolão ativo e até 10 cotas", () => {
    expect(podeCriarBolao(false, 0, 10).ok).toBe(true);
    expect(podeCriarBolao(false, 1, 5)).toMatchObject({ ok: false, motivo: "boloes_ativos" });
    expect(podeCriarBolao(false, 0, 11)).toMatchObject({ ok: false, motivo: "cotas" });
  });
  it("Premium: sem limite de ativos, até 100 cotas", () => {
    expect(podeCriarBolao(true, 5, 100).ok).toBe(true);
    expect(podeCriarBolao(true, 0, 101).ok).toBe(false);
  });
  it("podeDefinirCotas respeita plano e cotas já atribuídas", () => {
    expect(podeDefinirCotas(false, 11, 0)).toMatchObject({ ok: false, motivo: "cotas" });
    expect(podeDefinirCotas(true, 11, 0).ok).toBe(true);
    expect(podeDefinirCotas(true, 5, 6).ok).toBe(false);
    expect(podeDefinirCotas(true, 6, 6).ok).toBe(true);
  });
  it("podeAdicionarParticipante", () => {
    expect(podeAdicionarParticipante(10, 9, 1).ok).toBe(true);
    expect(podeAdicionarParticipante(10, 9, 2).ok).toBe(false);
    expect(podeAdicionarParticipante(10, 10, 1).erro).toMatch(/Todas/);
  });
});

describe("valorCotaSugeridoCents", () => {
  it("arredonda pra cima ao centavo", () => {
    expect(valorCotaSugeridoCents(10000, 3)).toBe(3334);
    expect(valorCotaSugeridoCents(9000, 3)).toBe(3000);
  });
});
