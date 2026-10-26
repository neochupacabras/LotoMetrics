import { describe, it, expect } from "vitest";
import {
  bolaoEhPro,
  limiteCotas,
  podeCriarBolao,
  podeDefinirCotas,
  podeAdicionarParticipante,
  valorCotaSugeridoCents,
  calcularProAte,
  revogarProAte,
  proximoConcursoAlvo,
} from "./bolao-limites";
import { descontarDias } from "./plano-premium";

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

describe("calcularProAte", () => {
  const dia = 24 * 60 * 60 * 1000;
  it("sem validade anterior soma a partir de agora", () => {
    expect(calcularProAte(null, agora, 30).getTime()).toBe(agora.getTime() + 30 * dia);
  });
  it("validade futura é estendida", () => {
    const futura = new Date(agora.getTime() + 10 * dia).toISOString();
    expect(calcularProAte(futura, agora, 30).getTime()).toBe(agora.getTime() + 40 * dia);
  });
  it("validade vencida recomeça de agora", () => {
    const vencida = new Date(agora.getTime() - 5 * dia).toISOString();
    expect(calcularProAte(vencida, agora, 30).getTime()).toBe(agora.getTime() + 30 * dia);
  });
});

describe("revogarProAte", () => {
  const dia = 24 * 60 * 60 * 1000;
  it("tira os dias; se sobra tempo futuro, mantém", () => {
    const proAte = new Date(agora.getTime() + 40 * dia).toISOString();
    expect(revogarProAte(proAte, 30, agora)?.getTime()).toBe(agora.getTime() + 10 * dia);
  });
  it("se o que sobra já passou, volta a free (null)", () => {
    const proAte = new Date(agora.getTime() + 30 * dia).toISOString();
    expect(revogarProAte(proAte, 30, agora)).toBeNull();
    expect(revogarProAte(null, 30, agora)).toBeNull();
  });
});

describe("proximoConcursoAlvo", () => {
  // 20/11/2026 18:30 BRT = 21:30 UTC; 19:30 BRT = 22:30 UTC
  it("antes das 19h do dia do sorteio: o próximo é ultimo + 1", () => {
    expect(proximoConcursoAlvo(3074, "2026-11-20", new Date("2026-11-20T21:30:00Z"))).toBe(3075);
  });
  it("depois das 19h do dia do sorteio: já é o seguinte (ultimo + 2)", () => {
    expect(proximoConcursoAlvo(3074, "2026-11-20", new Date("2026-11-20T22:30:00Z"))).toBe(3076);
  });
  it("em outro dia, ou sem data: ultimo + 1", () => {
    expect(proximoConcursoAlvo(3074, "2026-11-22", new Date("2026-11-20T23:30:00Z"))).toBe(3075);
    expect(proximoConcursoAlvo(3074, "2026-11-18", new Date("2026-11-20T23:30:00Z"))).toBe(3075);
    expect(proximoConcursoAlvo(3074, null, new Date("2026-11-20T23:30:00Z"))).toBe(3075);
  });
  it("usa o dia de Brasília, não o UTC (23h BRT já é o dia seguinte em UTC)", () => {
    // 20/11 23:00 BRT = 21/11 02:00 UTC — ainda é 20/11 em Brasília
    expect(proximoConcursoAlvo(3074, "2026-11-20", new Date("2026-11-21T02:00:00Z"))).toBe(3076);
  });
});

describe("descontarDias (crédito Premium)", () => {
  const dia = 24 * 60 * 60 * 1000;
  it("tira os dias e mantém se ainda é futuro; null se já passou", () => {
    const exp = new Date(agora.getTime() + 60 * dia).toISOString();
    expect(descontarDias(exp, 30, agora)?.getTime()).toBe(agora.getTime() + 30 * dia);
    expect(descontarDias(exp, 60, agora)).toBeNull();
    expect(descontarDias(null, 30, agora)).toBeNull();
  });
});
