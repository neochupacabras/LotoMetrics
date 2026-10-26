import { describe, expect, it } from "vitest";
import { conferirBolao, lerDetalheJson, paraJson } from "./bolao-conferencia";
import type { ConcursoConferencia, FaixaConcurso } from "./conferencia";

function faixa(f: Partial<FaixaConcurso> & Pick<FaixaConcurso, "faixa" | "descricaoFaixa">): FaixaConcurso {
  return { valorPremio: 0, qtdGanhadores: 0, ...f };
}

// Mesmos fixtures reais usados em conferencia.test.ts (concursos em
// produção em 13/09/2026).
const megaConcurso: ConcursoConferencia = { numero: 3056, dezenas: [14, 21, 25, 40, 51, 56] };
const megaFaixas: FaixaConcurso[] = [
  faixa({ faixa: 1, descricaoFaixa: "6 acertos", valorPremio: 0, qtdGanhadores: 0 }),
  faixa({ faixa: 2, descricaoFaixa: "5 acertos", valorPremio: 45990.43, qtdGanhadores: 50 }),
  faixa({ faixa: 3, descricaoFaixa: "4 acertos", valorPremio: 1133.49, qtdGanhadores: 3344 }),
];

describe("conferirBolao — megasena (concurso 3056, sena acumulada)", () => {
  it("soma os prêmios reais dos jogos premiados e divide por cota (arredonda pra baixo)", () => {
    const jogos = [
      [14, 21, 25, 40, 1, 2], // 4 acertos -> 1133.49
      [14, 21, 25, 40, 51, 3], // 5 acertos -> 45990.43
      [1, 2, 3, 4, 5, 6], // 0 acertos
    ];
    const r = conferirBolao("megasena", jogos, megaConcurso, megaFaixas, 7);
    expect(r.acertos).toEqual([4, 5, 0]);
    expect(r.premiados).toBe(2);
    expect(r.premioTotalCents).toBe(113349 + 4599043);
    expect(r.porCotaCents).toBe(Math.floor((113349 + 4599043) / 7));
    expect(r.indeterminado).toBe(false);
    expect(r.acumulado).toBe(false);
  });

  it("bateu a sena acumulada: sinaliza acumulado e não inventa valor", () => {
    const r = conferirBolao("megasena", [megaConcurso.dezenas], megaConcurso, megaFaixas, 10);
    expect(r.acertos).toEqual([6]);
    expect(r.premiados).toBe(1);
    expect(r.acumulado).toBe(true);
    expect(r.premioTotalCents).toBe(0);
  });

  it("sem nenhum jogo premiado: prêmio zero", () => {
    const r = conferirBolao("megasena", [[1, 2, 3, 4, 5, 6]], megaConcurso, megaFaixas, 10);
    expect(r).toMatchObject({ premiados: 0, premioTotalCents: 0, porCotaCents: 0 });
  });
});

describe("conferirBolao — duplasena", () => {
  // Faixas por sorteio conforme FAIXAS_DUPLASENA_POR_SORTEIO.
  const concurso: ConcursoConferencia = {
    numero: 1,
    dezenas: [1, 2, 3, 4, 5, 6],
    dezenasSegundoSorteio: [10, 11, 12, 13, 14, 15],
  };

  it("usa o melhor dos dois sorteios como acertos do jogo", () => {
    const r = conferirBolao("duplasena", [[10, 11, 12, 1, 20, 21]], concurso, [], 1);
    expect(r.acertos).toEqual([3]);
  });
});

describe("conferirBolao — maismilionaria", () => {
  it("2+ acertos de dezenas sinaliza indeterminado (trevos desconhecidos)", () => {
    const concurso: ConcursoConferencia = { numero: 1, dezenas: [1, 2, 3, 4, 5, 6] };
    const r = conferirBolao("maismilionaria", [[1, 2, 40, 41, 42, 43]], concurso, [], 5);
    expect(r.indeterminado).toBe(true);
    expect(r.premioTotalCents).toBe(0);
    expect(r.premiados).toBe(1);
  });
});

describe("json do resultado", () => {
  it("round-trip e leitura de array simples", () => {
    const r = conferirBolao("megasena", [[14, 21, 25, 40, 1, 2]], megaConcurso, megaFaixas, 1);
    expect(lerDetalheJson(paraJson(r))).toEqual(paraJson(r));
    expect(lerDetalheJson([4, 5]).acertos).toEqual([4, 5]);
    expect(lerDetalheJson(null).acertos).toEqual([]);
  });
});
