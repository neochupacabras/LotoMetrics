import crypto from "crypto";

// Fase 7 do Admin — integração com a API do Google Search Console via conta
// de serviço (JWT assinado com a private key, trocado por um access token —
// fluxo OAuth2 "server-to-server" padrão do Google, sem consentimento de
// usuário). Implementado com `crypto` nativo do Node em vez de instalar
// `googleapis`/`google-auth-library` — é só um endpoint, assinar um JWT RS256
// não justifica uma dependência nova (seção 41 do audit).
//
// Credenciais em 3 variáveis de ambiente (nunca o arquivo JSON inteiro no
// repo): GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL, GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY
// (com quebras de linha escapadas como "\n" literal — ver .env.local.example),
// GOOGLE_SEARCH_CONSOLE_SITE_URL (ex.: "sc-domain:lotoanalitica.com.br").
//
// Toda função aqui retorna `null` em vez de lançar exceção quando a
// integração não está configurada ou a API falha — o Admin trata isso como
// "UNAVAILABLE", nunca como zero (achado da auditoria, seção 27: nunca
// confundir "não sei" com "não tem").

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";

interface TokenCache {
  token: string;
  expiraEm: number;
}
let cache: TokenCache | null = null;

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function credenciaisConfiguradas(): boolean {
  return !!(
    process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL &&
    process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY &&
    process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL
  );
}

async function getAccessToken(): Promise<string | null> {
  if (cache && cache.expiraEm > Date.now() + 30_000) return cache.token;
  if (!credenciaisConfiguradas()) return null;

  const clientEmail = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL!;
  const privateKey = process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY!.replace(/\\n/g, "\n");

  try {
    const agora = Math.floor(Date.now() / 1000);
    const header = { alg: "RS256", typ: "JWT" };
    const claim = {
      iss: clientEmail,
      scope: SCOPE,
      aud: TOKEN_URL,
      exp: agora + 3600,
      iat: agora,
    };
    const naoAssinado = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claim))}`;
    const signer = crypto.createSign("RSA-SHA256");
    signer.update(naoAssinado);
    signer.end();
    const assinatura = base64url(signer.sign(privateKey));
    const jwt = `${naoAssinado}.${assinatura}`;

    const resp = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    });
    if (!resp.ok) {
      console.error("Search Console: falha ao trocar JWT por access token:", resp.status, await resp.text());
      return null;
    }
    const data = await resp.json();
    cache = { token: data.access_token, expiraEm: Date.now() + data.expires_in * 1000 };
    return cache.token;
  } catch (err) {
    console.error("Search Console: erro ao gerar access token:", (err as Error).message);
    return null;
  }
}

interface LinhaBrutaGsc {
  keys?: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

async function query(
  startDate: string,
  endDate: string,
  dimensions: string[],
  rowLimit: number
): Promise<LinhaBrutaGsc[] | null> {
  const token = await getAccessToken();
  if (!token) return null;
  const siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL!;

  try {
    const resp = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ startDate, endDate, dimensions, rowLimit }),
      }
    );
    if (!resp.ok) {
      console.error("Search Console: query falhou:", resp.status, await resp.text());
      return null;
    }
    const data = await resp.json();
    return data.rows ?? [];
  } catch (err) {
    console.error("Search Console: erro na query:", (err as Error).message);
    return null;
  }
}

// A API do Search Console tem ~2-3 dias de atraso nos dados mais recentes —
// pedir "hoje" ou "ontem" retorna vazio, não é bug. Desloca o fim do período
// pra trás e mantém a mesma duração.
export function periodoEfetivoGsc(from: Date, to: Date): { startDate: string; endDate: string } {
  const ATRASO_DIAS = 3;
  const duracaoMs = to.getTime() - from.getTime();
  const endEfetivo = new Date(Math.min(to.getTime(), Date.now() - ATRASO_DIAS * 86_400_000));
  const startEfetivo = new Date(endEfetivo.getTime() - duracaoMs);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { startDate: fmt(startEfetivo), endDate: fmt(endEfetivo) };
}

export interface ResumoBusca {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export async function getResumoBusca(from: Date, to: Date): Promise<ResumoBusca | null> {
  const { startDate, endDate } = periodoEfetivoGsc(from, to);
  const rows = await query(startDate, endDate, [], 1);
  if (rows === null) return null;
  const r = rows[0];
  return r
    ? { clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position }
    : { clicks: 0, impressions: 0, ctr: 0, position: 0 };
}

export interface LinhaBusca {
  chave: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export async function getTopQueries(from: Date, to: Date, limit = 20): Promise<LinhaBusca[] | null> {
  const { startDate, endDate } = periodoEfetivoGsc(from, to);
  const rows = await query(startDate, endDate, ["query"], limit);
  if (rows === null) return null;
  return rows.map((r) => ({ chave: r.keys?.[0] ?? "—", clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position }));
}

export async function getTopPages(from: Date, to: Date, limit = 20): Promise<LinhaBusca[] | null> {
  const { startDate, endDate } = periodoEfetivoGsc(from, to);
  const rows = await query(startDate, endDate, ["page"], limit);
  if (rows === null) return null;
  return rows.map((r) => ({ chave: r.keys?.[0] ?? "—", clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position }));
}
