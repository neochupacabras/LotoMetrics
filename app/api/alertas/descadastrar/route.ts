import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { validarTokenAlerta } from "@/lib/alertas-jogo-tokens";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Descadastro de um aviso de jogo, sem login: apaga a linha (não guardamos
// o e-mail de quem saiu).
//   GET  /api/alertas/descadastrar?a=<id>&t=<token> — link do e-mail e
//        ação "Parar este aviso" da notificação push.
//   POST mesmo endereço — descadastro em um clique dos clientes de e-mail
//        (cabeçalho List-Unsubscribe-Post).

async function apagar(request: Request): Promise<{ ok: boolean; loteria?: string }> {
  const url = new URL(request.url);
  const id = url.searchParams.get("a");
  if (!validarTokenAlerta("descadastrar", id, url.searchParams.get("t"))) return { ok: false };
  const { rows } = await pool.query<{ loteria: string }>(
    `DELETE FROM alertas_jogo WHERE id = $1 RETURNING loteria`,
    [id]
  );
  // Linha que já não existe também conta como descadastrado.
  return { ok: true, loteria: rows[0]?.loteria };
}

export async function GET(request: Request) {
  const r = await apagar(request);
  const status = r.ok ? "descadastrado" : "invalido";
  const loteria = r.loteria ? `&loteria=${r.loteria}` : "";
  return NextResponse.redirect(new URL(`/alertas?status=${status}${loteria}`, new URL(request.url).origin), 303);
}

export async function POST(request: Request) {
  const r = await apagar(request);
  return new NextResponse(null, { status: r.ok ? 200 : 400 });
}
