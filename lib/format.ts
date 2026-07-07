import { CodigoLoteria } from "./types";

export const LOTERIAS: Record<CodigoLoteria, { nome: string; slug: CodigoLoteria }> = {
  lotofacil: { nome: "Lotofácil",  slug: "lotofacil"  },
  megasena:  { nome: "Mega-Sena",  slug: "megasena"   },
  quina:     { nome: "Quina",      slug: "quina"      },
  lotomania:  { nome: "Lotomania",   slug: "lotomania"  },
  diadesorte: { nome: "Dia de Sorte", slug: "diadesorte" },
};

export function isCodigoLoteriaValido(valor: string): valor is CodigoLoteria {
  return ["lotofacil", "megasena", "quina", "lotomania", "diadesorte"].includes(valor);
}

export function formatarData(isoOuDataSql: string | null): string {
  if (!isoOuDataSql) return "—";
  const data = new Date(isoOuDataSql);
  if (Number.isNaN(data.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(data);
}

export function formatarMoeda(valor: number | null): string {
  if (valor === null || Number.isNaN(valor)) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

export function formatarDezena(dezena: number): string {
  return dezena.toString().padStart(2, "0");
}
