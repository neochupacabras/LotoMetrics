// Auditoria Mega-Sena — regressão dos textos corrigidos (Etapa 1 do plano).
// Lê o código-fonte das páginas e artigos e confere os números citados contra
// cálculos independentes (./referencia.ts e contagens exatas feitas aqui).
// Também impede que frases comprovadamente falsas voltem. Os números que
// vêm do histórico (recorde de acúmulo, % de concursos com ganhador) foram
// conferidos com o banco de produção até o concurso 3084; ver
// docs/auditorias/mega-sena/09-correcoes-etapa1.md.
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { OPCOES_BOLAO, exemploBolao } from "@/lib/bolao-opcoes";
import { cicloEsperado } from "@/lib/ciclo-esperado";
import * as R from "./referencia";

const raiz = path.resolve(__dirname, "../../..");
// Espaços e quebras de linha normalizados: as frases atravessam linhas.
const ler = (arquivo: string) =>
  readFileSync(path.join(raiz, arquivo), "utf8").replace(/\s+/g, " ");

const br = (x: number, casas: number) => x.toFixed(casas).replace(".", ",");

// Trecho de um artigo de lib/analises.ts, do slug até o próximo slug.
function artigo(slug: string): string {
  const fonte = ler("lib/analises.ts");
  const ini = fonte.indexOf(`slug: "${slug}"`);
  expect(ini, slug).toBeGreaterThan(-1);
  const fim = fonte.indexOf("slug: ", ini + 10);
  return fonte.slice(ini, fim === -1 ? undefined : fim);
}

// Distribuição exata da soma de 6 dezenas distintas de 1 a 60 (programação
// dinâmica; independe do código do site).
function distribuicaoSoma(): number[] {
  const dp = Array.from({ length: R.M + 1 }, () => new Array<number>(400).fill(0));
  dp[0][0] = 1;
  for (let x = 1; x <= R.N; x++)
    for (let k = R.M; k >= 1; k--)
      for (let s = 399; s >= x; s--) dp[k][s] += dp[k - 1][s - x];
  return dp[R.M];
}
const SOMA = distribuicaoSoma();
const TOTAL = Number(R.TOTAL_COMBINACOES);
const pSoma = (a: number, b: number) => {
  let t = 0;
  for (let s = a; s <= b; s++) t += SOMA[s];
  return t / TOTAL;
};

describe("MS-31 — artigo de soma = distribuição exata", () => {
  const fonte = ler("app/dicas/soma/page.tsx");

  it("a contagem por programação dinâmica fecha com C(60,6) e média 183", () => {
    expect(SOMA.reduce((a, b) => a + b, 0)).toBe(TOTAL);
    const media = SOMA.reduce((a, c, s) => a + s * c, 0) / TOTAL;
    expect(media).toBe(183);
  });

  it("média citada é 183 (não 183,5)", () => {
    expect(fonte).toContain("A soma média esperada é 183 ");
    expect(fonte).not.toContain("183,5");
  });

  it("faixas da tabela", () => {
    const linhas: [string, number][] = [
      ["155–211", pSoma(155, 211)],
      ["130–236", pSoma(130, 236)],
    ];
    for (const [faixa, p] of linhas) {
      expect(fonte, faixa).toContain(`<td>${faixa}</td> <td className="num">${br(100 * p, 1)}%</td>`);
    }
    expect(fonte).toContain(`<td>Abaixo de 100</td> <td className="num">${br(100 * pSoma(21, 99), 2)}%</td>`);
    expect(fonte).toContain(`<td>Acima de 266</td> <td className="num">${br(100 * pSoma(267, 345), 2)}%</td>`);
  });

  it("a soma mais comum tem menos de 1% das combinações", () => {
    expect(SOMA[183] / TOTAL).toBeLessThan(0.01);
    expect(Math.max(...SOMA)).toBe(SOMA[183]);
  });

  it("não volta o '≈ 80%' para 152–215 (o exato é 56,0%)", () => {
    expect(br(100 * pSoma(152, 215), 1)).toBe("56,0");
    expect(fonte).not.toContain("≈ 80%");
  });
});

describe("MS-29 — artigo de atraso", () => {
  const fonte = ler("app/dicas/atraso/page.tsx");
  it("chance de 100 concursos sem sair = (54/60)^100", () => {
    const pNaoSai = Number(R.comb(59, 6)) / TOTAL; // 0,9
    const p = pNaoSai ** 100;
    expect(fonte).toContain(`${br(100 * p, 5)}%`);
    expect(fonte).toContain(`1 em ${Math.round(1 / p / 1000)} mil`);
    expect(fonte).not.toContain("0,0000265%");
  });
});

describe("MS-30 — artigo de duques e trincas", () => {
  const fonte = ler("app/dicas/duques-trincas/page.tsx");
  it("trinca específica: 1 em 1.711 concursos", () => {
    const umEm = TOTAL / Number(R.comb(57, 3));
    expect(fonte).toContain(`a cada ${Math.round(umEm).toLocaleString("pt-BR")} sorteios`);
    expect(fonte).toContain(`${br(100 / umEm, 3)}%`);
    expect(fonte).not.toContain("1.670");
  });
  it("não diz que a maioria das trincas nunca saiu", () => {
    expect(fonte).not.toContain("a maioria delas nunca apareceu");
    // Esperado ao acaso em 3.084 concursos: ~16,5% inéditas (o texto diz 1 em 6).
    const pInedita = (1 - Number(R.comb(57, 3)) / TOTAL) ** 3084;
    expect(pInedita).toBeGreaterThan(1 / 7);
    expect(pInedita).toBeLessThan(1 / 5);
  });
});

