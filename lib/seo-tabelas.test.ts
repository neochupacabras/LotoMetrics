import { describe, expect, it } from "vitest";
import { CATEGORIAS } from "./categorias";
import { metadataTextoTabela, tituloBuscaTabela } from "./seo-tabelas";

const ultimo = { numero: 3824, data: "08/11/2026" };

describe("tituloBuscaTabela", () => {
  it("usa as palavras da busca e a preposição certa", () => {
    expect(tituloBuscaTabela("repetidas", "lotofacil", "x")).toBe("Dezenas repetidas da Lotofácil");
    expect(tituloBuscaTabela("duques-trincas", "quina", "x")).toBe("Duplas e trincas que mais saem na Quina");
    expect(tituloBuscaTabela("duques-trincas", "diadesorte", "x")).toBe("Duplas e trincas que mais saem no Dia de Sorte");
    expect(tituloBuscaTabela("frequencia", "supersete", "x")).toBe("Números mais sorteados do Super Sete");
  });

  it("tem versão de busca para todas as categorias", () => {
    for (const c of CATEGORIAS) {
      expect(tituloBuscaTabela(c.slug, "megasena", "FALLBACK")).not.toContain("FALLBACK");
    }
  });

  it("cai no título curto para slug desconhecido", () => {
    expect(tituloBuscaTabela("nova", "megasena", "Nova tabela")).toBe("Nova tabela da Mega-Sena");
  });
});

describe("metadataTextoTabela", () => {
  it("põe o concurso de referência no título e na description", () => {
    const r = metadataTextoTabela("repetidas", "lotofacil", "x", "y", { ultimoConcurso: ultimo });
    expect(r.titulo).toBe("Dezenas repetidas da Lotofácil: tabela até o concurso 3824");
    expect(r.descricao).toContain("Atualizada até o concurso 3824 (08/11/2026).");
  });

  it("mostra quantas dezenas faltam no ciclo", () => {
    const r = metadataTextoTabela("ciclos", "megasena", "x", "y", { ultimoConcurso: ultimo, dezenasFaltantesCiclo: 9 });
    expect(r.descricao).toContain("Ciclo atual: faltam 9 dezenas.");
    const um = metadataTextoTabela("ciclos", "megasena", "x", "y", { ultimoConcurso: ultimo, dezenasFaltantesCiclo: 1 });
    expect(um.descricao).toContain("falta 1 dezena.");
  });

  it("funciona sem dado vivo (banco indisponível)", () => {
    const r = metadataTextoTabela("atraso", "megasena", "x", "y", { ultimoConcurso: null });
    expect(r.titulo).toBe("Dezenas atrasadas da Mega-Sena");
    expect(r.descricao).not.toContain("Atualizada");
  });
});
