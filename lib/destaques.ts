// Curadoria de fatos estatísticos notáveis sobre o estado atual dos
// dados — todos estritamente descritivos (o que JÁ aconteceu), nunca
// preditivos. Nenhum destaque aqui sugere o que vai sair no próximo
// concurso; cada um aponta de volta pra tabela correspondente, onde o
// histórico completo pode ser conferido.

import { getAtraso, getCiclos } from "./estatisticas";
import { getCategoriasParaLoteria } from "./categorias";
import { getUltimoConcurso } from "./queries";
import { analisarConcurso, AnaliseConcurso } from "./analise-concurso";
import { formatarDezena } from "./format";

export interface Destaque {
  titulo: string;
  descricao: string;
  link: string;
}

interface CandidatoConcurso {
  rotulo: string;
  percentual: number;
  link: string;
}

function candidatosDoConcurso(
  analise: AnaliseConcurso,
  codigoLoteria: string
): CandidatoConcurso[] {
  // Só inclui métricas cujas tabelas estão disponíveis para esta loteria
  const categoriasDisponiveis = new Set(
    getCategoriasParaLoteria(codigoLoteria).map((c) => c.slug)
  );

  const candidatos: CandidatoConcurso[] = [];

  if (analise.percentualParImpar !== null && categoriasDisponiveis.has("pares-impares")) {
    candidatos.push({
      rotulo: `${analise.pares} pares e ${analise.impares} ímpares`,
      percentual: analise.percentualParImpar,
      link: `/${codigoLoteria}/tabelas/pares-impares`,
    });
  }
  if (analise.percentualSoma !== null && categoriasDisponiveis.has("soma")) {
    candidatos.push({
      rotulo: `soma ${analise.soma}`,
      percentual: analise.percentualSoma,
      link: `/${codigoLoteria}/tabelas/soma`,
    });
  }
  if (analise.percentualPrimos !== null && categoriasDisponiveis.has("primos")) {
    candidatos.push({
      rotulo: `${analise.primos} números primos`,
      percentual: analise.percentualPrimos,
      link: `/${codigoLoteria}/tabelas/primos`,
    });
  }
  if (analise.percentualFibonacci !== null && categoriasDisponiveis.has("fibonacci")) {
    candidatos.push({
      rotulo: `${analise.fibonacci} números de Fibonacci`,
      percentual: analise.percentualFibonacci,
      link: `/${codigoLoteria}/tabelas/fibonacci`,
    });
  }
  if (analise.percentualMultiplos3 !== null && categoriasDisponiveis.has("multiplos-de-3")) {
    candidatos.push({
      rotulo: `${analise.multiplos3} múltiplos de 3`,
      percentual: analise.percentualMultiplos3,
      link: `/${codigoLoteria}/tabelas/multiplos-de-3`,
    });
  }
  if (analise.percentualMolduraCentro !== null && categoriasDisponiveis.has("moldura-centro")) {
    candidatos.push({
      rotulo: `${analise.moldura} dezenas na moldura e ${analise.centro} no centro`,
      percentual: analise.percentualMolduraCentro,
      link: `/${codigoLoteria}/tabelas/moldura-centro`,
    });
  }
  if (analise.percentualSequencia !== null && categoriasDisponiveis.has("sequencias")) {
    candidatos.push({
      rotulo: `uma sequência de ${analise.maiorSequencia} dezenas seguidas`,
      percentual: analise.percentualSequencia,
      link: `/${codigoLoteria}/tabelas/sequencias`,
    });
  }

  return candidatos.sort((a, b) => a.percentual - b.percentual);
}

export async function gerarDestaques(
  loteriaId: number,
  codigoLoteria: string,
  config: { dezenaMax: number; gridColunas: number }
): Promise<Destaque[]> {
  const [atraso, ciclos, ultimoConcurso] = await Promise.all([
    getAtraso(loteriaId),
    getCiclos(loteriaId),
    getUltimoConcurso(loteriaId),
  ]);

  const destaques: Destaque[] = [];

  // ---------- Atraso ----------
  const maisAtrasada = atraso[0];
  if (maisAtrasada) {
    const ehRecorde = maisAtrasada.atraso >= maisAtrasada.maiorAtraso;
    destaques.push({
      titulo: ehRecorde
        ? `Recorde de atraso: dezena ${formatarDezena(maisAtrasada.dezena)}`
        : `Maior atraso atual: dezena ${formatarDezena(maisAtrasada.dezena)}`,
      descricao: ehRecorde
        ? `Não sai há ${maisAtrasada.atraso} concursos — o maior atraso já registrado para essa dezena no histórico.`
        : `Não sai há ${maisAtrasada.atraso} concursos. O recorde dela é ${maisAtrasada.maiorAtraso} concursos sem sair.`,
      link: `/${codigoLoteria}/tabelas/atraso`,
    });
  }

  // ---------- Ciclo perto de fechar ----------
  const categoriasDisponiveisGlobal = new Set(
    getCategoriasParaLoteria(codigoLoteria).map((c) => c.slug)
  );
  if (
    categoriasDisponiveisGlobal.has("ciclos") &&
    ciclos.atual &&
    ciclos.atual.dezenasFaltantes.length > 0 &&
    ciclos.atual.dezenasFaltantes.length <= 3
  ) {
    const qtd = ciclos.atual.dezenasFaltantes.length;
    destaques.push({
      titulo: "Ciclo perto de fechar",
      descricao: `Faltam apenas ${qtd} dezena${qtd > 1 ? "s" : ""} pra completar o ciclo atual (iniciado no concurso ${ciclos.atual.concursoInicio}): ${ciclos.atual.dezenasFaltantes.map(formatarDezena).join(", ")}.`,
      link: `/${codigoLoteria}/tabelas/ciclos`,
    });
  }

  // ---------- Fato do concurso mais recente ----------
  if (ultimoConcurso) {
    const analise = await analisarConcurso(loteriaId, ultimoConcurso.dezenas, null, config);
    const candidatos = candidatosDoConcurso(analise, codigoLoteria);
    const maisIncomum = candidatos[0];
    if (maisIncomum) {
      const raro = maisIncomum.percentual < 15;
      destaques.push({
        titulo: `Concurso ${ultimoConcurso.numero}: ${raro ? "resultado incomum" : "dentro do padrão típico"}`,
        descricao: `Saiu ${maisIncomum.rotulo} — isso já aconteceu em ${maisIncomum.percentual}% do histórico.`,
        link: maisIncomum.link,
      });
    }
  }

  return destaques;
}
