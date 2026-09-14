import { describe, expect, it } from "vitest";
import {
  chaveNewsletterSemanal,
  chavePixVencendo,
  contarSequenciaAcumulada,
  deveAlertarAcumulo,
  diasAteExpirar,
  escolherLoteriaDestaqueSemana,
} from "./regras";

describe("contarSequenciaAcumulada", () => {
  it("conta a sequência a partir do concurso mais recente", () => {
    const concursos = [
      { numero: 3060, acumulado: true },
      { numero: 3059, acumulado: true },
      { numero: 3058, acumulado: true },
      { numero: 3057, acumulado: false },
      { numero: 3056, acumulado: true },
    ];
    expect(contarSequenciaAcumulada(concursos)).toBe(3);
  });

  it("é 0 quando o mais recente não acumulou", () => {
    expect(contarSequenciaAcumulada([{ numero: 1, acumulado: false }])).toBe(0);
  });

  it("é 0 pra lista vazia", () => {
    expect(contarSequenciaAcumulada([])).toBe(0);
  });
});

describe("deveAlertarAcumulo", () => {
  it("dispara pelo valor mesmo sem sorteios_sem_ganhador configurado", () => {
    const ok = deveAlertarAcumulo({ thresholdBrl: 80_000_000, sorteiosSemGanhador: null }, 85_000_000, 1);
    expect(ok).toBe(true);
  });

  it("não dispara se o valor ainda não bateu o threshold", () => {
    const ok = deveAlertarAcumulo({ thresholdBrl: 80_000_000, sorteiosSemGanhador: null }, 79_000_000, 1);
    expect(ok).toBe(false);
  });

  it("dispara pela sequência mesmo sem threshold de valor configurado", () => {
    const ok = deveAlertarAcumulo({ thresholdBrl: null, sorteiosSemGanhador: 5 }, null, 5);
    expect(ok).toBe(true);
  });

  it("qualquer um dos dois critérios já basta", () => {
    const ok = deveAlertarAcumulo({ thresholdBrl: 80_000_000, sorteiosSemGanhador: 5 }, 90_000_000, 1);
    expect(ok).toBe(true);
  });

  it("sem nenhum critério configurado, nunca dispara", () => {
    const ok = deveAlertarAcumulo({ thresholdBrl: null, sorteiosSemGanhador: null }, 999_000_000, 99);
    expect(ok).toBe(false);
  });
});

describe("chavePixVencendo", () => {
  it("inclui a data de expiração, pra não colidir com um ciclo futuro", () => {
    expect(chavePixVencendo("2026-10-13T16:24:30.655Z", 5)).toBe("pix:2026-10-13:5");
    expect(chavePixVencendo("2026-10-13T16:24:30.655Z", 1)).toBe("pix:2026-10-13:1");
  });

  it("datas de expiração diferentes geram chaves diferentes", () => {
    const a = chavePixVencendo("2026-10-13T00:00:00.000Z", 5);
    const b = chavePixVencendo("2027-04-13T00:00:00.000Z", 5);
    expect(a).not.toBe(b);
  });
});

describe("diasAteExpirar", () => {
  it("arredonda pra baixo", () => {
    const agora = new Date("2026-10-08T10:00:00Z");
    const expira = new Date("2026-10-13T09:00:00Z"); // quase 5 dias, mas não chegou
    expect(diasAteExpirar(agora, expira)).toBe(4);
  });

  it("é negativo quando já expirou", () => {
    const agora = new Date("2026-10-20T00:00:00Z");
    const expira = new Date("2026-10-13T00:00:00Z");
    expect(diasAteExpirar(agora, expira)).toBeLessThan(0);
  });
});

describe("chaveNewsletterSemanal", () => {
  it("usa a data (AAAA-MM-DD) como chave", () => {
    expect(chaveNewsletterSemanal(new Date("2026-09-14T10:00:00Z"))).toBe("newsletter:2026-09-14");
  });

  it("datas diferentes geram chaves diferentes", () => {
    const a = chaveNewsletterSemanal(new Date("2026-09-14T00:00:00Z"));
    const b = chaveNewsletterSemanal(new Date("2026-09-21T00:00:00Z"));
    expect(a).not.toBe(b);
  });
});

describe("escolherLoteriaDestaqueSemana", () => {
  it("escolhe a loteria acumulada com o maior prêmio estimado", () => {
    const escolhida = escolherLoteriaDestaqueSemana(
      [
        { codigo: "quina", acumulado: true, valorEstimadoProximo: 5_000_000 },
        { codigo: "megasena", acumulado: true, valorEstimadoProximo: 45_000_000 },
        { codigo: "lotofacil", acumulado: false, valorEstimadoProximo: 8_000_000 },
      ],
      "lotofacil"
    );
    expect(escolhida).toBe("megasena");
  });

  it("cai pro padrão quando nenhuma loteria está acumulada", () => {
    const escolhida = escolherLoteriaDestaqueSemana(
      [
        { codigo: "quina", acumulado: false, valorEstimadoProximo: null },
        { codigo: "megasena", acumulado: false, valorEstimadoProximo: null },
      ],
      "lotofacil"
    );
    expect(escolhida).toBe("lotofacil");
  });

  it("ignora acumulada sem valor estimado", () => {
    const escolhida = escolherLoteriaDestaqueSemana(
      [{ codigo: "duplasena", acumulado: true, valorEstimadoProximo: null }],
      "lotofacil"
    );
    expect(escolhida).toBe("lotofacil");
  });
});
