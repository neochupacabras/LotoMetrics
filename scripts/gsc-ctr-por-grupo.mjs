// CTR por grupo de páginas no Google Search Console (só leitura).
// Gerou docs/growth/BASELINE_CTR_2026-11.md; rodar de novo em 4–6 semanas
// para comparar com o mesmo recorte.
//
// Uso (na raiz do repo, com as vars GOOGLE_SEARCH_CONSOLE_* no .env.local):
//   node scripts/gsc-ctr-por-grupo.mjs                  # últimos 28 dias com dado
//   node scripts/gsc-ctr-por-grupo.mjs 2026-12-01 2026-12-28
//
// Usa só a dimensão "page": cruzar page × device devolveu dados incompletos
// (50 de 291 cliques em 10/11/2026). Posição do grupo = média das posições
// das páginas ponderada por impressões.
import crypto from "crypto";

process.loadEnvFile(`${process.cwd()}/.env.local`);
const email = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL;
const key = process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY.replace(/\\n/g, "\n");
const site = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL;

const b64 = (x) => Buffer.from(x).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const now = Math.floor(Date.now() / 1000);
const unsigned = `${b64(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${b64(JSON.stringify({
  iss: email, scope: "https://www.googleapis.com/auth/webmasters.readonly",
  aud: "https://oauth2.googleapis.com/token", exp: now + 3600, iat: now,
}))}`;
const sig = b64(crypto.createSign("RSA-SHA256").update(unsigned).sign(key));
const tok = await (await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${sig}` }),
})).json();
if (!tok.access_token) { console.error("token falhou"); process.exit(1); }

async function q(body) {
  const r = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${tok.access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  return (await r.json()).rows ?? [];
}

// Último dia com dado: descobre pela dimensão date.
const hoje = new Date();
const iso = (d) => d.toISOString().slice(0, 10);
const recentes = await q({ startDate: iso(new Date(hoje - 10 * 864e5)), endDate: iso(hoje), dimensions: ["date"] });
const fim = process.argv[3] ?? recentes.map((r) => r.keys[0]).sort().pop();
const inicio = process.argv[2] ?? iso(new Date(new Date(fim).getTime() - 27 * 864e5));

const LOT = "(lotofacil|megasena|quina|lotomania|diadesorte|maismilionaria|timemania|duplasena|supersete)";
const GRUPOS = [
  ["tabelas", new RegExp(`^/${LOT}/tabelas(/|$)`)],
  ["simuladores", new RegExp(`^/${LOT}/simulador$`)],
  ["concursos", new RegExp(`^/${LOT}/resultados/\\d+$`)],
  ["dicas e análises", /^\/(dicas|analises)(\/|$)/],
  ["mega-da-virada", /^\/mega-da-virada(\/|$)/],
  ["home", /^\/$/],
];
const grupo = (url) => {
  let p;
  try { p = new URL(url).pathname.replace(/\/+$/, "") || "/"; } catch { return "outros"; }
  for (const [g, re] of GRUPOS) if (re.test(p)) return g;
  return "outros";
};

const linhas = await q({ startDate: inicio, endDate: fim, dimensions: ["page"], rowLimit: 25000 });
const total = await q({ startDate: inicio, endDate: fim, dimensions: [] });
const device = await q({ startDate: inicio, endDate: fim, dimensions: ["device"] });

const agg = {};
for (const r of linhas) {
  const g = grupo(r.keys[0]);
  const a = (agg[g] ??= { clicks: 0, impressions: 0, posPeso: 0, urls: new Set(), mobile: { clicks: 0, impressions: 0 } });
  a.clicks += r.clicks;
  a.impressions += r.impressions;
  a.posPeso += r.position * r.impressions;
  a.urls.add(r.keys[0]);
}

// Páginas com mais impressões em cada grupo (para acompanhar individualmente).
const porPagina = {};
for (const r of linhas) {
  const k = r.keys[0];
  const p = (porPagina[k] ??= { clicks: 0, impressions: 0, posPeso: 0 });
  p.clicks += r.clicks; p.impressions += r.impressions; p.posPeso += r.position * r.impressions;
}
const top = {};
for (const [url, p] of Object.entries(porPagina)) (top[grupo(url)] ??= []).push({ url, ...p });

const out = {
  periodo: { inicio, fim },
  totalSite: total[0] ?? null,
  totalPorPagina: { clicks: linhas.reduce((s, r) => s + r.clicks, 0), impressions: linhas.reduce((s, r) => s + r.impressions, 0) },
  device: device.map((r) => ({ device: r.keys[0], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, posicao: r.position })),
  grupos: Object.fromEntries(Object.entries(agg).map(([g, a]) => [g, {
    urls: a.urls.size, clicks: a.clicks, impressions: a.impressions,
    ctr: a.impressions ? a.clicks / a.impressions : 0,
    posicao: a.impressions ? a.posPeso / a.impressions : null,
  }])),
  top: Object.fromEntries(Object.entries(top).map(([g, l]) => [g, l.sort((a, b) => b.impressions - a.impressions).slice(0, 5).map((p) => ({
    url: p.url.replace(/^https?:\/\/[^/]+/, ""), clicks: p.clicks, impressions: p.impressions,
    ctr: p.clicks / p.impressions, posicao: p.posPeso / p.impressions,
  }))])),
};
console.log(JSON.stringify(out, null, 1));
