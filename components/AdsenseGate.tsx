"use client";

import Script from "next/script";
import { usePlanoUsuario } from "@/components/auth/PlanoUsuarioProvider";
import { useSemAnuncios } from "@/components/SemAnunciosProvider";

// Só injeta o script do AdSense depois de confirmar no cliente que o
// visitante não é premium — nunca carrega enquanto o plano ainda está
// sendo checado, preservando a garantia de "nunca para assinantes".
// Também não carrega em páginas que pedem "sem anúncios" (bolão Pro).
export default function AdsenseGate() {
  const { carregando, isPremium } = usePlanoUsuario();

  const semAnuncios = useSemAnuncios();

  if (carregando || isPremium || semAnuncios) return null;

  return (
    <Script
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2396097789128007"
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
