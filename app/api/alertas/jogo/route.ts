import { cookies } from "next/headers";
import pool from "@/lib/db";
import { getLoteriaPorCodigo } from "@/lib/queries";
import { isCodigoLoteriaValido } from "@/lib/format";
import { erro, lerJson, ok, preChecar } from "@/lib/push/rotas";
import { validarInscricao } from "@/lib/push/validacao";
import { pushConfigurado } from "@/lib/push/servidor";
import { consumirLimite, hashCurto } from "@/lib/rate-limit";
import { LIMITE_JOGOS_POR_DESTINO, normalizarEmail, validarJogoAlerta } from "@/lib/alertas-jogo";
import { urlAcaoAlerta } from "@/lib/alertas-jogo-tokens";
import { emLoteria } from "@/lib/notificacoes/alertas-jogo-envio";
import { enviarEmail } from "@/lib/notificacoes/enviar";
import { emailConfirmarAvisoJogo } from "@/lib/email-templates";
import { NOME_LOTERIA } from "@/lib/seo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/alertas/jogo — inscreve um jogo no aviso a cada sorteio
// (semana 4 do roadmap, entrega c). Sem conta e sem senha.
//   { loteria, dezenas: number[], trevos?: number[], canal: "push", inscricao: PushSubscriptionJSON }
//   { loteria, dezenas: number[], trevos?: number[], canal: "email", email }
//
// push : cria/reaproveita a inscrição do navegador em push_inscricoes (sem
//        assinar nenhuma outra categoria) e o aviso já vale.
// email: grava pendente e manda o link de confirmação (opt-in duplo). A
//        resposta é a mesma para e-mail novo, repetido ou no limite, para
//        não revelar quais endereços já estão inscritos.

const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://lotoanalitica.com.br").replace(/\/$/, "");
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function anonymousId(): Promise<string | null> {
  const v = (await cookies()).get("la_aid")?.value ?? "";
  return UUID.test(v) ? v : null;
}

// Começa a avisar a partir do PRÓXIMO concurso, não do que já saiu.
async function ultimoConcurso(loteriaId: number): Promise<number | null> {
  const { rows } = await pool.query<{ n: number | null }>(
    `SELECT max(numero) AS n FROM concurso WHERE loteria_id = $1`,
    [loteriaId]
  );
  return rows[0]?.n ?? null;
}