describe("MS-33 — rateio no artigo quina vs sena", () => {
  it("regra oficial 43,79% → 40/10/10 + 25 + 15", () => {
    const texto = artigo("mega-sena-chance-real-quina-vs-sena");
    expect(texto).toContain("43,79% formam o prêmio bruto");
    expect(texto).toContain("40% vão para a sena, 10% para a quina e 10% para a quadra");
    expect(texto).toContain(
      "25% são reservados para os concursos de final 0 ou 5 e 15% para a Mega da Virada"
    );
    expect(40 + 10 + 10 + 25 + 15).toBe(100);
    expect(texto).not.toContain("35% para sena");
  });
});

describe("MS-32 — artigo de acúmulos longos", () => {
  it("recorde de 17 concursos sem ganhador, sem os números inflados", () => {
    const texto = artigo("megasena-acumulos-longos-historico");
    expect(texto).toContain("17 concursos seguidos sem ganhador");
    expect(texto).not.toContain("30, 40 e até mais");
    expect(texto).not.toContain("ultrapassaram os 20");
    expect(texto).not.toContain("1 em cada 5 concursos acumula");
  });
});

describe("MS-35 — artigo de ganhadores por concurso", () => {
  it("sem '20-30% de chance' nem valor esperado positivo", () => {
    const texto = artigo("mega-sena-ganhadores-por-concurso-media");
    expect(texto).not.toContain("20-30%");
    expect(texto).not.toContain("tendem a ter valor esperado positivo");
  });
});

describe("MS-34 — agenda de sorteios no guia da Mega-Sena", () => {
  it("terça e quinta às 21h e domingo às 11h", () => {
    const texto = artigo("como-jogar-mega-sena-regras-completas");
    expect(texto).not.toMatch(/quintas e sábados/i);
    expect(texto).toContain("Terças e quintas, às 21h, e domingos, às 11h");
  });
});

describe("MS-23 — exemplo do Bolão vem da tabela da loteria", () => {
  it("Mega-Sena: exemplo possível (pool ≤ 16, garantia < 6) e com total real", () => {
    const ex = exemploBolao("megasena")!;
    expect(OPCOES_BOLAO.megasena).toContainEqual(ex);
    expect(ex.tamanhoPool).toBeLessThanOrEqual(16);
    expect(ex.garantia).toBeLessThan(R.M);
  });
  it("a página não tem mais o exemplo fixo da Lotofácil", () => {
    const fonte = ler("app/[loteria]/bolao/page.tsx");
    expect(fonte).not.toContain("18 dezenas");
    expect(fonte).not.toContain("faz 13 pontos");
  });
});

describe("MS-13 (texto) — sem a média fixa de ~43% como referência do jogo", () => {
  it("simulador histórico, página do simulador e conferidor", () => {
    expect(ler("components/SimuladorHistoricoClient.tsx")).not.toContain("~43%");
    expect(ler("app/[loteria]/simulador/page.tsx")).not.toContain("~57%");
    expect(ler("app/[loteria]/conferidor/page.tsx")).not.toContain("~43%");
  });
});

describe("MS-24, MS-25, MS-26 — textos das ferramentas", () => {
  it("MS-24: Analisador compara com as combinações possíveis", () => {
    expect(ler("components/AnalisadorClient.tsx")).not.toContain("a maioria já jogou");
  });
  it("MS-25: ciclo esperado da Mega-Sena = 45,2 e 'apenas' condicional", () => {
    expect(br(cicloEsperado(R.N, R.M), 1)).toBe("45,2");
    const fonte = ler("app/[loteria]/tabelas/[categoria]/page.tsx");
    expect(fonte).toContain("cicloEsperado(universo, qtdDezenasSorteadas)");
    expect(fonte).not.toContain("Faltam apenas <strong>");
  });
  it("MS-26: sem 'ponto quente'", () => {
    const fonte = ler("app/[loteria]/tabelas/[categoria]/page.tsx");
    expect(fonte).not.toContain('kicker="O ponto quente');
    expect(fonte).toContain("alguma sempre fica acima da média");
  });
});

describe("MS-27, MS-08 — Virada e calculadora de valor esperado", () => {
  it("MS-27: hub da Virada explica o concurso especial de 2008", () => {
    expect(ler("app/mega-da-virada/page.tsx")).toContain("31/12/2008");
  });
  it("MS-08: calculadora avisa que quina e quadra (8,76% da arrecadação) ficam de fora", () => {
    const pct = 43.79 * (0.1 + 0.1);
    expect(ler("app/calculadoras/valor-esperado-aposta/CalcClient.tsx")).toContain(
      `${br(pct, 2)}% da arrecadação`
    );
  });
});
