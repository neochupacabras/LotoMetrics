import { NextResponse } from "next/server";
import { logToolEvent, pareceBot, type ToolEventName } from "@/lib/telemetry";

export const runtime = "nodejs";

// Recebe os eventos de produto emitidos pelo cliente via
// navigator.sendBeacon (components/TelemetriaBeacon.tsx) — tarefa 2.3 do
// plano de implementação (13/09/2026). Antes, tool_view era gravado no
// Server Component de cada ferramenta: um INSERT por render, contando
// crawler junto com visitante real, e — em páginas com ISR/SSG — só
// contando as regenerações de cache, não as visitas de verdade servidas
// do cache.
//
// Sempre responde 200 (mesmo descartando o evento): sendBeacon não lê a
// resposta, e queremos que o navegador nunca tente re-enviar a mesma
// requisição por causa de um 4xx.
const EVENTOS_PERMITIDOS = new Set<ToolEventName>([
  "tool_view",
  "pricing_view",
  "visit_landing",
  "waitlist_joined",
  "limit_reached",
]);

export async function POST(request: Request) {
  if (pareceBot(request.headers.get("user-agent"))) {
    return NextResponse.json({ ok: true, ignorado: "bot" });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: true, ignorado: "corpo invalido" });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ ok: true, ignorado: "corpo invalido" });
  }
  const b = body as Record<string, unknown>;

  if (typeof b.eventName !== "string" || !EVENTOS_PERMITIDOS.has(b.eventName as ToolEventName)) {
    return NextResponse.json({ ok: true, ignorado: "evento desconhecido" });
  }

  const asStringOuNull = (v: unknown, max = 100): string | null =>
    typeof v === "string" && v.length > 0 ? v.slice(0, max) : null;

  await logToolEvent({
    eventName: b.eventName as ToolEventName,
    tool: asStringOuNull(b.tool),
    lottery: asStringOuNull(b.lottery),
    plan: b.plan === "premium" || b.plan === "free" ? b.plan : null,
    anonymousId: asStringOuNull(b.anonymousId, 64),
    metadata:
      typeof b.metadata === "object" && b.metadata !== null
        ? (b.metadata as Record<string, unknown>)
        : null,
  });

  return NextResponse.json({ ok: true });
}
