// Auditoria Mega-Sena — simulador histórico (preço por época e pontuação).
import { describe, expect, it } from "vitest";
import { ERAS_PRECO, precoApostaNoConcurso, precoAtual } from "@/lib/precos-loteria";
import { pontuarDraw } from "@/lib/simulador-pontuacao";
import type { ConcessaoSimulacao } from "@/lib/queries";
import * as R from "./referencia";

describe("pontuarDraw — concurso 3084 (mapa 6→1, 5→2, 4→3)", () => {
  const mapaFaixas = { 6: 1, 5: 2, 4: 3 };
  const { dezenas: sorteio, faixas } = R.CONCURSO_3084;
  const premios = Object.fromEntries(faixas.map((f) => [f.faixa, f.valorPremio]));
  const draw = (p: Record<number, number>): ConcessaoSimulacao => ({
    numero: 3084, dataSorteio: "2026-11-10", dezenas: sorteio,
    dezenasSegundoSorteio: null, trevos: null, premios: p,
  });
  const fora = R.UNIVERSO.filter((d) => !sorteio.includes(d));

  for (let k = 0; k <= 6; k++) {
    it(`${k} acertos`, () => {
      const jogo = [...sorteio.slice(0, k), ...fora.slice(0, 6 - k)];
      const r = pontuarDraw(draw(premios), jogo, { tipo: "padrao", mapaFaixas });
      if (k < 4) expect(r).toEqual([]);
      else expect(r).toEqual([{ faixa: 7 - k, premio: premios[7 - k], acertosExibicao: k, descricao: `${k} acertos` }]);
    });
  }

  it("sena num concurso acumulado vira acerto 'acumulado', com prêmio 0", () => {
    const r = pontuarDraw(draw({ ...premios, 1: 0 }), sorteio, { tipo: "padrao", mapaFaixas });
    expect(r[0]).toMatchObject({ faixa: 1, premio: 0, acumulado: true, acertosExibicao: 6 });
  });
});

describe("preço da aposta por época", () => {
  it("preço atual R$ 6,00", () => {
    expect(precoAtual("megasena")).toBe(6);
    expect(precoApostaNoConcurso("megasena", 3084)).toBe(6);
  });

  // MS-03: sem ERAS_PRECO.megasena, o simulador cobra R$ 6,00 no concurso 1
  // (1996). Até 23/05/2015 a aposta custava R$ 2,50 ou menos (notícias; preço
  // oficial por período PENDENTE). Ao corrigir, trocar por `it` e acrescentar
  // os concursos de fronteira de cada era.
  // ATENÇÃO: lib/auditoria/lotofacil/simulador.test.ts afirma hoje que a
  // Mega-Sena usa o preço atual em todo concurso; esse teste precisa ser
  // ajustado junto com a correção.
  it.fails("MS-03: concursos de 1996 a 2015 não custam o preço atual", () => {
    expect(ERAS_PRECO.megasena).toBeDefined();
    expect(precoApostaNoConcurso("megasena", 1)).toBeLessThanOrEqual(2.5);
    expect(precoApostaNoConcurso("megasena", 1600)).toBeLessThanOrEqual(2.5); // 2014
  });

  // MS-13: a tela compara o retorno com "~43% para qualquer combinação"; a
  // média exata de todas as combinações no próprio simulador é 9,5% (R$ 6
  // fixo) ou ≥ 16,8% com preço da época (evidencias/fase2/sim.mjs, dados de
  // produção). A frase está em SimuladorHistoricoClient; ao corrigir, extrair
  // o valor de referência para uma função testável.
  it.todo("MS-13: a referência de retorno médio exibida vem do histórico da própria loteria");
});
