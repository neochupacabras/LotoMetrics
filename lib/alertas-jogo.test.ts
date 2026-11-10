import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  conferirJogoAlerta,
  normalizarEmail,
  tamanhoJogo,
  textoAviso,
  validarJogoAlerta,
  type ConcursoAlerta,
} from "./alertas-jogo";
import type { FaixaConcurso } from "./conferencia";
import { urlAcaoAlerta, validarTokenAlerta } from "./alertas-jogo-tokens";

const limpar = (s: string) => s.replace(/ /g, " ");

const MEGA = { codigo: "megasena", dezenaMin: 1, dezenaMax: 60, qtdDezenasSorteadas: 6 };
const MILIONARIA = { codigo: "maismilionaria", dezenaMin: 1, dezenaMax: 50, qtdDezenasSorteadas: 6 };
const LOTOMANIA = { codigo: "lotomania", dezenaMin: 0, dezenaMax: 99, qtdDezenasSorteadas: 20 };
const SUPER7 = { codigo: "supersete", dezenaMin: 0, dezenaMax: 9, qtdDezenasSorteadas: 7 };

const faixasMega: FaixaConcurso[] = [
  { faixa: 1, descricaoFaixa: "6 acertos", valorPremio: 0, qtdGanhadores: 0 },
  { faixa: 2, descricaoFaixa: "5 acertos", valorPremio: 50_000, qtdGanhadores: 40 },
  { faixa: 3, descricaoFaixa: "4 acertos", valorPremio: 1_000, qtdGanhadores: 3000 },
];
const concursoMega: ConcursoAlerta = { numero: 2950, dezenas: [5, 12, 23, 34, 41, 60], dezenasSegundoSorteio: null, trevos: null };

describe("normalizarEmail", () => {
  it("normaliza e valida", () => {
    expect(normalizarEmail("  Fulana@Exemplo.COM ")).toBe("fulana@exemplo.com");
    expect(normalizarEmail("sem-arroba")).toBeNull();
    expect(normalizarEmail(42)).toBeNull();
    expect(normalizarEmail(`${"a".repeat(195)}@b.com`)).toBeNull();
  });
});

describe("validarJogoAlerta", () => {
  it("ordena as dezenas", () => {
    expect(validarJogoAlerta(MEGA, [60, 5, 12, 23, 34, 41], undefined)).toEqual({ dezenas: [5, 12, 23, 34, 41, 60], trevos: null });
  });
  it("recusa tamanho errado, repetido, fora da faixa e não inteiro", () => {
    expect(validarJogoAlerta(MEGA, [1, 2, 3], undefined)).toHaveProperty("erro");
    expect(validarJogoAlerta(MEGA, [1, 1, 2, 3, 4, 5], undefined)).toHaveProperty("erro");
    expect(validarJogoAlerta(MEGA, [0, 1, 2, 3, 4, 5], undefined)).toHaveProperty("erro");
    expect(validarJogoAlerta(MEGA, [1.5, 2, 3, 4, 5, 6], undefined)).toHaveProperty("erro");
    expect(validarJogoAlerta(MEGA, "1 2 3", undefined)).toHaveProperty("erro");
    expect(validarJogoAlerta({ ...MEGA, codigo: "xyz" }, [1, 2, 3, 4, 5, 6], undefined)).toHaveProperty("erro");
  });
  it("Lotomania exige 50 números", () => {
    expect(tamanhoJogo("lotomania", 20)).toBe(50);
    const cinquenta = Array.from({ length: 50 }, (_, i) => i * 2);
    expect(validarJogoAlerta(LOTOMANIA, cinquenta, undefined)).toHaveProperty("dezenas");
    expect(validarJogoAlerta(LOTOMANIA, cinquenta.slice(0, 20), undefined)).toHaveProperty("erro");
  });
  it("Super Sete: 7 algarismos na ordem, podem repetir", () => {
    expect(validarJogoAlerta(SUPER7, [1, 0, 9, 3, 3, 7, 2], undefined)).toEqual({ dezenas: [1, 0, 9, 3, 3, 7, 2], trevos: null });
    expect(validarJogoAlerta(SUPER7, [1, 0, 10, 3, 3, 7, 2], undefined)).toHaveProperty("erro");
  });
  it("+Milionária exige 2 trevos diferentes de 1 a 6", () => {
    expect(validarJogoAlerta(MILIONARIA, [1, 2, 3, 4, 5, 6], [4, 1])).toEqual({ dezenas: [1, 2, 3, 4, 5, 6], trevos: [1, 4] });
    expect(validarJogoAlerta(MILIONARIA, [1, 2, 3, 4, 5, 6], [1])).toHaveProperty("erro");
    expect(validarJogoAlerta(MILIONARIA, [1, 2, 3, 4, 5, 6], [2, 2])).toHaveProperty("erro");
    expect(validarJogoAlerta(MILIONARIA, [1, 2, 3, 4, 5, 6], [1, 7])).toHaveProperty("erro");
  });
});

