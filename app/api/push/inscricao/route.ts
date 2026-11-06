import pool from "@/lib/db";
import { endpointPermitido, normalizarCategorias, normalizarLoterias, validarInscricao } from "@/lib/push/validacao";
import { erro, lerJson, ok, preChecar, usuarioAtual } from "@/lib/push/rotas";
import { pushConfigurado } from "@/lib/push/servidor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST   /api/push/inscricao  — cria/atualiza a inscrição deste navegador
//        { inscricao: PushSubscriptionJSON, categorias: string[], loterias: string[] }
// DELETE /api/push/inscricao  — remove { endpoint }
//
// Autorização: o endpoint é um segredo do navegador (capacidade). O
// user_id vem SEMPRE da sessão (cookie), nunca do corpo — um cliente não
// consegue associar a inscrição a outra conta nem assinar categorias
// pessoais sem estar logado.

export async function POST(request: Request) {
  const bloqueio = await preChecar(request, "push:salvar", 30, 3600);
  if (bloqueio) return bloqueio;
  if (!pushConfigurado()) return erro(503, "Notificações ainda não configuradas no servidor");

  const corpo = await lerJson(request);
  if (!corpo) return erro(400, "Corpo inválido");

  const inscricao = validarInscricao(corpo.inscricao);
  if (!inscricao) return erro(400, "Inscrição push inválida");

  const userId = await usuarioAtual();
  const categorias = normalizarCategorias(corpo.categorias, !!userId);
  const loterias = normalizarLoterias(corpo.loterias);
  if (categorias.length === 0) return erro(400, "Escolha ao menos um tipo de notificação");

  const userAgent = (request.headers.get("user-agent") ?? "").slice(0, 300);

  // ON CONFLICT: o mesmo navegador re-salvando preferências (ou o serviço
  // de push rotacionando chaves). O dono passa a ser quem está logado
  // agora — se ninguém está, as categorias pessoais já foram filtradas.
  const { rows } = await pool.query<{ categorias: string[]; loterias: string[] }>(
    `INSERT INTO push_inscricoes (endpoint, p256dh, auth, user_id, categorias, loterias, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (endpoint) DO UPDATE SET
       p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth, user_id = EXCLUDED.user_id,
       categorias = EXCLUDED.categorias, loterias = EXCLUDED.loterias,
       user_agent = EXCLUDED.user_agent, falhas_consecutivas = 0, atualizado_em = now()
     RETURNING categorias, loterias`,
    [inscricao.endpoint, inscricao.p256dh, inscricao.auth, userId, categorias, loterias, userAgent]
  );

  return ok({ categorias: rows[0].categorias, loterias: rows[0].loterias, vinculadaAConta: !!userId });
}

export async function DELETE(request: Request) {
  const bloqueio = await preChecar(request, "push:remover", 30, 3600);
  if (bloqueio) return bloqueio;

  const corpo = await lerJson(request);
  if (!corpo || !endpointPermitido(corpo.endpoint)) return erro(400, "Endpoint inválido");

  await pool.query(`DELETE FROM push_inscricoes WHERE endpoint = $1`, [corpo.endpoint]);
  return ok();
}

