import { describe, expect, it } from "vitest";
import {
  assinaturaRenovaSozinha,
  inicioDoNovoPeriodo,
  somarDias,
  trialEndDoCheckout,
} from "./renovacao";

const AGORA = new Date("2026-11-11T12:00:00Z");
const seg = (iso: string) => Math.floor(new Date(iso).getTime() / 1000);

describe("inicioDoNovoPeriodo", () => {
  it("sem crédito, começa agora", () => {
    expect(inicioDoNovoPeriodo(AGORA, null, undefined)).toEqual(AGORA);
  });
  it("crédito vencido não conta", () => {
    expect(inicioDoNovoPeriodo(AGORA, "2026-11-01T00:00:00Z")).toEqual(AGORA);
  });
  it("Pix sobre Pix: começa no fim do crédito atual", () => {
    expect(inicioDoNovoPeriodo(AGORA, "2026-11-20T00:00:00Z")).toEqual(new Date("2026-11-20T00:00:00Z"));
  });
  it("Pix com cartão ativo: começa no fim do período pago, mesmo se o perfil disser menos", () => {
    expect(
      inicioDoNovoPeriodo(AGORA, "2026-11-20T00:00:00Z", "2026-12-05T00:00:00Z")
    ).toEqual(new Date("2026-12-05T00:00:00Z"));
  });
  it("data inválida é ignorada", () => {
    expect(inicioDoNovoPeriodo(AGORA, "lixo")).toEqual(AGORA);
  });
});

describe("somarDias", () => {
  it("30 dias depois do fim do período", () => {
    expect(somarDias(new Date("2026-12-05T00:00:00Z"), 30)).toEqual(new Date("2027-01-04T00:00:00Z"));
  });
});

describe("trialEndDoCheckout", () => {
  it("sem crédito: fluxo normal (null)", () => {
    expect(trialEndDoCheckout({ agora: AGORA, creditoAte: null, elegivelParaTrial: true })).toBeNull();
    expect(trialEndDoCheckout({ agora: AGORA, creditoAte: "2026-11-10T00:00:00Z", elegivelParaTrial: false })).toBeNull();
  });
  it("crédito Pix de 20 dias: primeira cobrança no fim do crédito", () => {
    expect(
      trialEndDoCheckout({ agora: AGORA, creditoAte: "2026-12-01T12:00:00Z", elegivelParaTrial: false })
    ).toBe(seg("2026-12-01T12:00:00Z"));
  });
  it("crédito maior que o teste: vale o crédito (o teste não soma)", () => {
    expect(
      trialEndDoCheckout({ agora: AGORA, creditoAte: "2026-12-01T12:00:00Z", elegivelParaTrial: true })
    ).toBe(seg("2026-12-01T12:00:00Z"));
  });
  it("crédito menor que o teste de 7 dias: vale o teste", () => {
    expect(
      trialEndDoCheckout({ agora: AGORA, creditoAte: "2026-11-14T12:00:00Z", elegivelParaTrial: true })
    ).toBe(seg("2026-11-18T12:00:00Z"));
  });
  it("crédito acabando em menos de 48 h: usa o mínimo do Stripe (49 h)", () => {
    expect(
      trialEndDoCheckout({ agora: AGORA, creditoAte: "2026-11-12T00:00:00Z", elegivelParaTrial: false })
    ).toBe(seg("2026-11-13T13:00:00Z"));
  });
});

describe("assinaturaRenovaSozinha", () => {
  it("ativa ou em teste, sem cancelamento marcado", () => {
    expect(assinaturaRenovaSozinha({ status: "active", cancel_at_period_end: false })).toBe(true);
    expect(assinaturaRenovaSozinha({ status: "trialing", cancel_at_period_end: false, cancel_at: null })).toBe(true);
  });
  it("marcada para cancelar, em atraso ou cancelada: não mexe", () => {
    expect(assinaturaRenovaSozinha({ status: "active", cancel_at_period_end: true })).toBe(false);
    expect(assinaturaRenovaSozinha({ status: "active", cancel_at_period_end: false, cancel_at: 1 })).toBe(false);
    expect(assinaturaRenovaSozinha({ status: "past_due", cancel_at_period_end: false })).toBe(false);
    expect(assinaturaRenovaSozinha({ status: "canceled", cancel_at_period_end: false })).toBe(false);
  });
});
