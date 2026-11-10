import { describe, expect, it } from "vitest";
import {
  anoDaEdicao,
  destaquesVirada,
  diasAteVirada,
  emTemporadaDaVirada,
  frequenciaNaVirada,
  resumirEdicao,
  tabelaApostas,
  type EdicaoVirada,
} from "./mega-da-virada";

function edicao(ano: number, dezenas: number[], sena: [number, number]): EdicaoVirada {
  return {
    ano,
    numero: ano,
    dataSorteio: `${ano}-12-31T00:00:00.000Z`,
    dezenas,
    valorArrecadado: null,
    premiacoes: [
      { faixa: 1, descricaoFaixa: null, qtdGanhadores: sena[0], valorPremio: sena[1] },
      { faixa: 2, descricaoFaixa: null, qtdGanhadores: 100, valorPremio: 1000 },
      { faixa: 3, descricaoFaixa: null, qtdGanhadores: 5000, valorPremio: 100 },
    ],
  };
}

describe("anoDaEdicao", () => {
  it("31/12 é do próprio ano; 01/01 é a Virada do ano anterior", () => {
    expect(anoDaEdicao("2024-12-31T00:00:00.000Z")).toBe(2024);
    expect(anoDaEdicao("2026-01-01T00:00:00.000Z")).toBe(2025);
  });
});

describe("diasAteVirada", () => {
  it("conta os dias corridos até 31/12", () => {
    expect(diasAteVirada(new Date(2026, 10, 9, 23, 0))).toEqual({ ano: 2026, dias: 52 });
    expect(diasAteVirada(new Date(2026, 11, 31, 8, 0))).toEqual({ ano: 2026, dias: 0 });
  });
});

describe("emTemporadaDaVirada", () => {
  it("vale de novembro à primeira semana de janeiro", () => {
    expect(emTemporadaDaVirada(new Date(2026, 9, 31))).toBe(false);
    expect(emTemporadaDaVirada(new Date(2026, 10, 1))).toBe(true);
    expect(emTemporadaDaVirada(new Date(2027, 0, 7))).toBe(true);
    expect(emTemporadaDaVirada(new Date(2027, 0, 8))).toBe(false);
  });
});

describe("resumirEdicao", () => {
  it("multiplica ganhadores pelo prêmio de cada um", () => {
    const r = resumirEdicao(edicao(2025, [1, 2, 3, 4, 5, 6], [6, 181_892_881.09]));
    expect(r.ganhadoresSena).toBe(6);
    expect(r.premioTotalSena).toBeCloseTo(1_091_357_286.54, 2);
  });

  it("sem ganhador da sena, prêmio zero", () => {
    expect(resumirEdicao(edicao(2008, [1, 2, 3, 4, 5, 6], [0, 0])).premioTotalSena).toBe(0);
  });
});

describe("frequenciaNaVirada", () => {
  it("ordena pela mais sorteada e inclui as que nunca saíram", () => {
    const f = frequenciaNaVirada([edicao(1, [10, 20, 30, 40, 50, 60], [1, 1]), edicao(2, [10, 20, 1, 2, 3, 4], [1, 1])]);
    expect(f).toHaveLength(60);
    expect(f.slice(0, 2)).toEqual([{ dezena: 10, vezes: 2 }, { dezena: 20, vezes: 2 }]);
    expect(f.at(-1)).toEqual({ dezena: 59, vezes: 0 });
  });
});

describe("destaquesVirada", () => {
  it("acha o maior prêmio total, o maior individual e a edição com mais ganhadores", () => {
    const a = edicao(2018, [1, 2, 3, 4, 5, 6], [52, 5_818_007.36]);
    const b = edicao(2021, [1, 2, 3, 4, 5, 6], [2, 189_062_363.74]);
    const c = edicao(2025, [1, 2, 3, 4, 5, 6], [6, 181_892_881.09]);
    const d = destaquesVirada([a, b, c]);
    expect(d.maiorPremioTotal?.ano).toBe(2025);
    expect(d.maiorPremioIndividual?.ano).toBe(2021);
    expect(d.maisGanhadores?.ano).toBe(2018);
    expect(d.totalGanhadoresSena).toBe(60);
  });
});

describe("tabelaApostas", () => {
  it("preço e chance batem com a regra da Mega-Sena", () => {
    const [seis, , , , dez] = tabelaApostas();
    expect(seis).toEqual({ dezenas: 6, jogos: 1, preco: 6, umEm: 50_063_860 });
    expect(dez.jogos).toBe(210);
    expect(dez.preco).toBe(1260);
    expect(dez.umEm).toBe(238_399);
  });
});