describe("conferirJogoAlerta + textoAviso", () => {
  it("premiado: valor e descrição", () => {
    const conf = conferirJogoAlerta("megasena", { dezenas: [5, 12, 23, 34, 1, 2], trevos: null }, concursoMega, faixasMega);
    expect(conf.premiado).toBe(true);
    expect(conf.valorTotal).toBe(1000);
    const t = textoAviso("Mega-Sena", "megasena", 2950, conf);
    expect(limpar(t.titulo)).toBe("Seu jogo foi premiado na Mega-Sena 2950 (R$ 1.000,00)");
    expect(limpar(t.corpo)).toBe("4 acertos: prêmio de R$ 1.000,00");
  });

  it("não premiado: diz os acertos", () => {
    const conf = conferirJogoAlerta("megasena", { dezenas: [5, 12, 1, 2, 3, 4], trevos: null }, concursoMega, faixasMega);
    expect(conf.premiado).toBe(false);
    const t = textoAviso("Mega-Sena", "megasena", 2950, conf);
    expect(t.titulo).toBe("Seu jogo na Mega-Sena 2950");
    expect(t.corpo).toBe("2 acertos. Não foi dessa vez.");
  });

  it("faixa acumulada: premiado sem valor, sem inventar prêmio", () => {
    const conf = conferirJogoAlerta("megasena", { dezenas: [5, 12, 23, 34, 41, 60], trevos: null }, concursoMega, faixasMega);
    expect(conf.premiado).toBe(true);
    expect(conf.valorTotal).toBe(0);
    const t = textoAviso("Mega-Sena", "megasena", 2950, conf);
    expect(t.titulo).toBe("Seu jogo foi premiado na Mega-Sena 2950");
    expect(t.corpo).toContain("ninguém ganhou nela neste concurso");
  });

  it("+Milionária usa os trevos para achar a faixa", () => {
    const faixas: FaixaConcurso[] = [
      { faixa: 9, descricaoFaixa: "2 acertos + 2 trevos", valorPremio: 12, qtdGanhadores: 900 },
      { faixa: 10, descricaoFaixa: "2 acertos + 1 trevo", valorPremio: 6, qtdGanhadores: 9000 },
    ];
    const concurso: ConcursoAlerta = { numero: 300, dezenas: [1, 2, 10, 11, 12, 13], dezenasSegundoSorteio: null, trevos: [1, 5] };
    const conf = conferirJogoAlerta("maismilionaria", { dezenas: [1, 2, 3, 4, 5, 6], trevos: [1, 4] }, concurso, faixas);
    expect(conf.linhas[0]).toMatchObject({ acertos: 2, trevos: 1, premio: 6 });
    expect(limpar(textoAviso("+Milionária", "maismilionaria", 300, conf).corpo)).toBe("2 acertos e 1 trevo: prêmio de R$ 6,00");
  });

  it("Dupla Sena: uma linha por sorteio", () => {
    const faixas: FaixaConcurso[] = [
      { faixa: 4, descricaoFaixa: "3 acertos", valorPremio: 3, qtdGanhadores: 100 },
      { faixa: 8, descricaoFaixa: "3 acertos", valorPremio: 2, qtdGanhadores: 100 },
    ];
    const concurso: ConcursoAlerta = { numero: 2800, dezenas: [1, 2, 3, 40, 41, 42], dezenasSegundoSorteio: [1, 2, 3, 30, 31, 32], trevos: null };
    const conf = conferirJogoAlerta("duplasena", { dezenas: [1, 2, 3, 4, 5, 6], trevos: null }, concurso, faixas);
    expect(conf.valorTotal).toBe(5);
    const t = textoAviso("Dupla Sena", "duplasena", 2800, conf);
    expect(t.detalhes).toHaveLength(2);
    expect(t.detalhes[1]).toContain("no 2º sorteio");
  });

  it("Super Sete: colunas certas e preposição 'no'", () => {
    const concurso: ConcursoAlerta = { numero: 800, dezenas: [1, 0, 9, 3, 3, 7, 2], dezenasSegundoSorteio: null, trevos: null };
    const conf = conferirJogoAlerta("supersete", { dezenas: [1, 0, 0, 0, 0, 0, 0], trevos: null }, concurso, []);
    const t = textoAviso("Super Sete", "supersete", 800, conf);
    expect(t.titulo).toBe("Seu jogo no Super Sete 800");
    expect(t.corpo).toContain("2 colunas certas");
  });
});

describe("tokens de confirmar/descadastrar", () => {
  beforeEach(() => vi.stubEnv("NOTIFICACOES_UNSUB_SECRET", "segredo-de-teste"));
  afterEach(() => vi.unstubAllEnvs());

  const id = "3f2b6c1e-8a4d-4c7e-9b1a-2d3e4f5a6b7c";
  const token = (url: string) => new URL(url).searchParams.get("t");

  it("token vale só para a ação e o id dele", () => {
    const confirmar = token(urlAcaoAlerta("confirmar", id, "https://x.test"));
    const descadastrar = token(urlAcaoAlerta("descadastrar", id, "https://x.test"));
    expect(validarTokenAlerta("confirmar", id, confirmar)).toBe(true);
    expect(validarTokenAlerta("descadastrar", id, descadastrar)).toBe(true);
    expect(validarTokenAlerta("descadastrar", id, confirmar)).toBe(false);
    expect(validarTokenAlerta("confirmar", "3f2b6c1e-8a4d-4c7e-9b1a-2d3e4f5a6b7d", confirmar)).toBe(false);
  });

  it("recusa id que não é uuid e token vazio", () => {
    expect(validarTokenAlerta("confirmar", "1 OR 1=1", "abc")).toBe(false);
    expect(validarTokenAlerta("confirmar", id, null)).toBe(false);
  });
});
