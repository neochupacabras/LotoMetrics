// Configuração central usada por metadados, sitemap.xml e robots.txt.
// NEXT_PUBLIC_SITE_URL deve ser configurada no Vercel apontando pro
// domínio de produção (ex.: https://loto-metrics.vercel.app, ou um
// domínio próprio se você configurar um depois) — sem isso, URLs
// canônicas, Open Graph e o sitemap caem no valor padrão abaixo.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://loto-metrics.vercel.app";

export const SITE_NAME = "LotoMetrics";

export const NOME_LOTERIA: Record<string, string> = {
  lotofacil: "Lotofácil",
  megasena: "Mega-Sena",
};

// Helper compartilhado pelas páginas por loteria (Destaques, Tabelas,
// Gerador, etc.) — monta título, descrição, canonical e Open Graph de
// forma consistente, sem repetir a mesma estrutura em cada page.tsx.
export function metadataPagina(
  codigoLoteria: string,
  caminho: string,
  titulo: string,
  descricao: string
) {
  const url = `${SITE_URL}/${codigoLoteria}${caminho}`;
  return {
    title: titulo,
    description: descricao,
    alternates: { canonical: url },
    openGraph: {
      title: titulo,
      description: descricao,
      url,
      siteName: SITE_NAME,
      locale: "pt_BR",
      type: "website" as const,
    },
    twitter: {
      card: "summary" as const,
      title: titulo,
      description: descricao,
    },
  };
}
