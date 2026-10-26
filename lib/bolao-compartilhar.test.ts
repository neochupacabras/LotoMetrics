import { describe, expect, it } from "vitest";
import {
  descreverResultado,
  montarMensagemWhatsapp,
  urlWhatsapp,
  type ResumoResultadoBolao,
} from "./bolao-compartilhar";

const base: ResumoResultadoBolao = {
  concurso: 3074,
  melhorAcerto: 5,
  premiados: 2,
  totalJogos: 6,
  premioTotalCents: 6063712,
  porCotaCents: 866244,
  indeterminado: false,
  acumulado: false,
};

describe("descreverResultado", () => {
  it("com prêmio por cota, cita o valor bruto", () => {
    const t = descreverResultado(base);
    expect(t).toContain("5 acertos");
    expect(t).toContain("por cota (bruto)");
    expect(t).toMatch(/8\.662,44/);
  });
  it("sem jogo premiado, diz que não houve prêmio", () => {
    expect(descreverResultado({ ...base, melhorAcerto: 3, premiados: 0, premioTotalCents: 0, porCotaCents: 0 })).toBe(
      "Melhor jogo: 3 acertos — sem prêmio desta vez"
    );
  });
  it("premiado sem valor firme (acumulado/indeterminado): não inventa número", () => {
    const t = descreverResultado({ ...base, premioTotalCents: 0, porCotaCents: 0, acumulado: true, premiados: 1 });
    expect(t).toBe("Melhor jogo: 5 acertos — 1 jogo premiado");
    expect(t).not.toMatch(/R\$/);
  });
  it("singular de acerto", () => {
    expect(descreverResultado({ ...base, melhorAcerto: 1, premiados: 0, porCotaCents: 0, premioTotalCents: 0 })).toContain(
      "1 acerto "
    );
  });
});

describe("mensagem do WhatsApp", () => {
  it("antes do resultado: convida a ver jogos e pagamentos", () => {
    const m = montarMensagemWhatsapp({ titulo: "Bolão da Mega", nomeLoteria: "Mega-Sena", url: "https://x/b/abc" });
    expect(m).toContain('Bolão "Bolão da Mega" (Mega-Sena)');
    expect(m).toContain("quem já pagou");
    expect(m.endsWith("https://x/b/abc")).toBe(true);
  });
  it("com resultado: traz o concurso, o destaque e o link", () => {
    const m = montarMensagemWhatsapp({
      titulo: "Bolão da Mega",
      nomeLoteria: "Mega-Sena",
      url: "https://x/b/abc",
      resultado: base,
    });
    expect(m).toContain("concurso 3074");
    expect(m).toContain("5 acertos");
    expect(m.endsWith("https://x/b/abc")).toBe(true);
  });
  it("urlWhatsapp codifica o texto", () => {
    const u = urlWhatsapp("a b\nc&d");
    expect(u).toBe("https://wa.me/?text=a%20b%0Ac%26d");
  });
});
