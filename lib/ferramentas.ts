// Registro ÚNICO das ferramentas da LotoAnalítica — fonte da Central de
// ferramentas (/conta/ferramentas) e da busca Ctrl+K da área de membros.
//
// Antes havia três listas divergentes: Subnav (17 abas), MaisSheet (10) e a
// tabela da /premium. Este registro ainda não substitui as duas primeiras
// (fora do escopo do redesign da área de membros); se uma ferramenta nova
// entrar no Subnav, entra aqui também. O teste lib/ferramentas.test.ts
// confere que toda aba do Subnav está registrada.
//
// Descrições: resumo fiel do que a própria página promete (metadados de
// app/[loteria]/*/page.tsx). Extras Premium: só o que de fato é liberado
// pelo plano no código (ver docs/membros/REDESIGN_AREA_MEMBROS.md, 1.2).

import { abaAplicavel } from "@/lib/abas-loteria";
import { isCodigoLoteriaValido } from "@/lib/format";
import type { CodigoLoteria } from "@/lib/types";

export type CategoriaFerramenta =
  | "acompanhar"
  | "estudar"
  | "montar"
  | "conferir"
  | "dados"
  | "utilitarios";

export const CATEGORIAS: { id: CategoriaFerramenta; nome: string; descricao: string }[] = [
  { id: "acompanhar", nome: "Acompanhar", descricao: "Resultados, prêmios e o que acabou de acontecer" },
  { id: "estudar", nome: "Estudar padrões", descricao: "Estatística do histórico e probabilidade exata" },
  { id: "montar", nome: "Montar jogos", descricao: "Gerar combinações, fechamentos e bolões" },
  { id: "conferir", nome: "Testar e conferir", descricao: "Ver como um jogo teria se saído" },
  { id: "dados", nome: "Seus dados", descricao: "O desempenho dos seus jogos salvos" },
  { id: "utilitarios", nome: "Utilitários", descricao: "Calendário, comparador e calculadoras" },
];

interface FerramentaBase {
  id: string;
  nome: string;
  descricao: string;
  categoria: CategoriaFerramenta;
  // Termos extras para a busca (sinônimos, o que as pessoas digitam).
  termos?: string[];
  // O que o Premium acrescenta numa ferramenta aberta a todos.
  extraPremium?: string;
  // Ferramenta inteira só para assinantes.
  exclusivaPremium?: boolean;
}

// Ferramenta por loteria: vive em /[loteria]/[aba] (páginas públicas, ISR).
export interface FerramentaLoteria extends FerramentaBase {
  tipo: "loteria";
  aba: string;
}

// Ferramenta com endereço fixo.
export interface FerramentaGlobal extends FerramentaBase {
  tipo: "global";
  href: string;
}

export type Ferramenta = FerramentaLoteria | FerramentaGlobal;

