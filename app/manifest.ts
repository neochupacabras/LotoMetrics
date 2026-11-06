import type { MetadataRoute } from "next";

// Web App Manifest (servido em /manifest.webmanifest pelo Next). Mesma
// identidade do site: a cor do tema é o papel do cabeçalho (#faf9f4) — a
// barra de status/título do app instalado se funde ao masthead — e o papel
// (#f3f1ea) é o fundo da tela de abertura do Android. Ícones (tinta + chip
// coral) gerados por scripts/gerar-icones-pwa.mjs.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "LotoAnalítica — Resultados e estatísticas de loteria",
    short_name: "LotoAnalítica",
    description:
      "Resultados oficiais, estatísticas, conferidor e ferramentas para as loterias da Caixa.",
    lang: "pt-BR",
    dir: "ltr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "portrait",
    theme_color: "#faf9f4",
    background_color: "#f3f1ea",
    categories: ["entertainment", "utilities"],
    prefer_related_applications: false,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      {
        name: "Resultado da Lotofácil",
        short_name: "Lotofácil",
        url: "/lotofacil/resultados",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Resultado da Mega-Sena",
        short_name: "Mega-Sena",
        url: "/megasena/resultados",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Conferir meu jogo",
        short_name: "Conferir",
        url: "/lotofacil/conferidor",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Minha conta",
        short_name: "Conta",
        url: "/conta",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
    ],
  };
}
