import pool from "@/lib/db";
import { endpointPermitido } from "@/lib/push/validacao";
import { erro, lerJson, ok, preChecar } from "@/lib/push/rotas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/push/desvincular { endpoint } — chamado ao sair da conta (e
// quando o app percebe que a sessão mudou). Mantém as notificações
// públicas deste aparelho (resultado/acúmulo), mas desliga a conta e tira
// as categorias pessoais: depois do logout, o aparelho não recebe mais
// nada sobre os jogos/bolões de quem saiu.
export async function POST(request: Request) {
  const bloqueio = await preChecar(request, "push:desvincular", 60, 3600);
  if (bloqueio) return bloqueio;

  const corpo = await lerJson(request);
  if (!corpo || !endpointPermitido(corpo.endpoint)) return erro(400, "Endpoint inválido");

  await pool.query(
    `UPDATE push_inscricoes
     SET user_id = NULL,
         categorias = ARRAY(SELECT unnest(categorias) EXCEPT SELECT unnest(ARRAY['meus_jogos','bolao']::text[])),
         atualizado_em = now()
     WHERE endpoint = $1`,
    [corpo.endpoint]
  );
  // Sem categoria pública sobrando, a inscrição não serve para nada.
  await pool.query(`DELETE FROM push_inscricoes WHERE endpoint = $1 AND cardinality(categorias) = 0`, [corpo.endpoint]);
  return ok();
}
