import { describe, expect, it, vi } from "vitest";

// concursos.ts importa o envio (pg/web-push); aqui só os montadores de
// payload interessam.
vi.mock("@/lib/push/servidor", () => ({ notificarInscricoes: vi.fn(), semFalhar: vi.fn() }));

import { montarPayloadAcumulado, montarPayloadResultado } from "@/lib/push/concursos";

const base = { loteria_codigo: "megasena", numero: 2800, dezenas: [5, 12, 23, 34, 45, 60], acumulado: false, valor_estimado_proximo: null };

describe("montarPayloadResultado", () => {
  it("lista as dezenas com dois dígitos e aponta para o concurso", () => {
    const p = montarPayloadResultado(base);
    expect(p.titulo).toBe("Mega-Sena 2800");
    expect(p.corpo).toBe("05 12 23 34 45 60");
    expect(p.url).toBe("/megasena/resultados/2800");
    expect(p.tag).toBe("resultado-megasena");
    expect(p.acoes?.map((a) => a.url)).toEqual(["/megasena/resultados/2800", "/megasena/conferidor"]);
  });

  it("acumulado: título avisa e corpo traz a estimativa", () => {
    const p = montarPayloadResultado({ ...base, acumulado: true, valor_estimado_proximo: "45000000" });
    expect(p.titulo).toBe("Mega-Sena 2800 · Acumulou!");
    expect(p.corpo).toContain("05 12 23 34 45 60\nPróximo prêmio estimado:");
    expect(p.corpo).toContain("45.000.000");
  });
});

describe("montarPayloadAcumulado", () => {
  it("usa a preposição certa quando não há estimativa", () => {
    const p = montarPayloadAcumulado({ ...base, loteria_codigo: "supersete", acumulado: true });
    expect(p.corpo).toBe("Ninguém acertou o concurso 2800 do Super Sete.");
    expect(p.url).toBe("/supersete/resultados/2800");
  });
});
