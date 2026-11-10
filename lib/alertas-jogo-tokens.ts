import { gerarTokenDescadastro, validarTokenDescadastro } from "./notificacoes/unsubscribe";

// Links de confirmar e de descadastrar um aviso de jogo (alertas_jogo).
// HMAC sobre o id da linha com a mesma chave dos outros descadastros
// (NOTIFICACOES_UNSUB_SECRET), mas com prefixo e ação próprios: um token de
// "confirmar" nunca vale para "descadastrar", nem um token de usuário ou de
// participante de bolão vale aqui.

export type AcaoAlerta = "confirmar" | "descadastrar";

const mensagem = (acao: AcaoAlerta, id: string) => `alerta-jogo:${acao}:${id}`;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function urlAcaoAlerta(acao: AcaoAlerta, id: string, baseUrl: string): string {
  const token = gerarTokenDescadastro(mensagem(acao, id));
  return `${baseUrl}/api/alertas/${acao}?a=${encodeURIComponent(id)}&t=${token}`;
}

export function validarTokenAlerta(acao: AcaoAlerta, id: string | null, token: string | null): boolean {
  if (!id || !token || !UUID.test(id)) return false;
  return validarTokenDescadastro(mensagem(acao, id), token);
}
