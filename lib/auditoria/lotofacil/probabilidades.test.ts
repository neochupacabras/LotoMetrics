// Auditoria Lotofácil — probabilidades, classificação e conferência.
// Referência: ./referencia.ts (independente do código auditado).
// Ver docs/auditorias/lotofacil/05-testes-evidencias.md.
import { describe, expect, it } from "vitest";
import {
  binomial,
  calcularProbabilidades,
  probabilidadeAoMenosK,
  probAoMenosUmGanhador,
  calcularProjecao,
  FAIXAS_PREMIADAS,
  PARAMS_LOTERIA,
} from "@/lib/probabilidades";
import {
  ehPrimo,
  ehFibonacci,
  ehMultiploDe3,
  zonaDaDezena,
  linhaDaDezena,
  colunaDaDezena,
  maiorSequenciaConsecutiva,
  classificarJogo,
} from "@/lib/classificacao";
import { pontuarJogo, type FaixaConcurso } from "@/lib/conferencia";
import { qtdDezenasAposta, formatarUmEm, formatarProbabilidadePct } from "@/lib/format";
import * as R from "./referencia";

describe("referência (sanidade da própria implementação independente)", () => {
  it("C(25,15) = 3.268.760", () => {
    expect(R.TOTAL_COMBINACOES).toBe(BigInt(3268760));
  });

  it("para cada tamanho de aposta, as probabilidades de todos os k somam 1", () => {
    for (let b = R.APOSTA_MIN; b <= R.APOSTA_MAX; b++) {
      let soma = BigInt(0);
      for (let k = 0; k <= 15; k++) soma += R.favoraveis(b, k);
      expect(soma).toBe(R.comb(25, b));
    }
  });

  it("reproduz a tabela oficial da Caixa (1 em N, mesma precisão da Caixa)", () => {
    for (const k of R.FAIXAS) {
      for (let b = 15; b <= 20; b++) {
        const caixa = R.TABELA_CAIXA_1_EM[k][b - 15];
        const ref = 1 / R.probAcertos(b, k);
        const casas = Number.isInteger(caixa) ? 0 : 1;
        expect(Number(ref.toFixed(casas))).toBe(caixa);
      }
    }
  });
});

describe("parâmetros da Lotofácil no código", () => {
  it("faixas premiadas = 11..15", () => {
    expect(FAIXAS_PREMIADAS.lotofacil).toEqual([11, 12, 13, 14, 15]);
  });
  it("PARAMS_LOTERIA: n = 25, m = 15, preço vigente R$ 3,50", () => {
    expect(PARAMS_LOTERIA.lotofacil.n).toBe(25);
    expect(PARAMS_LOTERIA.lotofacil.m).toBe(15);
    expect(PARAMS_LOTERIA.lotofacil.precoAposta).toBe(3.5);
  });
  it("aposta simples tem 15 dezenas", () => {
    expect(qtdDezenasAposta("lotofacil", 15)).toBe(15);
  });
});

describe("binomial()", () => {
  it("é exato para todo C(25,k) (comparado com BigInt)", () => {
    for (let k = 0; k <= 25; k++) expect(BigInt(binomial(25, k))).toBe(R.comb(25, k));
  });
  it("vale 0 fora do domínio", () => {
    expect(binomial(25, -1)).toBe(0);
    expect(binomial(25, 26)).toBe(0);
  });
});

