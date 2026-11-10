import { describe, expect, it } from "vitest";
import { csvMegaDaVirada, csvRecordes } from "./kit-imprensa";
import type { EdicaoVirada } from "./mega-da-virada";

const edicao = (over: Partial<EdicaoVirada>): EdicaoVirada => ({
  ano: 2025,
  numero: 2955,
  dataSorteio: "2026-01-01",
  dezenas: [9, 13, 21, 32, 33, 59],
  valorArrecadado: 3_000_000_000,
  premiacoes: [
    { faixa: 1, descricaoFaixa: "6 acertos", qtdGanhadores: 6, valorPremio: 181_892_881.09 },
    { faixa: 2, descricaoFaixa: "5 acertos", qtdGanhadores: 3000, valorPremio: 50_000 },
    { faixa: 3, descricaoFaixa: "4 acertos", qtdGanhadores: 200_000, valorPremio: 1_000 },
  ],
  ...over,
});

const linhas = (csv: string) => csv.replace(/^﻿/, "").trimEnd().split("\r\n");

describe("csvMegaDaVirada", () => {
  it("BOM, ; e vírgula decimal, uma linha por edição em ordem", () => {
    const csv = csvMegaDaVirada([edicao({}), edicao({ numero: 2150, dataSorteio: "2018-12-31", valorArrecadado: null })]);
    expect(csv.startsWith("﻿")).toBe(true);
    const [cab, l1, l2] = linhas(csv);
    expect(cab.split(";")).toHaveLength(10);
    expect(l1.split(";").slice(0, 4)).toEqual(["2018", "2150", "31/12/2018", "09 13 21 32 33 59"]);
    expect(l1.endsWith(";")).toBe(true); // arrecadação vazia
    // 01/01/2026 conta como a Virada de 2025
    expect(l2.split(";")).toEqual([
      "2025", "2955", "01/01/2026", "09 13 21 32 33 59", "6", "181892881,09", "1091357286,54", "3000", "200000", "3000000000",
    ]);
  });
});

describe("csvRecordes", () => {
  it("usa o nome da loteria e escapa texto com ;", () => {
    const csv = csvRecordes(
      [{ codigo: "megasena", numero: 3077, data: "2026-10-28", valor: 324_898_791.61, ganhadores: 1 },
       { codigo: "xyz", numero: 1, data: "2020-01-01", valor: 10, ganhadores: 2 }],
      { megasena: "Mega-Sena", xyz: "Nome; com separador" }
    );
    const [, l1, l2] = linhas(csv);
    expect(l1).toBe("Mega-Sena;324898791,61;3077;28/10/2026;1");
    expect(l2.startsWith('"Nome; com separador";10;')).toBe(true);
  });
});
