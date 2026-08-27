"use client";

import Script from "next/script";
import { usePlanoUsuario } from "@/components/auth/PlanoUsuarioProvider";

// Só injeta o script do AdSense depois de confirmar no cliente que o
// visitante não é premium — nunca carrega enquanto o plano ainda está
// sendo checado, preservando a garantia de "nunca para assinantes".
export default function AdsenseGate() {
  const { carregando, isPremium } = usePlanoUsuario();

  if (carregando || isPremium) return null;

  return (
    <Script
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2396097789128007"
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