export const FERRAMENTAS: Ferramenta[] = [
  // ── Acompanhar ──────────────────────────────────────────────────────────
  {
    tipo: "loteria", id: "resultados", aba: "resultados", nome: "Resultados", categoria: "acompanhar",
    descricao: "Último concurso, prêmios por faixa e todo o histórico de sorteios.",
    termos: ["resultado", "concurso", "histórico", "csv", "exportar"],
    extraPremium: "Exportação do histórico em CSV",
  },
  {
    tipo: "loteria", id: "ao-vivo", aba: "ao-vivo", nome: "Ao vivo", categoria: "acompanhar",
    descricao: "Contagem regressiva para o sorteio e o resultado assim que sai.",
    termos: ["sorteio", "agora", "contagem", "hoje"],
  },
  {
    tipo: "loteria", id: "destaques", aba: "destaques", nome: "Destaques", categoria: "acompanhar",
    descricao: "Maior atraso, ciclo perto de fechar e o resultado mais incomum do último concurso.",
    termos: ["atraso", "ciclo", "curiosidades"],
  },
  {
    tipo: "loteria", id: "acumulos", aba: "acumulos", nome: "Acúmulos", categoria: "acompanhar",
    descricao: "Linha do tempo de todos os acúmulos: os mais longos e os maiores prêmios.",
    termos: ["acumulado", "acumulou", "prêmio"],
  },
  {
    tipo: "loteria", id: "recordes", aba: "recordes", nome: "Recordes", categoria: "acompanhar",
    descricao: "Os maiores prêmios da loteria, com data, concurso e ganhadores.",
    termos: ["maior prêmio", "recorde"],
  },

  // ── Estudar padrões ─────────────────────────────────────────────────────
  {
    tipo: "loteria", id: "tabelas", aba: "tabelas", nome: "Tabelas estatísticas", categoria: "estudar",
    descricao: "Frequência, atraso, ciclos, primos e outras categorias sobre todo o histórico.",
    termos: ["frequência", "atraso", "ciclo", "primos", "estatística", "quentes", "frias"],
  },
  {
    tipo: "loteria", id: "heatmap", aba: "heatmap", nome: "Heatmap do volante", categoria: "estudar",
    descricao: "Quais dezenas saem mais, desenhadas sobre o volante.",
    termos: ["mapa de calor", "frequência", "volante"],
    extraPremium: "Todos os períodos para comparar",
  },
  {
    tipo: "loteria", id: "probabilidades", aba: "probabilidades", nome: "Probabilidades", categoria: "estudar",
    descricao: "A chance matemática exata de cada faixa, calculada por combinatória.",
    termos: ["chance", "probabilidade", "combinatória"],
  },
  {
    tipo: "loteria", id: "equilibrio", aba: "equilibrio", nome: "Índice de Equilíbrio", categoria: "estudar",
    descricao: "Uma nota de 0 a 100 para o quão típico é o seu jogo frente ao histórico.",
    termos: ["nota", "equilíbrio", "típico"],
  },
  {
    tipo: "loteria", id: "ineditas", aba: "ineditas", nome: "Combinações inéditas", categoria: "estudar",
    descricao: "Quantas trincas de dezenas já saíram juntas e quais nunca saíram.",
    termos: ["trincas", "nunca saíram", "inéditas"],
  },

  // ── Montar jogos ────────────────────────────────────────────────────────
  {
    tipo: "loteria", id: "gerador", aba: "gerador", nome: "Gerador de jogos", categoria: "montar",
    descricao: "Combinações aleatórias com filtros opcionais tirados das estatísticas.",
    termos: ["gerar", "palpite", "surpresinha", "filtros"],
    extraPremium: "Modo avançado com todos os filtros combinados",
  },
  {
    tipo: "loteria", id: "data-da-sorte", aba: "data-da-sorte", nome: "Jogo da data", categoria: "montar",
    descricao: "Um jogo gerado a partir de uma data especial — a mesma data, o mesmo jogo.",
    termos: ["aniversário", "data", "sorte"],
  },
  {
    tipo: "loteria", id: "fechamentos", aba: "fechamentos", nome: "Fechamentos", categoria: "montar",
    descricao: "Escolha as dezenas e quantos pontos garantir; o sistema monta os bilhetes.",
    termos: ["fechamento", "garantia", "desdobramento"],
  },
  {
    tipo: "loteria", id: "bolao", aba: "bolao", nome: "Bolão", categoria: "montar",
    descricao: "Diga o orçamento do grupo e receba os bilhetes, o link e a conferência.",
    termos: ["bolão", "grupo", "cotas", "amigos"],
    extraPremium: "O Bolão Pro, com até 100 cotas",
  },

  // ── Testar e conferir ───────────────────────────────────────────────────
  {
    tipo: "loteria", id: "conferidor", aba: "conferidor", nome: "Conferidor", categoria: "conferir",
    descricao: "Quantos pontos uma combinação fez em cada concurso do histórico.",
    termos: ["conferir", "acertos", "bilhete", "foto"],
    extraPremium: "Jogos ilimitados e conferência por foto do bilhete",
  },
  {
    tipo: "loteria", id: "simulador", aba: "simulador", nome: "Simulador", categoria: "conferir",
    descricao: "Se os seus números já teriam sido premiados, e quanto teria gastado e ganhado.",
    termos: ["teria ganho", "simular", "retorno"],
    extraPremium: "Histórico completo e comparação de dois jogos",
  },
  {
    tipo: "loteria", id: "analisador", aba: "analisador", nome: "Analisador de jogo", categoria: "conferir",
    descricao: "O perfil estatístico do seu jogo: soma, par/ímpar, sequências e mais.",
    termos: ["analisar", "soma", "par", "ímpar", "sequência"],
  },

  // ── Seus dados ──────────────────────────────────────────────────────────
  {
    tipo: "global", id: "carteira", href: "/conta/carteira", nome: "Carteira do apostador", categoria: "dados",
    descricao: "Gasto, prêmios e saldo de cada jogo salvo desde que você o salvou.",
    termos: ["saldo", "gasto", "carteira", "teto"],
    exclusivaPremium: true,
  },
  {
    tipo: "global", id: "meu-ano", href: "/conta/meu-ano", nome: "Meu ano na loteria", categoria: "dados",
    descricao: "A retrospectiva do ano: total gasto e ganho, loteria favorita e maior prêmio.",
    termos: ["retrospectiva", "ano"],
    exclusivaPremium: true,
  },
  {
    tipo: "global", id: "relatorio", href: "/conta/jogos", nome: "Relatório mensal em PDF", categoria: "dados",
    descricao: "O desempenho dos seus jogos salvos em cada mês, pronto para baixar.",
    termos: ["pdf", "relatório", "mensal"],
    exclusivaPremium: true,
  },
  {
    tipo: "global", id: "api", href: "/conta/api", nome: "API de dados", categoria: "dados",
    descricao: "Resultados e estatísticas via REST, com chave própria.",
    termos: ["api", "rest", "desenvolvedor", "integração"],
    exclusivaPremium: true,
  },

  // ── Utilitários ─────────────────────────────────────────────────────────
  {
    tipo: "global", id: "comparador", href: "/comparador", nome: "Comparador de loterias", categoria: "utilitarios",
    descricao: "As 9 loterias lado a lado: prêmio estimado, acúmulo e próximo sorteio.",
    termos: ["comparar", "loterias", "prêmio"],
  },
  {
    tipo: "global", id: "calendario", href: "/calendario", nome: "Calendário de sorteios", categoria: "utilitarios",
    descricao: "Que loterias sorteiam em cada dia e em que horário.",
    termos: ["quando", "dia", "horário", "agenda"],
  },
  {
    tipo: "global", id: "calculadoras", href: "/calculadoras", nome: "Calculadoras", categoria: "utilitarios",
    descricao: "Combinações, imposto do prêmio, rateio de bolão, quanto rende o prêmio e mais.",
    termos: ["calcular", "imposto", "rateio", "rendimento", "juros"],
  },
];

