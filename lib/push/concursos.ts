import { LOTERIAS, formatarMoeda, preposicaoLoteria } from "@/lib/format";
import type { PayloadPush } from "@/lib/push/categorias";
import { notificarInscricoes, semFalhar, type OpcoesPush, type ResumoPush } from "@/lib/push/servidor";

// Push público por concurso novo: "resultado" (todas as dezenas) e
// "acumulado" (estimativa do próximo prêmio). Chamado de
// processarConcursosNovos() — mesmo gatilho (importador + cron diário) e
// mesma janela do e-mail, com idempotência própria em push_envios.

export interface ConcursoPush {
  loteria_codigo: string;
  numero: number;
  dezenas: number[];
  acumulado: boolean;
  valor_estimado_proximo: string | null;
}

export function montarPayloadResultado(c: ConcursoPush): PayloadPush {
  const nome = LOTERIAS[c.loteria_codigo as keyof typeof LOTERIAS]?.nome ?? c.loteria_codigo;
  const dezenas = c.dezenas.map((d) => String(d).padStart(2, "0")).join(" ");
  const valor = c.valor_estimado_proximo ? Number(c.valor_estimado_proximo) : null;
  const sufixo = c.acumulado ? " · Acumulou!" : "";
  return {
    titulo: `${nome} ${c.numero}${sufixo}`,
    corpo: c.acumulado && valor ? `${dezenas}\nPróximo prêmio estimado: ${formatarMoeda(valor)}` : dezenas,
    url: `/${c.loteria_codigo}/resultados/${c.numero}`,
    tag: `resultado-${c.loteria_codigo}`,
    categoria: "resultado",
    acoes: [
      { acao: "ver", titulo: "Ver resultado", url: `/${c.loteria_codigo}/resultados/${c.numero}` },
      { acao: "conferir", titulo: "Conferir jogo", url: `/${c.loteria_codigo}/conferidor` },
    ],
  };
}

export function montarPayloadAcumulado(c: ConcursoPush): PayloadPush {
  const nome = LOTERIAS[c.loteria_codigo as keyof typeof LOTERIAS]?.nome ?? c.loteria_codigo;
  const valor = c.valor_estimado_proximo ? Number(c.valor_estimado_proximo) : null;
  const { de } = preposicaoLoteria(c.loteria_codigo);
  return {
    titulo: `${nome} acumulou!`,
    corpo: valor
      ? `Estimativa de ${formatarMoeda(valor)} para o concurso ${c.numero + 1}.`
      : `Ninguém acertou o concurso ${c.numero} ${de} ${nome}.`,
    url: `/${c.loteria_codigo}/resultados/${c.numero}`,
    tag: `acumulado-${c.loteria_codigo}`,
    categoria: "acumulado",
    acoes: [{ acao: "gerar", titulo: "Gerar jogo", url: `/${c.loteria_codigo}/gerador` }],
  };
}

export async function notificarConcursoPush(c: ConcursoPush, opcoes: OpcoesPush): Promise<ResumoPush[]> {
  const chave = `concurso:${c.loteria_codigo}:${c.numero}`;
  const resumos: ResumoPush[] = [];
  // Uma notificação por sorteio e inscrição: quem assina "resultado" já
  // recebe o "Acumulou!" + estimativa no próprio resultado; o aviso de
  // "acumulado" vai só para quem assina acúmulo SEM assinar resultado.
  const r1 = await semFalhar(
    () => notificarInscricoes("resultado", c.loteria_codigo, `${chave}:resultado`, montarPayloadResultado(c), opcoes),
    `resultado ${chave}`
  );
  if (r1) resumos.push(r1);
  if (c.acumulado) {
    const r2 = await semFalhar(
      () => notificarInscricoes("acumulado", c.loteria_codigo, `${chave}:acumulado`, montarPayloadAcumulado(c), opcoes, "resultado"),
      `acumulado ${chave}`
    );
    if (r2) resumos.push(r2);
  }
  return resumos;
}
