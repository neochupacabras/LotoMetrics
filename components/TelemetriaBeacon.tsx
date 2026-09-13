"use client";

import { useEffect } from "react";
import { usePlanoUsuario } from "@/components/auth/PlanoUsuarioProvider";
import { enviarBeacon, obterOuCriarAnonymousId } from "@/lib/telemetria-cliente";

interface Props {
  eventName?: "tool_view" | "pricing_view";
  tool?: string | null;
  lottery?: string | null;
  metadata?: Record<string, unknown>;
}

// Emite um evento de produto pelo cliente (navigator.sendBeacon), não pelo
// servidor — tarefa 2.3 do plano de implementação (13/09/2026). Um
// crawler sem JavaScript nunca executa isto; uma página com ISR/SSG conta
// a visita de verdade em vez de só a regeneração de cache (o que
// acontecia com after(() => logToolEvent(...)) nas versões anteriores
// destas páginas — o próprio Server Component só roda de novo quando o
// cache expira, não a cada pageview servido dele).
//
// Renderizado sem props numa página de ferramenta = "tool_view" — o
// `tool`/`lottery` vêm de quem instancia. Componente puramente de efeito
// colateral: nunca renderiza nada.
export default function TelemetriaBeacon({ eventName = "tool_view", tool = null, lottery = null, metadata }: Props) {
  const { carregando, isPremium, logado } = usePlanoUsuario();

  useEffect(() => {
    // Espera o plano carregar antes de disparar — senão toda visita de
    // usuário logado seria contada como "plan: null" na primeira
    // renderização.
    if (carregando) return;
    enviarBeacon({
      eventName,
      tool,
      lottery,
      plan: logado ? (isPremium ? "premium" : "free") : null,
      anonymousId: obterOuCriarAnonymousId(),
      ...(metadata ? { metadata } : {}),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carregando]);

  return null;
}
