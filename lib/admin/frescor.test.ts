import { describe, expect, it } from "vitest";
import { avaliarFrescor } from "./frescor";

const em = (iso: string) => Date.parse(iso);

describe("avaliarFrescor com data do próximo sorteio", () => {
  it("pausa anunciada não alerta (Quina Friday)", () => {
    // último sorteio 19/11, próximo 29/11: em 24/11 está tudo certo
    expect(
      avaliarFrescor({ diasDesde: 5, sorteiosPorSemana: 6, proximoSorteio: "2026-11-29", agora: em("2026-11-24T20:00:00Z") })
    ).toBe("healthy");
  });

  it("noite do sorteio e manhã seguinte ainda estão no prazo", () => {
    const base = { diasDesde: 5, sorteiosPorSemana: 3, proximoSorteio: "2026-11-23" };
    expect(avaliarFrescor({ ...base, agora: em("2026-11-24T01:00:00Z") })).toBe("healthy"); // 22h BRT do dia 23
    expect(avaliarFrescor({ ...base, agora: em("2026-11-24T14:59:00Z") })).toBe("healthy"); // 11h59 BRT do dia 24
  });

  it("resultado que não chegou alerta a partir do meio-dia seguinte (Super Sete 925)", () => {
    const base = { diasDesde: 6, sorteiosPorSemana: 3, proximoSorteio: "2026-11-23" };
    expect(avaliarFrescor({ ...base, agora: em("2026-11-24T15:01:00Z") })).toBe("warning");
    expect(avaliarFrescor({ ...base, agora: em("2026-11-26T15:00:00Z") })).toBe("warning");
    expect(avaliarFrescor({ ...base, agora: em("2026-11-26T15:01:00Z") })).toBe("critical");
  });
});

describe("avaliarFrescor sem data do próximo sorteio (cadência)", () => {
  it("usa 2x o intervalo + 1 dia, e o dobro para crítico", () => {
    // 3 sorteios/semana: tolerância ~5,67 dias
    const base = { sorteiosPorSemana: 3, proximoSorteio: null, agora: 0 };
    expect(avaliarFrescor({ ...base, diasDesde: 5 })).toBe("healthy");
    expect(avaliarFrescor({ ...base, diasDesde: 6 })).toBe("warning");
    expect(avaliarFrescor({ ...base, diasDesde: 12 })).toBe("critical");
  });
});
