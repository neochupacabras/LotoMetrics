// Auditoria Mega-Sena — probabilidades, parâmetros, classificação,
// conferência, projeção e hub da Virada.
// Referência: ./referencia.ts (independente do código auditado).
// Ver docs/auditorias/mega-sena/05-testes-evidencias.md.
//
// Convenção: `it.fails` = problema comprovado, ainda não corrigido (o teste
// passa enquanto o erro existir; quem corrigir troca por `it`).
// `it.todo` = depende de decisão ou de código que ainda não é testável.
import { describe, expect, it } from "vitest";
import {
  binomial,
  calcularProbabilidades,
  probabilidadeAoMenosK,
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
import { pontuarJogo } from "@/lib/conferencia";
import { qtdDezenasAposta } from "@/lib/format";
import { CONCURSOS_VIRADA, PRECO_APOSTA_SIMPLES, tabelaApostas, anoDaEdicao } from "@/lib/mega-da-virada";
import { qtdSorteiosPorSemana } from "@/lib/calendario";
import * as R from "./referencia";

describe("referência (sanidade da implementação independente)", () => {
  it("C(60,6) = 50.063.860", () => {
    expect(R.TOTAL_COMBINACOES).toBe(BigInt(50063860));
  });

  it("para cada tamanho de aposta (6 a 20), as probabilidades de k = 0..6 somam 1", () => {
    for (let b = R.APOSTA_MIN; b <= R.APOSTA_MAX; b++) {
      let soma = BigInt(0);
      for (let k = 0; k <= 6; k++) soma += R.favoraveis(b, k);
      expect(soma).toBe(R.comb(60, b));
    }
  });

  it("reproduz as 45 células da tabela oficial da Caixa (1 em N, arredondado)", () => {
    for (const k of R.FAIXAS) {
      for (let b = 6; b <= 20; b++) {
        expect(Math.round(1 / R.probAcertos(b, k))).toBe(R.TABELA_CAIXA_1_EM[k][b - 6]);
      }
    }
  });

  it("reproduz a tabela de preços da Caixa: C(b,6) × R$ 6,00", () => {
    for (let b = 6; b <= 20; b++) expect(Number(R.comb(b, 6)) * R.PRECO_ATUAL).toBe(R.PRECOS_CAIXA[b - 6]);
  });

  it("as duas grades possíveis têm 28 dezenas na moldura (a contagem por sorteio não depende da grade)", () => {
    expect(R.MOLDURA_10X6).toHaveLength(28);
    expect(R.MOLDURA_6X10).toHaveLength(28);
    expect(new Set(R.MOLDURA_10X6).size).toBe(28);
    expect(new Set(R.MOLDURA_6X10).size).toBe(28);
  });
});

describe("parâmetros da Mega-Sena no código", () => {
  it("faixas premiadas = 4, 5 e 6 acertos", () => {
    expect(FAIXAS_PREMIADAS.megasena).toEqual([4, 5, 6]);
  });
  it("n = 60, m = 6, preço vigente R$ 6,00 nas duas constantes de preço", () => {
    expect(PARAMS_LOTERIA.megasena.n).toBe(60);
    expect(PARAMS_LOTERIA.megasena.m).toBe(6);
    expect(PARAMS_LOTERIA.megasena.precoAposta).toBe(R.PRECO_ATUAL);
    expect(PRECO_APOSTA_SIMPLES).toBe(R.PRECO_ATUAL);
  });
  it("aposta simples de 6 dezenas; 3 sorteios por semana (ter, qui, dom)", () => {
    expect(qtdDezenasAposta("megasena", 6)).toBe(6);
    expect(qtdSorteiosPorSemana("megasena")).toBe(3);
  });

  // MS-04: os relatórios em PDF têm o preço fixo em R$ 5,00. A constante
  // fica dentro da rota (não exportada); ao corrigir, extrair o preço para
  // precoAtual() e testar aqui.
  it.todo("MS-04: relatório PDF usa precoAtual('megasena') (R$ 6,00), não R$ 5,00");
  // MS-11: preço repetido em PARAMS_LOTERIA, PRECO_APOSTA_SIMPLES, calculadoras e relatórios.
  it.todo("MS-11: uma única fonte para o preço da Mega-Sena");
});

describe("binomial() e calcularProbabilidades()", () => {
  it("binomial é exato para todo C(60,k) com k ≤ 20 (valores < 2^53)", () => {
    for (let k = 0; k <= 20; k++) expect(BigInt(binomial(60, k))).toBe(R.comb(60, k));
  });

  for (let b = 6; b <= 20; b++) {
    it(`aposta de ${b} dezenas: 3 faixas iguais à referência e à Caixa`, () => {
      const f = calcularProbabilidades(60, 6, b, [4, 5, 6]);
      expect(f.map((x) => x.acertos)).toEqual([4, 5, 6]);
      for (const x of f) {
        const ref = R.probAcertos(b, x.acertos);
        expect(Math.abs(x.probabilidade - ref) / ref).toBeLessThan(1e-12);
        expect(x.umEm).toBe(R.TABELA_CAIXA_1_EM[x.acertos][b - 6]);
        expect(BigInt(x.combinacoesFavoraveis)).toBe(R.favoraveis(b, x.acertos));
      }
    });
  }

  it("probabilidades de todos os k somam 1 e ficam em [0,1] (b = 6..20)", () => {
    for (let b = 6; b <= 20; b++) {
      const f = calcularProbabilidades(60, 6, b, [0, 1, 2, 3, 4, 5, 6]);
      const soma = f.reduce((a, x) => a + x.probabilidade, 0);
      expect(soma).toBeCloseTo(1, 12);
      for (const x of f) {
        expect(x.probabilidade).toBeGreaterThanOrEqual(0);
        expect(x.probabilidade).toBeLessThanOrEqual(1);
      }
    }
  });

  it("aposta simples: sena 1 em 50.063.860, quina 1 em 154.518, quadra 1 em 2.332", () => {
    const f = calcularProbabilidades(60, 6, 6, [4, 5, 6]);
    expect(f.map((x) => x.umEm)).toEqual([2332, 154518, 50063860]);
    expect(f.map((x) => x.combinacoesFavoraveis)).toEqual([21465, 324, 1]);
  });

  it("mais dezenas nunca piora a chance de nenhuma faixa (monotonia em b)", () => {
    for (const k of R.FAIXAS) {
      for (let b = 6; b < 20; b++) {
        const p1 = calcularProbabilidades(60, 6, b, [k])[0].probabilidade;
        const p2 = calcularProbabilidades(60, 6, b + 1, [k])[0].probabilidade;
        // a quadra pode cair com muitas dezenas (passa a vir junto com quina/sena),
        // mas sena e quina só aumentam
        if (k >= 5) expect(p2).toBeGreaterThan(p1);
      }
    }
  });
});

describe("probabilidadeAoMenosK() — pré-condição dos fechamentos", () => {
  it("bate com a referência para pools de 7 a 16 e garantias 4 e 5", () => {
    for (let v = 7; v <= 16; v++) {
      for (const k of [4, 5]) {
        let ref = 0;
        for (let j = k; j <= 6; j++) ref += Number(R.comb(6, j) * R.comb(54, v - j)) / Number(R.comb(60, v));
        expect(Math.abs(probabilidadeAoMenosK(60, 6, v, k) - ref) / ref).toBeLessThan(1e-12);
      }
    }
  });
  it("pool de 10: as 6 sorteadas no pool = 1 em 238.399", () => {
    expect(Math.round(1 / probabilidadeAoMenosK(60, 6, 10, 6))).toBe(238399);
  });
});

describe("classificação no volante (grade atual do site: 10 × 6)", () => {
  it("primos (17), Fibonacci (9), múltiplos de 3 (20) = conjuntos da regra", () => {
    expect(R.UNIVERSO.filter(ehPrimo)).toEqual(R.PRIMOS);
    expect(R.UNIVERSO.filter(ehFibonacci)).toEqual(R.FIBONACCI);
    expect(R.UNIVERSO.filter(ehMultiploDe3)).toEqual(R.MULTIPLOS_3);
  });
  it("moldura da grade 10×6 tem as 28 dezenas esperadas para essa grade", () => {
    expect(R.UNIVERSO.filter((d) => zonaDaDezena(d, 60, 6) === "moldura")).toEqual(R.MOLDURA_10X6);
  });
  it("linha e coluna para 6 colunas", () => {
    for (const d of R.UNIVERSO) {
      expect(linhaDaDezena(d, 6)).toBe(Math.floor((d - 1) / 6) + 1);
      expect(colunaDaDezena(d, 6)).toBe(((d - 1) % 6) + 1);
    }
  });
  // MS-06 (PENDENTE de fonte): se o volante oficial for 6 linhas × 10
  // colunas, a moldura deve ser R.MOLDURA_6X10 e o banco deve ter
  // grid_colunas = 10. Confirmar com o volante antes de escrever o teste.
  it.todo("MS-06: moldura, linhas e colunas seguem a grade do volante oficial");

  it("maiorSequenciaConsecutiva = referência (5.000 jogos aleatórios)", () => {
    for (let t = 0; t < 5000; t++) {
      const jogo = [...R.UNIVERSO].sort(() => Math.random() - 0.5).slice(0, 6).sort((a, b) => a - b);
      let melhor = 1;
      let atual = 1;
      for (let i = 1; i < 6; i++) {
        atual = jogo[i] === jogo[i - 1] + 1 ? atual + 1 : 1;
        melhor = Math.max(melhor, atual);
      }
      expect(maiorSequenciaConsecutiva(jogo)).toBe(melhor);
    }
  });
  it("classificarJogo: contagens do concurso 3084", () => {
    const c = classificarJogo(R.CONCURSO_3084.dezenas, { dezenaMax: 60, gridColunas: 6 });
    expect(c.soma).toBe(140);
    expect(c.pares).toBe(4);
    expect(c.primos).toBe(2); // 31 e 37
    expect(c.fibonacci).toBe(0);
    expect(c.multiplos3).toBe(2); // 6 e 30
    expect(c.maiorSequencia).toBe(2); // 30-31
    expect(c.moldura + c.centro).toBe(6);
  });
});

describe("pontuarJogo() — concurso real 3084 (10/11/2026)", () => {
  const { dezenas: sorteio, faixas } = R.CONCURSO_3084;
  const concurso = { numero: 3084, dezenas: sorteio };
  const fora = R.UNIVERSO.filter((d) => !sorteio.includes(d));

  for (let k = 0; k <= 6; k++) {
    it(`jogo com ${k} acertos`, () => {
      const jogo = [...sorteio.slice(0, k), ...fora.slice(0, 6 - k)];
      const [r] = pontuarJogo("megasena", jogo, concurso, faixas);
      expect(r.acertos).toBe(R.acertos(jogo, sorteio));
      if (k >= 4) {
        expect(r.faixa?.faixa).toBe(7 - k);
        expect(r.premioReais).toBe(faixas[6 - k].valorPremio);
      } else {
        expect(r.faixa).toBeNull();
        expect(r.premioReais).toBeNull();
      }
    });
  }

  it("sena sem ganhador vira 'acumulado', sem valor inventado", () => {
    const semGanhador = faixas.map((f) => (f.faixa === 1 ? { ...f, qtdGanhadores: 0, valorPremio: 0 } : f));
    const [r] = pontuarJogo("megasena", sorteio, concurso, semGanhador);
    expect(r.acertos).toBe(6);
    expect(r.acumulado).toBe(true);
    expect(r.premioReais).toBeNull();
  });
});

describe("Projeção de acúmulo", () => {
  it("p de 1 aposta = 1/C(60,6); P(ganhador) em [0,1] e crescente com acumulados", () => {
    let anterior = -1;
    for (let a = 0; a <= 25; a++) {
      const p = calcularProjecao("megasena", null, null, 60_000_000, a);
      expect(p.probGanhadorUmTicket).toBeCloseTo(1 / 50063860, 18);
      expect(p.probAoMenosUmGanhador).toBeGreaterThanOrEqual(0);
      expect(p.probAoMenosUmGanhador).toBeLessThanOrEqual(1);
      expect(p.probAoMenosUmGanhador).toBeGreaterThanOrEqual(anterior);
      expect(p.probGanhadorSeVenderMenos).toBeLessThanOrEqual(p.probAoMenosUmGanhador);
      expect(p.probGanhadorSeVenderMais).toBeGreaterThanOrEqual(p.probAoMenosUmGanhador);
      anterior = p.probAoMenosUmGanhador;
    }
  });

  // MS-17: sem arrecadação o modelo supõe 80 milhões de apostas; a mediana
  // real desde 2024 é 9,7 milhões de apostas simples equivalentes
  // (evidencias/fase2/proj.mjs).
  it.fails("MS-17: estimativa padrão de apostas compatível com a Mega-Sena real (≤ 20 mi)", () => {
    expect(PARAMS_LOTERIA.megasena.ticketsMedios).toBeLessThanOrEqual(20_000_000);
  });

  // MS-17: backtest com dados de produção (concursos normais desde 2016:
  // 20,5% previsto x 16,6% observado). Fica no script de evidência.
  it.todo("MS-17: backtest da P(ganhador) dentro de ±2 EP do observado");

  // MS-05: calcularProjecao não recebe o número do concurso, então não tem
  // como aplicar a regra de final 0 ou 5 (25% do prêmio bruto reservado).
  it.todo("MS-05: projeção do próximo concurso considera final 0/5 e a reserva da Virada");
});

describe("hub da Mega da Virada (lib/mega-da-virada.ts)", () => {
  it("tabelaApostas reproduz preço e chance da sena da Caixa para 6 a 20 dezenas", () => {
    const qs = Array.from({ length: 15 }, (_, i) => i + 6);
    for (const l of tabelaApostas(qs)) {
      expect(l.jogos).toBe(Number(R.comb(l.dezenas, 6)));
      expect(l.preco).toBe(R.PRECOS_CAIXA[l.dezenas - 6]);
      expect(l.umEm).toBe(R.TABELA_CAIXA_1_EM[6][l.dezenas - 6]);
    }
  });
  it("uma edição por ano de 2009 a 2025, concursos crescentes", () => {
    const anos = Object.keys(CONCURSOS_VIRADA).map(Number);
    expect(anos).toEqual(Array.from({ length: 17 }, (_, i) => 2009 + i));
    const ns = anos.map((a) => CONCURSOS_VIRADA[a]);
    for (let i = 1; i < ns.length; i++) expect(ns[i]).toBeGreaterThan(ns[i - 1]);
  });
  it("sorteio em 01/01 conta como Virada do ano anterior (edição 2025)", () => {
    expect(anoDaEdicao("2026-01-01T00:00:00Z")).toBe(2025);
    expect(anoDaEdicao("2024-12-31T00:00:00Z")).toBe(2024);
  });
});