describe("calcularProbabilidades() — Lotofácil, apostas de 15 a 20 dezenas", () => {
  for (let b = 15; b <= 20; b++) {
    it(`b = ${b}: igual à hipergeométrica de referência em todas as faixas`, () => {
      const faixas = calcularProbabilidades(25, 15, b, [11, 12, 13, 14, 15]);
      expect(faixas.map((f) => f.acertos)).toEqual([11, 12, 13, 14, 15]);
      for (const f of faixas) {
        expect(BigInt(f.combinacoesFavoraveis)).toBe(R.favoraveis(b, f.acertos));
        expect(BigInt(f.totalCombinacoes)).toBe(R.comb(25, b));
        expect(f.probabilidade).toBeCloseTo(R.probAcertos(b, f.acertos), 15);
        expect(f.probabilidade).toBeGreaterThan(0);
        expect(f.probabilidade).toBeLessThanOrEqual(1);
      }
    });

    it(`b = ${b}: soma de todos os k possíveis = 1 e suporte = [b-10, 15]`, () => {
      const todas = calcularProbabilidades(25, 15, b, Array.from({ length: 16 }, (_, i) => i));
      expect(todas.reduce((s, f) => s + f.probabilidade, 0)).toBeCloseTo(1, 12);
      expect(Math.min(...todas.map((f) => f.acertos))).toBe(b - 10);
      expect(Math.max(...todas.map((f) => f.acertos))).toBe(15);
    });
  }

  it("aposta simples: 1 em 3.268.760 / 21.792 / 692 / 60 / 11", () => {
    const umEm = calcularProbabilidades(25, 15, 15, [15, 14, 13, 12, 11]).map((f) => f.umEm);
    expect(umEm).toEqual([3268760, 21792, 692, 60, 11]);
  });

  // LF-09 (corrigido): "1 em N" era arredondado para inteiro; agora usa 1
  // casa quando N < 10, como a tabela da Caixa.
  // A Caixa não é uniforme (mostra "1 em 6" para 5,94 e "1 em 4,2" para
  // 4,22); o site usa sempre 1 casa abaixo de 10 e inteiro acima.
  it("LF-09: formatarUmEm usa 1 casa abaixo de 10 e fica a no máximo 0,5 da Caixa", () => {
    for (const k of R.FAIXAS) {
      for (let b = 15; b <= 20; b++) {
        const caixa = R.TABELA_CAIXA_1_EM[k][b - 15];
        const p = calcularProbabilidades(25, 15, b, [k])[0].probabilidade;
        const n = 1 / R.probAcertos(b, k);
        const esperado = n < 10
          ? `1 em ${n.toFixed(1).replace(".", ",")}`
          : `1 em ${Math.round(n).toLocaleString("pt-BR")}`;
        expect(formatarUmEm(p), `${k} acertos, ${b} dezenas`).toBe(esperado);
        expect(Math.abs(n - caixa)).toBeLessThanOrEqual(0.5); // ex.: 204.297,5 → 204.298
      }
    }
  });
});

describe("probabilidadeAoMenosK() — pré-condição do fechamento", () => {
  it("igual à soma da hipergeométrica de referência (pools 16–20, k 11–15)", () => {
    for (let v = 16; v <= 20; v++) {
      for (let k = 11; k <= 15; k++) {
        let ref = 0;
        for (let j = k; j <= 15; j++) ref += R.probAcertos(v, j);
        expect(probabilidadeAoMenosK(25, 15, v, k)).toBeCloseTo(ref, 12);
      }
    }
  });
  it("pool 20 sempre tem ao menos 10 sorteadas: P(>=10) = 1", () => {
    expect(probabilidadeAoMenosK(25, 15, 20, 10)).toBeCloseTo(1, 12);
  });
});

describe("projeção de acúmulo — propriedades do modelo", () => {
  it("probabilidade de 1 bilhete = 1 / C(25,15)", () => {
    const p = calcularProjecao("lotofacil", 0, 2_000_000, 20_000_000, 0);
    expect(p.probGanhadorUmTicket).toBe(1 / 3268760);
  });
  it("P(>=1 ganhador) fica em [0,1] e cresce com o número de apostas", () => {
    const p = 1 / 3268760;
    let anterior = -1;
    for (const t of [0, 1, 1e5, 1e6, 1e7, 1e8]) {
      const v = probAoMenosUmGanhador(p, t);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
      expect(v).toBeGreaterThanOrEqual(anterior);
      anterior = v;
    }
  });
  // LF-15 (corrigido): probabilidade < 1 nunca aparece como "100,0%".
  it("LF-15: formatarProbabilidadePct não arredonda para certeza", () => {
    expect(formatarProbabilidadePct(0.9996)).toBe("> 99,9%");
    expect(formatarProbabilidadePct(1 - 1e-9)).toBe("> 99,9%");
    expect(formatarProbabilidadePct(1)).toBe("100%");
    expect(formatarProbabilidadePct(0.831)).toBe("83,1%");
    expect(formatarProbabilidadePct(0.0004)).toBe("< 0,1%");
  });

  // LF-07: o modelo supõe apostas uniformes e superestima a chance de
  // ganhador (backtest 08/2025–11/2026: 87,8% previsto x 75,3% real). Depende
  // de dados de produção — o backtest está em evidencias/fase2/proj.mjs.
  it.todo("LF-07: backtest da projeção dentro de ±2 dp do observado");
});

