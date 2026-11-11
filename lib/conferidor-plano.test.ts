import { describe, expect, it } from "vitest";
import {
  JANELA_CONFERENCIAS_MS,
  LIMITE_CONFERENCIAS_FREE,
  conferenciasRestantes,
  lerConferencias,
  registrarConferencia,
} from "./conferidor-plano";

const SEGREDO = "segredo-de-teste";
const AGORA = 1_800_000_000_000;
const HORA = 60 * 60 * 1000;

// Monta um cookie como o servidor faria, uma conferência por vez.
function cookieCom(instantes: number[], segredo = SEGREDO): string | undefined {
  let cookie: string | undefined;
  for (const t of instantes) {
    cookie = registrarConferencia(lerConferencias(cookie, segredo, t), segredo, t);
  }
  return cookie;
}

describe("limite do plano gratuito", () => {
  it("são 3 conferências", () => {
    expect(LIMITE_CONFERENCIAS_FREE).toBe(3);
  });

  it("sem cookie, nada foi usado", () => {
    const usadas = lerConferencias(undefined, SEGREDO, AGORA);
    expect(usadas).toEqual([]);
    expect(conferenciasRestantes(usadas)).toBe(3);
  });

  it("conta cada conferência gravada", () => {
    const cookie = cookieCom([AGORA - 2 * HORA, AGORA - HORA]);
    const usadas = lerConferencias(cookie, SEGREDO, AGORA);
    expect(usadas).toEqual([AGORA - 2 * HORA, AGORA - HORA]);
    expect(conferenciasRestantes(usadas)).toBe(1);
  });

  it("a 4ª conferência em 24 h não tem crédito", () => {
    const cookie = cookieCom([AGORA - 3 * HORA, AGORA - 2 * HORA, AGORA - HORA]);
    expect(conferenciasRestantes(lerConferencias(cookie, SEGREDO, AGORA))).toBe(0);
  });

  it("a janela é móvel: a conferência mais antiga libera crédito ao fazer 24 h", () => {
    const antiga = AGORA - JANELA_CONFERENCIAS_MS;
    const cookie = cookieCom([antiga, AGORA - 2 * HORA, AGORA - HORA]);
    const usadas = lerConferencias(cookie, SEGREDO, AGORA);
    expect(usadas).toEqual([AGORA - 2 * HORA, AGORA - HORA]);
    expect(conferenciasRestantes(usadas)).toBe(1);
  });

  it("o cookie guarda no máximo o limite, sempre as mais recentes", () => {
    const instantes = [1, 2, 3, 4, 5].map((h) => AGORA - (6 - h) * HORA);
    const usadas = lerConferencias(cookieCom(instantes), SEGREDO, AGORA);
    expect(usadas).toEqual(instantes.slice(-3));
  });
});

describe("assinatura do cookie", () => {
  const cheio = cookieCom([AGORA - 3 * HORA, AGORA - 2 * HORA, AGORA - HORA])!;

  it("assinado com outro segredo vale como nada usado", () => {
    const forjado = cookieCom([AGORA - HORA], "outro-segredo");
    expect(lerConferencias(forjado, SEGREDO, AGORA)).toEqual([]);
  });

  it("payload trocado sem reassinar é rejeitado (não zera a conta de quem estourou)", () => {
    const [versao, , assinatura] = cheio.split(".");
    const payloadVazio = Buffer.from("[]").toString("base64url");
    const adulterado = `${versao}.${payloadVazio}.${assinatura}`;
    // Inválido conta como nada usado, o mesmo que apagar o cookie; o que
    // importa é que o servidor nunca aceita a lista adulterada como válida.
    expect(lerConferencias(adulterado, SEGREDO, AGORA)).toEqual([]);
  });

  it("forjar um cookie que estoure o limite não funciona", () => {
    const [versao, , assinatura] = cookieCom([AGORA - HORA])!.split(".");
    const muitas = Array.from({ length: 50 }, (_, i) => AGORA - i * 1000);
    const payload = Buffer.from(JSON.stringify(muitas)).toString("base64url");
    expect(lerConferencias(`${versao}.${payload}.${assinatura}`, SEGREDO, AGORA)).toEqual([]);
  });

  it("assinatura truncada, versão errada ou lixo valem como nada usado", () => {
    const [versao, payload, assinatura] = cheio.split(".");
    expect(lerConferencias(`${versao}.${payload}.${assinatura.slice(0, -2)}`, SEGREDO, AGORA)).toEqual([]);
    expect(lerConferencias(`v9.${payload}.${assinatura}`, SEGREDO, AGORA)).toEqual([]);
    expect(lerConferencias("lixo", SEGREDO, AGORA)).toEqual([]);
    expect(lerConferencias("v1..", SEGREDO, AGORA)).toEqual([]);
  });

  it("cookie válido devolve só instantes numéricos", () => {
    const usadas = lerConferencias(cheio, SEGREDO, AGORA);
    expect(usadas).toHaveLength(3);
    expect(usadas.every((t) => typeof t === "number")).toBe(true);
  });

  it("instante no futuro é descartado", () => {
    const cookie = cookieCom([AGORA + HORA]);
    expect(lerConferencias(cookie, SEGREDO, AGORA)).toEqual([]);
  });
});
