// Leitura das dezenas no texto que o Google Cloud Vision devolve da foto de
// um bilhete (app/api/ocr/route.ts). Funções puras, testadas em
// lib/ocr-bilhete.test.ts.
//
// O bilhete impresso tem muito número que não é aposta: data e hora da
// compra, valor, número do concurso, código do terminal, protocolo. A versão
// antiga pegava todo número de 1 ou 2 algarismos ("24/10/2026" virava 24 e
// 10). Aqui o texto é limpo antes (datas, horas, valores e números de 3 ou
// mais algarismos saem), linhas de cabeçalho/rodapé são ignoradas e as
// linhas "densas" (quase só números, como a linha do jogo) têm prioridade.

import { qtdDezenasAposta } from "./format";
import type { CodigoLoteria } from "./types";

export interface ConfigOcr {
  min: number;
  max: number;
  // Quantos números a pessoa marca num jogo simples.
  qtd: number;
  // Super Sete: um algarismo por coluna, na ordem, pode repetir.
  porColuna?: boolean;
}

// Faixas da tabela `loteria` em produção. qtd = tamanho da aposta simples
// (Lotomania 50 e Timemania 10, não a quantidade sorteada).
const SORTEADAS: Record<CodigoLoteria, { min: number; max: number; sorteadas: number }> = {
  lotofacil:      { min: 1, max: 25, sorteadas: 15 },
  megasena:       { min: 1, max: 60, sorteadas: 6 },
  quina:          { min: 1, max: 80, sorteadas: 5 },
  lotomania:      { min: 0, max: 99, sorteadas: 20 },
  diadesorte:     { min: 1, max: 31, sorteadas: 7 },
  maismilionaria: { min: 1, max: 50, sorteadas: 6 },
  timemania:      { min: 1, max: 80, sorteadas: 7 },
  duplasena:      { min: 1, max: 50, sorteadas: 6 },
  supersete:      { min: 0, max: 9,  sorteadas: 7 },
};

export const CONFIG_OCR: Record<CodigoLoteria, ConfigOcr> = Object.fromEntries(
  Object.entries(SORTEADAS).map(([codigo, f]) => [
    codigo,
    {
      min: f.min,
      max: f.max,
      qtd: qtdDezenasAposta(codigo, f.sorteadas),
      ...(codigo === "supersete" ? { porColuna: true } : {}),
    },
  ])
) as Record<CodigoLoteria, ConfigOcr>;

export type Confianca = "alta" | "media" | "baixa";

export interface LeituraBilhete {
  // Dezenas em ordem crescente; no Super Sete, os 7 algarismos na ordem das
  // colunas.
  dezenas: number[];
  confianca: Confianca;
}

// Linhas que nunca trazem a aposta: cabeçalho, rodapé e os campos extras
// (trevos da +Milionária, Time do Coração, Mês da Sorte), que continuam
// sendo marcados à mão no conferidor.
const LINHA_IGNORADA =
  /(conc|valor|total|r\$|data|hora|terminal|cpf|cnpj|trevo|time\s+do|cora[çc][ãa]o|m[êe]s|protocolo|c[óo]d|aposta\s*n|n[º°o]\s*\d|teimosinha|lot[ée]rica|autentica|id\s*:)/i;

// Só "/" (ou "." com ano): "01-02-03" pode ser um jogo separado por hífen.
const DATA = /\b\d{1,2}\s*\/\s*\d{1,2}(\s*\/\s*\d{2,4})?\b|\b\d{1,2}\.\d{1,2}\.\d{2,4}\b/g;
const HORA = /\b\d{1,2}\s*[:h]\s*\d{2}(\s*:\s*\d{2})?\b/gi;
const VALOR = /\b\d+(\.\d{3})*,\d{2}\b/g;
const LONGO = /\b\d{3,}\b/g;
// Prefixo de jogo ("A:", "B)", "01 -" não, só letra única).
const PREFIXO_JOGO = /^\s*[A-Za-z]\s*[:.)\]-]\s*/;

// O OCR às vezes lê o zero como a letra O ("O5", "1O", "OO").
function corrigirZeros(linha: string): string {
  return linha.replace(/\b[0-9Oo]{2}\b/g, (t) => (/\d/.test(t) || /^[Oo]{2}$/.test(t) ? t.replace(/[Oo]/g, "0") : t));
}

