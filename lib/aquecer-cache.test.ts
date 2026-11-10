import { describe, expect, it } from "vitest";
import { aquecerUrls, USER_AGENT_AQUECIMENTO } from "./aquecer-cache";

function respostaFalsa(status: number, cache?: string): Response {
  return new Response("ok", { status, headers: cache ? { "x-vercel-cache": cache } : {} });
}

describe("aquecerUrls", () => {
  it("visita todas as URLs e conta o estado do cache", async () => {
    const vistas: string[] = [];
    const fetchImpl = (async (url: string, init?: RequestInit) => {
      vistas.push(url);
      expect((init?.headers as Record<string, string>)["User-Agent"]).toBe(USER_AGENT_AQUECIMENTO);
      return respostaFalsa(200, url.endsWith("/1") ? "MISS" : "STALE");
    }) as unknown as typeof fetch;

    const r = await aquecerUrls(["https://x/1", "https://x/2", "https://x/3"], { fetchImpl });

    expect(vistas.sort()).toEqual(["https://x/1", "https://x/2", "https://x/3"]);
    expect(r).toMatchObject({ total: 3, visitadas: 3, ok: 3, puladas: 0, falhas: [] });
    expect(r.cache).toEqual({ MISS: 1, STALE: 2 });
  });

  it("registra erro HTTP e exceção sem interromper as outras URLs", async () => {
    const fetchImpl = (async (url: string) => {
      if (url.endsWith("/404")) return respostaFalsa(404);
      if (url.endsWith("/erro")) throw new Error("falha de rede");
      return respostaFalsa(200, "HIT");
    }) as unknown as typeof fetch;

    const r = await aquecerUrls(["https://x/404", "https://x/erro", "https://x/ok"], { fetchImpl });

    expect(r.ok).toBe(1);
    expect(r.falhas).toEqual(
      expect.arrayContaining([
        { url: "https://x/404", erro: "HTTP 404" },
        { url: "https://x/erro", erro: "falha de rede" },
      ])
    );
    expect(r.cache).toEqual({ "sem-cabecalho": 1, HIT: 1 });
  });

  it("não passa da concorrência pedida", async () => {
    let emAndamento = 0;
    let maximo = 0;
    const fetchImpl = (async () => {
      emAndamento++;
      maximo = Math.max(maximo, emAndamento);
      await new Promise((r) => setTimeout(r, 5));
      emAndamento--;
      return respostaFalsa(200);
    }) as unknown as typeof fetch;

    await aquecerUrls(Array.from({ length: 10 }, (_, i) => `https://x/${i}`), { fetchImpl, concorrencia: 2 });
    expect(maximo).toBe(2);
  });

  it("pula o que não começou dentro do prazo total", async () => {
    const fetchImpl = (async () => {
      await new Promise((r) => setTimeout(r, 30));
      return respostaFalsa(200);
    }) as unknown as typeof fetch;

    const r = await aquecerUrls(["https://x/1", "https://x/2", "https://x/3"], {
      fetchImpl,
      concorrencia: 1,
      prazoMs: 10,
    });
    expect(r.visitadas).toBe(1);
    expect(r.puladas).toBe(2);
  });

  it("lista vazia não faz nada", async () => {
    const r = await aquecerUrls([], { fetchImpl: (() => { throw new Error("não devia chamar"); }) as unknown as typeof fetch });
    expect(r).toMatchObject({ total: 0, visitadas: 0, ok: 0 });
  });
});
