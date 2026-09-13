"use client";

import { useEffect } from "react";
import { enviarBeacon, escreverCookie, lerCookie, obterOuCriarAnonymousId } from "@/lib/telemetria-cliente";

const COOKIE_LANDED = "la_landed";

// Monta uma vez no layout raiz (app/layout.tsx) e dispara "visit_landing"
// só na PRIMEIRA página que a pessoa abrir — nunca de novo, mesmo
// navegando pelo site inteiro — usando um cookie próprio (la_landed,
// separado do anonymous_id) como trava. Tarefa 2.3 do plano de
// implementação: dá pra saber por onde o visitante entrou (referrer,
// UTM) sem instrumentar cada página individualmente.
export default function VisitaLandingBeacon() {
  useEffect(() => {
    if (lerCookie(COOKIE_LANDED)) return;
    escreverCookie(COOKIE_LANDED, "1");

    const params = new URLSearchParams(window.location.search);
    enviarBeacon({
      eventName: "visit_landing",
      anonymousId: obterOuCriarAnonymousId(),
      metadata: {
        landingPath: window.location.pathname,
        referrer: document.referrer || null,
        utmSource: params.get("utm_source"),
        utmMedium: params.get("utm_medium"),
        utmCampaign: params.get("utm_campaign"),
      },
    });
  }, []);

  return null;
}
