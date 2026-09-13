import { describe, expect, it } from "vitest";
import { pontuarJogo, type ConcursoConferencia, type FaixaConcurso } from "./conferencia";

// Fixtures copiados de premiacao_faixa/concurso reais em produção
// (13/09/2026, projeto "Loterias"), um concurso por loteria — exatamente
// como o plano de implementação pediu ("testes com concursos reais de
// cada uma das 9 loterias"). Isso evita testar contra uma tabela de
// faixas inventada que poderia não bater com o formato real de
// descricao_faixa.

function faixa(f: Partial<FaixaConcurso> & Pick<FaixaConcurso, "faixa" | "descricaoFaixa">): FaixaConcurso {
  return { valorPremio: 0, qtdGanhadores: 0, ...f };
}

describe("pontuarJogo — lotofacil (concurso 3779)", () => {
  const concurso: ConcursoConferencia = {
    numero: 3779,
    dezenas: [3, 4, 5, 7, 8, 10, 11, 13, 14, 16, 17, 19, 23, 24, 25],
  };
  const faixas: FaixaConcurso[] = [
    faixa({ faixa: 1, descricaoFaixa: "15 acertos", valorPremio: 532221.72, qtdGanhadores: 7 }),
    faixa({ faixa: 2, descricaoFaixa: "14 acertos", valorPremio: 889.16, qtdGanhadores: 704 }),
    faixa({ faixa: 3, descricaoFaixa: "13 acertos", valorPremio: 35, qtdGanhadores: 17324 }),
    faixa({ faixa: 4, descricaoFaixa: "12 acertos", valorPremio: 14, qtdGanhadores: 179888 }),
    faixa({ faixa: 5, descricaoFaixa: "11 acertos", valorPremio: 7, qtdGanhadores: 847986 }),
  ];

  it("15 acertos bate a faixa 1, com o prêmio real do concurso", () => {
    const [r] = pontuarJogo("lotofacil", concurso.dezenas, concurso, faixas);
    expect(r.acertos).toBe(15);
    expect(r.faixa?.faixa).toBe(1);
    expect(r.premioReais).toBe(532221.72);
    expect(r.acumulado).toBe(false);
  });

  it("11 acertos bate a faixa mais baixa (5)", () => {
    // 11 das 15 dezenas sorteadas.
    const jogo = concurso.dezenas.slice(0, 11);
    const [r] = pontuarJogo("lotofacil", jogo, concurso, faixas);
    expect(r.acertos).toBe(11);
    expect(r.faixa?.descricaoFaixa).toBe("11 acertos");
    expect(r.premioReais).toBe(7);
  });

  it("menos de 11 acertos não bate faixa nenhuma", () => {
    const jogo = [1, 2, 6, 9, 12, 15, 18, 20, 21, 22]; // nenhuma dezena sorteada
    const [r] = pontuarJogo("lotofacil", jogo, concurso, faixas);
    expect(r.acertos).toBe(0);
    expect(r.faixa).toBeNull();
    expect(r.premioReais).toBeNull();
  });
});

describe("pontuarJogo — megasena (concurso 3056, sena acumulada)", () => {
  const concurso: ConcursoConferencia = { numero: 3056, dezenas: [14, 21, 25, 40, 51, 56] };
  const faixas: FaixaConcurso[] = [
    faixa({ faixa: 1, descricaoFaixa: "6 acertos", valorPremio: 0, qtdGanhadores: 0 }),
    faixa({ faixa: 2, descricaoFaixa: "5 acertos", valorPremio: 45990.43, qtdGanhadores: 50 }),
    faixa({ faixa: 3, descricaoFaixa: "4 acertos", valorPremio: 1133.49, qtdGanhadores: 3344 }),
  ];

  it("6 acertos bate a faixa 1, mas o prêmio real é 0 (acumulou) — não crava um valor", () => {
    const [r] = pontuarJogo("megasena", concurso.dezenas, concurso, faixas);
    expect(r.acertos).toBe(6);
    expect(r.faixa?.faixa).toBe(1);
    expect(r.acumulado).toBe(true);
    expect(r.premioReais).toBeNull();
  });

  it("4 acertos bate a faixa 3 com prêmio normal", () => {
    const jogo = [14, 21, 25, 40, 99, 98]; // 4 das 6 dezenas
    const [r] = pontuarJogo("megasena", jogo, concurso, faixas);
    expect(r.acertos).toBe(4);
    expect(r.premioReais).toBe(1133.49);
    expect(r.acumulado).toBe(false);
  });
});

