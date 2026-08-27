import type { Metadata } from "next";
import { Instrument_Serif, Work_Sans, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Footer from "@/components/Footer";
import AdsenseGate from "@/components/AdsenseGate";
import { PlanoUsuarioProvider } from "@/components/auth/PlanoUsuarioProvider";
import { SITE_URL } from "@/lib/seo";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${instrumentSerif.variable} ${workSans.variable} ${plexMono.variable}`}>
      <body suppressHydrationWarning>
        <PlanoUsuarioProvider>
          {children}
          <Footer />
          <Analytics />
          <SpeedInsights />
          <AdsenseGate />
        </PlanoUsuarioProvider>
      </body>
    </html>
  );
}
