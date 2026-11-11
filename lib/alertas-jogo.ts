// Avisos de jogo do simulador (semana 4 do roadmap, entrega c): "Quer saber
// se esse jogo ganha no próximo sorteio? Receba um aviso". A cada concurso
// novo da loteria, quem se inscreveu recebe a conferência do jogo, por push
// ou por e-mail, até se descadastrar. Tabela: alertas_jogo (migration
// 20261110000000_alertas_jogo.sql).
//
// Este arquivo só tem regras puras (testadas em lib/alertas-jogo.test.ts):
// validar o jogo, conferir contra um concurso e montar o texto do aviso. Os
// links de confirmar/descadastrar vêm de lib/alertas-jogo-tokens.ts (HMAC no
// servidor).

import { pontuarJogo, type FaixaConcurso } from "./conferencia";
import { FAIXAS_MILIONARIA } from "./probabilidades";
import { formatarMoeda, isCodigoLoteriaValido, preposicaoLoteria, qtdDezenasAposta } from "./format";

// Jogos inscritos por e-mail ou por aparelho, para o aviso não virar spam
// e a lista não crescer com jogos aleatórios.
export const LIMITE_JOGOS_POR_DESTINO = 5;
// E-mail não confirmado é apagado depois deste prazo (cron diário).
export const DIAS_PARA_CONFIRMAR = 7;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizarEmail(entrada: unknown): string | null {
  if (typeof entrada !== "string") return null;
  const email = entrada.trim().toLowerCase();
  return email.length <= 200 && EMAIL_REGEX.test(email) ? email : null;
}

// Tamanho do jogo que a pessoa marca: 50 na Lotomania (que sorteia 20), 10
// na Timemania (que sorteia 7), 7 colunas no Super Sete, a quantidade
// sorteada nas demais (ver qtdDezenasAposta).
export function tamanhoJogo(codigoLoteria: string, qtdDezenasSorteadas: number): number {
  if (codigoLoteria === "supersete") return 7;
  return qtdDezenasAposta(codigoLoteria, qtdDezenasSorteadas);
}

export interface LoteriaParaValidar {
  codigo: string;
  dezenaMin: number;
  dezenaMax: number;
  qtdDezenasSorteadas: number;
}

export type JogoValidado = { dezenas: number[]; trevos: number[] | null };

function inteiros(entrada: unknown): number[] | null {
  if (!Array.isArray(entrada) || entrada.length > 60) return null;
  return entrada.every((n) => Number.isInteger(n)) ? (entrada as number[]) : null;
}

// Valida o jogo vindo do navegador. Dezenas ordenadas e sem repetição
// (Super Sete: 7 algarismos de 0 a 9, na ordem das colunas, podem repetir).
export function validarJogoAlerta(
  loteria: LoteriaParaValidar,
  dezenasEntrada: unknown,
  trevosEntrada: unknown
): JogoValidado | { erro: string } {
  if (!isCodigoLoteriaValido(loteria.codigo)) return { erro: "Loteria inválida." };
  const dezenas = inteiros(dezenasEntrada);
  const qtd = tamanhoJogo(loteria.codigo, loteria.qtdDezenasSorteadas);
  if (!dezenas || dezenas.length !== qtd) return { erro: `O jogo precisa ter ${qtd} números.` };

  if (loteria.codigo === "supersete") {
    if (dezenas.some((d) => d < 0 || d > 9)) return { erro: "Cada coluna vai de 0 a 9." };
    return { dezenas, trevos: null };
  }

  if (dezenas.some((d) => d < loteria.dezenaMin || d > loteria.dezenaMax)) {
    return { erro: "Há número fora da faixa da loteria." };
  }
  if (new Set(dezenas).size !== dezenas.length) return { erro: "Há número repetido no jogo." };
  const ordenadas = [...dezenas].sort((a, b) => a - b);

  if (loteria.codigo === "maismilionaria") {
    const trevos = inteiros(trevosEntrada);
    if (!trevos || trevos.length !== 2 || new Set(trevos).size !== 2 || trevos.some((t) => t < 1 || t > 6)) {
      return { erro: "Escolha os 2 trevos." };
    }
    return { dezenas: ordenadas, trevos: [...trevos].sort((a, b) => a - b) };
  }
  return { dezenas: ordenadas, trevos: null };
}

export interface ConcursoAlerta {
  numero: number;
  dezenas: number[];
  dezenasSegundoSorteio: number[] | null;
  trevos: number[] | null;
}

