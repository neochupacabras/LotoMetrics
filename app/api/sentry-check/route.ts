// ROTA TEMPORÁRIA de verificação do Sentry — REMOVER após confirmar o erro.
// Lança um erro real num Route Handler para validar a captura server-side
// (onRequestError em instrumentation.ts) ponta a ponta.
export const dynamic = "force-dynamic";

export function GET() {
  throw new Error("Sentry verification — setup lotoanalitica (remover)");
}
