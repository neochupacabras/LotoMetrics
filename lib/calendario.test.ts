import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { dataHoraProximoSorteio, descricaoProximoSorteioEspecial } from "./calendario";

// Pausa cadastrada em PAUSAS_AGENDA (lib/calendario.ts): Lotofácil sem
// sorteio regular de 04/09 a 15/09/2026, com o concurso especial da
// Independência marcado para 15/09 às 11h de Brasília (14h UTC).
//
// `dataHoraProximoSorteio` compara o alvo contra `Date.now()` (o relógio
// real, não o `referencia` passado) — por isso os testes fixam o relógio
// do sistema com `vi.setSystemTime`, em vez de confiar só no argumento.

describe("dataHoraProximoSorteio — pausa da Lotofácil da Independência", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("antes da pausa, cai no sorteio regular normal (não pega o especial)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 1, 10, 0, 0)); // 01/09/2026, terça
    const referencia = new Date(2026, 8, 1, 10, 0, 0);
    const alvo = dataHoraProximoSorteio("lotofacil", referencia);
    // Terça-feira mesma, sorteio regular às 21h (0h UTC do dia seguinte).
    expect(alvo.toISOString()).toBe(new Date(Date.UTC(2026, 8, 2, 0, 0, 0)).toISOString());
  });

  it("durante a pausa, aponta pro concurso especial de 15/09 às 14h UTC", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 10, 10, 0, 0)); // 10/09/2026, quinta, dentro da pausa
    const referencia = new Date(2026, 8, 10, 10, 0, 0);
    const alvo = dataHoraProximoSorteio("lotofacil", referencia);
    expect(alvo.toISOString()).toBe("2026-09-15T14:00:00.000Z");
  });

  it("na véspera (14/09), ainda aponta pro concurso especial do dia seguinte", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 14, 8, 0, 0));
    const referencia = new Date(2026, 8, 14, 8, 0, 0);
    const alvo = dataHoraProximoSorteio("lotofacil", referencia);
    expect(alvo.toISOString()).toBe("2026-09-15T14:00:00.000Z");
  });

  it("depois do concurso especial, volta pra grade regular (16/09, quarta, 21h)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 16, 8, 0, 0));
    const referencia = new Date(2026, 8, 16, 8, 0, 0);
    const alvo = dataHoraProximoSorteio("lotofacil", referencia);
    expect(alvo.toISOString()).toBe(new Date(Date.UTC(2026, 8, 17, 0, 0, 0)).toISOString());
  });

  it("outras loterias não são afetadas pela pausa da Lotofácil", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 10, 10, 0, 0));
    const referencia = new Date(2026, 8, 10, 10, 0, 0);
    const alvo = dataHoraProximoSorteio("megasena", referencia);
    // Mega-Sena sorteia terça/quinta — 10/09 é quinta, sorteio às 21h.
    expect(alvo.toISOString()).toBe(new Date(Date.UTC(2026, 8, 11, 0, 0, 0)).toISOString());
  });
});

describe("descricaoProximoSorteioEspecial", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("descreve o concurso especial quando é o próximo sorteio", () => {
    vi.setSystemTime(new Date(2026, 8, 10, 10, 0, 0));
    const referencia = new Date(2026, 8, 10, 10, 0, 0);
    expect(descricaoProximoSorteioEspecial("lotofacil", referencia)).toContain("Independência");
  });

  it("é null fora da pausa", () => {
    vi.setSystemTime(new Date(2026, 8, 1, 10, 0, 0));
    const referencia = new Date(2026, 8, 1, 10, 0, 0);
    expect(descricaoProximoSorteioEspecial("lotofacil", referencia)).toBeNull();
  });

  it("é null pra loterias sem pausa cadastrada", () => {
    vi.setSystemTime(new Date(2026, 8, 10, 10, 0, 0));
    const referencia = new Date(2026, 8, 10, 10, 0, 0);
    expect(descricaoProximoSorteioEspecial("megasena", referencia)).toBeNull();
  });
});
