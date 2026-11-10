import { NOME_LOTERIA } from "./seo";
import { preposicaoLoteria } from "./format";

// Títulos e descrições das tabelas estatísticas (/[loteria]/tabelas/[categoria])
// escritos com as palavras que as pessoas digitam no Google. Auditoria de
// growth de 09/11/2026 (docs/growth/SEO_TECHNICAL_AUDIT.md, achado T5): o
// título antigo ("Repetidas do concurso anterior — Tabela estatística da
// Lotofácil") não continha "dezenas repetidas lotofácil", a consulta com
// mais impressões dessa página, e a description não trazia nenhum dado.
//
// `de`/`em` = preposição certa para a loteria ("da Lotofácil", "do Dia de
// Sorte", "na Quina", "no Super Sete").
type Prep = { de: string; em: string; nome: string };

const TITULOS: Record<string, (p: Prep) => string> = {
  frequencia: ({ de, nome }) => `Números mais sorteados ${de} ${nome}`,
  atraso: ({ de, nome }) => `Dezenas atrasadas ${de} ${nome}`,
  ciclos: ({ de, nome }) => `Ciclo das dezenas ${de} ${nome}`,
  sequencias: ({ de, nome }) => `Sequências de números ${de} ${nome}`,
  "pares-impares": ({ em, nome }) => `Pares e ímpares ${em} ${nome}`,
  primos: ({ em, nome }) => `Números primos ${em} ${nome}`,
  soma: ({ de, nome }) => `Soma das dezenas ${de} ${nome}`,
  fibonacci: ({ em, nome }) => `Números de Fibonacci ${em} ${nome}`,
  "multiplos-de-3": ({ em, nome }) => `Múltiplos de 3 ${em} ${nome}`,
  repetidas: ({ de, nome }) => `Dezenas repetidas ${de} ${nome}`,
  "moldura-centro": ({ de, nome }) => `Moldura e centro ${de} ${nome}`,
  "linhas-colunas": ({ em, nome }) => `Linhas e colunas que mais saem ${em} ${nome}`,
  "duques-trincas": ({ em, nome }) => `Duplas e trincas que mais saem ${em} ${nome}`,
};

// Primeira frase da description: o que a pessoa encontra, nas palavras da busca.
const RESUMOS: Record<string, (p: Prep) => string> = {
  frequencia: ({ de, nome }) => `Quantas vezes cada dezena ${de} ${nome} já saiu, do mais ao menos sorteado.`,
  atraso: ({ de, nome }) => `Há quantos concursos cada dezena ${de} ${nome} não sai, e o maior atraso de cada uma.`,
  ciclos: ({ de, nome }) => `Em que ponto está o ciclo ${de} ${nome}: quais dezenas já saíram e quais faltam para fechar.`,
  sequencias: ({ de, nome }) => `Quantos números consecutivos costumam sair por concurso ${de} ${nome}.`,
  "pares-impares": ({ em, nome }) => `Quantas dezenas pares e ímpares saem por concurso ${em} ${nome}.`,
  primos: ({ em, nome }) => `Quantos números primos saem por concurso ${em} ${nome}.`,
  soma: ({ de, nome }) => `A soma das dezenas sorteadas ${de} ${nome}: média, faixa mais comum e histograma.`,
  fibonacci: ({ em, nome }) => `Quantos números da sequência de Fibonacci saem por concurso ${em} ${nome}.`,
  "multiplos-de-3": ({ em, nome }) => `Quantos múltiplos de 3 saem por concurso ${em} ${nome}.`,
  repetidas: ({ de, nome }) => `Quantas dezenas ${de} ${nome} se repetem do concurso anterior, e com que frequência.`,
  "moldura-centro": ({ de, nome }) => `Quantas dezenas saem na moldura e no centro do volante ${de} ${nome}.`,
  "linhas-colunas": ({ de, nome }) => `Quais linhas e colunas do volante ${de} ${nome} mais saem.`,
  "duques-trincas": ({ em, nome }) => `As duplas e trincas de dezenas que mais saem juntas ${em} ${nome}.`,
};

function prep(codigoLoteria: string): Prep {
  const { de, em } = preposicaoLoteria(codigoLoteria);
  return { de, em, nome: NOME_LOTERIA[codigoLoteria] ?? codigoLoteria };
}

// Usado no H1 e como base do <title>. Cai no título curto da categoria se o
// slug não tiver versão de busca (categoria nova ainda não mapeada).
export function tituloBuscaTabela(slug: string, codigoLoteria: string, fallback: string): string {
  const f = TITULOS[slug];
  return f ? f(prep(codigoLoteria)) : `${fallback} ${prep(codigoLoteria).de} ${prep(codigoLoteria).nome}`;
}

export interface DadosVivosTabela {
  ultimoConcurso: { numero: number; data: string } | null;
  // Só a tabela de ciclos: quantas dezenas faltam para fechar o ciclo atual.
  dezenasFaltantesCiclo?: number | null;
}

export function metadataTextoTabela(
  slug: string,
  codigoLoteria: string,
  fallbackTitulo: string,
  fallbackDescricao: string,
  dados: DadosVivosTabela
): { titulo: string; descricao: string } {
  const base = tituloBuscaTabela(slug, codigoLoteria, fallbackTitulo);
  const u = dados.ultimoConcurso;
  const titulo = u ? `${base}: tabela até o concurso ${u.numero}` : base;

  const partes = [RESUMOS[slug]?.(prep(codigoLoteria)) ?? fallbackDescricao];
  const faltam = dados.dezenasFaltantesCiclo;
  if (slug === "ciclos" && typeof faltam === "number") {
    partes.push(
      faltam === 0
        ? "O ciclo atual acabou de fechar."
        : `Ciclo atual: ${faltam === 1 ? "falta 1 dezena" : `faltam ${faltam} dezenas`}.`
    );
  }
  if (u) partes.push(`Atualizada até o concurso ${u.numero} (${u.data}).`);
  return { titulo, descricao: partes.join(" ") };
}
