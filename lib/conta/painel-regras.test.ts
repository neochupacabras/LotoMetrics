import { describe, expect, it } from "vitest";
import {
  atalhosRapidos,
  diaBrasilia,
  linhaDoDia,
  quandoSorteio,
  saudacaoPorHora,
} from "./painel-regras";

// Instante real a partir de um horário de Brasília (UTC-3).
const brt = (iso: string) => new Date(`${iso}-03:00`);

describe("saudacaoPorHora", () => {
  it("separa manhã, tarde e noite", () => {
    expect(saudacaoPorHora(5)).toBe("Bom dia");
    expect(saudacaoPorHora(11)).toBe("Bom dia");
    expect(saudacaoPorHora(12)).toBe("Boa tarde");
    expect(saudacaoPorHora(17)).toBe("Boa tarde");
    expect(saudacaoPorHora(18)).toBe("Boa noite");
    expect(saudacaoPorHora(2)).toBe("Boa noite");
  });
});

describe("diaBrasilia", () => {
  it("usa o dia de Brasília, não o de UTC", () => {
    // 23h30 em Brasília = 02h30 UTC do dia seguinte
    expect(diaBrasilia(brt("2026-11-10T23:30:00"))).toBe("2026-11-10");
  });
});

describe("quandoSorteio", () => {
  const agora = brt("2026-11-10T15:00:00"); // terça

  it("hoje e amanhã por extenso", () => {
    expect(quandoSorteio(brt("2026-11-10T21:00:00"), agora)).toBe("hoje, 21h");
    expect(quandoSorteio(brt("2026-11-11T21:00:00"), agora)).toBe("amanhã, 21h");
  });

  it("depois disso, dia da semana e data", () => {
    expect(quandoSorteio(brt("2026-11-15T11:00:00"), agora)).toMatch(/^dom\.? 15\/11, 11h$/);
  });
});

describe("linhaDoDia", () => {
  const agora = brt("2026-11-10T15:00:00");

  it("lista até 3 loterias com a preposição certa", () => {
    const linha = linhaDoDia(
      [
        { codigo: "megasena", instante: brt("2026-11-10T21:00:00") },
        { codigo: "diadesorte", instante: brt("2026-11-10T21:00:00") },
        { codigo: "lotomania", instante: brt("2026-11-11T21:00:00") },
      ],
      agora
    );
    expect(linha).toBe("Hoje tem sorteio da Mega-Sena e do Dia de Sorte, às 21h.");
  });

  it("resume quando há mais de 3 sorteios no dia", () => {
    const codigos = ["lotofacil", "megasena", "quina", "timemania"] as const;
    const linha = linhaDoDia(
      codigos.map((codigo) => ({ codigo, instante: brt("2026-11-10T21:00:00") })),
      agora
    );
    expect(linha).toBe("Hoje tem 4 sorteios, às 21h: Lotofácil, Mega-Sena, Quina e Timemania.");
  });

  it("sem sorteio ainda hoje, aponta o próximo", () => {
    const linha = linhaDoDia(
      [
        { codigo: "supersete", instante: brt("2026-11-11T21:00:00") },
        { codigo: "megasena", instante: brt("2026-11-12T21:00:00") },
      ],
      agora
    );
    expect(linha).toBe("Hoje não há mais sorteios. O próximo é do Super Sete, amanhã, 21h.");
  });

  it("sem dados, não inventa", () => {
    expect(linhaDoDia([], agora)).toBe("");
  });
});

describe("atalhosRapidos", () => {
  it("leva o contexto da loteria", () => {
    expect(atalhosRapidos("quina").map((a) => a.href)).toEqual([
      "/quina/conferidor",
      "/quina/gerador",
      "/quina/simulador",
      "/quina/bolao",
    ]);
  });

  it("bolão cai na Mega-Sena onde não existe", () => {
    expect(atalhosRapidos("lotomania")[3].href).toBe("/megasena/bolao");
    expect(atalhosRapidos("supersete")[3].href).toBe("/megasena/bolao");
  });
});