export function limparLinha(linha: string): string {
  return corrigirZeros(linha)
    .replace(DATA, " ")
    .replace(HORA, " ")
    .replace(VALOR, " ")
    .replace(LONGO, " ")
    .replace(PREFIXO_JOGO, " ");
}

interface LinhaLida {
  numeros: number[];
  densa: boolean;
}

function lerLinhas(texto: string, maxAlgarismos: 1 | 2): LinhaLida[] {
  const token = maxAlgarismos === 1 ? /\b\d\b/g : /\b\d{1,2}\b/g;
  return texto
    .split(/\r?\n/)
    .filter((l) => !LINHA_IGNORADA.test(l))
    .map((bruta) => {
      const linha = limparLinha(bruta);
      const numeros = (linha.match(token) ?? []).map(Number);
      const semEspaco = linha.replace(/[\s\-–,;|]/g, "");
      const digitos = (linha.match(/\d/g) ?? []).length;
      // "Densa": tem ao menos 3 números e quase só algarismos.
      const densa = numeros.length >= 3 && semEspaco.length > 0 && digitos / semEspaco.length >= 0.8;
      return { numeros, densa };
    })
    .filter((l) => l.numeros.length > 0);
}

function confiancaPor(lidos: number, qtd: number): Confianca {
  if (lidos === qtd) return "alta";
  return lidos >= qtd - 2 ? "media" : "baixa";
}

// Pega os primeiros `qtd` números distintos na ordem do bilhete. Num bilhete
// com vários jogos (A, B, C...), isso é o primeiro jogo.
function primeirosDistintos(numeros: number[], cfg: ConfigOcr): number[] {
  const vistos = new Set<number>();
  for (const n of numeros) {
    if (n < cfg.min || n > cfg.max) continue;
    vistos.add(n);
    if (vistos.size === cfg.qtd) break;
  }
  return [...vistos];
}

function lerDezenas(texto: string, cfg: ConfigOcr): LeituraBilhete {
  const linhas = lerLinhas(texto, 2);
  const densas = primeirosDistintos(linhas.filter((l) => l.densa).flatMap((l) => l.numeros), cfg);
  const todas = primeirosDistintos(linhas.flatMap((l) => l.numeros), cfg);
  // As linhas densas bastam quando formam o jogo inteiro; senão, completa
  // com o resto (bilhete com dezenas espalhadas ou mal recortado).
  const escolhidas = densas.length >= cfg.qtd ? densas : todas.length > densas.length ? todas : densas;
  return {
    dezenas: [...escolhidas].sort((a, b) => a - b),
    confianca: confiancaPor(escolhidas.length, cfg.qtd),
  };
}

// Super Sete: procura "Coluna 1: 5", "C1 5" etc.; senão a primeira linha com
// 7 algarismos isolados; senão os 7 primeiros algarismos das linhas densas.
function lerColunas(texto: string, cfg: ConfigOcr): LeituraBilhete {
  const rotuladas = new Map<number, number>();
  for (const m of texto.matchAll(/\bc(?:ol(?:una)?)?\.?\s*([1-7])\s*[:=-]?\s+(\d)\b/gi)) {
    const coluna = Number(m[1]);
    if (!rotuladas.has(coluna)) rotuladas.set(coluna, Number(m[2]));
  }
  if (rotuladas.size === cfg.qtd) {
    return { dezenas: [1, 2, 3, 4, 5, 6, 7].map((c) => rotuladas.get(c)!), confianca: "alta" };
  }

  const linhas = lerLinhas(texto, 1);
  const exata = linhas.find((l) => l.numeros.length === cfg.qtd);
  if (exata) return { dezenas: exata.numeros, confianca: "alta" };

  const densas = linhas.filter((l) => l.densa).flatMap((l) => l.numeros).slice(0, cfg.qtd);
  return { dezenas: densas, confianca: confiancaPor(densas.length, cfg.qtd) };
}

export function lerBilhete(texto: string, cfg: ConfigOcr): LeituraBilhete {
  return cfg.porColuna ? lerColunas(texto, cfg) : lerDezenas(texto, cfg);
}
