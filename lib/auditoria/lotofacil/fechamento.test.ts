// Auditoria Lotofácil — fechamentos e tabela do bolão.
// A garantia "se >= k das sorteadas estiverem no pool, algum jogo faz >= k"
// equivale a cobrir todo k-subconjunto do pool; aqui ela é conferida por um
// verificador próprio (./referencia.ts), não por verificarGarantia().
import { describe, expect, it } from "vitest";
import { gerarFechamentoCompleto, gerarFechamentoReduzido, verificarGarantia } from "@/lib/fechamento";
import { FECHAMENTO_CONFIG } from "@/lib/fechamento-config";
import { OPCOES_BOLAO, planosViaveis } from "@/lib/bolao-opcoes";
import * as R from "./referencia";

function poolAleatorio(v: number): number[] {
  return [...R.UNIVERSO].sort(() => Math.random() - 0.5).slice(0, v);
}

describe("configuração do fechamento da Lotofácil", () => {
  const cfg = FECHAMENTO_CONFIG.lotofacil;
  it("pool entre 16 e 20 (acima do mínimo 15, até o máximo oficial 20)", () => {
    expect(cfg.poolMin).toBe(16);
    expect(cfg.poolMax).toBe(20);
  });
  it("garantias oferecidas são faixas premiadas (11 a 14)", () => {
    for (let v = 16; v <= 20; v++) {
      for (const k of cfg.getKsPermitidos(v)) {
        expect(k).toBeGreaterThanOrEqual(11);
        expect(k).toBeLessThanOrEqual(14);
      }
    }
  });
  it("a tabela do bolão tem exatamente as combinações permitidas", () => {
    const permitidas = [];
    for (let v = 16; v <= 20; v++) for (const k of cfg.getKsPermitidos(v)) permitidas.push(`${v}/${k}`);
    expect(OPCOES_BOLAO.lotofacil.map((o) => `${o.tamanhoPool}/${o.garantia}`).sort()).toEqual(permitidas.sort());
  });
});

// Pools 16–18 rodam sempre (< 0,5 s cada). 19 e 20 levam 1–3 s cada.
const opcoes = OPCOES_BOLAO.lotofacil;
describe.each(opcoes)("fechamento reduzido pool $tamanhoPool, garantia $garantia", (o) => {
  it(
    "jogos válidos, sem duplicata, garantia verificada e total igual à tabela do bolão",
    () => {
      const pool = poolAleatorio(o.tamanhoPool);
      const r = gerarFechamentoReduzido(pool, 15, o.garantia);
      for (const j of r.tickets) {
        expect(R.jogoValido(j)).toBe(true);
        expect(j.every((d) => pool.includes(d))).toBe(true);
      }
      expect(new Set(r.tickets.map((j) => [...j].sort((a, b) => a - b).join(","))).size).toBe(r.tickets.length);
      expect(r.garantiaVerificada).toBe(true);
      expect(R.cobreTodosKSubconjuntos(pool, r.tickets, o.garantia)).toBe(true);
      expect(r.totalTickets).toBe(o.totalJogos);
      expect(r.totalTickets).toBeGreaterThanOrEqual(R.limiteSchonheim(o.tamanhoPool, o.garantia));
      expect(r.totalTickets).toBeLessThan(Number(R.comb(o.tamanhoPool, 15)));
    },
    20_000
  );
});

describe("fechamento — propriedades", () => {
  it("pools 16 e 17 atingem o limite inferior de Schönheim (ótimos)", () => {
    for (const o of opcoes.filter((o) => o.tamanhoPool <= 17)) {
      expect(o.totalJogos).toBe(R.limiteSchonheim(o.tamanhoPool, o.garantia));
    }
  });

  it("completo = todas as C(v,15) combinações distintas do pool", () => {
    for (let v = 16; v <= 18; v++) {
      const pool = poolAleatorio(v);
      const r = gerarFechamentoCompleto(pool, 15);
      expect(BigInt(r.totalTickets)).toBe(R.comb(v, 15));
      expect(new Set(r.tickets.map((j) => j.join(","))).size).toBe(r.totalTickets);
      expect(R.cobreTodosKSubconjuntos(pool, r.tickets, 15)).toBe(true);
    }
  });

  it("verificarGarantia detecta cobertura quebrada (remove um jogo necessário)", () => {
    const pool = poolAleatorio(16);
    const r = gerarFechamentoReduzido(pool, 15, 14); // ótimo: nenhum jogo é dispensável
    const incompleto = r.tickets.slice(1);
    expect(R.cobreTodosKSubconjuntos(pool, incompleto, 14)).toBe(false);
    expect(verificarGarantia(pool, incompleto, 15, 14)).toBe(false);
  });

  it("garantia vale de fato contra sorteios simulados (5.000 sorteios, pool 18 / k 13)", () => {
    const pool = poolAleatorio(18);
    const r = gerarFechamentoReduzido(pool, 15, 13);
    for (let t = 0; t < 5000; t++) {
      const sorteio = [...R.UNIVERSO].sort(() => Math.random() - 0.5).slice(0, 15);
      if (R.acertos(pool, sorteio) >= 13) {
        expect(Math.max(...r.tickets.map((j) => R.acertos(j, sorteio)))).toBeGreaterThanOrEqual(13);
      }
    }
  });

  it("planosViaveis: só planos que cabem no orçamento, custo = jogos x preço", () => {
    const planos = planosViaveis("lotofacil", 500, 3.5);
    expect(planos.length).toBeGreaterThan(0);
    for (const p of planos) {
      expect(p.custoTotal).toBeCloseTo(p.totalJogos * 3.5, 2);
      expect(p.custoTotal).toBeLessThanOrEqual(500);
    }
    expect(planosViaveis("lotofacil", 500, 0)).toEqual([]);
  });

  // LF-23: o rótulo "Completo ... garante o prêmio máximo" não mostra a
  // condição (as 15 sorteadas no pool) nem a probabilidade dela. Teste de
  // interface — fica para a correção.
  it.todo("LF-23: fechamento completo exibe P(15 sorteadas no pool) — pool 18: 1 em 4.006");
});
