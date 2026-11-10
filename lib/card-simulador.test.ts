import { describe, expect, it } from "vitest";
import { jogoParaUrl, montarTextoCard, type EntradaCard } from "./card-simulador";

// Intl usa espaço não separável entre "R$" e o valor.
const limpar = (s: string | null) => (s ?? "").replace(/ /g, " ");

const base: EntradaCard = {
  nomeLoteria: "Mega-Sena",
  deLoteria: "da Mega-Sena",
  superSete: false,
  totalConcursos: 100,
  totalGasto: 600,
  totalGanho: 0,
  saldoFinal: -600,
  maiorPremio: null,
};

describe("montarTextoCard", () => {
  it("sem prêmio: diz que não ganharia e quanto gastaria", () => {
    const t = montarTextoCard(base);
    expect(t.premiado).toBe(false);
    expect(t.titulo).toBe("Meu jogo não teria ganho nada");
    expect(t.destaque).toBeNull();
    expect(limpar(t.resumo)).toBe("Em 100 concursos da Mega-Sena, eu gastaria R$ 600,00 sem nenhum prêmio.");
  });

  it("com prêmio: mostra o total, o maior prêmio e o saldo negativo", () => {
    const t = montarTextoCard({
      ...base,
      totalGanho: 1234.56,
      saldoFinal: 634.56,
      maiorPremio: { numero: 2701, acertos: 4, premio: 1234.56 },
    });
    expect(t.premiado).toBe(true);
    expect(limpar(t.titulo)).toBe("Meu jogo teria ganho R$ 1.234,56");
    expect(limpar(t.destaque)).toBe("Maior prêmio: 4 acertos no concurso 2701 (R$ 1.234,56)");
    expect(limpar(t.resumo)).toBe("Em 100 concursos da Mega-Sena, eu gastaria R$ 600,00: saldo positivo de R$ 634,56.");
  });

  it("prêmio menor que o gasto: saldo negativo explícito", () => {
    const t = montarTextoCard({
      ...base,
      totalGanho: 50,
      saldoFinal: -550,
      maiorPremio: { numero: 2990, acertos: 4, premio: 50 },
    });
    expect(limpar(t.resumo)).toContain("saldo de -R$ 550,00");
  });

  it("Super Sete fala em colunas certas", () => {
    const t = montarTextoCard({
      ...base,
      nomeLoteria: "Super Sete",
      deLoteria: "do Super Sete",
      superSete: true,
      totalGanho: 5,
      saldoFinal: -245,
      maiorPremio: { numero: 800, acertos: 3, premio: 5 },
    });
    expect(t.destaque).toContain("3 colunas certas no concurso 800");
    expect(t.resumo).toContain("do Super Sete");
  });

  it("um concurso só: singular", () => {
    expect(montarTextoCard({ ...base, totalConcursos: 1 }).resumo).toContain("Em 1 concurso da");
  });
});

describe("jogoParaUrl", () => {
  it("dezenas com zero à esquerda separadas por traço", () => {
    expect(jogoParaUrl([5, 12, 60])).toBe("05-12-60");
  });
  it("Super Sete: algarismos colados", () => {
    expect(jogoParaUrl([1, 0, 9, 3, 3, 7, 2], true)).toBe("1093372");
  });
});
