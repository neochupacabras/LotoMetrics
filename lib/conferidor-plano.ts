import crypto from "node:crypto";

// Limite de plano do conferidor, decidido no servidor.
//
// Fica fora de lib/conferidor-actions.ts porque um arquivo "use server" só
// pode exportar funções async, e estas precisam ser puras para teste (mesmo
// padrão de lib/simulador-plano.ts).
//
// Quem não é Premium tem LIMITE_CONFERENCIAS_FREE conferências numa janela
// móvel de 24 horas. A conta fica num cookie httpOnly assinado com HMAC: o
// navegador guarda, mas não consegue editar sem invalidar a assinatura.
// Cookie ausente, malformado ou com assinatura inválida vale como "nenhuma
// conferência usada" (o mesmo que apagar o cookie, então forjar não dá
// nada a mais), e a conta só cresce a partir daí. Apagar o cookie zera a
// conta: é um limite de produto, não um controle de segurança.

export const LIMITE_CONFERENCIAS_FREE = 3;
export const JANELA_CONFERENCIAS_MS = 24 * 60 * 60 * 1000;
export const COOKIE_CONFERENCIAS = "la_conf";

export const ERRO_LIMITE_CONFERIDOR =
  `Você já fez ${LIMITE_CONFERENCIAS_FREE} conferências nas últimas 24 horas, o limite do plano gratuito. ` +
  "Assine o Premium para conferir quantos jogos quiser.";

const VERSAO = "v1";

function assinar(payload: string, segredo: string): string {
  return crypto.createHmac("sha256", segredo).update(`${VERSAO}.${payload}`).digest("base64url");
}

function assinaturaConfere(payload: string, assinatura: string, segredo: string): boolean {
  const esperada = Buffer.from(assinar(payload, segredo));
  const recebida = Buffer.from(assinatura);
  return esperada.length === recebida.length && crypto.timingSafeEqual(esperada, recebida);
}

// Instantes (ms) das conferências ainda dentro da janela, do mais antigo ao
// mais recente. Qualquer coisa que não seja um cookie válido vira [].
export function lerConferencias(
  valor: string | undefined,
  segredo: string,
  agora: number
): number[] {
  if (!valor) return [];
  const partes = valor.split(".");
  if (partes.length !== 3 || partes[0] !== VERSAO) return [];
  const [, payload, assinatura] = partes;
  if (!assinaturaConfere(payload, assinatura, segredo)) return [];

  let dados: unknown;
  try {
    dados = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return [];
  }
  if (!Array.isArray(dados)) return [];
  return dados
    .filter((t): t is number => typeof t === "number" && Number.isFinite(t))
    // Instante no futuro só apareceria com o relógio do servidor voltando;
    // descartar evita que ele prenda a conta por mais de 24 h.
    .filter((t) => t > agora - JANELA_CONFERENCIAS_MS && t <= agora)
    .sort((a, b) => a - b);
}

export function conferenciasRestantes(usadas: number[]): number {
  return Math.max(0, LIMITE_CONFERENCIAS_FREE - usadas.length);
}

// Cookie com a conferência de agora somada. Guarda no máximo o limite (as
// mais recentes), então o valor não cresce.
export function registrarConferencia(usadas: number[], segredo: string, agora: number): string {
  const novas = [...usadas, agora].slice(-LIMITE_CONFERENCIAS_FREE);
  const payload = Buffer.from(JSON.stringify(novas)).toString("base64url");
  return `${VERSAO}.${payload}.${assinar(payload, segredo)}`;
}

// Validade do cookie: a conferência gravada agora é a mais recente, então
// tudo nele expira em no máximo uma janela.
export const MAX_AGE_COOKIE_CONFERENCIAS = JANELA_CONFERENCIAS_MS / 1000;
