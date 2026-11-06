import webpush, { WebPushError } from "web-push";
import pool from "@/lib/db";
import type { CategoriaPush, PayloadPush } from "@/lib/push/categorias";

// Envio de Web Push no servidor (biblioteca web-push: criptografia
// aes128gcm do payload — RFC 8291 — e assinatura VAPID — RFC 8292).
//
// Variáveis de ambiente (ver docs/PWA.md):
//   NEXT_PUBLIC_VAPID_PUBLIC_KEY  chave pública (vai para o navegador)
//   VAPID_PRIVATE_KEY             chave privada — SÓ no servidor
//   VAPID_SUBJECT                 mailto: ou https: de contato do remetente
//
// Sem as variáveis, pushConfigurado() devolve false e nada é enviado (as
// rotas respondem 503 e o cron só registra "push não configurado").

let configurado: boolean | null = null;

export function pushConfigurado(): boolean {
  if (configurado !== null) return configurado;
  const publica = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privada = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:contato@lotoanalitica.com.br";
  if (!publica || !privada) {
    configurado = false;
    return false;
  }
  try {
    webpush.setVapidDetails(subject, publica, privada);
    configurado = true;
  } catch (err) {
    console.error("VAPID inválido:", (err as Error).message);
    configurado = false;
  }
  return configurado;
}

export interface InscricaoRow {
  id: number;
  endpoint: string;
  p256dh: string;
  auth: string;
}

export type ResultadoEnvio = "enviado" | "expirada" | "falhou";

// Inscrição descartada após tantas falhas seguidas (fora 404/410, que
// removem na hora).
const MAX_FALHAS = 5;

