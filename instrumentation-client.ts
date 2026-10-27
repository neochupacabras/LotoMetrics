import * as Sentry from "@sentry/nextjs";

// Runtime do browser. O DSN é público (vai no bundle do cliente) e vem de
// NEXT_PUBLIC_SENTRY_DSN. Sem `dataCollection`/`sendDefaultPii`: por padrão
// o SDK NÃO envia dados pessoais (IP, cookies, corpos HTTP) — coerente com
// o endurecimento de LGPD do projeto.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 100% em dev, 10% em produção.
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  // Session Replay: 10% das sessões, 100% das sessões com erro.
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    // maskAllText/blockAllMedia são o padrão do replayIntegration — não
    // grava texto nem mídia da tela, reduzindo exposição de PII.
    Sentry.replayIntegration(),
  ],
});

// Liga as transições de navegação do App Router ao tracing.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
