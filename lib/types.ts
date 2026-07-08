export interface Loteria {
  id: number;
  codigo: string;
  nome: string;
  dezenaMin: number;
  dezenaMax: number;
  qtdDezenasSorteadas: number;
  gridColunas: number;
}

export interface PremiacaoFaixa {
  faixa: number;
  descricaoFaixa: string | null;
  qtdGanhadores: number;
  valorPremio: number;
}

export interface Concurso {
  numero: number;
  dataSorteio: string;
  dezenas: number[];
  dezenasOrdemSorteio: number[];
  acumulado: boolean;
  localSorteio: string | null;
  municipioUfSorteio: string | null;
  valorArrecadado: number | null;
  valorAcumuladoProximo: number | null;
  valorEstimadoProximo: number | null;
  dataProximoConcurso: string | null;
  mesSorte: string | null;        // Dia de Sorte: mês sorteado (ex: "MARÇO")
  trevos: number[] | null;          // +Milionária: trevos sorteados (ex: [1, 4])
  dezenasSegundoSorteio: number[] | null; // Dupla Sena: dezenas do 2º sorteio
  premiacoes: PremiacaoFaixa[];
}

export interface ConcursoResumo {
  numero: number;
  dataSorteio: string;
  dezenas: number[];
  acumulado: boolean;
  mesSorte?: string | null;
  trevos?: number[] | null;
  dezenasSegundoSorteio?: number[] | null;
}

export type CodigoLoteria = "lotofacil" | "megasena" | "quina" | "lotomania" | "diadesorte" | "maismilionaria" | "timemania" | "duplasena" | "supersete";
