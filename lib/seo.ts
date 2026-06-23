// Configuração central usada por metadados, sitemap.xml e robots.txt.
// NEXT_PUBLIC_SITE_URL deve ser configurada no Vercel apontando pro
// domínio de produção (ex.: https://lotoanalitica.com.br, ou um
// domínio próprio se você configurar um depois) — sem isso, URLs
// canônicas, Open Graph e o sitemap caem no valor padrão abaixo.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://lotoanalitica.com.br";

export const SITE_NAME = "LotoAnalítica";

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
  // Precisa ser explícito aqui: quando uma página define seu próprio
  // objeto openGraph, o Next.js substitui o openGraph inteiro herdado
  // do layout raiz — inclusive a imagem gerada por opengraph-image.tsx.
  // Sem repetir a URL da imagem aqui, essas páginas ficariam sem
  // imagem nenhuma no preview de compartilhamento.
  const imagem = `${SITE_URL}/opengraph-image`;
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
      images: [imagem],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: titulo,
      description: descricao,
      images: [imagem],
    },
  };
}
