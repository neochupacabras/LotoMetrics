import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CATEGORIAS,
  FERRAMENTAS,
  buscarFerramentas,
  disponivelEm,
  extraPremiumEm,
  ferramentaDaUrl,
  hrefFerramenta,
  normalizar,
} from "./ferramentas";

describe("registro de ferramentas", () => {
  it("tem toda aba do Subnav (fonte das páginas por loteria)", () => {
    const fonte = readFileSync(join(__dirname, "..", "components", "Subnav.tsx"), "utf8");
    const bloco = fonte.slice(fonte.indexOf("ABAS_COMPLETAS"), fonte.indexOf("];", fonte.indexOf("ABAS_COMPLETAS")));
    const slugs = [...bloco.matchAll(/slug:\s*"([a-z-]+)"/g)].map((m) => m[1]);
    expect(slugs.length).toBeGreaterThan(10);
    const abas = FERRAMENTAS.flatMap((f) => (f.tipo === "loteria" ? [f.aba] : []));
    expect(abas.sort()).toEqual([...slugs].sort());
  });

  it("ids únicos e categorias válidas", () => {
    const ids = FERRAMENTAS.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
    const categorias = new Set(CATEGORIAS.map((c) => c.id));
    for (const f of FERRAMENTAS) expect(categorias.has(f.categoria)).toBe(true);
  });

  it("toda categoria tem ao menos uma ferramenta", () => {
    for (const c of CATEGORIAS) {
      expect(FERRAMENTAS.some((f) => f.categoria === c.id)).toBe(true);
    }
  });
});

describe("disponibilidade e endereço", () => {
  const bolao = FERRAMENTAS.find((f) => f.id === "bolao")!;
  const calendario = FERRAMENTAS.find((f) => f.id === "calendario")!;

  it("respeita as exclusões por loteria", () => {
    expect(disponivelEm(bolao, "megasena")).toBe(true);
    expect(disponivelEm(bolao, "lotomania")).toBe(false);
    expect(disponivelEm(calendario, "supersete")).toBe(true);
  });

  it("monta o href com a loteria só nas ferramentas por loteria", () => {
    expect(hrefFerramenta(bolao, "quina")).toBe("/quina/bolao");
    expect(hrefFerramenta(calendario, "quina")).toBe("/calendario");
  });
});

describe("busca", () => {
  it("ignora acento e caixa", () => {
    expect(normalizar("Estatísticas ")).toBe("estatisticas");
    expect(buscarFerramentas("estatistica").map((f) => f.id)).toContain("tabelas");
  });

  it("acha por sinônimo e exige todas as palavras", () => {
    expect(buscarFerramentas("foto").map((f) => f.id)).toEqual(["conferidor"]);
    // "teria" também aparece dentro de "loteria": entra, mas depois.
    expect(buscarFerramentas("teria ganho")[0].id).toBe("simulador");
    expect(buscarFerramentas("gerador")[0].id).toBe("gerador");
    expect(buscarFerramentas("bolão xyz")).toEqual([]);
  });

  it("consulta vazia devolve tudo", () => {
    expect(buscarFerramentas("  ")).toHaveLength(FERRAMENTAS.length);
  });
});

describe("ferramentaDaUrl", () => {
  it("reconhece ferramenta por loteria", () => {
    expect(ferramentaDaUrl("/megasena/gerador")).toMatchObject({ loteria: "megasena", ferramenta: { id: "gerador" } });
    expect(ferramentaDaUrl("/quina/resultados/pagina/3")).toMatchObject({ ferramenta: { id: "resultados" } });
  });

  it("ignora o que não é ferramenta de loteria", () => {
    expect(ferramentaDaUrl("/conta/jogos")).toBeNull();
    expect(ferramentaDaUrl("/dicas/atraso")).toBeNull();
    expect(ferramentaDaUrl("/lotomania/bolao")).toBeNull(); // não existe para a Lotomania
    expect(ferramentaDaUrl("/")).toBeNull();
  });
});

describe("extraPremiumEm", () => {
  const conferidor = FERRAMENTAS.find((f) => f.id === "conferidor")!;
  const gerador = FERRAMENTAS.find((f) => f.id === "gerador")!;

  it("só promete foto do bilhete onde há OCR", () => {
    expect(extraPremiumEm(conferidor, "megasena")).toMatch(/foto/);
    expect(extraPremiumEm(conferidor, "lotofacil")).toMatch(/foto/);
    expect(extraPremiumEm(conferidor, "quina")).toBe("Jogos ilimitados");
  });

  it("nas demais, o extra é o do registro", () => {
    expect(extraPremiumEm(gerador, "quina")).toBe(gerador.extraPremium);
  });
});
