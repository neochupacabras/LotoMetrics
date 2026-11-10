import { describe, expect, it } from "vitest";
import { chaveTelegram, montarMensagemTelegram } from "./telegram-mensagem";
import type { Concurso } from "./types";

const base = (over: Partial<Concurso> = {}): Concurso => ({
  numero: 3080,
  dataSorteio: "2026-11-07",
  dezenas: [5, 12, 23, 34, 41, 60],
  dezenasOrdemSorteio: [41, 5, 60, 12, 34, 23],
  acumulado: true,
  localSorteio: null,
  municipioUfSorteio: null,
  valorArrecadado: null,
  valorAcumuladoProximo: null,
  valorEstimadoProximo: 85_000_000,
  dataProximoConcurso: "2026-11-11",
  mesSorte: null,
  trevos: null,
  dezenasSegundoSorteio: null,
  premiacoes: [{ faixa: 1, descricaoFaixa: "6 acertos", qtdGanhadores: 0, valorPremio: 0 }],
  ...over,
});

const SITE = "https://lotoanalitica.com.br";

describe("montarMensagemTelegram", () => {
  it("manchete do resumo, data, dezenas e link com UTM", () => {
    const m = montarMensagemTelegram({ codigoLoteria: "megasena", nomeLoteria: "Mega-Sena", concurso: base(), siteUrl: SITE });
    const linhas = m.split("\n");
    expect(linhas[0]).toBe("<b>Mega-Sena 3080 acumula e prêmio vai a R$ 85 milhões</b>");
    expect(linhas[1]).toBe("<i>Sorteio de sábado, 07/11</i>");
    expect(m).toContain("<b>05 · 12 · 23 · 34 · 41 · 60</b>");
    expect(m).toContain(`<a href="${SITE}/megasena/resultados/3080?utm_source=telegram&utm_medium=canal">`);
  });

  it("Dupla Sena: os dois sorteios", () => {
    const m = montarMensagemTelegram({
      codigoLoteria: "duplasena",
      nomeLoteria: "Dupla Sena",
      concurso: base({ dezenasSegundoSorteio: [1, 2, 3, 4, 5, 6] }),
      siteUrl: SITE,
    });
    expect(m).toContain("1º sorteio: <b>05 · 12");
    expect(m).toContain("2º sorteio: <b>01 · 02 · 03 · 04 · 05 · 06</b>");
  });

  it("+Milionária com trevos e Timemania com o time escapado", () => {
    expect(
      montarMensagemTelegram({ codigoLoteria: "maismilionaria", nomeLoteria: "+Milionária", concurso: base({ trevos: [1, 4] }), siteUrl: SITE })
    ).toContain("Trevos: <b>1 · 4</b>");
    expect(
      montarMensagemTelegram({ codigoLoteria: "timemania", nomeLoteria: "Timemania", concurso: base({ mesSorte: "A&B <FC>" }), siteUrl: SITE })
    ).toContain("Time do Coração: <b>A&amp;B &lt;FC&gt;</b>");
  });

  it("Super Sete: algarismos sem zero à esquerda", () => {
    expect(
      montarMensagemTelegram({ codigoLoteria: "supersete", nomeLoteria: "Super Sete", concurso: base({ dezenas: [1, 0, 9, 3, 3, 7, 2] }), siteUrl: SITE })
    ).toContain("<b>1 · 0 · 9 · 3 · 3 · 7 · 2</b>");
  });

  it("com ganhador: manchete diz quanto levou", () => {
    const m = montarMensagemTelegram({
      codigoLoteria: "megasena",
      nomeLoteria: "Mega-Sena",
      concurso: base({ acumulado: false, premiacoes: [{ faixa: 1, descricaoFaixa: "6 acertos", qtdGanhadores: 1, valorPremio: 42_000_000 }] }),
      siteUrl: SITE,
    });
    expect(m.split("\n")[0]).toBe("<b>Mega-Sena 3080 tem 1 ganhador, que leva R$ 42 milhões</b>");
  });
});

describe("chaveTelegram", () => {
  it("loteria:numero", () => expect(chaveTelegram("quina", 6500)).toBe("quina:6500"));
});
