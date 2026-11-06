import { describe, expect, it } from "vitest";
import {
  caminhoInterno,
  endpointPermitido,
  normalizarCategorias,
  normalizarLoterias,
  validarInscricao,
} from "@/lib/push/validacao";

const P256DH = "B" + "A".repeat(86);
const AUTH = "a".repeat(22);

describe("endpointPermitido", () => {
  it("aceita os serviços de push dos navegadores", () => {
    expect(endpointPermitido("https://fcm.googleapis.com/fcm/send/abc")).toBe(true);
    expect(endpointPermitido("https://updates.push.services.mozilla.com/wpush/v2/x")).toBe(true);
    expect(endpointPermitido("https://web.push.apple.com/QGx")).toBe(true);
    expect(endpointPermitido("https://wns2-bl2p.notify.windows.com/w/?token=x")).toBe(true);
  });

  it("recusa SSRF: http, host interno, IP, porta, credenciais e sufixos falsos", () => {
    expect(endpointPermitido("http://fcm.googleapis.com/fcm/send/abc")).toBe(false);
    expect(endpointPermitido("https://169.254.169.254/latest/meta-data")).toBe(false);
    expect(endpointPermitido("https://localhost/x")).toBe(false);
    expect(endpointPermitido("https://fcm.googleapis.com:8443/x")).toBe(false);
    expect(endpointPermitido("https://user:pw@fcm.googleapis.com/x")).toBe(false);
    expect(endpointPermitido("https://fcm.googleapis.com.evil.com/x")).toBe(false);
    expect(endpointPermitido("https://evil.com/.push.apple.com")).toBe(false);
    expect(endpointPermitido("https://a.b.push.apple.com/x")).toBe(false);
    expect(endpointPermitido("nada")).toBe(false);
    expect(endpointPermitido(42)).toBe(false);
    expect(endpointPermitido("https://fcm.googleapis.com/" + "x".repeat(2000))).toBe(false);
  });
});

describe("validarInscricao", () => {
  it("aceita uma PushSubscription serializada", () => {
    const sub = { endpoint: "https://fcm.googleapis.com/fcm/send/abc", keys: { p256dh: P256DH, auth: AUTH } };
    expect(validarInscricao(sub)).toEqual({ endpoint: sub.endpoint, p256dh: P256DH, auth: AUTH });
  });

  it("recusa chaves ausentes ou malformadas", () => {
    const endpoint = "https://fcm.googleapis.com/fcm/send/abc";
    expect(validarInscricao({ endpoint })).toBeNull();
    expect(validarInscricao({ endpoint, keys: { p256dh: "curta", auth: AUTH } })).toBeNull();
    expect(validarInscricao({ endpoint, keys: { p256dh: P256DH, auth: "<script>" + "a".repeat(10) } })).toBeNull();
    expect(validarInscricao(null)).toBeNull();
  });
});

describe("normalizarCategorias", () => {
  it("descarta desconhecidas, duplicadas e pessoais sem login", () => {
    expect(normalizarCategorias(["resultado", "resultado", "xss", "meus_jogos"], false)).toEqual(["resultado"]);
    expect(normalizarCategorias(["resultado", "meus_jogos", "bolao"], true)).toEqual(["resultado", "meus_jogos", "bolao"]);
    expect(normalizarCategorias("resultado", true)).toEqual([]);
  });
});

describe("normalizarLoterias", () => {
  it("mantém só códigos válidos", () => {
    expect(normalizarLoterias(["megasena", "megasena", "foo", 1])).toEqual(["megasena"]);
  });
});

describe("caminhoInterno", () => {
  it("só permite caminhos relativos do próprio site", () => {
    expect(caminhoInterno("/megasena/resultados/2800")).toBe("/megasena/resultados/2800");
    expect(caminhoInterno("https://evil.com")).toBe("/");
    expect(caminhoInterno("//evil.com")).toBe("/");
    expect(caminhoInterno("/\\evil.com")).toBe("/");
    expect(caminhoInterno(undefined)).toBe("/");
  });
});