// A ferramenta existe para essa loteria? (Lotomania e Super Sete não têm
// algumas — lib/abas-loteria.ts, a mesma regra do Subnav e do sitemap.)
export function disponivelEm(f: Ferramenta, loteria: CodigoLoteria): boolean {
  return f.tipo === "global" || abaAplicavel(loteria, f.aba);
}

export function hrefFerramenta(f: Ferramenta, loteria: CodigoLoteria): string {
  return f.tipo === "global" ? f.href : `/${loteria}/${f.aba}`;
}

// Busca sem acento e sem caixa ("estatistica" acha "Tabelas
// estatísticas"). Todas as palavras digitadas precisam aparecer em algum
// lugar; a ordem dá peso ao nome, depois aos termos, depois à descrição.
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function buscarFerramentas(consulta: string, lista: Ferramenta[] = FERRAMENTAS): Ferramenta[] {
  const palavras = normalizar(consulta).split(/\s+/).filter(Boolean);
  if (palavras.length === 0) return lista;
  return lista
    .map((f, ordem) => {
      const nome = normalizar(f.nome);
      const termos = normalizar((f.termos ?? []).join(" "));
      const resto = normalizar(`${f.descricao} ${f.extraPremium ?? ""}`);
      let pontos = 0;
      for (const p of palavras) {
        if (nome.includes(p)) pontos += 3;
        else if (termos.includes(p)) pontos += 2;
        else if (resto.includes(p)) pontos += 1;
        else return null; // palavra ausente: fora
      }
      return { f, pontos, ordem };
    })
    .filter((r): r is { f: Ferramenta; pontos: number; ordem: number } => r !== null)
    .sort((a, b) => b.pontos - a.pontos || a.ordem - b.ordem)
    .map((r) => r.f);
}

export function ferramentaPorId(id: string): Ferramenta | undefined {
  return FERRAMENTAS.find((f) => f.id === id);
}

// Ferramenta por loteria de uma URL (/megasena/gerador), para "recentes".
// Só as de loteria: as globais de /conta já estão na navegação, e
// /conta/jogos (onde fica o relatório) não é "usar uma ferramenta".
export function ferramentaDaUrl(pathname: string): { ferramenta: FerramentaLoteria; loteria: CodigoLoteria } | null {
  const m = pathname.match(/^\/([a-z]+)\/([a-z-]+)(?:\/|$)/);
  if (!m || !isCodigoLoteriaValido(m[1])) return null;
  const f = FERRAMENTAS.find((x): x is FerramentaLoteria => x.tipo === "loteria" && x.aba === m[2]);
  return f && abaAplicavel(m[1], f.aba) ? { ferramenta: f, loteria: m[1] } : null;
}
