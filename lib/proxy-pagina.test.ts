import { describe, expect, it } from "vitest";
import { destinoPaginaResultados } from "../proxy";

const d = (u: string) => destinoPaginaResultados(new URL(u, "https://lotoanalitica.com.br"))?.toString() ?? null;

describe("destinoPaginaResultados", () => {
  it("leva ?pagina=N para /resultados/pagina/N sem repetir a query", () => {
    expect(d("/megasena/resultados?pagina=5")).toBe("https://lotoanalitica.com.br/megasena/resultados/pagina/5");
  });
  it("mantém outros parâmetros", () => {
    expect(d("/quina/resultados?pagina=3&utm_source=x")).toBe(
      "https://lotoanalitica.com.br/quina/resultados/pagina/3?utm_source=x"
    );
  });
  it("página 1 ou valor inválido vai para o hub", () => {
    expect(d("/megasena/resultados?pagina=1")).toBe("https://lotoanalitica.com.br/megasena/resultados");
    expect(d("/megasena/resultados?pagina=abc")).toBe("https://lotoanalitica.com.br/megasena/resultados");
    expect(d("/megasena/resultados?pagina=0")).toBe("https://lotoanalitica.com.br/megasena/resultados");
  });
  it("ignora outras rotas e o hub sem ?pagina", () => {
    expect(d("/megasena/resultados")).toBeNull();
    expect(d("/megasena/resultados/3080?pagina=2")).toBeNull();
    expect(d("/conta?pagina=2")).toBeNull();
  });
});