describe("classificação de dezenas no volante 5x5", () => {
  it("primos, Fibonacci, múltiplos de 3 = conjuntos da regra", () => {
    expect(R.UNIVERSO.filter(ehPrimo)).toEqual(R.PRIMOS);
    expect(R.UNIVERSO.filter(ehFibonacci)).toEqual(R.FIBONACCI);
    expect(R.UNIVERSO.filter(ehMultiploDe3)).toEqual(R.MULTIPLOS_3);
  });
  it("moldura (16) e centro (9)", () => {
    expect(R.UNIVERSO.filter((d) => zonaDaDezena(d, 25, 5) === "moldura")).toEqual(R.MOLDURA);
    expect(R.UNIVERSO.filter((d) => zonaDaDezena(d, 25, 5) === "centro")).toEqual(R.CENTRO);
  });
  it("linha e coluna", () => {
    for (const d of R.UNIVERSO) {
      expect(linhaDaDezena(d, 5)).toBe(Math.floor((d - 1) / 5) + 1);
      expect(colunaDaDezena(d, 5)).toBe(((d - 1) % 5) + 1);
    }
  });
  it("maiorSequenciaConsecutiva = referência por bitmask (5.000 jogos aleatórios)", () => {
    for (let t = 0; t < 5000; t++) {
      const jogo = [...R.UNIVERSO].sort(() => Math.random() - 0.5).slice(0, 15);
      const mask = jogo.reduce((m, d) => m | (1 << (d - 1)), 0);
      expect(maiorSequenciaConsecutiva(jogo)).toBe(R.maiorCorrida(mask));
    }
  });
  it("classificarJogo: contagens coerentes e somando 15", () => {
    const c = classificarJogo([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], { dezenaMax: 25, gridColunas: 5 });
    expect(c.pares + c.impares).toBe(15);
    expect(c.moldura + c.centro).toBe(15);
    expect(c.soma).toBe(120);
    expect(c.pares).toBe(7);
    expect(c.primos).toBe(6);
    expect(c.fibonacci).toBe(6);
    expect(c.multiplos3).toBe(5);
    expect(c.maiorSequencia).toBe(15);
    expect(Object.values(c.porLinha).reduce((a, b) => a + b, 0)).toBe(15);
  });
});

describe("pontuarJogo() — concurso real 3826 (10/11/2026, conferido na API da Caixa)", () => {
  const sorteio = [1, 2, 3, 5, 8, 9, 12, 13, 15, 18, 19, 21, 22, 24, 25];
  const faixas: FaixaConcurso[] = [
    { faixa: 1, descricaoFaixa: "15 acertos", qtdGanhadores: 3, valorPremio: 408185.03 },
    { faixa: 2, descricaoFaixa: "14 acertos", qtdGanhadores: 355, valorPremio: 1033.24 },
    { faixa: 3, descricaoFaixa: "13 acertos", qtdGanhadores: 11132, valorPremio: 35 },
    { faixa: 4, descricaoFaixa: "12 acertos", qtdGanhadores: 118233, valorPremio: 14 },
    { faixa: 5, descricaoFaixa: "11 acertos", qtdGanhadores: 575335, valorPremio: 7 },
  ];
  const concurso = { numero: 3826, dezenas: sorteio };
  const fora = R.UNIVERSO.filter((d) => !sorteio.includes(d)); // 10 dezenas

  for (let k = 5; k <= 15; k++) {
    it(`jogo com ${k} acertos`, () => {
      const jogo = [...sorteio.slice(0, k), ...fora.slice(0, 15 - k)];
      const [r] = pontuarJogo("lotofacil", jogo, concurso, faixas);
      expect(r.acertos).toBe(R.acertos(jogo, sorteio));
      if (k >= 11) {
        expect(r.faixa?.faixa).toBe(16 - k);
        expect(r.premioReais).toBe(faixas[15 - k].valorPremio);
        expect(r.acumulado).toBe(false);
      } else {
        expect(r.faixa).toBeNull();
        expect(r.premioReais).toBeNull();
      }
    });
  }

  it("faixa sem ganhador vira 'acumulado', sem valor inventado", () => {
    const semGanhador = faixas.map((f) => (f.faixa === 1 ? { ...f, qtdGanhadores: 0, valorPremio: 0 } : f));
    const [r] = pontuarJogo("lotofacil", sorteio, concurso, semGanhador);
    expect(r.acertos).toBe(15);
    expect(r.acumulado).toBe(true);
    expect(r.premioReais).toBeNull();
  });
});
