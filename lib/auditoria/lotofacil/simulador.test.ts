// Auditoria Lotofácil — simulador histórico (LF-04, LF-05), Etapa 2.
import { describe, expect, it } from "vitest";
import { ERAS_PRECO, precoApostaNoConcurso, precoAtual } from "@/lib/precos-loteria";
import { pontuarDraw } from "@/lib/simulador-pontuacao";
import type { ConcessaoSimulacao } from "@/lib/queries";

describe("LF-04 — preço da aposta por época", () => {
  const eras = ERAS_PRECO.lotofacil!;

  it("eras em ordem, preços crescentes e a última = preço atual (R$ 3,50)", () => {
    for (let i = 1; i < eras.length; i++) {
      expect(eras[i].aPartirDoConcurso).toBeGreaterThan(eras[i - 1].aPartirDoConcurso);
      expect(eras[i].preco).toBeGreaterThan(eras[i - 1].preco);
    }
    expect(eras[eras.length - 1].preco).toBe(precoAtual("lotofacil"));
  });

  it("concursos de fronteira usam o preço da nova era", () => {
    expect(precoApostaNoConcurso("lotofacil", 1)).toBe(1);
    expect(precoApostaNoConcurso("lotofacil", 1212)).toBe(1.5);
    expect(precoApostaNoConcurso("lotofacil", 1213)).toBe(2);
    expect(precoApostaNoConcurso("lotofacil", 1888)).toBe(2);
    expect(precoApostaNoConcurso("lotofacil", 1889)).toBe(2.5);
    expect(precoApostaNoConcurso("lotofacil", 2800)).toBe(2.5);
    expect(precoApostaNoConcurso("lotofacil", 2801)).toBe(3);
    expect(precoApostaNoConcurso("lotofacil", 3438)).toBe(3);
    expect(precoApostaNoConcurso("lotofacil", 3439)).toBe(3.5);
  });

  it("custo de jogar os concursos 1 a 3826 = R$ 8.344 (e não 3.826 × 3,50 = R$ 13.391)", () => {
    let total = 0;
    for (let n = 1; n <= 3826; n++) total += precoApostaNoConcurso("lotofacil", n);
    expect(total).toBeCloseTo(8344, 6);
  });

  it("loterias sem tabela continuam com o preço atual em todo concurso", () => {
    expect(precoApostaNoConcurso("megasena", 1)).toBe(precoAtual("megasena"));
  });
});

describe("LF-05 — acerto em faixa acumulada não some", () => {
  const sorteio = [1, 2, 3, 5, 8, 9, 12, 13, 15, 18, 19, 21, 22, 24, 25];
  const mapaFaixas = { 15: 1, 14: 2, 13: 3, 12: 4, 11: 5 };
  const draw = (premios: Record<number, number>): ConcessaoSimulacao => ({
    numero: 3826, dataSorteio: "2026-11-10", dezenas: sorteio,
    dezenasSegundoSorteio: null, trevos: null, premios,
  });

  it("15 acertos num concurso acumulado vira acerto 'acumulado', com prêmio 0", () => {
    const r = pontuarDraw(draw({ 1: 0, 2: 1033.24, 3: 35, 4: 14, 5: 7 }), sorteio, { tipo: "padrao", mapaFaixas });
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({ faixa: 1, premio: 0, acumulado: true, acertosExibicao: 15 });
  });

  it("15 acertos num concurso com ganhador paga o valor da faixa", () => {
    const r = pontuarDraw(draw({ 1: 408185.03, 2: 1033.24, 3: 35, 4: 14, 5: 7 }), sorteio, { tipo: "padrao", mapaFaixas });
    expect(r).toEqual([{ faixa: 1, premio: 408185.03, acertosExibicao: 15, descricao: "15 acertos" }]);
  });

  it("10 acertos não pontua", () => {
    const jogo = [...sorteio.slice(0, 10), 4, 6, 7, 10, 11];
    expect(pontuarDraw(draw({ 1: 0, 2: 1, 3: 35, 4: 14, 5: 7 }), jogo, { tipo: "padrao", mapaFaixas })).toEqual([]);
  });
});
