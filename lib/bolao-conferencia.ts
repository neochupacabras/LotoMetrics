import { pontuarJogo, type ConcursoConferencia, type FaixaConcurso } from "./conferencia";

// Conferência e rateio PUROS de um bolão contra um concurso — sem banco,
// sem I/O. Reaproveita pontuarJogo (a mesma regra por loteria do e-mail de
// resultado e do Conferidor), então o prêmio sempre vem das linhas reais de
// premiacao_faixa do concurso.
//
// Três situações em que o total NÃO é um número firme, e que o resultado
// sinaliza em vez de chutar:
//  - indeterminado: +Milionária — qual faixa depende dos trevos, que o
//    bolão não gera (mesma limitação de lib/conferencia.ts);
//  - acumulado: algum jogo bateu uma faixa que acumulou (0 ganhadores), então
//    não existe valor pago naquele concurso;
//  - arredondamento: o prêmio por cota é arredondado pra BAIXO ao centavo
//    (a sobra fica com o organizador); nunca promete mais do que existe.

export interface ResultadoBolao {
  // Maior número de acertos de cada jogo, na ordem dos jogos
  // (Dupla Sena: o melhor dos dois sorteios).
  acertos: number[];
  premiados: number;
  premioTotalCents: number;
  porCotaCents: number;
  indeterminado: boolean;
  acumulado: boolean;
}

export function conferirBolao(
  loteriaCodigo: string,
  jogos: number[][],
  concurso: ConcursoConferencia,
  faixas: FaixaConcurso[],
  qtdCotas: number
): ResultadoBolao {
  const acertos: number[] = [];
  let premiados = 0;
  let totalCents = 0;
  let indeterminado = false;
  let acumulado = false;

  for (const jogo of jogos) {
    const resultados = pontuarJogo(loteriaCodigo, jogo, concurso, faixas);
    acertos.push(Math.max(...resultados.map((r) => r.acertos)));

    let jogoPremiado = false;
    for (const r of resultados) {
      if (r.faixaIndeterminada) {
        indeterminado = true;
        jogoPremiado = true;
      }
      if (r.acumulado) {
        acumulado = true;
        jogoPremiado = true;
      }
      if (r.premioReais !== null) {
        totalCents += Math.round(r.premioReais * 100);
        jogoPremiado = true;
      }
    }
    if (jogoPremiado) premiados++;
  }

  return {
    acertos,
    premiados,
    premioTotalCents: totalCents,
    porCotaCents: qtdCotas > 0 ? Math.floor(totalCents / qtdCotas) : 0,
    indeterminado,
    acumulado,
  };
}

// Formato gravado em bolao_resultados.acertos_por_jogo (jsonb). O
// resto do resultado vai nas colunas próprias.
export interface DetalheResultadoJson {
  acertos: number[];
  premiados: number;
  indeterminado: boolean;
  acumulado: boolean;
}

export function paraJson(r: ResultadoBolao): DetalheResultadoJson {
  return {
    acertos: r.acertos,
    premiados: r.premiados,
    indeterminado: r.indeterminado,
    acumulado: r.acumulado,
  };
}

// Lê o jsonb gravado, aceitando também um array simples de acertos.
export function lerDetalheJson(valor: unknown): DetalheResultadoJson {
  if (Array.isArray(valor)) {
    return { acertos: valor.map(Number), premiados: 0, indeterminado: false, acumulado: false };
  }
  const v = (valor ?? {}) as Partial<DetalheResultadoJson>;
  return {
    acertos: Array.isArray(v.acertos) ? v.acertos.map(Number) : [],
    premiados: Number(v.premiados ?? 0),
    indeterminado: !!v.indeterminado,
    acumulado: !!v.acumulado,
  };
}
