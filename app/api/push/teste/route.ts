import pool from "@/lib/db";
import { endpointPermitido } from "@/lib/push/validacao";
import { erro, lerJson, ok, preChecar } from "@/lib/push/rotas";
import { consumirLimite, hashCurto } from "@/lib/rate-limit";
import { enviarParaInscricao, pushConfigurado, type InscricaoRow } from "@/lib/push/servidor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/push/teste { endpoint } — envia uma notificação de teste para
// o PRÓPRIO navegador (só para inscrições já salvas; o conteúdo é fixo,
// nada vindo do cliente entra na notificação). Limite: 3 por 10 min por
// inscrição + o limite por IP.
export async function POST(request: Request) {
  const bloqueio = await preChecar(request, "push:teste", 10, 3600);
  if (bloqueio) return bloqueio;
  if (!pushConfigurado()) return erro(503, "Notificações ainda não configuradas no servidor");

  const corpo = await lerJson(request);
  if (!corpo || !endpointPermitido(corpo.endpoint)) return erro(400, "Endpoint inválido");

  if (!(await consumirLimite(`push:teste:ep:${hashCurto(corpo.endpoint)}`, 3, 600))) {
    return erro(429, "Aguarde alguns minutos para testar de novo.");
  }

  const { rows } = await pool.query<InscricaoRow>(
    `SELECT id, endpoint, p256dh, auth FROM push_inscricoes WHERE endpoint = $1`,
    [corpo.endpoint]
  );
  if (!rows[0]) return erro(404, "Ative as notificações antes de testar");

  const { resultado, erro: detalhe } = await enviarParaInscricao(
    rows[0],
    {
      titulo: "Notificações ativadas ✓",
      corpo: "É assim que os resultados vão chegar no seu aparelho.",
      url: "/notificacoes",
      tag: "teste",
      categoria: "teste",
    },
    { ttlSegundos: 300, urgencia: "high" }
  );
  if (resultado === "enviado") return ok();
  if (resultado === "expirada") return erro(410, "Inscrição expirada — ative de novo");
  console.error("push teste falhou:", detalhe);
  return erro(502, "Não foi possível entregar a notificação de teste");
}
