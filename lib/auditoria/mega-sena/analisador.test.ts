// Auditoria Mega-Sena — Analisador (lib/analisador.ts), Equilíbrio e
// Destaques. As tabelas fixas da Mega-Sena são comparadas com a
// hipergeométrica e com a enumeração das 50.063.860 combinações.
import { describe, expect, it } from "vitest";
import { analisar } from "@/lib/analisador";
import { compararComHistorico, classificarJogo } from "@/lib/classificacao";
import { pesosParaLoteria, qtdCriteriosEquilibrio } from "@/lib/equilibrio";
import * as R from "./referencia";

const pctRef = (K: number, x: number) => 100 * R.probCategoria(K, x);

// Jogo da Mega-Sena com a contagem desejada numa categoria (o resto fora dela).
function jogoCom(categoria: number[], x: number): number[] {
  const dentro = categoria.slice(0, x);
  const fora = R.UNIVERSO.filter((d) => !categoria.includes(d)).slice(0, 6 - x);
  return [...dentro, ...fora].sort((a, b) => a - b);
}

const analisarMS = (d: number[]) => analisar(d, "megasena", 1, 60, 6, 6)!;

describe("Analisador — tabelas por categoria x hipergeométrica", () => {
  const casos: [string, number[], (r: ReturnType<typeof analisarMS>) => number][] = [
    ["pares", R.PARES, (r) => r.parImpar.pct],
    ["primos", R.PRIMOS, (r) => r.primos.pct],
    ["Fibonacci", R.FIBONACCI, (r) => r.fibonacci.pct],
    ["múltiplos de 3", R.MULTIPLOS_3, (r) => r.multiplos3.pct],
  ];
  for (const [nome, cat, pct] of casos) {
    it(`${nome}: todas as contagens 0..6 com erro ≤ 0,01 p.p.`, () => {
      for (let x = 0; x <= 6; x++) {
        expect(Math.abs(pct(analisarMS(jogoCom(cat, x))) - pctRef(cat.length, x))).toBeLessThanOrEqual(0.01);
      }
    });
  }

  it("moldura: contagens de 1 a 5 conferem (≤ 0,01 p.p.)", () => {
    for (let x = 1; x <= 5; x++) {
      const r = analisarMS(jogoCom(R.MOLDURA_10X6, x));
      expect(r.molduraCentro.moldura).toBe(x);
      expect(Math.abs(r.molduraCentro.pct - pctRef(28, x))).toBeLessThanOrEqual(0.01);
    }
  });

  // MS-01: pontas erradas na tabela fixa DIST_MC_MS (0 → 0,02% e 6 → 2,52%;
  // exatos 1,81% e 0,75%).
  it.fails("MS-01: moldura com 0 e com 6 dezenas confere com a hipergeométrica", () => {
    for (const x of [0, 6]) {
      const r = analisarMS(jogoCom(R.MOLDURA_10X6, x));
      expect(Math.abs(r.molduraCentro.pct - pctRef(28, x))).toBeLessThanOrEqual(0.01);
    }
  });

  it("rótulo de cada categoria segue a régua do próprio Analisador (≥20 / ≥10 / ≥3)", () => {
    const regua = (p: number) => (p >= 20 ? "Muito comum" : p >= 10 ? "Comum" : p >= 3 ? "Incomum" : "Raro");
    for (let x = 0; x <= 6; x++) {
      const r = analisarMS(jogoCom(R.PRIMOS, x));
      expect(r.primos.label).toBe(regua(r.primos.pct));
    }
  });

  it("recusa jogos que não têm exatamente 6 dezenas", () => {
    expect(analisar([], "megasena", 1, 60, 6, 6)).toBeNull();
    expect(analisar([1, 2, 3, 4, 5], "megasena", 1, 60, 6, 6)).toBeNull();
    expect(analisar([1, 2, 3, 4, 5, 6, 7], "megasena", 1, 60, 6, 6)).toBeNull();
  });
});

describe("Analisador — enumeração completa das 50.063.860 combinações", () => {
  const { somas, corridas } = R.distribuicoesEnumeradas();
  const total = Number(R.TOTAL_COMBINACOES);

  it("enumeração: soma de 21 a 345, média 183, variância 1.647 (fórmula da ficha)", () => {
    let n = 0;
    let s1 = 0;
    let s2 = 0;
    for (const [s, c] of somas) {
      n += c;
      s1 += s * c;
      s2 += s * s * c;
    }
    expect(n).toBe(total);
    expect(Math.min(...somas.keys())).toBe(21);
    expect(Math.max(...somas.keys())).toBe(345);
    const media = s1 / n;
    expect(media).toBeCloseTo(183, 9);
    expect(s2 / n - media * media).toBeCloseTo((6 * ((60 * 60 - 1) / 12) * 54) / 59, 6);
  });

  it("percentil da soma (CDF fixa) confere com a enumeração em todas as 325 somas (≤ 0,06 p.p.)", () => {
    let acumulado = 0;
    for (let s = 21; s <= 345; s++) {
      acumulado += somas.get(s) ?? 0;
      const jogo = jogoComSoma(s);
      const r = analisarMS(jogo);
      expect(r.soma.valor).toBe(s);
      expect(Math.abs(r.soma.percentil - (100 * acumulado) / total)).toBeLessThanOrEqual(0.06);
    }
  });

  it("maior sequência: tabela fixa confere com a enumeração (≤ 0,1 p.p.)", () => {
    for (let k = 1; k <= 6; k++) {
      const jogo = jogoComCorrida(k);
      const r = analisarMS(jogo);
      expect(r.sequencias.maior).toBe(k);
      expect(Math.abs(r.sequencias.pct - (100 * (corridas.get(k) ?? 0)) / total)).toBeLessThanOrEqual(0.1);
    }
  });

  // MS-22: a tabela fixa tem 1 casa decimal, mas duas células não são o
  // arredondamento do valor exato: 2 seguidas = 38,8% (exato 38,883% → 38,9)
  // e 3 seguidas = 3,1% (exato 3,042% → 3,0).
  it.fails("MS-22: maior sequência arredondada corretamente (erro ≤ 0,05 p.p.)", () => {
    for (let k = 1; k <= 6; k++) {
      const r = analisarMS(jogoComCorrida(k));
      expect(Math.abs(r.sequencias.pct - (100 * (corridas.get(k) ?? 0)) / total)).toBeLessThanOrEqual(0.05);
    }
  });

  // MS-02: a "centralidade" da soma é exibida como "% das combinações
  // possíveis". Soma 183 sai como 99,0%; o certo, para a faixa 180–189, é
  // 9,55% (a Lotofácil já foi corrigida no LF-16, com faixas de 10).
  it.fails("MS-02: soma.pct = % das combinações com soma na mesma faixa de 10", () => {
    for (const s of [120, 183, 250]) {
      const ini = Math.floor(s / 10) * 10;
      let naFaixa = 0;
      for (let x = ini; x <= ini + 9; x++) naFaixa += somas.get(x) ?? 0;
      const r = analisarMS(jogoComSoma(s));
      expect(Math.abs(r.soma.pct - (100 * naFaixa) / total)).toBeLessThanOrEqual(0.05);
    }
  });
});

