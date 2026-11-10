import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { validarTokenAlerta } from "@/lib/alertas-jogo-tokens";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/alertas/confirmar?a=<id>&t=<token> — link do e-mail de opt-in.
// Confirma o aviso por e-mail e passa a contar a partir do último concurso
// já sorteado (o próximo é o primeiro aviso).
export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("a");
  const destino = (status: string, loteria?: string) =>
    NextResponse.redirect(new URL(`/alertas?status=${status}${loteria ? `&loteria=${loteria}` : ""}`, url.origin), 303);

  if (!validarTokenAlerta("confirmar", id, url.searchParams.get("t"))) return destino("invalido");

  const { rows } = await pool.query<{ loteria: string }>(
    `UPDATE alertas_jogo a
     SET confirmado_em = coalesce(a.confirmado_em, now()),
         ultimo_concurso_avisado = CASE WHEN a.confirmado_em IS NULL THEN (
           SELECT max(c.numero) FROM concurso c JOIN loteria l ON l.id = c.loteria_id WHERE l.codigo = a.loteria
         ) ELSE a.ultimo_concurso_avisado END
     WHERE a.id = $1 AND a.canal = 'email'
     RETURNING a.loteria`,
    [id]
  );
  // Sem linha: já foi descadastrado ou apagado por não confirmar em 7 dias.
  return rows[0] ? destino("confirmado", rows[0].loteria) : destino("expirado");
}
