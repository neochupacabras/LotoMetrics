import crypto from "node:crypto";

// Token de descadastro de e-mail — permite desativar profiles.receber_emails
// a partir de um link no rodapé do e-mail, sem exigir login (prática padrão
// de e-mail transacional). HMAC-SHA256 sobre o próprio userId, com uma
// chave só pra isso (NOTIFICACOES_UNSUB_SECRET) — nunca reaproveitar
// CRON_SECRET/REVALIDAR_SECRET aqui, porque esse token circula em e-mails
// (superfície de exposição diferente de um secret só de servidor-servidor).

function getSecret(): string {
  const secret = process.env.NOTIFICACOES_UNSUB_SECRET;
  if (!secret) {
    throw new Error("NOTIFICACOES_UNSUB_SECRET não configurado");
  }
  return secret;
}

export function gerarTokenDescadastro(userId: string): string {
  return crypto.createHmac("sha256", getSecret()).update(userId).digest("hex");
}

export function validarTokenDescadastro(userId: string, token: string): boolean {
  let secret: string;
  try {
    secret = getSecret();
  } catch {
    return false;
  }
  const esperado = crypto.createHmac("sha256", secret).update(userId).digest("hex");
  const esperadoBuffer = Buffer.from(esperado);
  const recebidoBuffer = Buffer.from(token);
  return (
    esperadoBuffer.length === recebidoBuffer.length &&
    crypto.timingSafeEqual(esperadoBuffer, recebidoBuffer)
  );
}

export function urlDescadastro(userId: string, baseUrl: string): string {
  const token = gerarTokenDescadastro(userId);
  return `${baseUrl}/api/notificacoes/descadastrar?u=${encodeURIComponent(userId)}&t=${token}`;
}

// Participante de bolão não tem conta (só nome + e-mail informados pelo
// próprio participante), então o descadastro dele é por token sobre o ID da
// linha em bolao_participantes — com prefixo próprio, pra um token de
// usuário nunca valer como token de participante e vice-versa.
const prefixoParticipante = (id: string) => `bolao-participante:${id}`;

export function urlDescadastroParticipante(participanteId: string, baseUrl: string): string {
  const token = gerarTokenDescadastro(prefixoParticipante(participanteId));
  return `${baseUrl}/api/notificacoes/descadastrar?p=${encodeURIComponent(participanteId)}&t=${token}`;
}

export function validarTokenParticipante(participanteId: string, token: string): boolean {
  return validarTokenDescadastro(prefixoParticipante(participanteId), token);
}
