import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Footer from "@/components/Footer";
import { SITE_URL } from "@/lib/seo";
import { getPlanoPremium } from "@/lib/plano";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // necessário para env(safe-area-inset-bottom) no iPhone
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "LotoAnalítica — Resultados e estatísticas de loteria",
  description:
    "Resultados oficiais e estatísticas de Lotofácil e Mega-Sena: frequência, atraso, ciclos e mais.",
  robots: { index: true, follow: true },
  verification: {
    google: "WLl3OBG-d1NTYCfOVMGnAFQnsn73NjfYwpkingyJm2E",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Verifica o plano no servidor — o script do AdSense só é incluído
  // no HTML quando o usuário NÃO é premium. Para assinantes, o script
  // nunca chega ao navegador.
  const { premium } = await getPlanoPremium();

  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <body suppressHydrationWarning>
        {children}
        <Footer />
        <Analytics />
        <SpeedInsights />

        {/* Script do AdSense — NUNCA carregado para usuários premium */}
        {!premium && (
          <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2396097789128007"
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
