import { contarColunasAcertadas } from "./classificacao";
import { FAIXAS_DUPLASENA_POR_SORTEIO } from "./probabilidades";

// Pontuação PURA de um jogo contra um concurso — sem acesso a banco, sem
// I/O — usada pelo processador de notificações (lib/notificacoes/*) para
// poder testar cada loteria isoladamente com fixtures fixos (tarefa 1.2 do
// plano de implementação, 13/09/2026).
//
// O cron antigo (app/api/cron/conferir/route.ts, agora reescrito) usava
// tabelas fixas MIN_ACERTOS/FAIXAS por loteria, com dois problemas: (1)
// Lotomania paga uma faixa premiada com 0 acertos, e o mínimo fixo (15)
// excluía esse caso; (2) o valor do prêmio nunca vinha do concurso real.
// Aqui a faixa é sempre resolvida contra as linhas reais de
// premiacao_faixa do concurso — a mesma fonte que lib/conferidor.ts usa em
// calcularRetornoFinanceiro, e com a MESMA regra de correspondência
// (regex `/(\d+)\s*acerto/i` na descrição) para não divergir do que o
// Conferidor já mostra ao usuário. Ver esse arquivo se a regra mudar.

export interface FaixaConcurso {
  faixa: number;
  descricaoFaixa: string;
  valorPremio: number;
  qtdGanhadores: number;
}

export interface ConcursoConferencia {
  numero: number;
  dezenas: number[];
  // Dupla Sena: segundo sorteio do mesmo concurso.
  dezenasSegundoSorteio?: number[] | null;
}

export interface AcertoFaixa {
  acertos: number;
  // Dupla Sena: qual dos dois sorteios gerou esse resultado.
  sorteio?: 1 | 2;
  faixa: FaixaConcurso | null;
  // +Milionária: o número de acertos de dezenas já seria suficiente para
  // ALGUMA faixa, mas qual depende dos trevos — que user_games não guarda
  // hoje (mesma limitação documentada em app/conta/carteira/page.tsx e em
  // LOTERIAS_SEM_CALCULO_FINANCEIRO, lib/carteira.ts). Nunca cravamos uma
  // faixa/prêmio específico nesse caso — melhor avisar "confira" do que
  // arriscar um valor errado.
  faixaIndeterminada?: boolean;
  // Valor do prêmio nesse concurso especificamente (não uma estimativa).
  // null quando não bateu faixa, quando a faixa acumulou (0 ganhadores —
  // ver `acumulado`) ou quando faixaIndeterminada é true.
  premioReais: number | null;
  acumulado: boolean;
}

// Menor contagem de acertos de dezenas que já paga alguma faixa da
// +Milionária (2 acertos + 1 trevo é a faixa mais baixa — ver a tabela real
// de premiacao_faixa: faixas 1 a 10, a última "2 acertos + 1 trevo").
const MIN_ACERTOS_DEZENAS_MAISMILIONARIA = 2;

function faixaPorDescricaoNumerica(
  faixas: FaixaConcurso[],
  acertos: number
): FaixaConcurso | null {
  return (
    faixas.find((f) => {
      const m = f.descricaoFaixa.match(/(\d+)\s*acerto/i);
      return m !== null && Number(m[1]) === acertos;
    }) ?? null
  );
}

function montarResultado(
  acertos: number,
  sorteio: 1 | 2 | undefined,
  faixa: FaixaConcurso | null
): AcertoFaixa {
  if (!faixa) {
    return { acertos, sorteio, faixa: null, premioReais: null, acumulado: false };
  }
  if (faixa.qtdGanhadores === 0) {
    // Acumulou: ninguém ganhou de verdade, valor_premio registrado é 0 —
    // não dá pra saber quanto essa faixa realmente pagaria (mesma regra de
    // calcularRetornoFinanceiro em lib/conferidor.ts).
    return { acertos, sorteio, faixa, premioReais: null, acumulado: true };
  }
  return { acertos, sorteio, faixa, premioReais: faixa.valorPremio, acumulado: false };
}

function contarIntersecao(jogo: number[], sorteio: number[]): number {
  const set = new Set(sorteio);
  return jogo.filter((d) => set.has(d)).length;
}

// Retorna um resultado por "chance" do concurso: 1 item na maioria das
// loterias, 2 na Dupla Sena (um por sorteio).
export function pontuarJogo(
  loteriaCodigo: string,
  jogoDezenas: number[],
  concurso: ConcursoConferencia,
  faixasDoConcurso: FaixaConcurso[]
): AcertoFaixa[] {
  if (loteriaCodigo === "supersete") {
    // Acerto por posição de coluna, não por interseção de conjunto — cada
    // coluna sorteia um dígito (0-9) independente das demais.
    const acertos = contarColunasAcertadas(jogoDezenas, concurso.dezenas);
    return [montarResultado(acertos, undefined, faixaPorDescricaoNumerica(faixasDoConcurso, acertos))];
  }

  if (loteriaCodigo === "duplasena") {
    const acertos1 = contarIntersecao(jogoDezenas, concurso.dezenas);
    const dezenas2 = concurso.dezenasSegundoSorteio ?? [];
    const acertos2 = contarIntersecao(jogoDezenas, dezenas2);

    const faixaIndex1 = FAIXAS_DUPLASENA_POR_SORTEIO[1][acertos1];
    const faixaIndex2 = FAIXAS_DUPLASENA_POR_SORTEIO[2][acertos2];

    return [
      montarResultado(
        acertos1,
        1,
        faixaIndex1 ? faixasDoConcurso.find((f) => f.faixa === faixaIndex1) ?? null : null
      ),
      montarResultado(
        acertos2,
        2,
        faixaIndex2 ? faixasDoConcurso.find((f) => f.faixa === faixaIndex2) ?? null : null
      ),
    ];
  }

  const acertos = contarIntersecao(jogoDezenas, concurso.dezenas);

  if (loteriaCodigo === "maismilionaria") {
    return [
      {
        acertos,
        faixa: null,
        faixaIndeterminada: acertos >= MIN_ACERTOS_DEZENAS_MAISMILIONARIA,
        premioReais: null,
        acumulado: false,
      },
    ];
  }

  // lotofacil, megasena, quina, lotomania (inclusive a faixa de 0
  // acertos), diadesorte e timemania (só a parte numérica — "Mês da
  // Sorte"/"Time do Coração" não têm como ser verificados: user_games não
  // guarda o mês/time escolhido, só as dezenas).
  return [montarResultado(acertos, undefined, faixaPorDescricaoNumerica(faixasDoConcurso, acertos))];
}
