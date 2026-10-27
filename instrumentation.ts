import * as Sentry from "@sentry/nextjs";

// Hook de registro server-side do Next: carrega a config do runtime certo.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Captura automaticamente erros não tratados de requisições server-side
// (Route Handlers, Server Components, Server Actions). Requer @sentry/nextjs
// >= 8.28.0.
export const onRequestError = Sentry.captureRequestError;
