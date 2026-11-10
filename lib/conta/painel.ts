import { createClient } from "@/lib/supabase/server";
import { getLoteriaPorCodigo, getUltimosConcursos } from "@/lib/queries";
import { agoraBrasilia, dataHoraProximoSorteio } from "@/lib/calendario";
import { pontuarJogo } from "@/lib/conferencia";
import { LOTERIAS, isCodigoLoteriaValido, preposicaoLoteria } from "@/lib/format";
import { linhaDoDia, saudacaoPorHora } from "@/lib/conta/painel-regras";
import type { CodigoLoteria, Concurso } from "@/lib/types";

// Dados do Painel (/conta). Regra da proposta: só dado real — se não há
// informação confiável para um módulo, ele mostra um estado vazio útil em
// vez de um número inventado.
//
// Custo: 2 consultas ao Supabase (jogos, bolões; a da assinatura fica na
// página) + concursos via getLoteriaPorCodigo/getUltimosConcursos, ambos em
// unstable_cache e o segundo em LOTE (uma query para as 9 loterias — ver
// [[project_n1_queries_loterias]] na memória: nada de laço por loteria).

const TODAS: CodigoLoteria[] = Object.keys(LOTERIAS) as CodigoLoteria[];
// Sem jogos salvos, o módulo de loterias mostra as de maior procura.
const PADRAO: CodigoLoteria[] = ["megasena", "lotofacil", "quina"];
const MIN_LOTERIAS = 3;
const MAX_LOTERIAS = 4;
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
}

export interface JogoPainel {
  id: string;
  codigo: CodigoLoteria;
  nome: string;
  dezenas: number[];
  label: string | null;
  // Conferência contra o último concurso da loteria (null se não há concurso).
  conferencia: {
    concurso: number;
    acertos: number;
    // "1º sorteio" / "2º sorteio" (Dupla Sena: vale o melhor dos dois).
    sorteio: string | null;
    premiado: boolean;
    premioReais: number | null;
    // +Milionária: a faixa depende dos trevos, que o jogo salvo não guarda.
    confirmarTrevos: boolean;
  } | null;
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

function conferir(codigo: CodigoLoteria, dezenas: number[], concurso: Concurso | undefined): JogoPainel["conferencia"] {
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
  // Dupla Sena devolve um resultado por sorteio: mostra o melhor.
  const melhor = [...resultados].sort((a, b) => {
    const pa = a.faixa ? 1 : 0;
    const pb = b.faixa ? 1 : 0;
    return pb - pa || b.acertos - a.acertos;
  })[0];
  return {
    concurso: concurso.numero,
    acertos: melhor.acertos,
    sorteio: resultados.length > 1 && melhor.sorteio ? `${melhor.sorteio}º sorteio` : null,
    premiado: !!melhor.faixa,
    premioReais: melhor.premioReais,
    confirmarTrevos: !!melhor.faixaIndeterminada,
  };
}

export async function carregarPainel(userId: string): Promise<DadosPainel> {
  const supabase = await createClient();
  const agora = new Date();
  const refBrasilia = agoraBrasilia();

  const [{ data: jogosRaw }, { data: boloesRaw }, loterias] = await Promise.all([
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
    Promise.all(TODAS.map((c) => getLoteriaPorCodigo(c))),
  ]);

  const jogos = (jogosRaw ?? []).filter((j) => isCodigoLoteriaValido(j.loteria));
  const boloes = boloesRaw ?? [];

  const idPorCodigo = new Map<CodigoLoteria, number>();
  loterias.forEach((l, i) => {
    if (l) idPorCodigo.set(TODAS[i], l.id);
  });
  const ultimos = await getUltimosConcursos([...idPorCodigo.values()]);
  const concursoDe = (c: CodigoLoteria) => {
    const id = idPorCodigo.get(c);
    return id === undefined ? undefined : ultimos[id];
  };

  // Loterias do usuário, das mais jogadas para as menos.
  const contagem = new Map<CodigoLoteria, number>();
  for (const j of jogos) {
    const c = j.loteria as CodigoLoteria;
    contagem.set(c, (contagem.get(c) ?? 0) + 1);
  }
  const doUsuario = [...contagem.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c);
  // Completa com as de maior procura até 3 linhas, para o módulo não ficar
  // com uma linha só (as do usuário vêm primeiro e mostram "N jogos salvos").
  const foco = [...doUsuario, ...PADRAO.filter((c) => !doUsuario.includes(c))].slice(
    0,
    Math.max(MIN_LOTERIAS, Math.min(doUsuario.length, MAX_LOTERIAS))
  );

  const proximos = TODAS.flatMap((codigo) => {
    const c = concursoDe(codigo);
    if (!c) return [];
    return [{ codigo, instante: dataHoraProximoSorteio(codigo, refBrasilia, c.dataProximoConcurso) }];
  });
  const proximoDe = new Map(proximos.map((p) => [p.codigo, p.instante]));

  const loteriasPainel: LoteriaPainel[] = foco.flatMap((codigo) => {
    const c = concursoDe(codigo);
    const proximo = proximoDe.get(codigo);
    if (!c || !proximo) return [];
    return [
      {
        codigo,
        nome: LOTERIAS[codigo].nome,
        concurso: c.numero,
        dataSorteio: c.dataSorteio,
        acumulou: c.acumulado,
        premioEstimado: c.valorEstimadoProximo,
        proximoSorteioIso: proximo.toISOString(),
        jogosSalvos: contagem.get(codigo) ?? 0,
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
      conferencia: conferir(codigo, dezenas, concursoDe(codigo)),
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

  // Contexto dos atalhos: a loteria mais jogada (ou a Mega-Sena).
  const loteriaContexto = doUsuario[0] ?? "megasena";

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