describe("pontuarJogo — quina (concurso 7115)", () => {
  const concurso: ConcursoConferencia = { numero: 7115, dezenas: [12, 43, 61, 67, 74] };
  const faixas: FaixaConcurso[] = [
    faixa({ faixa: 1, descricaoFaixa: "5 acertos", valorPremio: 0, qtdGanhadores: 0 }),
    faixa({ faixa: 2, descricaoFaixa: "4 acertos", valorPremio: 12404.31, qtdGanhadores: 63 }),
    faixa({ faixa: 3, descricaoFaixa: "3 acertos", valorPremio: 143.54, qtdGanhadores: 5185 }),
    faixa({ faixa: 4, descricaoFaixa: "2 acertos", valorPremio: 5.45, qtdGanhadores: 136461 }),
  ];

  it("2 acertos já bate faixa na Quina (faixa mais generosa das 9 loterias)", () => {
    const jogo = [12, 43, 1, 2, 3];
    const [r] = pontuarJogo("quina", jogo, concurso, faixas);
    expect(r.acertos).toBe(2);
    expect(r.premioReais).toBe(5.45);
  });
});

describe("pontuarJogo — lotomania (concurso 2974, achado do audit: 0 acertos também premia)", () => {
  const concurso: ConcursoConferencia = {
    numero: 2974,
    dezenas: [3, 7, 10, 13, 20, 23, 26, 29, 31, 37, 42, 46, 47, 58, 59, 61, 73, 79, 92, 95],
  };
  const faixas: FaixaConcurso[] = [
    faixa({ faixa: 1, descricaoFaixa: "20 acertos", valorPremio: 0, qtdGanhadores: 0 }),
    faixa({ faixa: 2, descricaoFaixa: "19 acertos", valorPremio: 63120.17, qtdGanhadores: 3 }),
    faixa({ faixa: 3, descricaoFaixa: "18 acertos", valorPremio: 2076.32, qtdGanhadores: 57 }),
    faixa({ faixa: 4, descricaoFaixa: "17 acertos", valorPremio: 249.68, qtdGanhadores: 474 }),
    faixa({ faixa: 5, descricaoFaixa: "16 acertos", valorPremio: 43.96, qtdGanhadores: 2692 }),
    faixa({ faixa: 6, descricaoFaixa: "15 acertos", valorPremio: 10.08, qtdGanhadores: 11735 }),
    faixa({ faixa: 7, descricaoFaixa: "0 acertos", valorPremio: 0, qtdGanhadores: 0 }),
  ];

  it("19 acertos bate a faixa 2 com prêmio normal", () => {
    const jogo = concurso.dezenas.slice(0, 19); // tira 1 das 20
    const [r] = pontuarJogo("lotomania", jogo, concurso, faixas);
    expect(r.acertos).toBe(19);
    expect(r.faixa?.descricaoFaixa).toBe("19 acertos");
    expect(r.premioReais).toBe(63120.17);
  });

  it("0 acertos bate a faixa 7 — o cron antigo (MIN_ACERTOS=15) nunca detectava isso", () => {
    // Nenhuma das 20 dezenas sorteadas: qualquer número de 0-99 fora da lista.
    const sorteadas = new Set(concurso.dezenas);
    const jogo = Array.from({ length: 20 }, (_, i) => i).filter((n) => !sorteadas.has(n));
    const [r] = pontuarJogo("lotomania", jogo, concurso, faixas);
    expect(r.acertos).toBe(0);
    expect(r.faixa?.descricaoFaixa).toBe("0 acertos");
    // Nesse concurso real, a faixa de 0 acertos também acumulou (0
    // ganhadores) — o teste confirma que a faixa é ENCONTRADA (o bug do
    // cron antigo), não que ela paga um valor específico.
    expect(r.acumulado).toBe(true);
  });
});

