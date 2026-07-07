import type { MetadataRoute } from "next";
import { getLoteriaPorCodigo, getNumerosConcursos } from "@/lib/queries";
import { CATEGORIAS } from "@/lib/categorias";
import { ARTIGOS } from "@/lib/artigos";
import { ANALISES } from "@/lib/analises";
import { SITE_URL } from "@/lib/seo";

// Forçar geração em runtime (não em build time) — o sitemap depende do banco
export const dynamic = "force-dynamic";

const LOTERIAS = ["lotofacil", "megasena", "quina", "lotomania", "diadesorte", "maismilionaria"] as const;

const ABAS: [string, number, MetadataRoute.Sitemap[number]["changeFrequency"]][] = [
  ["resultado", 1.0, "daily"],   // alias para o último concurso — alta prioridade SEO
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
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entradas: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/dicas`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/analises`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/sobre`, changeFrequency: "yearly", priority: 0.3 },
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

  try {
    for (const codigoLoteria of LOTERIAS) {
      const loteria = await getLoteriaPorCodigo(codigoLoteria);
      if (!loteria) continue;

      for (const [aba, priority, changeFrequency] of ABAS) {
        entradas.push({
          url: `${SITE_URL}/${codigoLoteria}/${aba}`,
          changeFrequency,
          priority,
        });
      }

      for (const categoria of CATEGORIAS) {
        entradas.push({
          url: `${SITE_URL}/${codigoLoteria}/tabelas/${categoria.slug}`,
          changeFrequency: "daily",
          priority: 0.6,
        });
      }

      const concursos = await getNumerosConcursos(loteria.id);
      for (const c of concursos) {
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
