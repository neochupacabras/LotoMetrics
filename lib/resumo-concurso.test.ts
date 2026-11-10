import { describe, expect, it } from "vitest";
import { formatarMoedaCompacta, montarResumoConcurso, type EntradaResumo } from "./resumo-concurso";
import type { Concurso } from "./types";

function concursoBase(over: Partial<Concurso> = {}): Concurso {
  return {
    numero: 2930,
    dataSorteio: "2026-11-07", // sábado
    dezenas: [4, 11, 23, 35, 48, 59],
    dezenasOrdemSorteio: [23, 4, 59, 11, 48, 35],
    acumulado: true,
    localSorteio: "Espaço da Sorte",
    municipioUfSorteio: "SÃO PAULO, SP",
    valorArrecadado: 50_000_000,
    valorAcumuladoProximo: 80_000_000,
    valorEstimadoProximo: 85_000_000,
    dataProximoConcurso: "2026-11-11", // quarta-feira
    mesSorte: null,
    trevos: null,
    dezenasSegundoSorteio: null,
    premiacoes: [
      { faixa: 1, descricaoFaixa: "6 acertos", qtdGanhadores: 0, valorPremio: 0 },
      { faixa: 2, descricaoFaixa: "5 acertos", qtdGanhadores: 112, valorPremio: 41230.18 },
    ],
    ...over,
  };
}

function entrada(over: Partial<EntradaResumo> = {}): EntradaResumo {
  return {
    codigoLoteria: "megasena",
    nomeLoteria: "Mega-Sena",
    concurso: concursoBase(),
    contexto: { acumuladosAntes: 3, premiosMaioresHistorico: null, premiosMaioresAno: null },
    pares: 3,
    impares: 3,
    percentualParImpar: 33,
    soma: 180,
    percentualSoma: 40,
    ...over,
  };
}

describe("formatarMoedaCompacta", () => {
  it("usa singular abaixo de 2 e plural acima", () => {
    expect(formatarMoedaCompacta(1_500_000)).toBe("R$ 1,5 milhão");
    expect(formatarMoedaCompacta(85_000_000)).toBe("R$ 85 milhões");
    expect(formatarMoedaCompacta(1_200_000_000)).toBe("R$ 1,2 bilhão");
  });
  it("mostra valor exato abaixo de 1 milhão", () => {
    expect(formatarMoedaCompacta(41230.18)).toMatch(/41\.230,18/);
  });
});

