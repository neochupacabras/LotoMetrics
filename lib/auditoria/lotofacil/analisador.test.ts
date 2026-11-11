// Auditoria Lotofácil — Analisador (lib/analisador.ts).
// As tabelas fixas do Analisador dizem ser "combinatória exata"; aqui elas são
// comparadas com a hipergeométrica e com a enumeração das 3.268.760
// combinações (./referencia.ts). LF-03, LF-16 e LF-17 foram corrigidos na
// Etapa 2 do plano; os testes viraram regressão.
import { beforeAll, describe, expect, it } from "vitest";
import { analisar, type ResultadoAnalisador } from "@/lib/analisador";
import * as R from "./referencia";

// Tolerâncias: o código guarda 2 casas (categorias) e 1 casa (CDF da soma).
const TOL_CATEGORIA = 0.006;
const TOL_CDF = 0.051;

type Chave = "parImpar" | "primos" | "fibonacci" | "multiplos3" | "molduraCentro";
const CATEGORIAS: { nome: string; conjunto: number[]; chave: Chave }[] = [
  { nome: "pares", conjunto: R.PARES, chave: "parImpar" },
  { nome: "primos", conjunto: R.PRIMOS, chave: "primos" },
  { nome: "Fibonacci", conjunto: R.FIBONACCI, chave: "fibonacci" },
  { nome: "múltiplos de 3", conjunto: R.MULTIPLOS_3, chave: "multiplos3" },
  { nome: "moldura", conjunto: R.MOLDURA, chave: "molduraCentro" },
];

function pctAnalisador(r: ResultadoAnalisador, chave: Chave): number {
  return r[chave].pct;
}

// Para cada categoria e cada x possível: % do código x % exato.
function comparacoes() {
  const linhas: { nome: string; x: number; codigo: number; exato: number }[] = [];
  for (const c of CATEGORIAS) {
    for (let x = 0; x <= 15; x++) {
      const jogo = R.jogoComCategoria(c.conjunto, x);
      if (!jogo) continue;
      const r = analisar(jogo, "lotofacil", 1, 25, 5);
      if (!r) throw new Error("analisar devolveu null");
      linhas.push({ nome: c.nome, x, codigo: pctAnalisador(r, c.chave), exato: 100 * R.probCategoria(c.conjunto.length, x) });
    }
  }
  return linhas;
}

describe("Analisador — tabelas de categorias (Lotofácil)", () => {
  const linhas = comparacoes();

  it("valores com probabilidade >= 1% batem com a hipergeométrica", () => {
    for (const l of linhas.filter((l) => l.exato >= 1)) {
      expect(Math.abs(l.codigo - l.exato), `${l.nome} = ${l.x}`).toBeLessThan(TOL_CATEGORIA);
    }
  });

  // LF-03 (corrigido): as caudas estavam erradas nas constantes antigas
  // (primos 1/2/9, moldura 6/13/14, Fibonacci 0/1, múltiplos de 3 1/8).
  it("LF-03: caudas (< 1%) também batem com a hipergeométrica", () => {
    for (const l of linhas.filter((l) => l.exato < 1)) {
      expect(Math.abs(l.codigo - l.exato), `${l.nome} = ${l.x}`).toBeLessThan(TOL_CATEGORIA);
    }
  });

  it("rótulo de tipicidade segue os limiares declarados (>=20 / >=10 / >=3)", () => {
    for (const l of linhas) {
      const jogo = R.jogoComCategoria(CATEGORIAS.find((c) => c.nome === l.nome)!.conjunto, l.x)!;
      const r = analisar(jogo, "lotofacil", 1, 25, 5)!;
      const ch = CATEGORIAS.find((c) => c.nome === l.nome)!.chave;
      const esperado = l.codigo >= 20 ? "Muito comum" : l.codigo >= 10 ? "Comum" : l.codigo >= 3 ? "Incomum" : "Raro";
      expect(r[ch].label).toBe(esperado);
    }
  });
});

