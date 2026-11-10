import type { MetadataRoute } from "next";
import { getLoteriaPorCodigo, getNumerosConcursosPorLoterias } from "@/lib/queries";
import { getCategoriasParaLoteria } from "@/lib/categorias";
import { ARTIGOS } from "@/lib/artigos";
import { ANALISES } from "@/lib/analises";
import { ARTIGOS_MATEMATICA } from "@/lib/matematica";
import { CALCULADORAS } from "@/lib/calculadoras";
import { SITE_URL } from "@/lib/seo";
import { abaAplicavel } from "@/lib/abas-loteria";

// Forçar geração em runtime (não em build time) — o sitemap depende do banco
export const dynamic = "force-dynamic";

const LOTERIAS = ["lotofacil", "megasena", "quina", "lotomania", "diadesorte", "maismilionaria", "timemania", "duplasena", "supersete"] as const;

// Limite de concursos por loteria no sitemap — sem isso, o arquivo cresce
// pra sempre (uma URL por concurso já sorteado, de 9 loterias, algumas
// quase diárias desde os anos 90) até se aproximar do limite de 50.000 URLs
// por sitemap. Concursos fora da janela continuam indexáveis via a
// paginação de /resultados e os links de anterior/próximo em cada página
// de concurso — só não ficam reanunciados aqui pra sempre.
const MAX_CONCURSOS_POR_LOTERIA = 500;

const ABAS: [string, number, MetadataRoute.Sitemap[number]["changeFrequency"]][] = [
  // "resultado" (singular) não entra aqui de propósito: é só um alias que
  // sempre redireciona pro concurso mais recente (ver app/[loteria]/resultado/page.tsx)
  // — nunca serve conteúdo, então não deveria estar num sitemap (o Google
  // trata URL-que-só-redireciona no sitemap como sinal de qualidade ruim).
  ["resultados", 0.9, "daily"],
  ["destaques", 0.7, "daily"],
  ["tabelas", 0.6, "weekly"],
  ["gerador", 0.6, "monthly"],
  ["simulador", 0.6, "monthly"],
  ["fechamentos", 0.5, "monthly"],
  ["bolao", 0.5, "monthly"],
  ["conferidor", 0.5, "monthly"],
  ["analisador", 0.6, "monthly"],
  ["heatmap", 0.6, "weekly"],
  ["acumulos", 0.6, "daily"],
  ["probabilidades", 0.5, "monthly"],
  ["equilibrio",     0.6, "monthly"],
  ["ineditas",       0.5, "weekly"],
  ["data-da-sorte",  0.5, "yearly"],
  ["ao-vivo",        0.6, "daily"],
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entradas: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/dicas`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/analises`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/matematica`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/calculadoras`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/glossario`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/perguntas-frequentes`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/calendario`, changeFrequency: "daily", priority: 0.6 },
    { url: `${SITE_URL}/mega-da-virada`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/comparador`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/quiz`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/sobre`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/aplicativo`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/contato`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/api-dados`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/premium`, changeFrequency: "monthly", priority: 0.8 },
  ];

  for (const analise of ANALISES) {
    entradas.push({
      url: `${SITE_URL}/analises/${analise.slug}`,
      lastModified: new Date(analise.data),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  for (const artigo of ARTIGOS) {
    entradas.push({
      url: `${SITE_URL}/dicas/${artigo.slug}`,
      changeFrequency: "yearly",
      priority: 0.5,
    });
  }

  for (const artigoMat of ARTIGOS_MATEMATICA) {
    entradas.push({
      url: `${SITE_URL}/matematica/${artigoMat.slug}`,
      changeFrequency: "yearly",
      priority: 0.5,
    });
  }

  for (const calc of CALCULADORAS) {
    entradas.push({
      url: `${SITE_URL}/calculadoras/${calc.slug}`,
      changeFrequency: "yearly",
      priority: 0.5,
    });
  }

  try {
    // Resolve as loterias (cada getLoteriaPorCodigo é unstable_cache, então
    // praticamente sempre vem do cache — não bate no banco a cada sitemap).
    const loterias = await Promise.all(
      LOTERIAS.map(async (codigo) => ({ codigo, loteria: await getLoteriaPorCodigo(codigo) }))
    );
    const existentes = loterias.filter((l) => l.loteria !== null) as {
      codigo: (typeof LOTERIAS)[number];
      loteria: NonNullable<Awaited<ReturnType<typeof getLoteriaPorCodigo>>>;
    }[];

    // Uma única query para os concursos de TODAS as loterias (evita o N+1).
    const concursosPorLoteria = await getNumerosConcursosPorLoterias(
      existentes.map((l) => l.loteria.id),
      MAX_CONCURSOS_POR_LOTERIA
    );

    for (const { codigo: codigoLoteria, loteria } of existentes) {
      for (const [aba, priority, changeFrequency] of ABAS) {
        if (!abaAplicavel(codigoLoteria, aba)) continue;
        entradas.push({
          url: `${SITE_URL}/${codigoLoteria}/${aba}`,
          changeFrequency,
          priority,
        });
      }

      for (const categoria of getCategoriasParaLoteria(codigoLoteria)) {
        entradas.push({
          url: `${SITE_URL}/${codigoLoteria}/tabelas/${categoria.slug}`,
          changeFrequency: "daily",
          priority: 0.6,
        });
      }

      for (const c of concursosPorLoteria.get(loteria.id) ?? []) {
        entradas.push({
          url: `${SITE_URL}/${codigoLoteria}/resultados/${c.numero}`,
          lastModified: c.dataSorteio,
          changeFrequency: "yearly",
          priority: 0.4,
        });
      }
    }
  } catch (err) {
    // Em caso de falha no banco, retorna o sitemap parcial sem as URLs dinâmicas
    console.error("Sitemap: erro ao buscar dados do banco", err);
  }

  return entradas;
}
