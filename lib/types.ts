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
  premiacoes: PremiacaoFaixa[];
}

export interface ConcursoResumo {
  numero: number;
  dataSorteio: string;
  dezenas: number[];
  acumulado: boolean;
}

export type CodigoLoteria = "lotofacil" | "megasena";
