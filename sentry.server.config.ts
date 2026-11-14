import * as Sentry from "@sentry/nextjs";

// Runtime Node.js (Server Components, Route Handlers, Server Actions, crons).
// DSN só de servidor (SENTRY_DSN). Sem `dataCollection`/sendDefaultPii: não
// envia PII por padrão.
Sentry.init({
  dsn: process.env.SENTRY_DSN,

  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  // includeLocalVariables fica DESLIGADO: ele liga o depurador do Node
  // (node:inspector) para capturar variáveis nas exceções, e isso deixava
  // toda renderização ISR ~2s mais lenta — página de resultado em 2,7s com
  // ele, ~0,3s sem (preview na Vercel, 13/11/2026).
  includeLocalVariables: false,
});
