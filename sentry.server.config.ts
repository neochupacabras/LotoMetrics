import * as Sentry from "@sentry/nextjs";

// Runtime Node.js (Server Components, Route Handlers, Server Actions, crons).
// DSN só de servidor (SENTRY_DSN). Sem `dataCollection`/sendDefaultPii: não
// envia PII por padrão.
Sentry.init({
  dsn: process.env.SENTRY_DSN,

  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  // Anexa valores de variáveis locais aos frames do stack trace.
  includeLocalVariables: true,
});
