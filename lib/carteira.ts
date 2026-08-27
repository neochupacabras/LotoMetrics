import { getLoteriaPorCodigo, getDrawsParaSimulacao, getMapaFaixasPorAcertos } from "@/lib/queries";
import { PARAMS_LOTERIA, FAIXAS_DUPLASENA_POR_SORTEIO } from "@/lib/probabilidades";
import { LOTERIAS } from "@/lib/format";
import { contarColunasAcertadas } from "@/lib/classificacao";

export interface JogoSalvoBasico {
  id: number;
  loteria: string;
  dezenas: number[];
  label: string | null;
  ativo: boolean;
  createdAt: string; // ISO
}

export interface JogoCarteira extends JogoSalvoBasico {
  nomeLoteria: string;
  concursosAcompanhados: number;
  gasto: number;
  ganho: number | null; // null = não calculável (+Milionária: trevos não são salvos no jogo)
}

export interface ResumoCarteira {
  jogos: JogoCarteira[];
  totalGasto: number;
  totalGanho: number;
  saldoGeral: number;
  temJogoNaoCalculavel: boolean;
}

function precoAposta(codigoLoteria: string): number {
  const params = (PARAMS_LOTERIA as Record<string, { precoAposta: number }>)[codigoLoteria];
  return params?.precoAposta ?? 3.5;
}

// +Milionária: o jogo salvo só guarda as 6 dezenas, nunca os trevos (ver
// components/conta/NovoJogoClient.tsx — mesma simplificação já usada pelo
// cron de e-mail em app/api/cron/conferir/route.ts). Sem os trevos não dá
// pra saber a faixa premiada real, então o ganho não é calculável — melhor
// deixar em branco do que mostrar um número inventado.
const LOTERIAS_SEM_CALCULO_FINANCEIRO = new Set(["maismilionaria"]);

// "E se eu tivesse jogado essa combinação em todo concurso desde que
// salvei ela?" — mesma pergunta do Simulador, mas aplicada aos jogos
// realmente salvos pelo usuário, agregados numa carteira só.
export async function calcularCarteira(jogosSalvos: JogoSalvoBasico[]): Promise<ResumoCarteira> {
  const porLoteria = new Map<string, JogoSalvoBasico[]>();
  for (const j of jogosSalvos) {
    const lista = porLoteria.get(j.loteria) ?? [];
    lista.push(j);
    porLoteria.set(j.loteria, lista);
  }

  const jogos: JogoCarteira[] = [];
  let temJogoNaoCalculavel = false;

  for (const [codigoLoteria, jogosDaLoteria] of porLoteria) {
    const loteria = await getLoteriaPorCodigo(codigoLoteria);
    if (!loteria) continue;

    const nomeLoteria = LOTERIAS[codigoLoteria as keyof typeof LOTERIAS]?.nome ?? loteria.nome;
    const naoCalculavel = LOTERIAS_SEM_CALCULO_FINANCEIRO.has(codigoLoteria);
    const ehSuperSete = codigoLoteria === "supersete";
    const ehDuplaSena = codigoLoteria === "duplasena";
    const preco = precoAposta(codigoLoteria);

    // Busca só a partir do jogo salvo mais antigo dessa loteria — cobre
    // todos os jogos dela numa única query; o filtro por jogo individual
    // (que pode ter sido salvo depois desse ponto) é refinado abaixo.
    const dataMaisAntiga = jogosDaLoteria.reduce(
      (min, j) => (j.createdAt < min ? j.createdAt : min),
      jogosDaLoteria[0].createdAt
    );
    const todosDraws = await getDrawsParaSimulacao(loteria.id, dataMaisAntiga);
    const mapaFaixas = naoCalculavel ? {} : await getMapaFaixasPorAcertos(loteria.id);

    for (const jogo of jogosDaLoteria) {
      const draws = todosDraws.filter((d) => d.dataSorteio >= jogo.createdAt);
      const dezenasSet = new Set(jogo.dezenas);

      let ganho = 0;
      for (const draw of draws) {
        if (naoCalculavel) continue;

        // Dupla Sena: o mesmo jogo é conferido duas vezes por concurso (1º
        // e 2º sorteio), cada um podendo bater uma faixa independente — ver
        // FAIXAS_DUPLASENA_POR_SORTEIO (mapaFaixas não serve aqui porque a
        // descrição da faixa se repete entre os dois sorteios).
        if (ehDuplaSena) {
          const acertos1 = draw.dezenas.filter((d) => dezenasSet.has(d)).length;
          const acertos2 = (draw.dezenasSegundoSorteio ?? []).filter((d) => dezenasSet.has(d)).length;
          const faixa1 = FAIXAS_DUPLASENA_POR_SORTEIO[1][acertos1];
          const faixa2 = FAIXAS_DUPLASENA_POR_SORTEIO[2][acertos2];
          if (faixa1 !== undefined) ganho += draw.premios[faixa1] ?? 0;
          if (faixa2 !== undefined) ganho += draw.premios[faixa2] ?? 0;
          continue;
        }

        const acertos = ehSuperSete
          ? contarColunasAcertadas(jogo.dezenas, draw.dezenas)
          : draw.dezenas.filter((d) => dezenasSet.has(d)).length;
        const faixa = mapaFaixas[acertos];
        if (faixa !== undefined) {
          ganho += draw.premios[faixa] ?? 0;
        }
      }

      jogos.push({
        ...jogo,
        nomeLoteria,
        concursosAcompanhados: draws.length,
        gasto: Math.round(draws.length * preco * 100) / 100,
        ganho: naoCalculavel ? null : Math.round(ganho * 100) / 100,
      });
      if (naoCalculavel) temJogoNaoCalculavel = true;
    }
  }

  const totalGasto = jogos.reduce((s, j) => s + j.gasto, 0);
  const totalGanho = jogos.reduce((s, j) => s + (j.ganho ?? 0), 0);

  return {
    jogos: jogos.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    totalGasto: Math.round(totalGasto * 100) / 100,
    totalGanho: Math.round(totalGanho * 100) / 100,
    saldoGeral: Math.round((totalGanho - totalGasto) * 100) / 100,
    temJogoNaoCalculavel,
  };
}
