import { describe, expect, it } from "vitest";
import { calcularRendimentos, lerValor, ultimoValorSgs, type Taxas } from "./rendimento-premio";

const TAXAS: Taxas = { poupancaMensal: 0.65, cdiAnual: 13.65, selicAnual: 13.65, data: "10/11/2026", fonte: "bcb" };

describe("calcularRendimentos", () => {
  it("valor anunciado (bruto): desconta 30% antes de render", () => {
    const r = calcularRendimentos(1_000_000_000, true, TAXAS);
    expect(r.impostoPremio).toBe(300_000_000);
    expect(r.liquido).toBe(700_000_000);
  });

  it("valor já pago (líquido): não desconta nada", () => {
    const r = calcularRendimentos(700_000_000, false, TAXAS);
    expect(r.impostoPremio).toBe(0);
    expect(r.liquido).toBe(700_000_000);
  });

  it("poupança: taxa do mês direto, sem IR", () => {
    const r = calcularRendimentos(1_000_000, false, TAXAS);
    const p = r.linhas.find((l) => l.id === "poupanca")!;
    expect(p.mensal).toBeCloseTo(6_500, 2);
    expect(p.anual).toBeCloseTo(1_000_000 * (Math.pow(1.0065, 12) - 1), 2);
  });

  it("CDB: IR de 15% sobre o ganho", () => {
    const r = calcularRendimentos(1_000_000, false, TAXAS);
    const c = r.linhas.find((l) => l.id === "cdb")!;
    expect(c.anual).toBeCloseTo(1_000_000 * 0.1365 * 0.85, 2);
    expect(c.mensal).toBeCloseTo(1_000_000 * (Math.pow(1.1365, 1 / 12) - 1) * 0.85, 2);
  });

  it("Tesouro Selic: custódia de 0,20% a.a. reduz o ganho antes do IR", () => {
    const r = calcularRendimentos(1_000_000, false, TAXAS);
    const t = r.linhas.find((l) => l.id === "tesouro-selic")!;
    expect(t.anual).toBeCloseTo(1_000_000 * 0.1345 * 0.85, 2);
    expect(t.anual).toBeLessThan(r.linhas.find((l) => l.id === "cdb")!.anual);
  });

  it("valor inválido vira zero", () => {
    expect(calcularRendimentos(Number.NaN, true, TAXAS).liquido).toBe(0);
    expect(calcularRendimentos(-5, true, TAXAS).linhas.every((l) => l.mensal === 0)).toBe(true);
  });
});

describe("lerValor", () => {
  it.each([
    ["1.000.000", 1_000_000],
    ["R$ 2.500.000,50", 2_500_000.5],
    ["1000000", 1_000_000],
    ["", 0],
  ])("%j -> %d", (t, v) => expect(lerValor(t)).toBe(v));
});

describe("ultimoValorSgs", () => {
  const hoje = new Date(Date.UTC(2026, 10, 10));
  it("pega o mais recente até hoje, mesmo fora de ordem", () => {
    const serie = [
      { data: "09/11/2026", valor: "13.65" },
      { data: "06/11/2026", valor: "13.60" },
    ];
    expect(ultimoValorSgs(serie, hoje)).toEqual({ valor: 13.65, data: "09/11/2026" });
  });
  it("ignora datas futuras (meta Selic) e registros ruins", () => {
    const serie = [
      { data: "08/12/2026", valor: "14.00" },
      { data: "05/11/2026", valor: "13.75" },
      { data: "xx", valor: "1" },
      { data: "04/11/2026", valor: "abc" },
    ];
    expect(ultimoValorSgs(serie, hoje)).toEqual({ valor: 13.75, data: "05/11/2026" });
  });
  it("resposta que não é lista: null", () => {
    expect(ultimoValorSgs({ erro: "x" }, hoje)).toBeNull();
    expect(ultimoValorSgs([], hoje)).toBeNull();
  });
});

describe("getTaxasBcb", () => {
  it("API fora do ar: usa as taxas de reserva, marcadas como reserva", async () => {
    const { vi } = await import("vitest");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("rede")));
    const erro = vi.spyOn(console, "error").mockImplementation(() => {});
    const { getTaxasBcb } = await import("./taxas-bcb");
    const t = await getTaxasBcb(new Date(Date.UTC(2026, 10, 10)));
    expect(t.fonte).toBe("reserva");
    expect(t.cdiAnual).toBeGreaterThan(0);
    vi.unstubAllGlobals();
    erro.mockRestore();
  });

  it("API respondendo: usa o valor mais recente de cada série", async () => {
    const { vi } = await import("vitest");
    const respostas: Record<string, unknown> = {
      "195": [{ data: "01/11/2026", valor: "0.6521" }, { data: "05/11/2026", valor: "0.6600" }],
      "4389": [{ data: "09/11/2026", valor: "13.65" }],
      "1178": [{ data: "09/11/2026", valor: "13.60" }],
    };
    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      const codigo = url.match(/sgs\.(\d+)/)![1];
      return new Response(JSON.stringify(respostas[codigo]), { status: 200 });
    }));
    const { getTaxasBcb } = await import("./taxas-bcb");
    const t = await getTaxasBcb(new Date(Date.UTC(2026, 10, 10)));
    expect(t).toEqual({ poupancaMensal: 0.66, cdiAnual: 13.65, selicAnual: 13.6, data: "09/11/2026", fonte: "bcb" });
    vi.unstubAllGlobals();
  });
});
