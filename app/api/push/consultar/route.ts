import pool from "@/lib/db";
import { endpointPermitido } from "@/lib/push/validacao";
import { erro, lerJson, ok, preChecar, usuarioAtual } from "@/lib/push/rotas";
import { pushConfigurado } from "@/lib/push/servidor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/push/consultar { endpoint } — preferências salvas desta
// inscrição. POST (e não GET com query string) para o endpoint, que é a
// credencial da inscrição, não ir parar em logs de acesso/URL.
export async function POST(request: Request) {
  const bloqueio = await preChecar(request, "push:consultar", 120, 3600);
  if (bloqueio) return bloqueio;

  const corpo = await lerJson(request);
  if (!corpo || !endpointPermitido(corpo.endpoint)) return erro(400, "Endpoint inválido");

  const [{ rows }, userId] = await Promise.all([
    pool.query<{ categorias: string[]; loterias: string[]; user_id: string | null }>(
      `SELECT categorias, loterias, user_id FROM push_inscricoes WHERE endpoint = $1`,
      [corpo.endpoint]
    ),
    usuarioAtual(),
  ]);
  const linha = rows[0];
  return ok({
    configurado: pushConfigurado(),
    existe: !!linha,
    categorias: linha?.categorias ?? [],
    loterias: linha?.loterias ?? [],
    // Nunca devolve o user_id — só se a inscrição é da conta logada agora.
    vinculadaAConta: !!linha?.user_id && linha.user_id === userId,
    vinculadaAOutraConta: !!linha?.user_id && linha.user_id !== userId,
  });
}
