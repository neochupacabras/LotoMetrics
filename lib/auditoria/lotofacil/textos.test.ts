// Auditoria Lotofácil — regressão dos textos corrigidos (Etapa 1 do plano).
// Lê o código-fonte das páginas e artigos e confere os números citados contra
// a referência independente (./referencia.ts) e contra a tabela real do
// algoritmo de fechamento. Também impede que frases comprovadamente falsas
// voltem. Ver docs/auditorias/lotofacil/07-plano-de-correcao.md.
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { OPCOES_BOLAO } from "@/lib/bolao-opcoes";
import * as R from "./referencia";

const raiz = path.resolve(__dirname, "../../..");
const ler = (arquivo: string) => readFileSync(path.join(raiz, arquivo), "utf8");

const brInt = (n: number | bigint) => Number(n).toLocaleString("pt-BR");
const brPct = (p: number, casas = 2) => `${(100 * p).toFixed(casas).replace(".", ",")}%`;

// Linhas de tabela dos artigos: "<td>contagem</td> <td>percentual</td>".
function temLinha(fonte: string, contagem: bigint, p: number): boolean {
  const re = new RegExp(`${brInt(contagem).replace(/\./g, "\\.")}</td>\\s*<td className="num">${brPct(p).replace(/[.%]/g, "\\$&")}`);
  return re.test(fonte);
}

describe("LF-42 — tabelas das categorias nos artigos = hipergeométrica", () => {
  const casos: { arquivo: string; K: number; xs: number[] }[] = [
    { arquivo: "app/dicas/primos/page.tsx", K: 9, xs: [3, 4, 5, 6, 7, 8] },
    { arquivo: "app/dicas/fibonacci/page.tsx", K: 7, xs: [2, 3, 4, 5, 6, 7] },
    { arquivo: "app/dicas/multiplos-de-3/page.tsx", K: 8, xs: [2, 3, 4, 5, 6, 7, 8] },
  ];
  for (const c of casos) {
    it(c.arquivo, () => {
      const fonte = ler(c.arquivo);
      for (const x of c.xs) {
        const contagem = R.comb(c.K, x) * R.comb(25 - c.K, 15 - x);
        expect(temLinha(fonte, contagem, R.probCategoria(c.K, x)), `x = ${x}`).toBe(true);
      }
    });
  }

  it("app/dicas/moldura-centro/page.tsx (moldura 7 a 12)", () => {
    const fonte = ler("app/dicas/moldura-centro/page.tsx");
    for (let x = 7; x <= 12; x++) {
      const contagem = R.comb(16, x) * R.comb(9, 15 - x);
      expect(temLinha(fonte, contagem, R.probCategoria(16, x)), `moldura = ${x}`).toBe(true);
    }
  });

  it("app/dicas/repetidas/page.tsx (6 a 12 repetidas)", () => {
    const fonte = ler("app/dicas/repetidas/page.tsx");
    for (let k = 6; k <= 12; k++) {
      expect(temLinha(fonte, R.favoraveis(15, k), R.probAcertos(15, k)), `repetidas = ${k}`).toBe(true);
    }
  });
});

describe("LF-39 — fechamentos citados = algoritmo real", () => {
  const total = (v: number, k: number) =>
    OPCOES_BOLAO.lotofacil.find((o) => o.tamanhoPool === v && o.garantia === k)!.totalJogos;

  it("tabela de dicas/fechamento usa os totais do algoritmo", () => {
    const fonte = ler("app/dicas/fechamento/page.tsx");
    for (const [v, k] of [[16, 14], [17, 14], [18, 13], [20, 12]]) {
      const jogos = total(v, k);
      expect(fonte).toContain(`${brInt(jogos)} jogos / R$${(jogos * 3.5).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}`);
    }
    expect(fonte).not.toMatch(/5–8 jogos|15–20 jogos|40–60 jogos|150–200 jogos/);
  });

  it("nenhum total citado fica abaixo do limite de Schönheim", () => {
    expect(total(16, 14)).toBeGreaterThanOrEqual(R.limiteSchonheim(16, 14));
    expect(total(17, 14)).toBeGreaterThanOrEqual(R.limiteSchonheim(17, 14));
  });

  it("artigo 'fechamento: quando vale' não promete 18 dezenas / 12 pontos em 40–60 jogos", () => {
    const fonte = ler("lib/analises.ts");
    expect(fonte).not.toContain("exige pelo menos 40-60 jogos");
    expect(fonte).toContain(`${total(18, 12)} jogos (R$${Math.round(total(18, 12) * 3.5)})`);
  });

  it("página de fechamentos lê o exemplo do OPCOES_BOLAO (sem o 156 digitado)", () => {
    const fonte = ler("app/[loteria]/fechamentos/page.tsx");
    expect(fonte).toContain("OPCOES_BOLAO");
    expect(fonte).not.toMatch(/reduzido:\s*156/);
  });
});

