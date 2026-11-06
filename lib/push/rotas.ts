import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { dentroDoLimitePorIp } from "@/lib/rate-limit";

// Helpers comuns das rotas /api/push/*.

const TAMANHO_MAX_CORPO = 4 * 1024;

export function erro(status: number, mensagem: string) {
  return NextResponse.json({ ok: false, erro: mensagem }, { status, headers: { "Cache-Control": "no-store" } });
}

export function ok(dados: Record<string, unknown> = {}) {
  return NextResponse.json({ ok: true, ...dados }, { headers: { "Cache-Control": "no-store" } });
}

// CSRF: as rotas usam o cookie de sessão do Supabase para associar a
// inscrição ao usuário, então só aceitam chamadas do próprio site.
// Navegadores modernos sempre mandam Origin em fetch POST/DELETE.
export function origemValida(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const propria = new URL(request.url).origin;
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  return origin === propria || (!!site && origin === site);
}

export async function lerJson(request: Request): Promise<Record<string, unknown> | null> {
  const tipo = request.headers.get("content-type") ?? "";
  if (!tipo.includes("application/json")) return null;
  const texto = await request.text();
  if (texto.length > TAMANHO_MAX_CORPO) return null;
  try {
    const dados = JSON.parse(texto);
    return dados && typeof dados === "object" && !Array.isArray(dados) ? dados : null;
  } catch {
    return null;
  }
}

export async function usuarioAtual(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

// Pré-checagens comuns: origem + rate limit por IP.
export async function preChecar(
  request: Request,
  prefixo: string,
  max: number,
  janelaSegundos: number
): Promise<NextResponse | null> {
  if (!origemValida(request)) return erro(403, "Origem não permitida");
  if (!(await dentroDoLimitePorIp(prefixo, max, janelaSegundos))) {
    return erro(429, "Muitas tentativas. Aguarde alguns minutos.");
  }
  return null;
}
