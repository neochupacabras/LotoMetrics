// Texto do card "meu jogo teria ganho" (imagem para mandar no WhatsApp),
// montado a partir da simulação feita no servidor. Função pura, testada em
// lib/card-simulador.test.ts.
//
// Regra de honestidade: o card nunca mostra só o prêmio. Sempre diz em
// quantos concursos, quanto teria gastado e o saldo, para não virar
// propaganda de "jogo que ganha".

import { formatarMoeda } from "./format";

export interface EntradaCard {
  nomeLoteria: string;
  // "da Mega-Sena", "do Super Sete"
  deLoteria: string;
  superSete: boolean;
  totalConcursos: number;
  totalGasto: number;
  totalGanho: number;
  saldoFinal: number;
  // Maior prêmio da simulação (o primeiro de `melhores`), se houve.
  maiorPremio: { numero: number; acertos: number; premio: number } | null;
}

export interface TextoCard {
  titulo: string;
  destaque: string | null;
  resumo: string;
  premiado: boolean;
}

function numeroBr(n: number): string {
  return new Intl.NumberFormat("pt-BR").format(n);
}

export function montarTextoCard(e: EntradaCard): TextoCard {
  const concursos = `${numeroBr(e.totalConcursos)} ${e.totalConcursos === 1 ? "concurso" : "concursos"}`;
  const premiado = e.totalGanho > 0 && e.maiorPremio !== null;

  if (!premiado) {
    return {
      titulo: "Meu jogo não teria ganho nada",
      destaque: null,
      resumo: `Em ${concursos} ${e.deLoteria}, eu gastaria ${formatarMoeda(e.totalGasto)} sem nenhum prêmio.`,
      premiado: false,
    };
  }

  const p = e.maiorPremio!;
  const acertos = `${p.acertos} ${e.superSete ? (p.acertos === 1 ? "coluna certa" : "colunas certas") : p.acertos === 1 ? "acerto" : "acertos"}`;
  const saldo = e.saldoFinal >= 0
    ? `saldo positivo de ${formatarMoeda(e.saldoFinal)}`
    : `saldo de -${formatarMoeda(Math.abs(e.saldoFinal))}`;
  return {
    titulo: `Meu jogo teria ganho ${formatarMoeda(e.totalGanho)}`,
    destaque: `Maior prêmio: ${acertos} no concurso ${p.numero} (${formatarMoeda(p.premio)})`,
    resumo: `Em ${concursos} ${e.deLoteria}, eu gastaria ${formatarMoeda(e.totalGasto)}: ${saldo}.`,
    premiado: true,
  };
}

// Jogo no formato da URL (?jogo=05-12-23): só dígitos separados por "-".
export function jogoParaUrl(numeros: number[], superSete = false): string {
  return superSete ? numeros.join("") : numeros.map((n) => String(n).padStart(2, "0")).join("-");
}