describe("pontuarJogo — duplasena (concurso 3007, dois sorteios independentes)", () => {
  const concurso: ConcursoConferencia = {
    numero: 3007,
    dezenas: [10, 24, 26, 31, 32, 48],
    dezenasSegundoSorteio: [9, 23, 32, 33, 39, 48],
  };
  const faixas: FaixaConcurso[] = [
    faixa({ faixa: 1, descricaoFaixa: "6 acertos", valorPremio: 0, qtdGanhadores: 0 }), // 1º sorteio
    faixa({ faixa: 2, descricaoFaixa: "5 acertos", valorPremio: 7366.49, qtdGanhadores: 9 }),
    faixa({ faixa: 3, descricaoFaixa: "4 acertos", valorPremio: 127.34, qtdGanhadores: 595 }),
    faixa({ faixa: 4, descricaoFaixa: "3 acertos", valorPremio: 3.43, qtdGanhadores: 11016 }),
    faixa({ faixa: 5, descricaoFaixa: "6 acertos", valorPremio: 0, qtdGanhadores: 0 }), // 2º sorteio
    faixa({ faixa: 6, descricaoFaixa: "5 acertos", valorPremio: 4262.04, qtdGanhadores: 14 }),
    faixa({ faixa: 7, descricaoFaixa: "4 acertos", valorPremio: 106.11, qtdGanhadores: 714 }),
    faixa({ faixa: 8, descricaoFaixa: "3 acertos", valorPremio: 3.12, qtdGanhadores: 12129 }),
  ];

  it("um jogo gera DOIS resultados independentes, um por sorteio", () => {
    const resultados = pontuarJogo("duplasena", concurso.dezenas, concurso, faixas);
    expect(resultados).toHaveLength(2);
  });

  it("acerta o 1º sorteio (6 acertos, faixa 1, acumulada) e erra o 2º (2 acertos, sem faixa)", () => {
    const [r1, r2] = pontuarJogo("duplasena", concurso.dezenas, concurso, faixas);
    expect(r1.sorteio).toBe(1);
    expect(r1.acertos).toBe(6);
    expect(r1.faixa?.faixa).toBe(1); // não a faixa 5, que tem a MESMA descrição do 2º sorteio
    expect(r1.acumulado).toBe(true);

    expect(r2.sorteio).toBe(2);
    expect(r2.acertos).toBe(2); // só {32, 48} em comum com o 2º sorteio
    expect(r2.faixa).toBeNull();
  });

  it("acerta o 2º sorteio com prêmio normal (faixa 6, não a 2, mesma descrição)", () => {
    const jogo = [9, 23, 32, 33, 39, 1]; // 5 das 6 do 2º sorteio + 1 dezena sem relação
    const [r1, r2] = pontuarJogo("duplasena", jogo, concurso, faixas);
    expect(r1.faixa).toBeNull(); // só {32} em comum com o 1º sorteio
    expect(r2.acertos).toBe(5);
    expect(r2.faixa?.faixa).toBe(6);
    expect(r2.premioReais).toBe(4262.04);
    expect(r2.acumulado).toBe(false);
  });
});

describe("pontuarJogo — supersete (concurso 897, acerto por coluna)", () => {
  // Cada posição é uma coluna independente (dígito 0-9), não um conjunto.
  const concurso: ConcursoConferencia = { numero: 897, dezenas: [1, 1, 4, 6, 8, 7, 6] };
  const faixas: FaixaConcurso[] = [
    faixa({ faixa: 1, descricaoFaixa: "7 acertos", valorPremio: 0, qtdGanhadores: 0 }),
    faixa({ faixa: 2, descricaoFaixa: "6 acertos", valorPremio: 30144.57, qtdGanhadores: 2 }),
    faixa({ faixa: 3, descricaoFaixa: "5 acertos", valorPremio: 828.14, qtdGanhadores: 104 }),
    faixa({ faixa: 4, descricaoFaixa: "4 acertos", valorPremio: 62.59, qtdGanhadores: 1376 }),
    faixa({ faixa: 5, descricaoFaixa: "3 acertos", valorPremio: 6, qtdGanhadores: 12177 }),
  ];

  it("acerta 5 das 7 colunas — não seria isso pela interseção de conjunto (que daria mais)", () => {
    const jogo = [1, 1, 4, 6, 8, 0, 9]; // colunas 0-4 certas, 5 e 6 erradas
    const [r] = pontuarJogo("supersete", jogo, concurso, faixas);
    expect(r.acertos).toBe(5);
    expect(r.faixa?.faixa).toBe(3);
    expect(r.premioReais).toBe(828.14);
  });

  it("interseção de conjunto daria 7 (todos os dígitos aparecem no sorteio) — coluna dá só 5", () => {
    // Confirma que contarColunasAcertadas está mesmo sendo usada, e não
    // fn_conferir_jogo (interseção), que contaria errado pra Super Sete.
    const jogo = [1, 1, 4, 6, 8, 0, 9];
    const [r] = pontuarJogo("supersete", jogo, concurso, faixas);
    expect(r.acertos).not.toBe(7);
  });
});