function esperar(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// Tópico: notificações com o mesmo tópico ainda não entregues (aparelho
// offline) são substituídas no serviço de push — evita fila de avisos
// velhos. Máx. 32 caracteres do alfabeto base64url.
function topico(tag: string): string {
  return tag.replace(/[^A-Za-z0-9_-]/g, "-").slice(0, 32);
}

function ehApple(endpoint: string): boolean {
  try {
    return new URL(endpoint).hostname.endsWith(".push.apple.com");
  } catch {
    return false;
  }
}

export async function enviarParaInscricao(
  inscricao: InscricaoRow,
  payload: PayloadPush,
  opts: { ttlSegundos?: number; urgencia?: "low" | "normal" | "high" } = {}
): Promise<{ resultado: ResultadoEnvio; erro?: string }> {
  if (!pushConfigurado()) return { resultado: "falhou", erro: "push não configurado" };

  const corpo = JSON.stringify(payload);
  const opcoes = {
    TTL: opts.ttlSegundos ?? 60 * 60 * 12,
    urgency: opts.urgencia ?? "normal",
    // O serviço da Apple (web.push.apple.com) recusa o cabeçalho Topic com
    // 400 {"reason":"BadWebPushTopic"} — visto no iPhone em 06/11/2026.
    // Lá ele vai sem tópico; a tag da notificação já evita duplicadas na tela.
    ...(ehApple(inscricao.endpoint) ? {} : { topic: topico(payload.tag) }),
    timeout: 10_000,
  };

  // 1 tentativa extra para erros transitórios (429 / 5xx / rede).
  for (let tentativa = 0; tentativa < 2; tentativa++) {
    try {
      await webpush.sendNotification(
        { endpoint: inscricao.endpoint, keys: { p256dh: inscricao.p256dh, auth: inscricao.auth } },
        corpo,
        opcoes
      );
      await pool.query(
        `UPDATE push_inscricoes SET falhas_consecutivas = 0, ultimo_envio_em = now() WHERE id = $1`,
        [inscricao.id]
      );
      return { resultado: "enviado" };
    } catch (err) {
      const status = err instanceof WebPushError ? err.statusCode : 0;
      // 404/410: a inscrição não existe mais (usuário revogou a permissão,
      // limpou dados ou desinstalou) — remove na hora.
      if (status === 404 || status === 410) {
        await pool.query(`DELETE FROM push_inscricoes WHERE id = $1`, [inscricao.id]);
        return { resultado: "expirada" };
      }
      const transitorio = status === 0 || status === 429 || status >= 500;
      if (transitorio && tentativa === 0) {
        await esperar(800);
        continue;
      }
      const mensagem = err instanceof WebPushError ? `${status}: ${err.body?.slice(0, 200)}` : (err as Error).message;
      // 400/401/403/413: payload ou VAPID inválido — conta falha; depois de
      // MAX_FALHAS seguidas a inscrição é descartada.
      // Dois comandos de propósito: num CTE (UPDATE … DELETE no mesmo
      // statement) o DELETE não enxerga a linha recém-atualizada e não
      // apagaria nada.
      const { rows } = await pool.query<{ falhas_consecutivas: number }>(
        `UPDATE push_inscricoes SET falhas_consecutivas = falhas_consecutivas + 1
         WHERE id = $1 RETURNING falhas_consecutivas`,
        [inscricao.id]
      );
      if ((rows[0]?.falhas_consecutivas ?? 0) >= MAX_FALHAS) {
        await pool.query(`DELETE FROM push_inscricoes WHERE id = $1`, [inscricao.id]);
      }
      return { resultado: "falhou", erro: mensagem };
    }
  }
  return { resultado: "falhou", erro: "sem tentativas" };
}

// Reivindica a chave em push_envios antes de enviar (nunca reenvia o mesmo
// evento para a mesma inscrição, mesmo se o cron e o disparo do importador
// rodarem juntos) e registra falha.
async function reivindicarEEnviar(
  inscricao: InscricaoRow,
  chave: string,
  payload: PayloadPush
): Promise<ResultadoEnvio | "duplicado"> {
  const { rows } = await pool.query<{ id: number }>(
    `INSERT INTO push_envios (inscricao_id, chave) VALUES ($1, $2)
     ON CONFLICT (inscricao_id, chave) DO NOTHING RETURNING id`,
    [inscricao.id, chave]
  );
  const envioId = rows[0]?.id;
  if (!envioId) return "duplicado";

  const { resultado, erro } = await enviarParaInscricao(inscricao, payload);
  if (resultado === "falhou") {
    await pool.query(`UPDATE push_envios SET status = 'falhou', erro = $2 WHERE id = $1`, [envioId, erro ?? null]);
  }
  return resultado;
}

export interface OpcoesPush {
  dryRun: boolean;
}

export interface ResumoPush {
  categoria: CategoriaPush;
  chave: string;
  inscricoes: number;
  enviados: number;
  expirados: number;
  falhos: number;
  duplicados: number;
  simulado: boolean;
}

// Envio em lotes pequenos e paralelos — os serviços de push respondem
// rápido, mas um laço serial com centenas de inscrições estouraria o
// maxDuration da função.
const LOTE = 20;

async function enviarParaLista(
  inscricoes: InscricaoRow[],
  categoria: CategoriaPush,
  chave: string,
  payload: PayloadPush,
  opcoes: OpcoesPush
): Promise<ResumoPush> {
  const resumo: ResumoPush = {
    categoria, chave, inscricoes: inscricoes.length,
    enviados: 0, expirados: 0, falhos: 0, duplicados: 0, simulado: opcoes.dryRun,
  };
  if (opcoes.dryRun || inscricoes.length === 0 || !pushConfigurado()) return resumo;

  for (let i = 0; i < inscricoes.length; i += LOTE) {
    const resultados = await Promise.all(
      inscricoes.slice(i, i + LOTE).map((ins) => reivindicarEEnviar(ins, chave, payload))
    );
    for (const r of resultados) {
      if (r === "enviado") resumo.enviados++;
      else if (r === "expirada") resumo.expirados++;
      else if (r === "duplicado") resumo.duplicados++;
      else resumo.falhos++;
    }
  }
  return resumo;
}

// Público: todas as inscrições (com ou sem conta) que assinam a categoria
// para a loteria dada (loterias vazio = todas).
export async function notificarInscricoes(
  categoria: Extract<CategoriaPush, "resultado" | "acumulado">,
  loteria: string,
  chave: string,
  payload: PayloadPush,
  opcoes: OpcoesPush,
  // Pula quem também assina esta outra categoria (e já recebe o mesmo
  // evento por ela) — evita duas notificações para um mesmo sorteio.
  excluirQuemAssina?: CategoriaPush
): Promise<ResumoPush> {
  const { rows } = await pool.query<InscricaoRow>(
    `SELECT id, endpoint, p256dh, auth FROM push_inscricoes
     WHERE $1 = ANY(categorias) AND (cardinality(loterias) = 0 OR $2 = ANY(loterias))
       AND ($3::text IS NULL OR NOT ($3::text = ANY(categorias)))`,
    [categoria, loteria, excluirQuemAssina ?? null]
  );
  return enviarParaLista(rows, categoria, chave, payload, opcoes);
}

// Pessoal: só os aparelhos do próprio usuário que assinam a categoria.
export async function notificarUsuario(
  userId: string,
  categoria: Extract<CategoriaPush, "meus_jogos" | "bolao">,
  chave: string,
  payload: PayloadPush,
  opcoes: OpcoesPush
): Promise<ResumoPush> {
  const { rows } = await pool.query<InscricaoRow>(
    `SELECT id, endpoint, p256dh, auth FROM push_inscricoes
     WHERE user_id = $1 AND $2 = ANY(categorias)`,
    [userId, categoria]
  );
  return enviarParaLista(rows, categoria, chave, payload, opcoes);
}

// Isolamento: falha de push nunca derruba o fluxo de e-mail que o chama.
export async function semFalhar<T>(fn: () => Promise<T>, contexto: string): Promise<T | null> {
  try {
    return await fn();
  } catch (err) {
    console.error(`push (${contexto}) falhou:`, (err as Error).message);
    return null;
  }
}
