// Resumo em texto corrido de um concurso ("boletim"), montado por regras a
// partir dos dados do próprio banco — sem IA e sem reescrever matéria de
// terceiros. Cada frase só aparece quando o dado que a sustenta existe, então
// o texto muda porque a situação muda (acumulou 4 vezes seguidas, prêmio
// recorde, ninguém acertou a 2ª faixa), não por sorteio de sinônimos.
//
// Função pura (sem banco) para poder ser testada; o contexto histórico vem de
// getContextoConcurso em lib/queries.ts.

import type { Concurso, PremiacaoFaixa } from "./types";
import { formatarMoeda, preposicaoLoteria } from "./format";

export interface ContextoConcurso {
  // Concursos seguidos sem ganhador na faixa 1 imediatamente ANTES deste.
  acumuladosAntes: number;
  // Quantos concursos (até este) pagaram prêmio por aposta maior na faixa 1.
  // null quando este concurso não teve ganhador na faixa 1.
  premiosMaioresHistorico: number | null;
  premiosMaioresAno: number | null;
}

export interface EntradaResumo {
  codigoLoteria: string;
  nomeLoteria: string;
  concurso: Concurso;
  contexto: ContextoConcurso | null;
  repetidas: number | null;
  pares: number;
  impares: number;
  percentualParImpar: number | null;
  soma: number;
  percentualSoma: number | null;
}

export interface ResumoConcurso {
  manchete: string;
  paragrafos: string[];
}

const DIAS_SEMANA = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];

function parseData(iso: string | null): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

