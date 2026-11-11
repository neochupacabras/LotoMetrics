import { CodigoLoteria } from "./types";

export const LOTERIAS: Record<CodigoLoteria, { nome: string; slug: CodigoLoteria }> = {
  lotofacil: { nome: "Lotofácil",  slug: "lotofacil"  },
  megasena:  { nome: "Mega-Sena",  slug: "megasena"   },
  quina:     { nome: "Quina",      slug: "quina"      },
  lotomania:  { nome: "Lotomania",   slug: "lotomania"  },
  diadesorte:     { nome: "Dia de Sorte",   slug: "diadesorte"     },
  maismilionaria: { nome: "+Milionária",   slug: "maismilionaria" },
  timemania:      { nome: "Timemania",      slug: "timemania"      },
  duplasena:  { nome: "Dupla Sena",  slug: "duplasena"  },
  supersete:  { nome: "Super Sete",  slug: "supersete"  },
};

// Quantas dezenas o apostador marca num jogo simples. É igual à quantidade
// sorteada em quase todas as loterias. As exceções:
// - Lotomania: marcam-se 50 dos 100 números e a Caixa sorteia 20 (prêmio
//   para 20, 19, 18, 17, 16, 15 ou 0 acertos entre os 20 sorteados);
// - Timemania: marcam-se 10 dos 80 e a Caixa sorteia 7 (prêmio para 7, 6,
//   5, 4 ou 3 acertos).
// A conferência é sempre a interseção entre o jogo e o sorteio, então a
// matemática não muda; só a quantidade aceita na entrada.
export const DEZENAS_APOSTA: Partial<Record<string, number>> = { lotomania: 50, timemania: 10 };

export function qtdDezenasAposta(codigoLoteria: string, qtdDezenasSorteadas: number): number {
  return DEZENAS_APOSTA[codigoLoteria] ?? qtdDezenasSorteadas;
}

export function isCodigoLoteriaValido(valor: string): valor is CodigoLoteria {
  return ["lotofacil", "megasena", "quina", "lotomania", "diadesorte", "maismilionaria", "timemania", "duplasena", "supersete"].includes(valor);
}

// Preposição de gênero de cada loteria ("na Lotofácil" vs. "no Super
// Sete") — só Dia de Sorte e Super Sete são masculinos ("o Dia de
// Sorte", "o Super Sete"). "de" segue a mesma regra (na→da, no→do).
// Extraído em 21/09/2026 (tarefa 2.1 do plano de implementação) do
// simulador, que já precisava disso pro H1/FAQ; outras páginas ainda têm
// "da {nomeLoteria}" hardcoded (ver spawn_task) e podem migrar pra cá aos
// poucos.
const LOTERIAS_MASCULINAS = new Set(["diadesorte", "supersete"]);

export function preposicaoLoteria(codigoLoteria: string): { em: "na" | "no"; de: "da" | "do" } {
  const em = LOTERIAS_MASCULINAS.has(codigoLoteria) ? "no" : "na";
  return { em, de: em === "na" ? "da" : "do" };
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

// "1 em N" de uma probabilidade: abaixo de 10, uma casa decimal ("1 em 4,2",
// como a tabela da Caixa); acima, inteiro com separador de milhar.
// Auditoria da Lotofácil, LF-09.
export function formatarUmEm(probabilidade: number): string {
  if (!(probabilidade > 0)) return "—";
  const n = 1 / probabilidade;
  if (n < 10) return `1 em ${n.toFixed(1).replace(".", ",")}`;
  return `1 em ${Math.round(n).toLocaleString("pt-BR")}`;
}

// Probabilidade em %, com vírgula; nunca mostra "100,0%" para algo que não é
// certo (auditoria da Lotofácil, LF-15).
export function formatarProbabilidadePct(p: number): string {
  if (p >= 1) return "100%";
  if (p >= 0.999) return "> 99,9%";
  if (p >= 0.01) return `${(p * 100).toFixed(1).replace(".", ",")}%`;
  if (p >= 0.001) return `${(p * 100).toFixed(2).replace(".", ",")}%`;
  return "< 0,1%";
}
