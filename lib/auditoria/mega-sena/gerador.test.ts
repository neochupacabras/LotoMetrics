// Auditoria Mega-Sena — gerador de jogos (lib/gerar-jogo.ts) e Data da sorte.
import { describe, expect, it } from "vitest";
import { gerarJogo, gerarJogoDaData, amostrarSubconjunto } from "@/lib/gerar-jogo";
import { ehPrimo, ehFibonacci } from "@/lib/classificacao";
import * as R from "./referencia";

const BASE = { dezenaMin: 1, dezenaMax: 60 };

describe("gerarJogo — validade", () => {
  it("todo jogo tem o tamanho pedido, dezenas distintas, ordenadas e em 1..60 (6 a 20)", () => {
    for (let b = 6; b <= 20; b++) {
      for (let t = 0; t < 1000; t++) {
        const r = gerarJogo({ ...BASE, qtdDezenas: b });
        expect(R.jogoValido(r.dezenas, b)).toBe(true);
        expect(r.dezenas).toEqual([...r.dezenas].sort((a, c) => a - c));
        expect(r.soma).toBe(r.dezenas.reduce((a, c) => a + c, 0));
        expect(r.pares + r.impares).toBe(b);
      }
    }
  });

  it("respeita obrigatórias e excluídas", () => {
    for (let t = 0; t < 2000; t++) {
      const embaralhado = [...R.UNIVERSO].sort(() => Math.random() - 0.5);
      const obrig = embaralhado.slice(0, 3);
      const excl = embaralhado.slice(3, 13);
      const r = gerarJogo({ ...BASE, qtdDezenas: 6, dezenasObrigatorias: obrig, dezenasExcluidas: excl });
      expect(obrig.every((d) => r.dezenas.includes(d))).toBe(true);
      expect(excl.some((d) => r.dezenas.includes(d))).toBe(false);
    }
  });

  it("quando diz que atendeu os filtros, atende mesmo (soma 170–209, 3 pares, 1–2 primos, 0–1 Fibonacci)", () => {
    let atendeu = 0;
    for (let t = 0; t < 3000; t++) {
      const r = gerarJogo({
        ...BASE,
        qtdDezenas: 6,
        somaFaixa: { min: 170, max: 209 },
        parImparAlvo: { pares: 3, impares: 3 },
        primosAlvo: [1, 2],
        fibonacciAlvo: [0, 1],
      });
      if (!r.atendeuTodosFiltros) continue;
      atendeu++;
      expect(r.soma).toBeGreaterThanOrEqual(170);
      expect(r.soma).toBeLessThanOrEqual(209);
      expect(r.pares).toBe(3);
      expect([1, 2]).toContain(r.dezenas.filter(ehPrimo).length);
      expect([0, 1]).toContain(r.dezenas.filter(ehFibonacci).length);
    }
    expect(atendeu).toBeGreaterThan(2900);
  });

  it("filtros impossíveis: devolve atendeuTodosFiltros = false e diz qual falhou", () => {
    const r = gerarJogo({ ...BASE, qtdDezenas: 6, somaFaixa: { min: 21, max: 25 }, parImparAlvo: { pares: 6, impares: 0 } });
    expect(r.atendeuTodosFiltros).toBe(false);
    expect(r.filtrosNaoAtendidos?.length).toBeGreaterThan(0);
    expect(R.jogoValido(r.dezenas, 6)).toBe(true);
  });

  it("casos extremos: exclusões demais dão erro; obrigatória duplicada não encolhe o jogo", () => {
    expect(() => gerarJogo({ ...BASE, qtdDezenas: 6, dezenasExcluidas: R.UNIVERSO.slice(0, 55) })).toThrow();
    const r = gerarJogo({ ...BASE, qtdDezenas: 6, dezenasObrigatorias: [5, 5, 7] });
    expect(R.jogoValido(r.dezenas, 6)).toBe(true);
    const todas = gerarJogo({ ...BASE, qtdDezenas: 6, dezenasExcluidas: R.UNIVERSO.slice(0, 54) });
    expect(todas.dezenas).toEqual([55, 56, 57, 58, 59, 60]);
  });

  it("amostrarSubconjunto nunca devolve dezena excluída nem repetida", () => {
    for (let t = 0; t < 2000; t++) {
      const s = amostrarSubconjunto([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3, [2, 4]);
      expect(new Set(s).size).toBe(s.length);
      expect(s.some((d) => d === 2 || d === 4)).toBe(false);
    }
  });
});

describe("gerarJogo — ausência de viés (sem filtros)", () => {
  it("frequências das 60 dezenas em 100.000 jogos: χ² (59 gl) < 95 (p ≈ 0,002)", () => {
    const n = 100_000;
    const f = Array(61).fill(0);
    let somaTotal = 0;
    for (let i = 0; i < n; i++) {
      const r = gerarJogo({ ...BASE, qtdDezenas: 6 });
      r.dezenas.forEach((d) => f[d]++);
      somaTotal += r.soma;
    }
    expect(R.quiQuadradoFrequencias(f, n)).toBeLessThan(95);
    // média da soma: 183 ± 3 erros-padrão (dp 40,58 / √n)
    expect(Math.abs(somaTotal / n - 183)).toBeLessThan((3 * 40.58) / Math.sqrt(n));
  });
});

describe("gerarJogoDaData — Data da sorte", () => {
  it("mesma data → mesmo jogo; jogo válido", () => {
    const a = gerarJogoDaData(new Date(2026, 10, 11), 1, 60, 6);
    const b = gerarJogoDaData(new Date(2026, 10, 11), 1, 60, 6);
    expect(a).toEqual(b);
    expect(R.jogoValido(a.dezenas, 6)).toBe(true);
  });
  it("datas de 30 anos cobrem as 60 dezenas sem viés forte: χ² < 95", () => {
    const f = Array(61).fill(0);
    let n = 0;
    for (let t = new Date(2000, 0, 1).getTime(); t < new Date(2030, 0, 1).getTime(); t += 86_400_000) {
      gerarJogoDaData(new Date(t), 1, 60, 6).dezenas.forEach((d) => f[d]++);
      n++;
    }
    expect(R.quiQuadradoFrequencias(f, n)).toBeLessThan(95);
  });
});

describe("telas do gerador e de probabilidades", () => {
  // MS-16: QTD_EXTRA_DEZENAS_MAX = 5 (GeradorClient e ProbabilidadesClient)
  // limita a Mega-Sena a 6 + 5 = 11 dezenas; o máximo oficial é 20. A
  // constante não é exportada; ao corrigir, expor o máximo por loteria e
  // testar max('megasena') === 20.
  it.todo("MS-16: Gerador e Probabilidades aceitam até 20 dezenas na Mega-Sena");
  // MS-19: a faixa de soma "mais comum" junta as 3 maiores faixas de 10 pelo
  // mínimo e máximo (170–209), incluindo 190–199, que não está entre as 3.
  // prepararDadosGerador depende do banco; extrair a regra para testar.
  it.todo("MS-19: faixa de soma comum só contém faixas que estão entre as mais comuns");
});
