// Kit de dados para a imprensa (semana 5 do roadmap de growth): CSVs pequenos
// e agregados que um jornalista abre direto no Excel em português. Não
// substituem a API de dados (Premium), que entrega estatística por concurso.
// Funções puras, testadas em lib/kit-imprensa.test.ts.

import { anoDaEdicao, resumirEdicao, type EdicaoVirada } from "./mega-da-virada";
import type { RecordeGeral } from "./recordes";

// Excel em pt-BR: separador ";" e vírgula decimal. O BOM faz o Excel ler
// os acentos como UTF-8.
const BOM = "﻿";
const SEP = ";";

function celula(valor: string | number | null): string {
  if (valor === null) return "";
  const texto = typeof valor === "number" ? numeroCsv(valor) : valor;
  return /[";\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

// 1234567.5 -> "1234567,50" (sem separador de milhar, para o Excel ler como número)
function numeroCsv(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(".", ",");
}

function dataBr(iso: string): string {
  const [a, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${a}`;
}

function montar(cabecalho: string[], linhas: (string | number | null)[][]): string {
  return BOM + [cabecalho, ...linhas].map((l) => l.map(celula).join(SEP)).join("\r\n") + "\r\n";
}

export function csvMegaDaVirada(edicoes: EdicaoVirada[]): string {
  const linhas = [...edicoes]
    .sort((a, b) => a.numero - b.numero)
    .map((e) => {
      const r = resumirEdicao(e);
      return [
        anoDaEdicao(e.dataSorteio),
        e.numero,
        dataBr(e.dataSorteio),
        e.dezenas.map((d) => String(d).padStart(2, "0")).join(" "),
        r.ganhadoresSena,
        r.premioPorGanhador,
        r.premioTotalSena,
        r.ganhadoresQuina,
        r.ganhadoresQuadra,
        e.valorArrecadado && e.valorArrecadado > 0 ? e.valorArrecadado : null,
      ];
    });
  return montar(
    [
      "Edição (ano)",
      "Concurso",
      "Data do sorteio",
      "Dezenas sorteadas",
      "Ganhadores da sena",
      "Prêmio por aposta da sena (R$)",
      "Total pago na sena (R$)",
      "Ganhadores da quina",
      "Ganhadores da quadra",
      "Arrecadação (R$)",
    ],
    linhas
  );
}

export function csvRecordes(lista: RecordeGeral[], nomes: Record<string, string>): string {
  return montar(
    ["Loteria", "Maior prêmio por aposta (R$)", "Concurso", "Data do sorteio", "Ganhadores"],
    lista.map((r) => [nomes[r.codigo] ?? r.codigo, r.valor, r.numero, dataBr(r.data), r.ganhadores])
  );
}