describe("pontuarJogo — maismilionaria (concurso 388, trevos não são verificáveis)", () => {
  const concurso: ConcursoConferencia = { numero: 388, dezenas: [11, 17, 21, 23, 34, 41] };
  // Faixas reais têm descrições como "6 acertos + 2 trevos" — o regex de
  // acerto puro NUNCA deve confundir isso com "6 acertos" sem trevo.
  const faixas: FaixaConcurso[] = [
    faixa({ faixa: 1, descricaoFaixa: "6 acertos + 2 trevos", valorPremio: 0, qtdGanhadores: 0 }),
    faixa({ faixa: 4, descricaoFaixa: "5 acertos + 1 ou nenhum trevo", valorPremio: 26963.4, qtdGanhadores: 16 }),
    faixa({ faixa: 10, descricaoFaixa: "2 acertos + 1 trevo", valorPremio: 6, qtdGanhadores: 99599 }),
  ];

  it("nunca crava uma faixa específica, mesmo acertando todas as dezenas", () => {
    const [r] = pontuarJogo("maismilionaria", concurso.dezenas, concurso, faixas);
    expect(r.acertos).toBe(6);
    expect(r.faixa).toBeNull();
    expect(r.premioReais).toBeNull();
    expect(r.faixaIndeterminada).toBe(true);
  });

  it("com 2 acertos de dezenas já sinaliza indeterminado (a faixa mais baixa exige só 2 + 1 trevo)", () => {
    const jogo = [11, 17, 1, 2, 3, 4];
    const [r] = pontuarJogo("maismilionaria", jogo, concurso, faixas);
    expect(r.acertos).toBe(2);
    expect(r.faixaIndeterminada).toBe(true);
  });

  it("com 1 acerto de dezenas não sinaliza nada (nenhuma faixa existe abaixo de 2)", () => {
    const jogo = [11, 1, 2, 3, 4, 5];
    const [r] = pontuarJogo("maismilionaria", jogo, concurso, faixas);
    expect(r.acertos).toBe(1);
    expect(r.faixaIndeterminada).toBeFalsy();
  });
});

describe("pontuarJogo — diadesorte (concurso 1295, 'Mês da Sorte' não é verificável)", () => {
  const concurso: ConcursoConferencia = { numero: 1295, dezenas: [10, 12, 14, 15, 24, 27, 31] };
  const faixas: FaixaConcurso[] = [
    faixa({ faixa: 1, descricaoFaixa: "7 acertos", valorPremio: 0, qtdGanhadores: 0 }),
    faixa({ faixa: 2, descricaoFaixa: "6 acertos", valorPremio: 2624.77, qtdGanhadores: 35 }),
    faixa({ faixa: 3, descricaoFaixa: "5 acertos", valorPremio: 25, qtdGanhadores: 1400 }),
    faixa({ faixa: 4, descricaoFaixa: "4 acertos", valorPremio: 5, qtdGanhadores: 17987 }),
    faixa({ faixa: 5, descricaoFaixa: "Mês da Sorte", valorPremio: 2.5, qtdGanhadores: 66645 }),
  ];

  it("7 acertos bate a faixa 1 (acumulada)", () => {
    const [r] = pontuarJogo("diadesorte", concurso.dezenas, concurso, faixas);
    expect(r.acertos).toBe(7);
    expect(r.faixa?.faixa).toBe(1);
    expect(r.acumulado).toBe(true);
  });

  it("6 acertos bate a faixa 2 com prêmio normal, e nunca a faixa 'Mês da Sorte'", () => {
    const jogo = [10, 12, 14, 15, 24, 27, 1];
    const [r] = pontuarJogo("diadesorte", jogo, concurso, faixas);
    expect(r.acertos).toBe(6);
    expect(r.faixa?.descricaoFaixa).toBe("6 acertos");
    expect(r.premioReais).toBe(2624.77);
  });
});

describe("pontuarJogo — timemania (concurso 2440, 'Time do Coração' não é verificável)", () => {
  const concurso: ConcursoConferencia = { numero: 2440, dezenas: [20, 45, 51, 65, 68, 77, 80] };
  const faixas: FaixaConcurso[] = [
    faixa({ faixa: 1, descricaoFaixa: "7 acertos", valorPremio: 0, qtdGanhadores: 0 }),
    faixa({ faixa: 2, descricaoFaixa: "6 acertos", valorPremio: 77322.96, qtdGanhadores: 2 }),
    faixa({ faixa: 3, descricaoFaixa: "5 acertos", valorPremio: 1578.01, qtdGanhadores: 140 }),
    faixa({ faixa: 4, descricaoFaixa: "4 acertos", valorPremio: 10.5, qtdGanhadores: 2358 }),
    faixa({ faixa: 5, descricaoFaixa: "3 acertos", valorPremio: 3.5, qtdGanhadores: 23443 }),
    faixa({ faixa: 6, descricaoFaixa: "Time do Coração", valorPremio: 8.5, qtdGanhadores: 4801 }),
  ];

  it("6 acertos bate a faixa 2 com prêmio normal, nunca a faixa 'Time do Coração'", () => {
    const jogo = [20, 45, 51, 65, 68, 77, 1];
    const [r] = pontuarJogo("timemania", jogo, concurso, faixas);
    expect(r.acertos).toBe(6);
    expect(r.faixa?.descricaoFaixa).toBe("6 acertos");
    expect(r.premioReais).toBe(77322.96);
  });
});