export async function POST(request: Request) {
  const bloqueio = await preChecar(request, "alerta:inscrever", 20, 3600);
  if (bloqueio) return bloqueio;

  const corpo = await lerJson(request);
  if (!corpo) return erro(400, "Corpo inválido");

  const codigo = typeof corpo.loteria === "string" ? corpo.loteria : "";
  if (!isCodigoLoteriaValido(codigo)) return erro(400, "Loteria inválida");
  const loteria = await getLoteriaPorCodigo(codigo);
  if (!loteria) return erro(400, "Loteria inválida");

  const jogo = validarJogoAlerta(
    { codigo, dezenaMin: loteria.dezenaMin, dezenaMax: loteria.dezenaMax, qtdDezenasSorteadas: loteria.qtdDezenasSorteadas },
    corpo.dezenas,
    corpo.trevos
  );
  if ("erro" in jogo) return erro(400, jogo.erro);

  const ultimo = await ultimoConcurso(loteria.id);
  const aid = await anonymousId();

  if (corpo.canal === "push") {
    if (!pushConfigurado()) return erro(503, "Notificações ainda não configuradas no servidor");
    const inscricao = validarInscricao(corpo.inscricao);
    if (!inscricao) return erro(400, "Inscrição push inválida");
    const userAgent = (request.headers.get("user-agent") ?? "").slice(0, 300);

    // Navegador novo entra sem nenhuma categoria (não passa a receber o
    // push de resultado sem ter pedido); um já inscrito mantém as dele.
    const { rows } = await pool.query<{ id: number }>(
      `INSERT INTO push_inscricoes (endpoint, p256dh, auth, categorias, loterias, user_agent)
       VALUES ($1, $2, $3, '{}', '{}', $4)
       ON CONFLICT (endpoint) DO UPDATE SET
         p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth,
         falhas_consecutivas = 0, atualizado_em = now()
       RETURNING id`,
      [inscricao.endpoint, inscricao.p256dh, inscricao.auth, userAgent]
    );
    const inscricaoId = rows[0].id;

    const { rows: contagem } = await pool.query<{ n: number }>(
      `SELECT count(*)::int AS n FROM alertas_jogo WHERE push_inscricao_id = $1`,
      [inscricaoId]
    );
    const r = await pool.query(
      `INSERT INTO alertas_jogo (loteria, dezenas, trevos, canal, push_inscricao_id, confirmado_em, ultimo_concurso_avisado, anonymous_id)
       SELECT $1, $2, $3, 'push', $4, now(), $5, $6
       WHERE $7::int < $8::int
       ON CONFLICT DO NOTHING`,
      [codigo, jogo.dezenas, jogo.trevos, inscricaoId, ultimo, aid, contagem[0].n, LIMITE_JOGOS_POR_DESTINO]
    );
    if ((r.rowCount ?? 0) === 0 && contagem[0].n >= LIMITE_JOGOS_POR_DESTINO) {
      return erro(409, `Este aparelho já recebe avisos de ${LIMITE_JOGOS_POR_DESTINO} jogos.`);
    }
    return ok({ canal: "push" });
  }

  if (corpo.canal === "email") {
    const email = normalizarEmail(corpo.email);
    if (!email) return erro(400, "Digite um e-mail válido.");
    // Além do limite por IP: no máximo 5 pedidos por dia para o mesmo
    // endereço (evita usar o formulário para lotar a caixa de alguém).
    if (!(await consumirLimite(`alerta:email:${hashCurto(email)}`, 5, 86400))) {
      return ok({ canal: "email" });
    }

    const { rows: contagem } = await pool.query<{ n: number }>(
      `SELECT count(*)::int AS n FROM alertas_jogo WHERE email = $1`,
      [email]
    );
    if (contagem[0].n >= LIMITE_JOGOS_POR_DESTINO) return ok({ canal: "email" });

    const { rows } = await pool.query<{ id: string; confirmado_em: Date | null }>(
      `WITH novo AS (
         INSERT INTO alertas_jogo (loteria, dezenas, trevos, canal, email, ultimo_concurso_avisado, anonymous_id)
         VALUES ($1, $2, $3, 'email', $4, $5, $6)
         ON CONFLICT DO NOTHING
         RETURNING id, confirmado_em
       )
       SELECT id, confirmado_em FROM novo
       UNION ALL
       SELECT id, confirmado_em FROM alertas_jogo
       WHERE canal = 'email' AND email = $4 AND loteria = $1 AND dezenas = $2
         AND coalesce(trevos, '{}') = coalesce($3::int[], '{}')
       LIMIT 1`,
      [codigo, jogo.dezenas, jogo.trevos, email, ultimo, aid]
    );
    const alerta = rows[0];
    // Já confirmado: nada a fazer (mesma resposta).
    if (!alerta || alerta.confirmado_em) return ok({ canal: "email" });

    const nome = NOME_LOTERIA[codigo] ?? loteria.nome;
    const jogoTexto = codigo === "supersete"
      ? jogo.dezenas.join(" ")
      : `${jogo.dezenas.map((d) => String(d).padStart(2, "0")).join(" ")}${jogo.trevos ? `  · trevos ${jogo.trevos.join(" ")}` : ""}`;
    const urlConfirmar = urlAcaoAlerta("confirmar", alerta.id, BASE_URL);

    // Fora de produção não manda e-mail de verdade: o link vai para o log
    // do servidor, para testar o fluxo sem escrever para ninguém.
    if (process.env.VERCEL_ENV !== "production") {
      console.info(`[alertas] e-mail de confirmação não enviado (fora de produção): ${urlConfirmar}`);
      return ok({ canal: "email" });
    }
    const envio = await enviarEmail({
      to: email,
      subject: `Confirme o aviso do seu jogo ${emLoteria(codigo)}`,
      html: emailConfirmarAvisoJogo(nome, emLoteria(codigo), jogoTexto, urlConfirmar),
    });
    if (!envio.ok) {
      console.error("alertas: falha ao enviar confirmação:", envio.erro);
      return erro(502, "Não conseguimos enviar o e-mail agora. Tente de novo em alguns minutos.");
    }
    return ok({ canal: "email" });
  }

  return erro(400, "Canal inválido");
}
