import * as Sentry from "@sentry/nextjs";

// Runtime Edge (o proxy/middleware em proxy.ts e qualquer rota edge). DSN só
// de servidor (SENTRY_DSN). Sem `dataCollection`/sendDefaultPii.
Sentry.init({
  dsn: process.env.SENTRY_DSN,

  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
});
