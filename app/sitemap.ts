import type { MetadataRoute } from "next";
import { getLoteriaPorCodigo, getNumerosConcursos } from "@/lib/queries";
import { CATEGORIAS } from "@/lib/categorias";
import { ARTIGOS } from "@/lib/artigos";
import { SITE_URL } from "@/lib/seo";

const LOTERIAS = ["lotofacil", "megasena"] as const;

// Cada item: [slug da aba, prioridade, frequência de mudança]
const ABAS: [string, number, MetadataRoute.Sitemap[number]["changeFrequency"]][] = [
  ["resultados", 0.9, "daily"],
  ["destaques", 0.7, "daily"],
  ["tabelas", 0.6, "weekly"],
  ["gerador", 0.6, "monthly"],
  ["simulador", 0.6, "monthly"],
  ["fechamentos", 0.5, "monthly"],
  ["bolao", 0.5, "monthly"],
  ["conferidor", 0.5, "monthly"],
  ["probabilidades", 0.5, "monthly"],
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entradas: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/dicas`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/sobre`, changeFrequency: "yearly", priority: 0.3 },
  ];

  for (const artigo of ARTIGOS) {
    entradas.push({
      url: `${SITE_URL}/dicas/${artigo.slug}`,
      changeFrequency: "yearly",
      priority: 0.5,
    });
  }

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

  return entradas;
}