export interface LinhaConferencia {
  sorteio?: 1 | 2;
  acertos: number;
  // Acertos de trevos (+Milionária).
  trevos?: number;
  faixa: string | null; // descrição da Caixa ("4 acertos")
  premio: number | null; // valor pago; null se a faixa acumulou
  acumulou: boolean;
}

export interface ConferenciaAlerta {
  linhas: LinhaConferencia[];
  premiado: boolean;
  valorTotal: number;
}

export function conferirJogoAlerta(
  codigoLoteria: string,
  jogo: JogoValidado,
  concurso: ConcursoAlerta,
  faixas: FaixaConcurso[]
): ConferenciaAlerta {
  let linhas: LinhaConferencia[];

  if (codigoLoteria === "maismilionaria" && jogo.trevos) {
    const sorteadas = new Set(concurso.dezenas);
    const acertos = jogo.dezenas.filter((d) => sorteadas.has(d)).length;
    const trevosSorteados = new Set(concurso.trevos ?? []);
    const acertosTrevos = jogo.trevos.filter((t) => trevosSorteados.has(t)).length;
    const indice = FAIXAS_MILIONARIA[`${acertos},${acertosTrevos}`];
    const faixa = indice !== undefined ? faixas.find((f) => f.faixa === indice) ?? null : null;
    linhas = [{
      acertos,
      trevos: acertosTrevos,
      faixa: faixa?.descricaoFaixa ?? null,
      premio: faixa && faixa.qtdGanhadores > 0 ? faixa.valorPremio : null,
      acumulou: !!faixa && faixa.qtdGanhadores === 0,
    }];
  } else {
    linhas = pontuarJogo(
      codigoLoteria,
      jogo.dezenas,
      { numero: concurso.numero, dezenas: concurso.dezenas, dezenasSegundoSorteio: concurso.dezenasSegundoSorteio },
      faixas
    ).map((r) => ({
      sorteio: r.sorteio,
      acertos: r.acertos,
      faixa: r.faixa?.descricaoFaixa ?? null,
      premio: r.premioReais,
      acumulou: r.acumulado,
    }));
  }

  const valorTotal = linhas.reduce((s, l) => s + (l.premio ?? 0), 0);
  return { linhas, premiado: linhas.some((l) => l.faixa !== null), valorTotal };
}

function descreverLinha(l: LinhaConferencia, superSete: boolean): string {
  const unidade = superSete
    ? l.acertos === 1 ? "coluna certa" : "colunas certas"
    : l.acertos === 1 ? "acerto" : "acertos";
  const trevos = l.trevos !== undefined ? ` e ${l.trevos} ${l.trevos === 1 ? "trevo" : "trevos"}` : "";
  const sorteio = l.sorteio ? ` no ${l.sorteio}º sorteio` : "";
  let resultado = "";
  if (l.premio !== null) resultado = `: prêmio de ${formatarMoeda(l.premio)}`;
  else if (l.acumulou) resultado = ": faixa premiada, mas ninguém ganhou nela neste concurso";
  return `${l.acertos} ${unidade}${trevos}${sorteio}${resultado}`;
}

export interface TextoAviso {
  titulo: string;
  corpo: string;
  // Uma linha por sorteio (Dupla Sena tem duas).
  detalhes: string[];
}

// Texto do aviso (push e assunto/abertura do e-mail). Honesto nos dois
// sentidos: premiado diz o valor; não premiado diz quantos acertos fez.
export function textoAviso(
  nomeLoteria: string,
  codigoLoteria: string,
  numeroConcurso: number,
  conf: ConferenciaAlerta
): TextoAviso {
  const superSete = codigoLoteria === "supersete";
  const { em } = preposicaoLoteria(codigoLoteria); // "na Mega-Sena", "no Super Sete"
  const detalhes = conf.linhas.map((l) => descreverLinha(l, superSete));
  if (conf.premiado) {
    const valor = conf.valorTotal > 0 ? ` (${formatarMoeda(conf.valorTotal)})` : "";
    return {
      titulo: `Seu jogo foi premiado ${em} ${nomeLoteria} ${numeroConcurso}${valor}`,
      corpo: detalhes.join(" · "),
      detalhes,
    };
  }
  return {
    titulo: `Seu jogo ${em} ${nomeLoteria} ${numeroConcurso}`,
    corpo: `${detalhes.join(" · ")}. Não foi dessa vez.`,
    detalhes,
  };
}
