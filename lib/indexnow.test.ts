import { afterEach, describe, expect, it, vi } from "vitest";
import { enviarIndexNow, urlsParaConcursos } from "./indexnow";
import { getCategoriasParaLoteria } from "./categorias";

const BASE = "https://exemplo.test";

describe("urlsParaConcursos", () => {
  it("inclui concurso, resultados, tabelas da loteria e home", () => {
    const urls = urlsParaConcursos([{ loteria: "megasena", numero: 2900 }], BASE);
    expect(urls).toContain(`${BASE}/megasena/resultados/2900`);
    expect(urls).toContain(`${BASE}/megasena/resultados`);
    expect(urls).toContain(`${BASE}/megasena/tabelas`);
    expect(urls).toContain(`${BASE}/megasena/tabelas/frequencia`);
    expect(urls).toContain(BASE);
    expect(urls).toHaveLength(4 + getCategoriasParaLoteria("megasena").length);
  });

  it("não repete as URLs da loteria quando entram dois concursos", () => {
    const urls = urlsParaConcursos(
      [{ loteria: "quina", numero: 10 }, { loteria: "quina", numero: 11 }],
      BASE
    );
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls).toContain(`${BASE}/quina/resultados/11`);
  });

  it("respeita as categorias excluídas da loteria", () => {
    const urls = urlsParaConcursos([{ loteria: "supersete", numero: 1 }], BASE);
    const esperadas = getCategoriasParaLoteria("supersete").map((c) => `${BASE}/supersete/tabelas/${c.slug}`);
    expect(urls.filter((u) => u.includes("/tabelas/"))).toEqual(esperadas);
  });

  it("ignora loteria desconhecida e número inválido", () => {
    expect(
      urlsParaConcursos(
        [
          { loteria: "../admin", numero: 1 },
          { loteria: "megasena", numero: -3 },
          { loteria: "megasena", numero: 1.5 },
        ],
        BASE
      )
    ).toEqual([]);
  });
});

describe("enviarIndexNow", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("não envia fora de produção", async () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const r = await enviarIndexNow(["https://lotoanalitica.com.br/"]);
    expect(r).toMatchObject({ enviado: false, motivo: "fora de produção" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("devolve falha sem lançar quando a API responde erro", async () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("chave inválida", { status: 403 })));
    const r = await enviarIndexNow(["https://lotoanalitica.com.br/"]);
    expect(r).toMatchObject({ enviado: false, status: 403 });
  });

  it("devolve falha sem lançar quando a rede cai", async () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNRESET")));
    const r = await enviarIndexNow(["https://lotoanalitica.com.br/"]);
    expect(r).toMatchObject({ enviado: false, motivo: "ECONNRESET" });
  });

  it("aceita 200 e 202 e manda chave e host no corpo", async () => {
    vi.stubEnv("VERCEL_ENV", "production");
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 202 }));
    vi.stubGlobal("fetch", fetchMock);
    const r = await enviarIndexNow(["https://lotoanalitica.com.br/megasena/resultados"]);
    expect(r).toMatchObject({ enviado: true, status: 202 });
    const corpo = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(corpo.key).toMatch(/^[0-9a-f]{32}$/);
    expect(corpo.keyLocation).toBe(`https://lotoanalitica.com.br/${corpo.key}.txt`);
    expect(corpo.urlList).toHaveLength(1);
  });
});
