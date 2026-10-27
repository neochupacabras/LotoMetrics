import type { NextConfig } from "next";

// SEC-003 (auditoria 27/10/2026): security headers. Os headers "duros"
// (sem risco de quebrar funcionalidade) vão ENFORCED. A CSP vai em
// Report-Only primeiro — o site carrega Google AdSense e Vercel Analytics,
// que injetam scripts/iframes; uma CSP enforced mal calibrada quebraria os
// anúncios. Em Report-Only ela não bloqueia nada: só reporta violações
// (no console do navegador), permitindo ajustar a lista de origens antes
// de promover para `Content-Security-Policy` de verdade.
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  // AdSense injeta scripts inline e pode usar eval; Next injeta bootstrap inline.
  // va.vercel-scripts.com: scripts do Vercel Analytics/Speed Insights
  // (confirmado por violação report-only no dev). Os googlesyndication/
  // doubleclick cobrem o AdSense.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://pagead2.googlesyndication.com https://*.googlesyndication.com https://partner.googleadservices.com https://*.g.doubleclick.net https://*.doubleclick.net",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  // Supabase (auth/REST/storage do browser) + beacon do Vercel Speed Insights.
  "connect-src 'self' https://*.supabase.co https://vitals.vercel-insights.com",
  "frame-src https://*.googlesyndication.com https://*.g.doubleclick.net https://*.doubleclick.net",
].join("; ");

const SECURITY_HEADERS = [
  // Força HTTPS por 2 anos, incluindo subdomínios (sem `preload` — exige
  // submissão manual à lista de preload dos navegadores).
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Content-Security-Policy-Report-Only", value: CSP_REPORT_ONLY },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;
