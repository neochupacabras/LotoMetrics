import { describe, expect, it } from "vitest";
import { intervaloDoAno, loteriaMaisJogada, maiorPremioIndividual } from "./retrospectiva";
import type { JogoCarteira } from "./carteira";

function jogo(overrides: Partial<JogoCarteira>): JogoCarteira {
  return {
    id: 1,
    loteria: "lotofacil",
    dezenas: [1, 2, 3],
    label: null,
    ativo: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    nomeLoteria: "Lotofácil",
    concursosAcompanhados: 10,
    gasto: 30,
    ganho: 0,
    ...overrides,
  };
}

describe("loteriaMaisJogada", () => {
  it("null pra lista vazia", () => {
    expect(loteriaMaisJogada([])).toBeNull();
  });

  it("escolhe a loteria com mais jogos", () => {
    const jogos = [
      jogo({ id: 1, loteria: "lotofacil", nomeLoteria: "Lotofácil" }),
      jogo({ id: 2, loteria: "lotofacil", nomeLoteria: "Lotofácil" }),
      jogo({ id: 3, loteria: "megasena", nomeLoteria: "Mega-Sena" }),
    ];
    expect(loteriaMaisJogada(jogos)).toEqual({
      codigoLoteria: "lotofacil",
      nomeLoteria: "Lotofácil",
      quantidadeJogos: 2,
    });
  });

  it("desempata por concursos acompanhados", () => {
    const jogos = [
      jogo({ id: 1, loteria: "lotofacil", nomeLoteria: "Lotofácil", concursosAcompanhados: 5 }),
      jogo({ id: 2, loteria: "megasena", nomeLoteria: "Mega-Sena", concursosAcompanhados: 20 }),
    ];
    expect(loteriaMaisJogada(jogos)?.codigoLoteria).toBe("megasena");
  });
});

describe("maiorPremioIndividual", () => {
  it("null quando ninguém ganhou nada", () => {
    const jogos = [jogo({ ganho: 0 }), jogo({ ganho: null })];
    expect(maiorPremioIndividual(jogos)).toBeNull();
  });

  it("escolhe o jogo com maior ganho", () => {
    const jogos = [
      jogo({ id: 1, ganho: 15 }),
      jogo({ id: 2, ganho: 500 }),
      jogo({ id: 3, ganho: 100 }),
    ];
    expect(maiorPremioIndividual(jogos)?.id).toBe(2);
  });

  it("ignora jogos não-calculáveis (ganho null)", () => {
    const jogos = [jogo({ id: 1, ganho: null }), jogo({ id: 2, ganho: 42 })];
    expect(maiorPremioIndividual(jogos)?.id).toBe(2);
  });
});

describe("intervaloDoAno", () => {
  it("cobre o ano inteiro quando não corta em 'hoje'", () => {
    expect(intervaloDoAno(2026)).toEqual({
      inicio: "2026-01-01T00:00:00.000Z",
      fim: "2026-12-31T23:59:59.999Z",
    });
  });

  it("corta no dia informado quando o ano ainda está em andamento", () => {
    const hoje = new Date("2026-12-05T10:00:00.000Z");
    expect(intervaloDoAno(2026, hoje)).toEqual({
      inicio: "2026-01-01T00:00:00.000Z",
      fim: "2026-12-05T10:00:00.000Z",
    });
  });

  it("não corta se a data informada já passou do fim do ano", () => {
    const depois = new Date("2027-03-01T00:00:00.000Z");
    expect(intervaloDoAno(2026, depois).fim).toBe("2026-12-31T23:59:59.999Z");
  });
});
