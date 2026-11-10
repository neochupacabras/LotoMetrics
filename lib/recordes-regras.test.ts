import { describe, expect, it } from "vitest";
import {
  descricaoRecordes,
  faixasPrincipais,
  maiorSequenciaAcumulo,
  temRecordesDeDezenas,
  tituloRecordes,
  type SequenciaAcumulo,
} from "./recordes-regras";

const limpar = (s: string) => s.replace(/ /g, " ");

const grupo = (inicio: number, fim: number, premio = 1000): SequenciaAcumulo => ({
  concursoInicio: inicio,
  concursoFim: fim,
  duracao: fim - inicio + 1,
  ganhadores: 1,
  premio,
  dataInicio: "2020-01-01",
  dataFim: "2020-02-01",
});

describe("faixasPrincipais e temRecordesDeDezenas", () => {
  it("Dupla Sena tem duas faixas principais", () => {
    expect(faixasPrincipais("duplasena")).toEqual([1, 5]);
    expect(faixasPrincipais("megasena")).toEqual([1]);
  });
  it("Super Sete fica sem recordes de dezenas", () => {
    expect(temRecordesDeDezenas("supersete")).toBe(false);
    expect(temRecordesDeDezenas("lotofacil")).toBe(true);
  });
});

describe("maiorSequenciaAcumulo", () => {
  it("acha a maior e conta só os concursos sem ganhador", () => {
    const r = maiorSequenciaAcumulo([grupo(1, 3), grupo(4, 20, 5e6), grupo(21, 21)]);
    expect(r).toMatchObject({
      concursosSemGanhador: 16,
      primeiroSemGanhador: 4,
      ultimoSemGanhador: 19,
      concursoComGanhador: 20,
      premio: 5e6,
    });
  });
  it("empate fica com a mais recente", () => {
    expect(maiorSequenciaAcumulo([grupo(1, 5), grupo(10, 14)])?.concursoComGanhador).toBe(14);
  });
  it("sem acúmulo nenhum: null", () => {
    expect(maiorSequenciaAcumulo([grupo(1, 1), grupo(2, 2)])).toBeNull();
    expect(maiorSequenciaAcumulo([])).toBeNull();
  });
});

describe("título e descrição", () => {
  const base = {
    nomeLoteria: "Mega-Sena",
    codigoLoteria: "megasena",
    ultimoConcurso: 3083,
    maiorPremio: { numero: 3077, data: "2026-10-28", valor: 324_898_791.61 },
  };
  it("título com o maior prêmio", () => {
    expect(limpar(tituloRecordes(base))).toBe("Recordes da Mega-Sena: maior prêmio é de R$ 325 milhões");
  });
  it("descrição com concurso, data e até onde vão os dados", () => {
    expect(limpar(descricaoRecordes(base))).toBe(
      "Maior prêmio por aposta da Mega-Sena: R$ 325 milhões no concurso 3077 (28/10/2026). Os 10 maiores prêmios, a maior sequência sem ganhador e os números mais sorteados, até o concurso 3083."
    );
  });
  it("preposição masculina e sem prêmio", () => {
    const r = { ...base, nomeLoteria: "Super Sete", codigoLoteria: "supersete", maiorPremio: null };
    expect(tituloRecordes(r)).toBe("Recordes do Super Sete");
    expect(descricaoRecordes(r)).toMatch(/^Os 10 maiores prêmios/);
  });
});
