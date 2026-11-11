// Auditoria Lotofácil — gerador de jogos (lib/gerar-jogo.ts).
// `it.fails` = problema comprovado na auditoria; troque por `it` ao corrigir.
import { describe, expect, it } from "vitest";
import { gerarJogo, gerarJogoDaData, amostrarSubconjunto } from "@/lib/gerar-jogo";
import { ehPrimo, ehFibonacci, ehMultiploDe3 } from "@/lib/classificacao";
import * as R from "./referencia";

const BASE = { dezenaMin: 1, dezenaMax: 25 };

describe("gerarJogo — validade", () => {
  it("todo jogo tem o tamanho pedido, dezenas distintas e dentro de 1..25 (15 a 20)", () => {
    for (let b = 15; b <= 20; b++) {
      for (let t = 0; t < 2000; t++) {
        const r = gerarJogo({ ...BASE, qtdDezenas: b });
        expect(R.jogoValido(r.dezenas, b)).toBe(true);
        expect(r.dezenas).toEqual([...r.dezenas].sort((a, c) => a - c));
        expect(r.soma).toBe(r.dezenas.reduce((a, c) => a + c, 0));
        expect(r.pares + r.impares).toBe(b);
      }
    }
  });

  it("respeita obrigatórias e excluídas (sem conflito entre elas)", () => {
    for (let t = 0; t < 2000; t++) {
      const embaralhado = [...R.UNIVERSO].sort(() => Math.random() - 0.5);
      const obrig = embaralhado.slice(0, 4);
      const excl = embaralhado.slice(4, 9);
      const r = gerarJogo({ ...BASE, qtdDezenas: 15, dezenasObrigatorias: obrig, dezenasExcluidas: excl });
      expect(obrig.every((d) => r.dezenas.includes(d))).toBe(true);
      expect(excl.some((d) => r.dezenas.includes(d))).toBe(false);
    }
  });

  it("quando diz que atendeu os filtros, atende mesmo (soma, pares, primos, Fibonacci, mult. 3)", () => {
    for (let t = 0; t < 3000; t++) {
      const r = gerarJogo({
        ...BASE,
        qtdDezenas: 15,
        somaFaixa: { min: 180, max: 209 },
        parImparAlvo: { pares: 7, impares: 8 },
        primosAlvo: [5, 6],
        fibonacciAlvo: [3, 4],
        multiplos3Alvo: [4, 5],
      });
      if (!r.atendeuTodosFiltros) continue;
      expect(r.soma).toBeGreaterThanOrEqual(180);
      expect(r.soma).toBeLessThanOrEqual(209);
      expect(r.pares).toBe(7);
      expect([5, 6]).toContain(r.dezenas.filter(ehPrimo).length);
      expect([3, 4]).toContain(r.dezenas.filter(ehFibonacci).length);
      expect([4, 5]).toContain(r.dezenas.filter(ehMultiploDe3).length);
    }
  });

  it("combinação impossível de filtros é sinalizada (atendeuTodosFiltros = false)", () => {
    const r = gerarJogo({ ...BASE, qtdDezenas: 15, somaFaixa: { min: 120, max: 125 }, parImparAlvo: { pares: 12, impares: 3 } });
    expect(r.atendeuTodosFiltros).toBe(false);
    expect(R.jogoValido(r.dezenas)).toBe(true);
  });

  it("exclusões demais lançam erro em vez de gerar jogo inválido", () => {
    expect(() =>
      gerarJogo({ ...BASE, qtdDezenas: 15, dezenasExcluidas: Array.from({ length: 11 }, (_, i) => i + 1) })
    ).toThrow();
    expect(() => gerarJogo({ ...BASE, qtdDezenas: 15, dezenasObrigatorias: R.UNIVERSO.slice(0, 16) })).toThrow();
  });

  // LF-25: no modo simples, uma dezena pode ser obrigatória (atrasada) e
  // excluída (mais frequente) ao mesmo tempo; ela entra e o jogo sai como
  // "atendeu todos os filtros".
  it.fails("LF-25: dezena obrigatória E excluída nunca resulta em jogo 'atendeu todos os filtros' com a excluída", () => {
    const r = gerarJogo({ ...BASE, qtdDezenas: 15, dezenasObrigatorias: [20], dezenasExcluidas: [20, 25] });
    expect(r.atendeuTodosFiltros && r.dezenas.includes(20)).toBe(false);
  });

  // LF-26: obrigatória duplicada gera jogo com 14 dezenas distintas.
  it.fails("LF-26: obrigatória duplicada é rejeitada ou deduplicada (sempre 15 distintas)", () => {
    let valido: boolean;
    try {
      const r = gerarJogo({ ...BASE, qtdDezenas: 15, dezenasObrigatorias: [5, 5, 7] });
      valido = R.jogoValido(r.dezenas);
    } catch {
      valido = true;
    }
    expect(valido).toBe(true);
  });
});

describe("gerarJogo — ausência de viés", () => {
  // Limite 70 para 24 gl corresponde a p ≈ 2e-6: falso alarme desprezível.
  it("sem filtros, frequência de cada dezena é uniforme (qui-quadrado, 60.000 jogos)", () => {
    const n = 60000;
    const freq = Array(26).fill(0);
    let soma = 0;
    for (let t = 0; t < n; t++) {
      const r = gerarJogo({ ...BASE, qtdDezenas: 15 });
      r.dezenas.forEach((d) => freq[d]++);
      soma += r.soma;
    }
    expect(R.quiQuadradoFrequencia(freq, n)).toBeLessThan(70);
    expect(soma / n).toBeGreaterThan(194.5);
    expect(soma / n).toBeLessThan(195.5);
  });

  it("com filtro de pares = 7, cada par sai com 7/12 e cada ímpar com 8/13 (uniforme condicional)", () => {
    const n = 30000;
    const freq = Array(26).fill(0);
    for (let t = 0; t < n; t++) {
      const r = gerarJogo({ ...BASE, qtdDezenas: 15, parImparAlvo: { pares: 7, impares: 8 }, maxTentativas: 5000 });
      expect(r.atendeuTodosFiltros).toBe(true);
      r.dezenas.forEach((d) => freq[d]++);
    }
    for (const d of R.UNIVERSO) {
      const esperado = d % 2 === 0 ? 7 / 12 : 8 / 13;
      expect(Math.abs(freq[d] / n - esperado)).toBeLessThan(0.015);
    }
  });

  it("amostrarSubconjunto: sem repetição e limitado ao pool", () => {
    for (let t = 0; t < 1000; t++) {
      const s = amostrarSubconjunto([1, 2, 3, 4, 5], 3);
      expect(new Set(s).size).toBe(3);
      expect(s.every((d) => d >= 1 && d <= 5)).toBe(true);
    }
    expect(amostrarSubconjunto([1, 2], 5)).toHaveLength(2);
  });
});

describe("gerarJogoDaData", () => {
  it("válido e reprodutível (mesma data = mesmo jogo)", () => {
    for (let dia = 1; dia <= 366; dia++) {
      const data = new Date(2024, 0, dia);
      const a = gerarJogoDaData(data, 1, 25, 15);
      const b = gerarJogoDaData(new Date(data), 1, 25, 15);
      expect(R.jogoValido(a.dezenas)).toBe(true);
      expect(a).toEqual(b);
    }
  });
});
