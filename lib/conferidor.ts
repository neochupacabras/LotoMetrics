import pool from "./db";

export interface ResultadoConcurso {
  numero: number;
  dataSorteio: string;
  pontos: number;
}

export interface DistribuicaoPontos {
  pontos: number;
  ocorrencias: number;
}

export interface ResultadoConferidor {
  totalConcursosAnalisados: number;
  ultimoConcurso: ResultadoConcurso | null;
  melhorResultado: ResultadoConcurso | null;
  distribuicaoPontos: DistribuicaoPontos[];
  acertosNasFaixas: ResultadoConcurso[];
}

export async function conferirJogo(
  loteriaId: number,
  dezenas: number[],
  faixasPremiadas: number[]
): Promise<ResultadoConferidor> {
  const { rows } = await pool.query(
    `SELECT numero, data_sorteio, pontos FROM fn_conferir_jogo($1, $2) ORDER BY numero DESC`,
    [loteriaId, dezenas]
  );

  const resultados: ResultadoConcurso[] = rows.map((r) => ({
    numero: r.numero,
    dataSorteio: r.data_sorteio instanceof Date ? r.data_sorteio.toISOString() : r.data_sorteio,
    pontos: r.pontos,
  }));

  const ultimoConcurso = resultados[0] ?? null;

  const melhorResultado = resultados.reduce<ResultadoConcurso | null>((melhor, atual) => {
    if (!melhor || atual.pontos > melhor.pontos) return atual;
    return melhor;
  }, null);

  const contagemPorPontos = new Map<number, number>();
  for (const r of resultados) {
    contagemPorPontos.set(r.pontos, (contagemPorPontos.get(r.pontos) ?? 0) + 1);
  }
  const distribuicaoPontos: DistribuicaoPontos[] = Array.from(contagemPorPontos.entries())
    .map(([pontos, ocorrencias]) => ({ pontos, ocorrencias }))
    .sort((a, b) => b.pontos - a.pontos);

  const acertosNasFaixas = resultados
    .filter((r) => faixasPremiadas.includes(r.pontos))
    .sort((a, b) => b.pontos - a.pontos || b.numero - a.numero);

  return {
    totalConcursosAnalisados: resultados.length,
    ultimoConcurso,
    melhorResultado,
    distribuicaoPontos,
    acertosNasFaixas,
  };
}

// ---------- Retorno financeiro ----------
// Compara o custo de ter jogado essa mesma combinação em todos os
// concursos analisados contra os prêmios reais que ela teria pago, faixa
// por faixa, usando o valor de premiação realmente distribuído em cada
// concurso (não uma estimativa). O preço da aposta é digitado pelo
// usuário porque não existe no schema do banco — o valor muda com o
// tempo e não há como garantir que um valor fixo aqui estaria
// atualizado.

export interface PremioDetalhado extends ResultadoConcurso {
  valorPremio: number | null;
  acumulado: boolean;
}

export interface RetornoFinanceiro {
  custoTotal: number;
  totalGanho: number;
  retornoLiquido: number;
  premiosDetalhados: PremioDetalhado[];
  qtdNaoCalculavel: number;
}

export async function calcularRetornoFinanceiro(
  loteriaId: number,
  acertosNasFaixas: ResultadoConcurso[],
  totalConcursosAnalisados: number,
  precoAposta: number
): Promise<RetornoFinanceiro> {
  const custoTotal = Math.round(totalConcursosAnalisados * precoAposta * 100) / 100;

  if (acertosNasFaixas.length === 0) {
    return {
      custoTotal,
      totalGanho: 0,
      retornoLiquido: -custoTotal,
      premiosDetalhados: [],
      qtdNaoCalculavel: 0,
    };
  }

  const numeros = acertosNasFaixas.map((a) => a.numero);
  const { rows } = await pool.query(
    `SELECT c.numero, pf.descricao_faixa, pf.valor_premio, pf.qtd_ganhadores
     FROM concurso c
     JOIN premiacao_faixa pf ON pf.concurso_id = c.id
     WHERE c.loteria_id = $1 AND c.numero = ANY($2)`,
    [loteriaId, numeros]
  );

  const porConcurso = new Map<
    number,
    { descricaoFaixa: string; valorPremio: number; qtdGanhadores: number }[]
  >();
  for (const r of rows) {
    const lista = porConcurso.get(r.numero) ?? [];
    lista.push({
      descricaoFaixa: r.descricao_faixa ?? "",
      valorPremio: Number(r.valor_premio),
      qtdGanhadores: Number(r.qtd_ganhadores),
    });
    porConcurso.set(r.numero, lista);
  }

  let totalGanho = 0;
  let qtdNaoCalculavel = 0;
  const premiosDetalhados: PremioDetalhado[] = acertosNasFaixas.map((acerto) => {
    const faixasDoConcurso = porConcurso.get(acerto.numero) ?? [];
    const faixaCorrespondente = faixasDoConcurso.find((f) => {
      const m = f.descricaoFaixa.match(/(\d+)\s*acerto/i);
      return m !== null && Number(m[1]) === acerto.pontos;
    });

    if (!faixaCorrespondente) {
      // Sem dado de premiação para esse concurso no banco (ex.: tabela
      // ainda não populada para concursos antigos).
      qtdNaoCalculavel++;
      return { ...acerto, valorPremio: null, acumulado: false };
    }

    if (faixaCorrespondente.qtdGanhadores === 0) {
      // Ninguém ganhou essa faixa de verdade nesse concurso (prêmio
      // acumulou). Se o jogo do usuário teria batido essa faixa, ele
      // teria sido o único ganhador de um valor bem diferente do
      // registrado (que é 0 porque não houve rateio) — não dá pra
      // calcular esse valor sem saber o tamanho do acumulado, então não
      // entra na soma.
      qtdNaoCalculavel++;
      return { ...acerto, valorPremio: null, acumulado: true };
    }

    totalGanho += faixaCorrespondente.valorPremio;
    return { ...acerto, valorPremio: faixaCorrespondente.valorPremio, acumulado: false };
  });

  return {
    custoTotal,
    totalGanho: Math.round(totalGanho * 100) / 100,
    retornoLiquido: Math.round((totalGanho - custoTotal) * 100) / 100,
    premiosDetalhados,
    qtdNaoCalculavel,
  };
}
