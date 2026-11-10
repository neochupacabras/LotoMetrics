// Frases do concurso que levam às tabelas da mesma loteria, com o link no
// meio do texto e ligado ao resultado ("a dezena 41 voltou depois de 37
// concursos sem sair; veja as dezenas atrasadas da Mega-Sena").
//
// Por quê: as tabelas rendem ~6,4 cliques por URL no Google, os concursos
// ~0,08 (docs/growth/SEO_PROGRAMMATIC_STRATEGY.md, seção 1 e 5). As páginas de
// concurso passam a distribuir autoridade para as tabelas, com âncora no texto
// da busca e sem bloco genérico de links.
//
// Regras: cada frase só aparece quando o dado que a sustenta existe, e os
// números são os do histórico ATÉ este concurso, para o texto de um concurso
// antigo continuar verdadeiro com o tempo. Função pura (sem banco), testada em
// lib/links-concurso.test.ts; os dados vêm de getHistoricoDezenasConcurso e
// getFinsDeCiclo em lib/queries.ts.

import { getCategoriasParaLoteria } from "./categorias";
import { preposicaoLoteria } from "./format";
import { tituloBuscaTabela } from "./seo-tabelas";

export interface HistoricoDezena {
  dezena: number;
  // Vezes que a dezena saiu do 1º concurso até este, inclusive.
  vezes: number;
  // Último concurso ANTES deste em que a dezena saiu; null se é a 1ª vez.
  ultimoAntes: number | null;
}

export interface CicloFechado {
  // Concursos que o ciclo levou para sortear todas as dezenas.
  qtdConcursos: number;
}

export interface EntradaLinksConcurso {
  codigoLoteria: string;
  nomeLoteria: string;
  numero: number;
  dezenaMax: number;
  dezenas: number[];
  dezenasAnterior: number[] | null;
  // Histórico das dezenas deste concurso; null se a consulta falhou.
  historico: HistoricoDezena[] | null;
  // Concursos da loteria até este, inclusive.
  totalConcursos: number | null;
  // Preenchido só quando este concurso fechou um ciclo.
  cicloFechado: CicloFechado | null;
  // Posição do prêmio deste concurso entre os maiores por aposta da história
  // (1 = maior), quando teve ganhador na faixa 1. O resumo já diz a posição;
  // aqui só entra o link para a página de recordes.
  posicaoPremioHistorico?: number | null;
}

export type ParteFrase = string | { texto: string; href: string };
export type FraseLink = ParteFrase[];

function dz(n: number): string {
  return String(n).padStart(2, "0");
}

function numeroBr(n: number): string {
  return new Intl.NumberFormat("pt-BR").format(n);
}

// "05", "05 e 12", "05, 12 e 23"
function listar(dezenas: number[]): string {
  const s = dezenas.map(dz);
  if (s.length <= 1) return s.join("");
  return `${s.slice(0, -1).join(", ")} e ${s[s.length - 1]}`;
}