describe("Analisador — soma e sequência contra a enumeração completa", () => {
  let enumeracao: ReturnType<typeof R.distribuicoesEnumeradas>;
  beforeAll(() => {
    enumeracao = R.distribuicoesEnumeradas();
  }, 60_000);

  it("enumeração cobre exatamente C(25,15) combinações; soma média 195, variância 325", () => {
    expect(enumeracao.total).toBe(3268760);
    let m = 0;
    let q = 0;
    for (const [s, c] of enumeracao.soma) {
      m += s * c;
      q += s * s * c;
    }
    m /= enumeracao.total;
    expect(m).toBeCloseTo(195, 10);
    expect(q / enumeracao.total - m * m).toBeCloseTo(325, 8);
  });

  it("percentil da soma (CDF) = enumeração, para toda soma de 120 a 270", () => {
    let acumulado = 0;
    for (let s = 120; s <= 270; s++) {
      acumulado += enumeracao.soma.get(s) ?? 0;
      const ref = (100 * acumulado) / enumeracao.total;
      // jogo qualquer com soma s: o percentil só depende da soma
      const r = analisar(jogoComSoma(s), "lotofacil", 1, 25, 5)!;
      expect(Math.abs(r.soma.percentil - ref), `soma ${s}`).toBeLessThan(TOL_CDF);
    }
  });

  it("maior sequência: % do código = enumeração (tolerância de arredondamento)", () => {
    for (const [corrida, c] of enumeracao.corrida) {
      const jogo = jogoComCorrida(corrida);
      if (!jogo) continue;
      const r = analisar(jogo, "lotofacil", 1, 25, 5)!;
      expect(r.sequencias.maior).toBe(corrida);
      expect(Math.abs(r.sequencias.pct - (100 * c) / enumeracao.total), `corrida ${corrida}`).toBeLessThan(TOL_CATEGORIA);
    }
  });

  // LF-16 (corrigido): `soma.pct` era uma centralidade exibida como "% das
  // combinações". Agora é o % exato de combinações com soma na mesma faixa
  // de 10 (a faixa das tabelas de soma do site).
  it("LF-16: soma.pct = % de combinações com soma na mesma faixa de 10", () => {
    for (let s = 120; s <= 270; s++) {
      const r = analisar(jogoComSoma(s), "lotofacil", 1, 25, 5)!;
      const ini = Math.floor(s / 10) * 10;
      let naFaixa = 0;
      for (let x = ini; x <= ini + 9; x++) naFaixa += enumeracao.soma.get(x) ?? 0;
      const ref = (100 * naFaixa) / enumeracao.total;
      expect(r.soma.faixaInicio).toBe(ini);
      expect(Math.abs(r.soma.pct - ref), `soma ${s}`).toBeLessThan(1e-9);
      const esperado = ref >= 20 ? "Muito comum" : ref >= 10 ? "Comum" : ref >= 3 ? "Incomum" : "Raro";
      expect(r.soma.label).toBe(esperado);
    }
  });
});

describe("Analisador — entrada", () => {
  it("jogo vazio devolve null", () => {
    expect(analisar([], "lotofacil", 1, 25, 5)).toBeNull();
  });
  // LF-17 (corrigido): com o tamanho do sorteio informado, jogos incompletos
  // ou maiores não são analisados (a tela pede o jogo completo).
  it("LF-17: jogo com 14 ou 16 dezenas não é analisado contra distribuições de 15", () => {
    const quatorze = R.UNIVERSO.slice(0, 14);
    const dezesseis = R.UNIVERSO.slice(0, 16);
    expect(analisar(quatorze, "lotofacil", 1, 25, 5, 15)).toBeNull();
    expect(analisar(dezesseis, "lotofacil", 1, 25, 5, 15)).toBeNull();
    expect(analisar(R.UNIVERSO.slice(0, 15), "lotofacil", 1, 25, 5, 15)).not.toBeNull();
  });
});

// ---- auxiliares --------------------------------------------------------

// Jogo de 15 dezenas com soma s (120..270): parte de 1..15 e desloca as
// maiores dezenas para cima, uma unidade por vez.
function jogoComSoma(s: number): number[] {
  const jogo = Array.from({ length: 15 }, (_, i) => i + 1);
  let falta = s - 120;
  for (let i = 14; i >= 0 && falta > 0; i--) {
    const teto = 25 - (14 - i);
    const passo = Math.min(falta, teto - jogo[i]);
    jogo[i] += passo;
    falta -= passo;
  }
  if (falta !== 0) throw new Error(`soma impossível: ${s}`);
  return jogo;
}

// Jogo de 15 dezenas cuja maior corrida de consecutivas é exatamente c.
function jogoComCorrida(c: number): number[] | null {
  for (let t = 0; t < 20000; t++) {
    const jogo = [...R.UNIVERSO].sort(() => Math.random() - 0.5).slice(0, 15);
    const mask = jogo.reduce((m, d) => m | (1 << (d - 1)), 0);
    if (R.maiorCorrida(mask) === c) return jogo.sort((a, b) => a - b);
  }
  // corridas longas: blocos determinísticos
  if (c >= 8) {
    const bloco = Array.from({ length: c }, (_, i) => i + 1);
    const resto: number[] = [];
    for (let d = c + 2; resto.length < 15 - c && d <= 25; d += 2) resto.push(d);
    const jogo = [...bloco, ...resto];
    if (jogo.length !== 15) return null;
    const mask = jogo.reduce((m, d) => m | (1 << (d - 1)), 0);
    return R.maiorCorrida(mask) === c ? jogo : null;
  }
  return null;
}
