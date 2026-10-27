import { describe, it, expect } from "vitest";
import { mascararEmails } from "./telemetry";

// Regressão SEC-3.3 (LGPD): e-mails nunca devem ser persistidos em claro nos
// logs de telemetria. mascararEmails roda no sink (logToolEvent/logJobRun/
// logError), então este teste trava o comportamento de mascaramento.
describe("mascararEmails", () => {
  it("mascara o local-part preservando a 1ª letra e o domínio", () => {
    expect(mascararEmails("joao.silva@gmail.com")).toBe("j***@gmail.com");
    expect(mascararEmails("a@b.co")).toBe("a***@b.co");
  });

  it("mascara vários e-mails numa mesma string (ex.: detalhes de job)", () => {
    expect(mascararEmails("ana@x.com: enviado; bruno@y.com.br: falhou")).toBe(
      "a***@x.com: enviado; b***@y.com.br: falhou"
    );
  });

  it("mascara e-mails embutidos em JSON serializado", () => {
    const json = JSON.stringify({ detalhes: [{ email: "maria@teste.org", status: "falhou" }] });
    const mascarado = mascararEmails(json);
    expect(mascarado).toContain("m***@teste.org");
    expect(mascarado).not.toContain("maria@teste.org");
    // Continua sendo JSON válido depois do mascaramento.
    expect(() => JSON.parse(mascarado)).not.toThrow();
  });

  it("não altera texto sem e-mail", () => {
    expect(mascararEmails("job concluído: 42 linhas")).toBe("job concluído: 42 linhas");
  });
});