function minuscula(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

export function montarLinksConcurso(e: EntradaLinksConcurso): FraseLink[] {
  // Super Sete sorteia um algarismo por coluna: "dezena que mais saiu" e
  // "atrasada" não têm o mesmo sentido, e repetidas/ciclos nem existem lá.
  if (e.codigoLoteria === "supersete") return [];

  const slugs = new Set(getCategoriasParaLoteria(e.codigoLoteria).map((c) => c.slug));
  const href = (slug: string) => `/${e.codigoLoteria}/tabelas/${slug}`;
  const ancora = (slug: string, fallback: string) =>
    minuscula(tituloBuscaTabela(slug, e.codigoLoteria, fallback));
  const { de } = preposicaoLoteria(e.codigoLoteria);
  // Dupla Sena: as tabelas consideram só o 1º sorteio (coluna `dezenas`).
  const doSorteio = e.codigoLoteria === "duplasena" ? "do 1º sorteio" : "deste resultado";

  const frases: FraseLink[] = [];

  // ── Repetidas do concurso anterior ──
  if (slugs.has("repetidas") && e.dezenasAnterior) {
    const anterior = new Set(e.dezenasAnterior);
    const repetidas = [...e.dezenas].filter((d) => anterior.has(d)).sort((a, b) => a - b);
    if (repetidas.length > 0) {
      const inicio = repetidas.length === 1
        ? `A dezena ${dz(repetidas[0])} saiu de novo: também tinha sido sorteada no concurso ${e.numero - 1}. `
        : `As dezenas ${listar(repetidas)} saíram de novo, repetindo o concurso ${e.numero - 1}. `;
      frases.push([
        `${inicio}Veja na `,
        { texto: `tabela de ${ancora("repetidas", "Dezenas repetidas")}`, href: href("repetidas") },
        " quantas dezenas costumam se repetir de um concurso para o outro.",
      ]);
    }
  }

  const historico = (e.historico ?? []).filter((h) => e.dezenas.includes(h.dezena));

  // ── Dezena deste resultado que mais saiu até aqui ──
  if (slugs.has("frequencia") && historico.length > 0 && e.totalConcursos) {
    const max = Math.max(...historico.map((h) => h.vezes));
    const lideres = historico.filter((h) => h.vezes === max).map((h) => h.dezena).sort((a, b) => a - b);
    if (max > 1 && lideres.length <= 3) {
      const quem = lideres.length === 1
        ? `a ${dz(lideres[0])} é a que mais saiu até este concurso: ${numeroBr(max)} vezes`
        : `as dezenas ${listar(lideres)} são as que mais saíram até este concurso: ${numeroBr(max)} vezes cada`;
      frases.push([
        `Entre as dezenas ${doSorteio}, ${quem} em ${numeroBr(e.totalConcursos)} concursos. Veja quantas vezes cada uma já saiu nos `,
        { texto: ancora("frequencia", "Frequência"), href: href("frequencia") },
        ".",
      ]);
    }
  }

  // ── Maior ausência entre as dezenas deste resultado ──
  if (slugs.has("atraso") && historico.length > 0) {
    const ausencias = historico
      .filter((h) => h.ultimoAntes !== null)
      .map((h) => ({ dezena: h.dezena, concursos: e.numero - (h.ultimoAntes as number) - 1 }));
    const max = ausencias.length > 0 ? Math.max(...ausencias.map((a) => a.concursos)) : 0;
    const lideres = ausencias.filter((a) => a.concursos === max).map((a) => a.dezena).sort((a, b) => a - b);
    if (max >= 2 && lideres.length <= 3) {
      const quem = lideres.length === 1
        ? `A dezena ${dz(lideres[0])} voltou a sair depois de ${numeroBr(max)} concursos de ausência, o maior intervalo entre as dezenas ${doSorteio}.`
        : `As dezenas ${listar(lideres)} voltaram a sair depois de ${numeroBr(max)} concursos de ausência, o maior intervalo entre as dezenas ${doSorteio}.`;
      frases.push([
        `${quem} Veja as `,
        { texto: ancora("atraso", "Atraso"), href: href("atraso") },
        " e há quantos concursos cada uma não sai.",
      ]);
    }
  }

  // ── Fechamento de ciclo ──
  if (slugs.has("ciclos") && e.cicloFechado) {
    const n = e.cicloFechado.qtdConcursos;
    frases.push([
      `Este concurso fechou um ciclo ${de} ${e.nomeLoteria}: as ${e.dezenaMax} dezenas saíram pelo menos uma vez em ${numeroBr(n)} ${n === 1 ? "concurso" : "concursos"}. Acompanhe o `,
      { texto: ancora("ciclos", "Ciclos"), href: href("ciclos") },
      " e quais dezenas faltam no ciclo atual.",
    ]);
  }

  // ── Prêmio entre os 10 maiores da história ──
  if (e.posicaoPremioHistorico && e.posicaoPremioHistorico <= 10) {
    frases.push([
      "Veja os 10 maiores prêmios, com data e número de ganhadores, nos ",
      { texto: `recordes ${de} ${e.nomeLoteria}`, href: `/${e.codigoLoteria}/recordes` },
      ".",
    ]);
  }

  return frases;
}
