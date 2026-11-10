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

// O 4º campo diz se o conteúdo da aba muda a cada concurso: essas recebem
// lastModified com a data do último concurso da loteria (achado T8 de
// docs/growth/SEO_TECHNICAL_AUDIT.md). Ferramentas cujo texto não depende
// do sorteio (gerador, simulador, conferidor...) ficam sem data, para o
// sitemap não anunciar uma mudança que não houve.
const ABAS: [string, number, MetadataRoute.Sitemap[number]["changeFrequency"], boolean][] = [
  // "resultado" (singular) não entra aqui de propósito: é só um alias que
  // sempre redireciona pro concurso mais recente (ver app/[loteria]/resultado/page.tsx)
  // — nunca serve conteúdo, então não deveria estar num sitemap (o Google
  // trata URL-que-só-redireciona no sitemap como sinal de qualidade ruim).
  ["resultados",     0.9, "daily",   true],
  ["destaques",      0.7, "daily",   true],
  ["tabelas",        0.6, "weekly",  true],
  ["gerador",        0.6, "monthly", false],
  ["simulador",      0.6, "monthly", false],
  ["fechamentos",    0.5, "monthly", false],
  ["bolao",          0.5, "monthly", false],
  ["conferidor",     0.5, "monthly", false],
  ["analisador",     0.6, "monthly", false],
  ["heatmap",        0.6, "weekly",  true],
  ["acumulos",       0.6, "daily",   true],
  ["recordes",       0.6, "daily",   true],
  ["probabilidades", 0.5, "monthly", true],
  ["equilibrio",     0.6, "monthly", false],
  ["ineditas",       0.5, "weekly",  true],
  ["data-da-sorte",  0.5, "yearly",  false],
  ["ao-vivo",        0.6, "daily",   true],
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
    { url: `${SITE_URL}/recordes`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/imprensa`, changeFrequency: "weekly", priority: 0.5 },
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
      const concursos = concursosPorLoteria.get(loteria.id) ?? [];
      // A lista vem do mais novo para o mais antigo.
      const ultimoSorteio = concursos[0]?.dataSorteio;

      for (const [aba, priority, changeFrequency, mudaComConcurso] of ABAS) {
        if (!abaAplicavel(codigoLoteria, aba)) continue;
        entradas.push({
          url: `${SITE_URL}/${codigoLoteria}/${aba}`,
          ...(mudaComConcurso && ultimoSorteio ? { lastModified: ultimoSorteio } : {}),
          changeFrequency,
          priority,
        });
      }

      for (const categoria of getCategoriasParaLoteria(codigoLoteria)) {
        entradas.push({
          url: `${SITE_URL}/${codigoLoteria}/tabelas/${categoria.slug}`,
          ...(ultimoSorteio ? { lastModified: ultimoSorteio } : {}),
          changeFrequency: "daily",
          priority: 0.6,
        });
      }

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