describe("Equilíbrio (lib/equilibrio.ts)", () => {
  it("pesos da Mega-Sena somam 1; moldura com peso 0 (6 critérios)", () => {
    const p = pesosParaLoteria("megasena");
    expect(Object.values(p).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12);
    expect(p.moldura).toBe(0);
    expect(qtdCriteriosEquilibrio("megasena")).toBe(6);
  });

  // MS-15: o critério soma usa faixas de 10 e o teto de 12% herdado da
  // Lotofácil; na Mega-Sena nenhuma faixa de 10 passa de 10,2% das
  // combinações (10,4% do histórico), então a soma nunca chega a 100 pontos e
  // a nota 100 é impossível. A nota inteira depende do banco (calcularEquilibrio
  // é assíncrona), então o teste demonstra a premissa com a enumeração.
  it("premissa do MS-15: a maior faixa de soma de 10 tem menos de 12% das combinações", () => {
    const { somas } = R.distribuicoesEnumeradas();
    const faixas = new Map<number, number>();
    for (const [s, c] of somas) faixas.set(Math.floor(s / 10) * 10, (faixas.get(Math.floor(s / 10) * 10) ?? 0) + c);
    const maior = Math.max(...faixas.values()) / Number(R.TOTAL_COMBINACOES);
    expect(maior).toBeLessThan(0.12);
    expect(maior).toBeGreaterThan(0.09);
  });
  it.todo("MS-15: a classificação distingue jogos (hoje 84,7% das combinações são 'típico' e nenhuma 'atípico')");
});

describe("Destaques (lib/destaques.ts) — premissa do MS-14", () => {
  // O destaque chama de "resultado incomum" o concurso cuja característica
  // mais rara tem frequência histórica < 15%. compararComHistorico mede a soma
  // em faixas de 10. Alimentado com a distribuição EXATA das somas (que no
  // histórico real fica ainda abaixo: máx. 10,4%), nenhuma soma passa de 15%:
  // todo concurso seria "incomum".
  it("com a distribuição exata, percentualSoma < 15% para qualquer soma possível", () => {
    const { somas } = R.distribuicoesEnumeradas();
    const faixas = new Map<number, number>();
    for (const [s, c] of somas) faixas.set(Math.floor(s / 10) * 10, (faixas.get(Math.floor(s / 10) * 10) ?? 0) + c);
    const somaHistograma = [...faixas.entries()].map(([ini, c]) => ({ faixaInicio: ini, faixaFim: ini + 9, ocorrencias: c }));
    for (let s = 21; s <= 345; s += 3) {
      const c = classificarJogo(jogoComSoma(s), { dezenaMax: 60, gridColunas: 6 });
      const r = compararComHistorico(c, {
        parImpar: [], primos: [], fibonacci: [], multiplos3: [], molduraCentro: [], sequencia: [], somaHistograma,
      });
      expect(r.percentualSoma).not.toBeNull();
      expect(r.percentualSoma!).toBeLessThan(15);
    }
  });
  it.todo("MS-14: o limiar de 'resultado incomum' considera a granularidade de cada métrica (hoje 100% dos concursos)");
});

// ── Construtores de jogos ────────────────────────────────────────────────────

// 6 dezenas distintas com a soma pedida (21..345): parte do menor jogo e sobe
// as dezenas de trás para frente.
function jogoComSoma(alvo: number): number[] {
  const d = [1, 2, 3, 4, 5, 6];
  let falta = alvo - 21;
  for (let i = 5; i >= 0 && falta > 0; i--) {
    const teto = 60 - (5 - i);
    const sobe = Math.min(falta, teto - d[i]);
    d[i] += sobe;
    falta -= sobe;
  }
  return d;
}

// Jogo cuja maior corrida de consecutivos é exatamente k.
function jogoComCorrida(k: number): number[] {
  const corrida = Array.from({ length: k }, (_, i) => 10 + i);
  const resto = [30, 40, 50, 55, 58, 60].slice(0, 6 - k);
  return [...corrida, ...resto].sort((a, b) => a - b);
}