describe("LF-01 / LF-02 — prêmios fixos e percentual vigentes", () => {
  const arquivos = [
    "app/dicas/como-os-premios-sao-calculados/page.tsx",
    "app/dicas/retorno-ao-apostador/page.tsx",
    "lib/analises.ts",
    "lib/artigos.ts",
  ];
  it("não citam mais R$5/R$10/R$25 como prêmios fixos atuais nem 43,35% como vigente", () => {
    for (const a of arquivos) {
      const fonte = ler(a);
      expect(fonte, a).not.toMatch(/R\$5 \/ R\$10 \/ R\$25|\(R\$5, R\$10 e R\$25|R\$5 para 11/);
      expect(fonte, a).not.toMatch(/destina 43,35%|43,35% da arrecadação vai/);
    }
  });
});

describe("textos que afirmavam algo falso não voltam", () => {
  it("LF-35: moldura x centro não declara 'vantagem' sem normalizar", () => {
    // A frase antiga era o resultado de um ternário: `? "a borda leva vantagem."`.
    expect(ler("app/[loteria]/tabelas/[categoria]/page.tsx")).not.toContain('"a borda leva vantagem."');
  });
  it("LF-19: heatmap não afirma 'exatamente o esperado' sem olhar os dados", () => {
    expect(ler("components/HeatmapPageClient.tsx")).not.toContain("exatamente o esperado pela teoria");
  });
  it("LF-36: gerador não chama o modo simples de 'puramente aleatório' (exceto Super Sete)", () => {
    const fonte = ler("app/[loteria]/gerador/page.tsx");
    // A frase só pode aparecer no ramo condicional da Super Sete.
    const ocorrencias = fonte.match(/No modo simples, a escolha é puramente aleatória/g) ?? [];
    expect(ocorrencias.length).toBe(1);
    expect(fonte).toMatch(/codigoLoteria === "supersete"\s*\?\s*"No modo simples, a escolha é puramente aleatória/);
  });
  it("LF-38: equilíbrio não se descreve como 'combinatória pura' nem 'pesos iguais'", () => {
    expect(ler("app/[loteria]/equilibrio/page.tsx")).not.toContain("combinatória pura");
    expect(ler("lib/analises.ts")).not.toContain("combinadas com pesos iguais");
  });
  it("LF-40: bolão não promete 15 pontos", () => {
    expect(ler("app/[loteria]/bolao/page.tsx")).not.toContain("um bilhete acerta 15 pontos");
  });
  it("LF-41: acúmulos não diz que a chance de haver ganhador é sempre a mesma", () => {
    expect(ler("app/[loteria]/acumulos/page.tsx")).not.toContain("probabilidade de haver um ganhador é sempre a mesma");
  });
  it("LF-47: guia da Lotofácil não diz que não há sorteio aos domingos", () => {
    expect(ler("lib/analises.ts")).not.toMatch(/Lotofácil\?", resposta: "Todos os dias, de segunda a sábado/);
  });
  it("LF-37: exemplos impossíveis na Lotofácil", () => {
    expect(ler("app/[loteria]/gerador/page.tsx")).not.toContain("0-15 ou 15-0");
    expect(ler("app/dicas/par-impar/page.tsx")).not.toContain("0 pares/15 ímpares");
  });
});

describe("LF-44 / LF-45 / LF-43 — percentuais citados = enumeração", () => {
  it("artigo 'resultados improváveis' e '5 filtros'", () => {
    const fonte = ler("lib/analises.ts");
    let somaAbaixo160 = 0;
    let somaAbaixo158 = 0;
    let somaAcima233 = 0;
    let corrida8 = 0;
    R.paraCadaCombinacao((m) => {
      const s = R.somaMascara(m);
      if (s < 160) somaAbaixo160++;
      if (s < 158) somaAbaixo158++;
      if (s > 233) somaAcima233++;
      if (R.maiorCorrida(m) >= 8) corrida8++;
    });
    const T = 3268760;
    const pct1 = (c: number) => `${((100 * c) / T).toFixed(1).replace(".", ",")}%`;
    expect(fonte).toContain(`cerca de ${pct1(somaAbaixo160)} de todas as combinações`);
    expect(fonte).toContain(`Somas abaixo de 158 (cerca de ${pct1(somaAbaixo158)}`);
    expect(fonte).toContain(`Somas acima de 233 (cerca de ${pct1(somaAcima233)}`);
    expect(fonte).toContain(`(cerca de ${pct1(corrida8)} das combinações)`);
    let pares9 = 0;
    for (let k = 9; k <= 12; k++) pares9 += R.probCategoria(12, k);
    expect(fonte).toContain(`cerca de ${(100 * pares9).toFixed(1).replace(".", ",")}% das combinações têm 9+ pares`);
    let pares6a9 = 0;
    for (let k = 6; k <= 9; k++) pares6a9 += R.probCategoria(12, k);
    expect(fonte).toContain(`6-9 pares cobre ~${Math.round(100 * pares6a9)}%`);
  }, 60_000);

  it("artigo duques/trincas: trinca 19,8%", () => {
    const p = (15 * 14 * 13) / (25 * 24 * 23);
    expect(ler("app/dicas/duques-trincas/page.tsx")).toContain(`${(100 * p).toFixed(1).replace(".", ",")}%`);
    expect(ler("app/dicas/duques-trincas/page.tsx")).not.toContain("19,1%");
  });

  it("artigo sequências: sem 3+ seguidas = 9.042 (0,28%)", () => {
    expect(ler("app/dicas/sequencias/page.tsx")).toContain(`9.042</td>`);
  });
});
