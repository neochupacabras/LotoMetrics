import pool from "./db";
import { contarColunasAcertadas } from "./classificacao";
import { FAIXAS_DUPLASENA_POR_SORTEIO } from "./probabilidades";

export interface ResultadoConcurso {
  numero: number;
  dataSorteio: string;
  pontos: number;
  // Dupla Sena: qual dos dois sorteios do concurso gerou esse acerto — só
  // definido pra conferirJogoDuplaSena, usado por calcularRetornoFinanceiro
  // pra saber em qual das duas faixas (mesma descrição, índices diferentes)
  // buscar o prêmio real.
  sorteio?: 1 | 2;
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

// Monta o resultado agregado (distribuição, melhor resultado, faixas
// batidas) a partir de uma lista já pontuada — reaproveitado tanto pela
// pontuação genérica (interseção de dezenas) quanto pela da Super Sete
// (comparação por coluna, ver conferirJogoSuperSete) e da Dupla Sena
// (dois sorteios por concurso, ver conferirJogoDuplaSena).
//
// `candidatosFaixas` é a lista usada pra achar faixas batidas — por padrão
// é a mesma que `resultados` (1 item por concurso), mas a Dupla Sena passa
// uma lista separada com até 2 itens por concurso (um por sorteio), já que
// cada sorteio pode bater uma faixa premiada independente do outro.
function agregarResultados(
  resultados: ResultadoConcurso[],
  faixasPremiadas: number[],
  candidatosFaixas: ResultadoConcurso[] = resultados
): ResultadoConferidor {
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

  const acertosNasFaixas = candidatosFaixas
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

  return agregarResultados(resultados, faixasPremiadas);
}

// Super Sete: `fn_conferir_jogo` faz interseção de conjuntos, o que não
// faz sentido aqui — cada coluna sorteia um dígito independente, então o
// acerto é por posição (coluna 3 do jogo == coluna 3 do sorteio), não por
// "esse dígito apareceu em algum lugar do sorteio". `jogo` tem 7 posições
// (índice 0 = coluna 1, ..., índice 6 = coluna 7).
export async function conferirJogoSuperSete(
  loteriaId: number,
  jogo: number[],
  faixasPremiadas: number[]
): Promise<ResultadoConferidor> {
  const { rows } = await pool.query(
    `SELECT numero, data_sorteio, dezenas FROM concurso WHERE loteria_id = $1 ORDER BY numero DESC`,
    [loteriaId]
  );

  const resultados: ResultadoConcurso[] = rows.map((r) => ({
    numero: r.numero,
    dataSorteio: r.data_sorteio instanceof Date ? r.data_sorteio.toISOString() : r.data_sorteio,
    pontos: contarColunasAcertadas(jogo, r.dezenas as number[]),
  }));

  return agregarResultados(resultados, faixasPremiadas);
}

// Dupla Sena: `fn_conferir_jogo` só confere contra `concurso.dezenas` (o 1º
// sorteio) — mas cada concurso sorteia DUAS vezes, e o mesmo jogo é
// conferido contra as duas, cada uma podendo bater uma faixa premiada
// independente da outra. `pontos` (usado pra distribuição/melhor resultado)
// é o melhor dos dois sorteios; `acertosNasFaixas` (usado pro retorno
// financeiro) lista os dois separadamente, marcados com `sorteio`, porque
// os dois podem pagar prêmios diferentes no mesmo concurso.
export async function conferirJogoDuplaSena(
  loteriaId: number,
  jogo: number[],
  faixasPremiadas: number[]
): Promise<ResultadoConferidor> {
  const { rows } = await pool.query(
    `SELECT numero, data_sorteio, dezenas, dezenas_segundo_sorteio FROM concurso WHERE loteria_id = $1 ORDER BY numero DESC`,
    [loteriaId]
  );

  const jogoSet = new Set(jogo);
  const resultados: ResultadoConcurso[] = [];
  const candidatosFaixas: ResultadoConcurso[] = [];

  for (const r of rows) {
    const dataSorteio = r.data_sorteio instanceof Date ? r.data_sorteio.toISOString() : r.data_sorteio;
    const acertos1 = (r.dezenas as number[]).filter((d) => jogoSet.has(d)).length;
    const dezenas2 = r.dezenas_segundo_sorteio as number[] | null;
    const acertos2 = dezenas2 ? dezenas2.filter((d) => jogoSet.has(d)).length : 0;

    resultados.push({ numero: r.numero, dataSorteio, pontos: Math.max(acertos1, acertos2) });

    if (faixasPremiadas.includes(acertos1)) {
      candidatosFaixas.push({ numero: r.numero, dataSorteio, pontos: acertos1, sorteio: 1 });
    }
    if (dezenas2 && faixasPremiadas.includes(acertos2)) {
      candidatosFaixas.push({ numero: r.numero, dataSorteio, pontos: acertos2, sorteio: 2 });
    }
  }

  return agregarResultados(resultados, faixasPremiadas, candidatosFaixas);
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
    `SELECT c.numero, pf.faixa, pf.descricao_faixa, pf.valor_premio, pf.qtd_ganhadores
     FROM concurso c
     JOIN premiacao_faixa pf ON pf.concurso_id = c.id
     WHERE c.loteria_id = $1 AND c.numero = ANY($2)`,
    [loteriaId, numeros]
  );

  const porConcurso = new Map<
    number,
    { faixaIndex: number; descricaoFaixa: string; valorPremio: number; qtdGanhadores: number }[]
  >();
  for (const r of rows) {
    const lista = porConcurso.get(r.numero) ?? [];
    lista.push({
      faixaIndex: Number(r.faixa),
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
      // Dupla Sena: 1º e 2º sorteio compartilham a mesma descrição ("6
      // acertos" etc.), então o texto sozinho não diferencia qual dos dois
      // essa entrada representa — usa o índice de faixa fixo da Caixa
      // (FAIXAS_DUPLASENA_POR_SORTEIO) em vez do regex de descrição.
      if (acerto.sorteio) {
        return f.faixaIndex === FAIXAS_DUPLASENA_POR_SORTEIO[acerto.sorteio][acerto.pontos];
      }
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