// "sábado (08/11)" — datas do banco são dias de calendário, lidas em UTC
// como em formatarData.
function diaComData(iso: string | null): string | null {
  const d = parseData(iso);
  if (!d) return null;
  const dia = String(d.getUTCDate()).padStart(2, "0");
  const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${DIAS_SEMANA[d.getUTCDay()]} (${dia}/${mes})`;
}

// "no sábado", "na quarta-feira"
function preposicaoDia(diaFormatado: string): "no" | "na" {
  return diaFormatado.startsWith("sábado") || diaFormatado.startsWith("domingo") ? "no" : "na";
}

function plural(n: number, singular: string, pluralForma: string): string {
  return `${n} ${n === 1 ? singular : pluralForma}`;
}

// "9,5%" — vírgula decimal e no máximo 1 casa, como no resto do texto.
function percentual(n: number): string {
  return `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(n)}%`;
}

function numeroBr(n: number): string {
  return new Intl.NumberFormat("pt-BR").format(n);
}

// "R$ 85 milhões", "R$ 1,5 milhão", "R$ 1,2 bilhão"; abaixo de 1 milhão,
// valor exato. Usado em manchete, onde o valor cheio fica ilegível.
export function formatarMoedaCompacta(valor: number): string {
  const fmt = (n: number) =>
    new Intl.NumberFormat("pt-BR", { maximumFractionDigits: n < 10 ? 1 : 0 }).format(n);
  if (valor >= 1e9) {
    const b = valor / 1e9;
    return `R$ ${fmt(b)} ${b < 2 ? "bilhão" : "bilhões"}`;
  }
  if (valor >= 1e6) {
    const m = valor / 1e6;
    return `R$ ${fmt(m)} ${m < 2 ? "milhão" : "milhões"}`;
  }
  return formatarMoeda(valor);
}

function descricaoFaixa(p: PremiacaoFaixa): string {
  const d = p.descricaoFaixa?.trim();
  return d ? d.toLowerCase() : `a ${p.faixa}ª faixa`;
}

function ordinal(n: number): string {
  return `${n}ª`;
}

function frasePremioFaixa(p: PremiacaoFaixa, principal: boolean): string {
  const desc = descricaoFaixa(p);
  if (p.qtdGanhadores === 0) {
    return principal ? `ninguém fez ${desc}` : `Ninguém fez ${desc}.`;
  }
  const valor = formatarMoeda(p.valorPremio);
  if (p.qtdGanhadores === 1) {
    return `1 aposta fez ${desc} e leva ${valor}`;
  }
  return `${numeroBr(p.qtdGanhadores)} apostas fizeram ${desc} e levam ${valor} cada`;
}

export function montarResumoConcurso(e: EntradaResumo): ResumoConcurso {
  const { concurso, contexto, nomeLoteria, codigoLoteria } = e;
  const { de } = preposicaoLoteria(codigoLoteria);
  const nomeConcurso = `${nomeLoteria} ${concurso.numero}`;
  const faixa1 = concurso.premiacoes.find((p) => p.faixa === 1) ?? null;
  const faixa2 = concurso.premiacoes.find((p) => p.faixa === 2) ?? null;
  const estimativa = concurso.valorEstimadoProximo && concurso.valorEstimadoProximo > 0
    ? concurso.valorEstimadoProximo
    : null;
  const dataProximo = diaComData(concurso.dataProximoConcurso);
  const semGanhador = faixa1 !== null && faixa1.qtdGanhadores === 0;
  // Dupla Sena: faixas 1–4 são do 1º sorteio e 5–8 do 2º (sena = faixa 5).
  // Sem essa ressalva, "ninguém fez 6 acertos" mentiria quando a sena do 2º
  // sorteio teve ganhador.
  const dupla = codigoLoteria === "duplasena";
  const no1Sorteio = dupla ? " no 1º sorteio" : "";
  const sena2 = dupla ? concurso.premiacoes.find((p) => p.faixa === 5) ?? null : null;

  // ── Manchete ──
  let manchete: string;
  if (concurso.acumulado) {
    manchete = estimativa
      ? `${nomeConcurso} acumula e prêmio vai a ${formatarMoedaCompacta(estimativa)}`
      : `${nomeConcurso} acumula`;
  } else if (faixa1 && faixa1.qtdGanhadores === 1) {
    manchete = `${nomeConcurso} tem 1 ganhador, que leva ${formatarMoedaCompacta(faixa1.valorPremio)}`;
  } else if (faixa1 && faixa1.qtdGanhadores > 1) {
    manchete = `${nomeConcurso} tem ${numeroBr(faixa1.qtdGanhadores)} ganhadores, que levam ${formatarMoedaCompacta(faixa1.valorPremio)} cada`;
  } else {
    manchete = `Resultado ${de} ${nomeConcurso}`;
  }

  const paragrafos: string[] = [];

  // ── 1º parágrafo: o que aconteceu na faixa principal ──
  const quando = diaComData(concurso.dataSorteio);
  const feminino = de === "da"; // "a Mega-Sena", "o Super Sete"
  const sorteadoEm = quando
    ? `, ${feminino ? "sorteada" : "sorteado"} ${preposicaoDia(quando)} ${quando}`
    : "";
  const artigo = feminino ? "A" : "O";
  let p1 = `${artigo} ${nomeConcurso}${sorteadoEm}`;
  // Fecha o aposto ", sorteada no sábado (07/11)," antes do verbo.
  const acumulou = `${sorteadoEm ? "," : ""} acumulou`;

  if (faixa1) {
    if (semGanhador) {
      p1 += concurso.acumulado
        ? `${acumulou}: ${frasePremioFaixa(faixa1, true)}${no1Sorteio}.`
        : `: ${frasePremioFaixa(faixa1, true)}${no1Sorteio}, mas pelas regras deste concurso o prêmio principal não acumula.`;
    } else {
      p1 += `: ${frasePremioFaixa(faixa1, true)}${no1Sorteio}.`;
    }
  } else {
    p1 += concurso.acumulado ? `${acumulou}.` : `${sorteadoEm ? "," : ""} teve o resultado divulgado.`;
  }

  if (contexto) {
    if (concurso.acumulado && semGanhador) {
      const seguidas = contexto.acumuladosAntes + 1;
      if (seguidas >= 2) p1 += ` É a ${ordinal(seguidas)} vez seguida sem ganhador${no1Sorteio}.`;
    } else if (faixa1 && faixa1.qtdGanhadores > 0 && contexto.acumuladosAntes >= 2) {
      p1 += ` O prêmio vinha acumulado havia ${contexto.acumuladosAntes} concursos.`;
    }
  }

  if (sena2) p1 += ` No 2º sorteio, ${frasePremioFaixa(sena2, true)}.`;

  if (contexto) {

    // Ranking só faz sentido com ganhador; valores são nominais (sem
    // correção pela inflação), então "da história" é por aposta e em valores
    // da época.
    if (faixa1 && faixa1.qtdGanhadores > 0 && contexto.premiosMaioresHistorico !== null) {
      const posHist = contexto.premiosMaioresHistorico + 1;
      if (posHist === 1) {
        p1 += ` É o maior prêmio por aposta já pago ${de} ${nomeLoteria} (em valores nominais).`;
      } else if (posHist <= 10) {
        p1 += ` É o ${posHist}º maior prêmio por aposta da história ${de} ${nomeLoteria} (em valores nominais).`;
      } else if (contexto.premiosMaioresAno === 0) {
        p1 += ` É o maior prêmio por aposta ${de} ${nomeLoteria} no ano até aqui.`;
      }
    }
  }
  paragrafos.push(p1);

  // ── 2º parágrafo: próximo concurso ──
  if (estimativa || dataProximo) {
    let p2 = "O próximo concurso";
    if (dataProximo) {
      p2 += ` é ${preposicaoDia(dataProximo)} ${dataProximo}`;
    }
    if (estimativa) {
      p2 += `${dataProximo ? ", com" : " tem"} prêmio estimado em ${formatarMoeda(estimativa)}`;
    }
    p2 += ".";
    paragrafos.push(p2);
  }

  // ── 3º parágrafo: faixa seguinte + números ──
  const partes: string[] = [];
  if (faixa2) {
    const frase = frasePremioFaixa(faixa2, false);
    partes.push(
      frase.endsWith(".")
        ? `${frase.slice(0, -1)}${no1Sorteio}.`
        : `Na faixa seguinte${dupla ? " do 1º sorteio" : ""}, ${frase}.`
    );
  }
  // Super Sete sorteia um algarismo (0–9) por coluna: "dezenas repetidas" e
  // pares/ímpares não dizem nada útil ao apostador, então ficam de fora.
  const semEstatisticaDezenas = codigoLoteria === "supersete";
  if (!semEstatisticaDezenas && e.repetidas !== null && e.repetidas > 0) {
    partes.push(
      e.repetidas === 1
        ? `Uma das dezenas repetiu o concurso anterior.`
        : `${e.repetidas} dezenas repetiram o concurso anterior.`
    );
  }
  if (!semEstatisticaDezenas && e.percentualParImpar !== null) {
    partes.push(
      `A divisão de ${plural(e.pares, "par", "pares")} e ${plural(e.impares, "ímpar", "ímpares")} aparece em ${percentual(e.percentualParImpar)} do histórico, e a soma ${e.soma}${
        e.percentualSoma !== null ? ` cai numa faixa que reúne ${percentual(e.percentualSoma)} dos concursos` : ""
      } — o que descreve o passado e não muda as chances do próximo sorteio.`
    );
  }
  if (partes.length > 0) paragrafos.push(partes.join(" "));

  return { manchete, paragrafos };
}
