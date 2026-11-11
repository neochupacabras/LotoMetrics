import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getLoteriaPorCodigo, getUltimosConcursos } from "@/lib/queries";
import { agoraBrasilia, dataHoraProximoSorteio } from "@/lib/calendario";
import { pontuarJogo } from "@/lib/conferencia";
import { LOTERIAS, isCodigoLoteriaValido } from "@/lib/format";
import type { CodigoLoteria, Concurso } from "@/lib/types";

// Dados das loterias compartilhados pelo Painel e pela Central de loterias
// (/conta/loterias). Último concurso das 9 numa ida só ao banco
// (getUltimosConcursos, em LOTE e em unstable_cache — nada de laço por
// loteria, ver [[project_n1_queries_loterias]]).

export const TODAS_LOTERIAS: CodigoLoteria[] = Object.keys(LOTERIAS) as CodigoLoteria[];

export interface ResumoLoteria {
  codigo: CodigoLoteria;
  nome: string;
  concurso: Concurso;
  // Próximo sorteio ainda por vir (data oficial da Caixa quando existe).
  proximoSorteioIso: string;
}

// cache() do React: o layout/página que pedir de novo na mesma requisição
// reaproveita.
export const carregarResumoLoterias = cache(async (): Promise<Map<CodigoLoteria, ResumoLoteria>> => {
  const loterias = await Promise.all(TODAS_LOTERIAS.map((c) => getLoteriaPorCodigo(c)));
  const idPorCodigo = new Map<CodigoLoteria, number>();
  loterias.forEach((l, i) => {
    if (l) idPorCodigo.set(TODAS_LOTERIAS[i], l.id);
  });
  const ultimos = await getUltimosConcursos([...idPorCodigo.values()]);
  const ref = agoraBrasilia();

  const mapa = new Map<CodigoLoteria, ResumoLoteria>();
  for (const codigo of TODAS_LOTERIAS) {
    const id = idPorCodigo.get(codigo);
    const concurso = id === undefined ? undefined : ultimos[id];
    if (!concurso) continue; // sem dado, a loteria simplesmente não aparece
    mapa.set(codigo, {
      codigo,
      nome: LOTERIAS[codigo].nome,
      concurso,
      proximoSorteioIso: dataHoraProximoSorteio(codigo, ref, concurso.dataProximoConcurso).toISOString(),
    });
  }
  return mapa;
});

export interface ConferenciaJogo {
  concurso: number;
  acertos: number;
  // "1º sorteio" / "2º sorteio" (Dupla Sena: vale o melhor dos dois).
  sorteio: string | null;
  premiado: boolean;
  premioReais: number | null;
  // +Milionária: a faixa depende dos trevos, que o jogo salvo não guarda.
  confirmarTrevos: boolean;
}

// Um jogo salvo contra o último concurso, com a MESMA regra do conferidor e
// das notificações (lib/conferencia.pontuarJogo).
export function conferirJogoSalvo(codigo: CodigoLoteria, dezenas: number[], concurso: Concurso | undefined): ConferenciaJogo | null {
  if (!concurso) return null;
  const faixas = concurso.premiacoes.map((p) => ({
    faixa: p.faixa,
    descricaoFaixa: p.descricaoFaixa ?? "",
    valorPremio: p.valorPremio,
    qtdGanhadores: p.qtdGanhadores,
  }));
  const resultados = pontuarJogo(
    codigo,
    dezenas,
    { numero: concurso.numero, dezenas: concurso.dezenas, dezenasSegundoSorteio: concurso.dezenasSegundoSorteio },
    faixas
  );
  const melhor = [...resultados].sort((a, b) => (b.faixa ? 1 : 0) - (a.faixa ? 1 : 0) || b.acertos - a.acertos)[0];
  return {
    concurso: concurso.numero,
    acertos: melhor.acertos,
    sorteio: resultados.length > 1 && melhor.sorteio ? `${melhor.sorteio}º sorteio` : null,
    premiado: !!melhor.faixa,
    premioReais: melhor.premioReais,
    confirmarTrevos: !!melhor.faixaIndeterminada,
  };
}

// Loterias favoritas (profiles.loterias_favoritas, migration
// 20261111000100). `disponivel: false` se a coluna não existir — a UI
// esconde as estrelas em vez de quebrar.
export async function carregarLoteriasFavoritas(
  userId: string
): Promise<{ disponivel: boolean; favoritas: CodigoLoteria[] }> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select("loterias_favoritas").eq("id", userId).single();
  if (error) return { disponivel: false, favoritas: [] };
  const lista = ((data?.loterias_favoritas as string[] | null) ?? []).filter(isCodigoLoteriaValido);
  return { disponivel: true, favoritas: lista };
}
