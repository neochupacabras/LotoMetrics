// Auditoria Mega-Sena — fechamentos (lib/fechamento.ts) e planos do bolão
// (lib/bolao-opcoes.ts). A garantia é verificada por um verificador próprio
// (referencia.cobreTodos), não pelo verificarGarantia do código auditado.
import { describe, expect, it } from "vitest";
import { gerarFechamentoReduzido, gerarFechamentoCompleto, verificarGarantia } from "@/lib/fechamento";
import { FECHAMENTO_CONFIG } from "@/lib/fechamento-config";
import { OPCOES_BOLAO, planosViaveis } from "@/lib/bolao-opcoes";
import * as R from "./referencia";

function poolAleatorio(v: number): number[] {
  return [...R.UNIVERSO].sort(() => Math.random() - 0.5).slice(0, v).sort((a, b) => a - b);
}

const opcoes = OPCOES_BOLAO.megasena;
const config = FECHAMENTO_CONFIG.megasena;

describe("configuração", () => {
  it("pools de 7 a 16 dezenas, garantias 4 e 5", () => {
    expect(config.poolMin).toBe(7);
    expect(config.poolMax).toBe(16);
    for (let v = 7; v <= 16; v++) expect(config.getKsPermitidos(v)).toEqual([4, 5]);
  });
  it("a tabela do bolão tem exatamente as 20 combinações permitidas", () => {
    const esperadas: string[] = [];
    for (let v = 7; v <= 16; v++) for (const k of config.getKsPermitidos(v)) esperadas.push(`${v}/${k}`);
    expect(opcoes.map((o) => `${o.tamanhoPool}/${o.garantia}`)).toEqual(esperadas);
  });
});

describe("as 20 opções de fechamento/bolão", () => {
  for (const o of opcoes) {
    it(`pool ${o.tamanhoPool}, garante ${o.garantia}: ${o.totalJogos} jogos válidos e cobertura completa`, () => {
      const pool = poolAleatorio(o.tamanhoPool);
      const r = gerarFechamentoReduzido(pool, 6, o.garantia);
      expect(r.totalTickets).toBe(o.totalJogos);
      expect(r.tickets).toHaveLength(r.totalTickets);
      for (const j of r.tickets) {
        expect(R.jogoValido(j, 6)).toBe(true);
        expect(j.every((d) => pool.includes(d))).toBe(true);
      }
      expect(new Set(r.tickets.map((j) => [...j].sort((a, b) => a - b).join(","))).size).toBe(r.totalTickets);
      expect(R.cobreTodos(pool, r.tickets, o.garantia)).toBe(true);
      expect(r.garantiaVerificada).toBe(true);
      expect(r.totalTickets).toBeGreaterThanOrEqual(R.schonheim(o.tamanhoPool, 6, o.garantia));
      expect(r.totalTickets).toBeLessThanOrEqual(Number(R.comb(o.tamanhoPool, 6)));
    });
  }
});

describe("propriedades", () => {
  it("pools 7 e 8 atingem a cota de Schönheim (ótimos)", () => {
    for (const o of opcoes.filter((o) => o.tamanhoPool <= 8)) {
      expect(o.totalJogos).toBe(R.schonheim(o.tamanhoPool, 6, o.garantia));
    }
  });

  it("completo = todas as C(v,6) combinações distintas do pool", () => {
    for (let v = 7; v <= 12; v++) {
      const pool = poolAleatorio(v);
      const r = gerarFechamentoCompleto(pool, 6);
      expect(BigInt(r.totalTickets)).toBe(R.comb(v, 6));
      expect(new Set(r.tickets.map((j) => j.join(","))).size).toBe(r.totalTickets);
      expect(R.cobreTodos(pool, r.tickets, 6)).toBe(true);
    }
  });

  it("verificarGarantia detecta cobertura quebrada (remove um jogo de um fechamento ótimo)", () => {
    const pool = poolAleatorio(8);
    const r = gerarFechamentoReduzido(pool, 6, 5); // 12 jogos = cota inferior
    const incompleto = r.tickets.slice(1);
    expect(R.cobreTodos(pool, incompleto, 5)).toBe(false);
    expect(verificarGarantia(pool, incompleto, 6, 5)).toBe(false);
  });

  it("a garantia vale contra sorteios simulados (20.000 sorteios, pool 12 / garantia 4)", () => {
    const pool = poolAleatorio(12);
    const r = gerarFechamentoReduzido(pool, 6, 4);
    let condicao = 0;
    for (let t = 0; t < 20000; t++) {
      const sorteio = [...R.UNIVERSO].sort(() => Math.random() - 0.5).slice(0, 6);
      if (R.acertos(pool, sorteio) >= 4) {
        condicao++;
        expect(Math.max(...r.tickets.map((j) => R.acertos(j, sorteio)))).toBeGreaterThanOrEqual(4);
      }
    }
    // P(≥ 4 sorteadas num pool de 12) ≈ 1/84: espera-se ~238 sorteios com a condição
    expect(condicao).toBeGreaterThan(150);
  });

  it("planosViaveis: só planos dentro do orçamento, custo = jogos × R$ 6", () => {
    const planos = planosViaveis("megasena", 1000, R.PRECO_ATUAL);
    expect(planos.length).toBeGreaterThan(0);
    for (const p of planos) {
      expect(p.custoTotal).toBeCloseTo(p.totalJogos * 6, 2);
      expect(p.custoTotal).toBeLessThanOrEqual(1000);
    }
    expect(planos[0].garantia).toBe(5);
    expect(planosViaveis("megasena", 1000, 0)).toEqual([]);
  });

  // MS-20: a garantia está certa, mas o fechamento guloso não é mínimo. Para
  // 12 dezenas e garantia 5 existe o sistema de Steiner S(5,6,12), que cobre
  // todos os 5-subconjuntos com 132 jogos (= cota de Schönheim); o site usa
  // 226. Mudar exige decidir se o site vai usar coberturas conhecidas.
  it("premissa do MS-20: a cota de Schönheim para 12/6/5 é 132 (atingida pelo S(5,6,12))", () => {
    expect(R.schonheim(12, 6, 5)).toBe(132);
    expect(opcoes.find((o) => o.tamanhoPool === 12 && o.garantia === 5)!.totalJogos).toBe(226);
  });
  it.todo("MS-20: fechamento de 12 dezenas com garantia 5 usa no máximo 132 jogos (ou avisa que não é mínimo)");
});