describe("montarResumoConcurso", () => {
  it("concurso acumulado: manchete com estimativa, sequência e próximo sorteio", () => {
    const r = montarResumoConcurso(entrada());
    expect(r.manchete).toBe("Mega-Sena 2930 acumula e prêmio vai a R$ 85 milhões");
    expect(r.paragrafos[0]).toBe(
      "A Mega-Sena 2930, sorteada no sábado (07/11), acumulou: ninguém fez 6 acertos. É a 4ª vez seguida sem ganhador."
    );
    expect(r.paragrafos[1]).toMatch(/^O próximo concurso é na quarta-feira \(11\/11\), com prêmio estimado em R\$\s85\.000\.000,00\.$/);
    expect(r.paragrafos[2]).toMatch(/^Na faixa seguinte, 112 apostas fizeram 5 acertos e levam R\$\s41\.230,18 cada\./);
    expect(r.paragrafos[2]).not.toContain("repetiram");
    expect(r.paragrafos[2]).toContain("não muda as chances do próximo sorteio");
    expect(r.paragrafos[2]).toContain("3 pares e 3 ímpares aparece em 33% do histórico");
  });

  it("concorda singular e usa vírgula decimal nos percentuais", () => {
    const r = montarResumoConcurso(entrada({ pares: 1, impares: 5, percentualParImpar: 8.87, percentualSoma: 10.4 }));
    expect(r.paragrafos[2]).toContain("1 par e 5 ímpares aparece em 8,9% do histórico");
    expect(r.paragrafos[2]).toContain("reúne 10,4% dos concursos");
  });

  it("primeiro acúmulo não menciona sequência", () => {
    const r = montarResumoConcurso(
      entrada({ contexto: { acumuladosAntes: 0, premiosMaioresHistorico: null, premiosMaioresAno: null } })
    );
    expect(r.paragrafos[0]).not.toContain("vez seguida");
  });

  it("um ganhador: manchete com valor, prêmio vinha acumulado e ranking histórico", () => {
    const c = concursoBase({
      acumulado: false,
      premiacoes: [
        { faixa: 1, descricaoFaixa: "6 acertos", qtdGanhadores: 1, valorPremio: 120_400_000 },
        { faixa: 2, descricaoFaixa: "5 acertos", qtdGanhadores: 0, valorPremio: 0 },
      ],
    });
    const r = montarResumoConcurso(
      entrada({ concurso: c, contexto: { acumuladosAntes: 5, premiosMaioresHistorico: 2, premiosMaioresAno: 0 } })
    );
    expect(r.manchete).toBe("Mega-Sena 2930 tem 1 ganhador, que leva R$ 120 milhões");
    expect(r.paragrafos[0]).toContain("1 aposta fez 6 acertos e leva");
    expect(r.paragrafos[0]).toContain("O prêmio vinha acumulado havia 5 concursos.");
    expect(r.paragrafos[0]).toContain("É o 3º maior prêmio por aposta da história da Mega-Sena");
    expect(r.paragrafos[2]).toMatch(/^Ninguém fez 5 acertos\./);
  });

  it("vários ganhadores fora do top 10 mas recorde no ano", () => {
    const c = concursoBase({
      acumulado: false,
      premiacoes: [{ faixa: 1, descricaoFaixa: "15 acertos", qtdGanhadores: 4, valorPremio: 1_200_000 }],
    });
    const r = montarResumoConcurso(
      entrada({
        codigoLoteria: "lotofacil",
        nomeLoteria: "Lotofácil",
        concurso: c,
        contexto: { acumuladosAntes: 0, premiosMaioresHistorico: 40, premiosMaioresAno: 0 },
      })
    );
    expect(r.manchete).toBe("Lotofácil 2930 tem 4 ganhadores, que levam R$ 1,2 milhão cada");
    expect(r.paragrafos[0]).toContain("4 apostas fizeram 15 acertos e levam");
    expect(r.paragrafos[0]).toContain("É o maior prêmio por aposta da Lotofácil no ano até aqui.");
  });

  it("loteria de nome masculino concorda o gênero", () => {
    const r = montarResumoConcurso(entrada({ codigoLoteria: "supersete", nomeLoteria: "Super Sete" }));
    expect(r.paragrafos[0]).toMatch(/^O Super Sete 2930, sorteado no sábado/);
  });

  it("Super Sete não fala de repetidas nem de pares/ímpares", () => {
    const r = montarResumoConcurso(entrada({ codigoLoteria: "supersete", nomeLoteria: "Super Sete" }));
    const texto = r.paragrafos.join(" ");
    expect(texto).not.toContain("repetiram");
    expect(texto).not.toContain("pares");
    expect(texto).toContain("Na faixa seguinte, 112 apostas fizeram 5 acertos");
  });

  it("sem ganhador e sem acúmulo (concurso especial) explica a regra", () => {
    const r = montarResumoConcurso(entrada({ concurso: concursoBase({ acumulado: false }) }));
    expect(r.manchete).toBe("Resultado da Mega-Sena 2930");
    expect(r.paragrafos[0]).toContain("o prêmio principal não acumula");
  });

  it("sem contexto e sem dados do próximo concurso não inventa frases", () => {
    const r = montarResumoConcurso(
      entrada({
        contexto: null,
        percentualParImpar: null,
        concurso: concursoBase({ valorEstimadoProximo: null, dataProximoConcurso: null, premiacoes: [] }),
      })
    );
    expect(r.manchete).toBe("Mega-Sena 2930 acumula");
    expect(r.paragrafos).toEqual(["A Mega-Sena 2930, sorteada no sábado (07/11), acumulou."]);
  });

  it("Dupla Sena separa 1º e 2º sorteio (caso real do concurso 3029)", () => {
    const c = concursoBase({
      numero: 3029,
      dataSorteio: "2026-11-06",
      dataProximoConcurso: "2026-11-09",
      valorEstimadoProximo: 11_600_000,
      premiacoes: [
        { faixa: 1, descricaoFaixa: "6 acertos", qtdGanhadores: 0, valorPremio: 0 },
        { faixa: 2, descricaoFaixa: "5 acertos", qtdGanhadores: 21, valorPremio: 5249.02 },
        { faixa: 5, descricaoFaixa: "6 acertos", qtdGanhadores: 1, valorPremio: 121252.46 },
      ],
    });
    const r = montarResumoConcurso(
      entrada({
        codigoLoteria: "duplasena",
        nomeLoteria: "Dupla Sena",
        concurso: c,
        contexto: { acumuladosAntes: 40, premiosMaioresHistorico: null, premiosMaioresAno: null },
      })
    );
    expect(r.paragrafos[0]).toMatch(
      /^A Dupla Sena 3029, sorteada na sexta-feira \(06\/11\), acumulou: ninguém fez 6 acertos no 1º sorteio\. É a 41ª vez seguida sem ganhador no 1º sorteio\. No 2º sorteio, 1 aposta fez 6 acertos e leva R\$\s121\.252,46\.$/
    );
    expect(r.paragrafos[2]).toMatch(/^Na faixa seguinte do 1º sorteio, 21 apostas fizeram 5 acertos/);
  });

  it("outras loterias não ganham ressalva de sorteio", () => {
    const r = montarResumoConcurso(entrada());
    expect(r.paragrafos.join(" ")).not.toContain("sorteio,");
    expect(r.paragrafos[0]).not.toContain("1º sorteio");
  });
});
