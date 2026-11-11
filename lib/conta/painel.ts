import { createClient } from "@/lib/supabase/server";
import { agoraBrasilia } from "@/lib/calendario";
import { LOTERIAS, isCodigoLoteriaValido, preposicaoLoteria } from "@/lib/format";
import { linhaDoDia, ordemLoteriasPainel, saudacaoPorHora } from "@/lib/conta/painel-regras";
import {
  TODAS_LOTERIAS,
  carregarLoteriasFavoritas,
  carregarResumoLoterias,
  conferirJogoSalvo,
  type ConferenciaJogo,
} from "@/lib/conta/loterias";
import type { CodigoLoteria } from "@/lib/types";

// Dados do Painel (/conta). Regra da proposta: só dado real — se não há
// informação confiável para um módulo, ele mostra um estado vazio útil em
// vez de um número inventado.
//
// Custo: 3 consultas ao Supabase (jogos, bolões, favoritas; a da
// assinatura fica na página) + os concursos de lib/conta/loterias.ts, em
// lote e em cache.

const MAX_JOGOS = 3;
const MAX_ATIVIDADE = 5;

export interface LoteriaPainel {
  codigo: CodigoLoteria;
  nome: string;
  concurso: number;
  dataSorteio: string; // AAAA-MM-DD
  acumulou: boolean;
  premioEstimado: number | null;
  proximoSorteioIso: string;
  jogosSalvos: number;
  favorita: boolean;
}

export interface JogoPainel {
  id: string;
  codigo: CodigoLoteria;
  nome: string;
  dezenas: number[];
  label: string | null;
  // Conferência contra o último concurso da loteria (null se não há concurso).
  conferencia: ConferenciaJogo | null;
}

export interface AtividadePainel {
  tipo: "jogo" | "bolao";
  quando: string; // ISO
  texto: string;
  href: string;
}

export interface DadosPainel {
  saudacao: string;
  dataHoje: string;
  linhaDoDia: string;
  loterias: LoteriaPainel[];
  totalJogos: number;
  jogos: JogoPainel[];
  atividade: AtividadePainel[];
  loteriaContexto: CodigoLoteria;
}

function preposicao(codigo: CodigoLoteria): string {
  return preposicaoLoteria(codigo).de;
}

export async function carregarPainel(userId: string): Promise<DadosPainel> {
  const supabase = await createClient();
  const agora = new Date();
  const refBrasilia = agoraBrasilia();

  const [{ data: jogosRaw }, { data: boloesRaw }, resumos, { favoritas }] = await Promise.all([
    supabase
      .from("user_games")
      .select("id, loteria, dezenas, label, created_at")
      .eq("user_id", userId)
      .eq("ativo", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("boloes")
      .select("id, titulo, loteria, criado_em")
      .eq("owner_id", userId)
      .order("criado_em", { ascending: false })
      .limit(MAX_ATIVIDADE),
    carregarResumoLoterias(),
    carregarLoteriasFavoritas(userId),
  ]);

  const jogos = (jogosRaw ?? []).filter((j) => isCodigoLoteriaValido(j.loteria));
  const boloes = boloesRaw ?? [];

  // Loterias dos jogos salvos, das mais jogadas para as menos.
  const contagem = new Map<CodigoLoteria, number>();
  for (const j of jogos) {
    const c = j.loteria as CodigoLoteria;
    contagem.set(c, (contagem.get(c) ?? 0) + 1);
  }
  const doUsuario = [...contagem.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c);

  const loteriasPainel: LoteriaPainel[] = ordemLoteriasPainel(favoritas, doUsuario).flatMap((codigo) => {
    const r = resumos.get(codigo);
    if (!r) return [];
    return [
      {
        codigo,
        nome: r.nome,
        concurso: r.concurso.numero,
        dataSorteio: r.concurso.dataSorteio,
        acumulou: r.concurso.acumulado,
        premioEstimado: r.concurso.valorEstimadoProximo,
        proximoSorteioIso: r.proximoSorteioIso,
        jogosSalvos: contagem.get(codigo) ?? 0,
        favorita: favoritas.includes(codigo),
      },
    ];
  });

  const jogosPainel: JogoPainel[] = jogos.slice(0, MAX_JOGOS).map((j) => {
    const codigo = j.loteria as CodigoLoteria;
    const dezenas = j.dezenas as number[];
    return {
      id: j.id,
      codigo,
      nome: LOTERIAS[codigo].nome,
      dezenas,
      label: j.label ?? null,
      conferencia: conferirJogoSalvo(codigo, dezenas, resumos.get(codigo)?.concurso),
    };
  });

  const atividade: AtividadePainel[] = [
    ...jogos.slice(0, MAX_ATIVIDADE).map((j) => ({
      tipo: "jogo" as const,
      quando: j.created_at as string,
      texto: `Jogo salvo ${preposicao(j.loteria as CodigoLoteria)} ${LOTERIAS[j.loteria as CodigoLoteria].nome}${j.label ? ` — “${j.label}”` : ""}`,
      href: "/conta/jogos",
    })),
    ...boloes.map((b) => ({
      tipo: "bolao" as const,
      quando: b.criado_em as string,
      texto: `Bolão criado: ${b.titulo}`,
      href: `/conta/boloes/${b.id}`,
    })),
  ]
    .sort((a, b) => b.quando.localeCompare(a.quando))
    .slice(0, MAX_ATIVIDADE);

  // Contexto dos atalhos: primeira favorita, senão a mais jogada, senão Mega-Sena.
  const loteriaContexto = favoritas[0] ?? doUsuario[0] ?? "megasena";

  const proximos = TODAS_LOTERIAS.flatMap((codigo) => {
    const r = resumos.get(codigo);
    return r ? [{ codigo, instante: new Date(r.proximoSorteioIso) }] : [];
  });

  const dataHoje = refBrasilia.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return {
    saudacao: saudacaoPorHora(refBrasilia.getHours()),
    dataHoje,
    linhaDoDia: linhaDoDia(proximos, agora),
    loterias: loteriasPainel,
    totalJogos: jogos.length,
    jogos: jogosPainel,
    atividade,
    loteriaContexto,
  };
}
