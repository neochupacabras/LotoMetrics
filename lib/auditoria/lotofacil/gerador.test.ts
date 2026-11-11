// Auditoria Lotofácil — gerador de jogos (lib/gerar-jogo.ts).
// LF-25 e LF-26 foram corrigidos na Etapa 2 do plano; os testes viraram regressão.
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

  // LF-25 (corrigido): uma dezena obrigatória e excluída ao mesmo tempo
  // entrava no jogo marcado como "atendeu todos os filtros".
  it("LF-25: obrigatória e excluída ao mesmo tempo é recusada com erro claro", () => {
    expect(() =>
      gerarJogo({ ...BASE, qtdDezenas: 15, dezenasObrigatorias: [20], dezenasExcluidas: [20, 25] })
    ).toThrow(/20/);
  });

  it("LF-25: o sorteio de obrigatórias do preset nunca escolhe uma dezena excluída", () => {
    // Cenário real de 11/11/2026: a dezena 20 era atrasada E a mais frequente.
    const atrasadas = [16, 11, 4, 6, 7, 10, 14, 17, 20, 23];
    const excluidas = [20, 25];
    for (let t = 0; t < 5000; t++) {
      const obrig = amostrarSubconjunto(atrasadas, 2, excluidas);
      expect(obrig.some((d) => excluidas.includes(d))).toBe(false);
      const r = gerarJogo({ ...BASE, qtdDezenas: 15, dezenasObrigatorias: obrig, dezenasExcluidas: excluidas });
      expect(r.dezenas.some((d) => excluidas.includes(d))).toBe(false);
    }
  });

  // LF-26 (corrigido): obrigatória duplicada gerava jogo com 14 dezenas.
  it("LF-26: obrigatória duplicada é deduplicada (sempre 15 distintas)", () => {
    const r = gerarJogo({ ...BASE, qtdDezenas: 15, dezenasObrigatorias: [5, 5, 7] });
    expect(R.jogoValido(r.dezenas)).toBe(true);
    expect(r.dezenas).toContain(5);
    expect(r.dezenas).toContain(7);
  });

  it("LF-26: sem solução, devolve a melhor tentativa e diz quais filtros faltaram", () => {
    const r = gerarJogo({
      ...BASE,
      qtdDezenas: 15,
      somaFaixa: { min: 120, max: 125 },
      parImparAlvo: { pares: 12, impares: 3 },
    });
    expect(r.atendeuTodosFiltros).toBe(false);
    expect(r.filtrosNaoAtendidos?.length).toBeGreaterThan(0);
    // A soma 120–125 só admite jogos quase iguais a 1..15 (7 pares): os dois
    // filtros juntos são impossíveis, mas um deles sozinho é atingível.
    expect(r.filtrosNaoAtendidos!.length).toBeLessThanOrEqual(2);
    const ok = gerarJogo({ ...BASE, qtdDezenas: 15, parImparAlvo: { pares: 7, impares: 8 } });
    expect(ok.filtrosNaoAtendidos).toEqual([]);
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
