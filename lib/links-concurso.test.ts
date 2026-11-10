import { describe, expect, it } from "vitest";
import { montarLinksConcurso, type EntradaLinksConcurso, type FraseLink } from "./links-concurso";

function base(over: Partial<EntradaLinksConcurso> = {}): EntradaLinksConcurso {
  return {
    codigoLoteria: "megasena",
    nomeLoteria: "Mega-Sena",
    numero: 2900,
    dezenaMax: 60,
    dezenas: [5, 12, 23, 34, 41, 60],
    dezenasAnterior: [1, 2, 3, 4, 7, 8],
    historico: null,
    totalConcursos: null,
    cicloFechado: null,
    ...over,
  };
}

const texto = (f: FraseLink) => f.map((p) => (typeof p === "string" ? p : p.texto)).join("");
const links = (f: FraseLink) => f.filter((p) => typeof p !== "string").map((p) => (p as { href: string }).href);

describe("montarLinksConcurso", () => {
  it("sem dado nenhum, não monta frase", () => {
    expect(montarLinksConcurso(base())).toEqual([]);
  });

  it("uma repetida: cita a dezena e o concurso anterior e linka a tabela de repetidas", () => {
    const [f] = montarLinksConcurso(base({ dezenasAnterior: [23, 1, 2, 3, 4, 7] }));
    expect(texto(f)).toContain("A dezena 23 saiu de novo: também tinha sido sorteada no concurso 2899.");
    expect(texto(f)).toContain("tabela de dezenas repetidas da Mega-Sena");
    expect(links(f)).toEqual(["/megasena/tabelas/repetidas"]);
  });

  it("várias repetidas: lista em ordem com zero à esquerda", () => {
    const [f] = montarLinksConcurso(base({ dezenasAnterior: [23, 5, 12, 1, 2, 3] }));
    expect(texto(f)).toContain("As dezenas 05, 12 e 23 saíram de novo, repetindo o concurso 2899.");
  });

  it("frequência: a dezena que mais saiu até este concurso, com o total", () => {
    const frases = montarLinksConcurso(
      base({
        historico: [
          { dezena: 5, vezes: 300, ultimoAntes: 2899 },
          { dezena: 41, vezes: 312, ultimoAntes: 2898 },
        ],
        totalConcursos: 2900,
      })
    );
    const f = frases.find((x) => links(x)[0] === "/megasena/tabelas/frequencia")!;
    expect(texto(f)).toContain("a 41 é a que mais saiu até este concurso: 312 vezes em 2.900 concursos");
    expect(texto(f)).toContain("números mais sorteados da Mega-Sena");
  });

  it("frequência empatada: cita as empatadas com 'cada'", () => {
    const frases = montarLinksConcurso(
      base({
        historico: [
          { dezena: 41, vezes: 312, ultimoAntes: 2898 },
          { dezena: 5, vezes: 312, ultimoAntes: 2899 },
        ],
        totalConcursos: 2900,
      })
    );
    const f = frases.find((x) => links(x)[0] === "/megasena/tabelas/frequencia")!;
    expect(texto(f)).toContain("as dezenas 05 e 41 são as que mais saíram até este concurso: 312 vezes cada");
  });

  it("atraso: maior ausência antes deste concurso, ignorando 1ª aparição", () => {
    const frases = montarLinksConcurso(
      base({
        historico: [
          { dezena: 5, vezes: 10, ultimoAntes: 2899 },
          { dezena: 41, vezes: 10, ultimoAntes: 2862 },
          { dezena: 60, vezes: 1, ultimoAntes: null },
        ],
        totalConcursos: 2900,
      })
    );
    const f = frases.find((x) => links(x)[0] === "/megasena/tabelas/atraso")!;
    expect(texto(f)).toContain("A dezena 41 voltou a sair depois de 37 concursos de ausência");
    expect(texto(f)).toContain("dezenas atrasadas da Mega-Sena");
  });

  it("atraso pequeno (menos de 2 concursos) não vira frase", () => {
    const frases = montarLinksConcurso(
      base({ historico: [{ dezena: 5, vezes: 10, ultimoAntes: 2898 }], totalConcursos: 2900 })
    );
    expect(frases.some((x) => links(x)[0] === "/megasena/tabelas/atraso")).toBe(false);
  });

  it("ciclo fechado: frase com o número de dezenas e de concursos", () => {
    const [f] = montarLinksConcurso(
      base({ codigoLoteria: "lotofacil", nomeLoteria: "Lotofácil", dezenaMax: 25, cicloFechado: { qtdConcursos: 5 } })
    );
    expect(texto(f)).toContain("Este concurso fechou um ciclo da Lotofácil: as 25 dezenas saíram pelo menos uma vez em 5 concursos.");
    expect(links(f)).toEqual(["/lotofacil/tabelas/ciclos"]);
  });

  it("prêmio entre os 10 maiores: link para os recordes", () => {
    const frases = montarLinksConcurso(base({ posicaoPremioHistorico: 3 }));
    expect(frases.map(links).flat()).toContain("/megasena/recordes");
    expect(texto(frases[frases.length - 1])).toContain("recordes da Mega-Sena");
    expect(montarLinksConcurso(base({ posicaoPremioHistorico: 11 }))).toEqual([]);
  });

  it("Super Sete fica sem frases", () => {
    expect(
      montarLinksConcurso(base({ codigoLoteria: "supersete", nomeLoteria: "Super Sete", dezenasAnterior: [5, 12] }))
    ).toEqual([]);
  });

  it("Dupla Sena deixa claro que é o 1º sorteio", () => {
    const frases = montarLinksConcurso(
      base({
        codigoLoteria: "duplasena",
        nomeLoteria: "Dupla Sena",
        dezenaMax: 50,
        dezenas: [5, 12],
        historico: [{ dezena: 5, vezes: 200, ultimoAntes: 2880 }],
        totalConcursos: 2900,
      })
    );
    expect(frases.map(texto).join(" ")).toContain("Entre as dezenas do 1º sorteio");
  });
});
