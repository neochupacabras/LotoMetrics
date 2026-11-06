import type { Metadata } from "next";
import { Instrument_Serif, Work_Sans, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Footer from "@/components/Footer";
import AdsenseGate from "@/components/AdsenseGate";
import VisitaLandingBeacon from "@/components/VisitaLandingBeacon";
import { PlanoUsuarioProvider } from "@/components/auth/PlanoUsuarioProvider";
import { SemAnunciosProvider } from "@/components/SemAnunciosProvider";
import { PwaProvider } from "@/components/pwa/PwaProvider";
import BottomNav from "@/components/pwa/BottomNav";
import ConviteInstalacao from "@/components/pwa/ConviteInstalacao";
import AvisosApp from "@/components/pwa/AvisosApp";
import { SITE_URL, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import "./globals.css";
// Depois do globals.css: estilos do app mobile (barra inferior, cabeçalho
// compacto, folha "Mais", convites). Quase tudo dentro de
// @media (max-width: 640px) — o desktop não muda.
import "./pwa.css";

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
  // Cor da barra de status/título (Android e app instalado) = fundo do
  // cabeçalho, para a barra "sumir" no topo como num app nativo.
  themeColor: "#faf9f4",
};

// Telas de abertura do app instalado no iPhone/iPad (o iOS não usa o
// manifest para isso). Geradas por scripts/gerar-icones-pwa.mjs.
const SPLASH_IOS: [number, number, number][] = [
  [440, 956, 3], [402, 874, 3], [430, 932, 3], [393, 852, 3], [390, 844, 3],
  [428, 926, 3], [375, 812, 3], [414, 896, 3], [414, 896, 2], [375, 667, 2],
  [320, 568, 2], [834, 1194, 2], [1024, 1366, 2],
];

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "LotoAnalítica — Resultados e estatísticas de loteria",
  description:
    "Resultados oficiais e estatísticas de Lotofácil e Mega-Sena: frequência, atraso, ciclos e mais.",
  robots: { index: true, follow: true },
  verification: {
    google: "WLl3OBG-d1NTYCfOVMGnAFQnsn73NjfYwpkingyJm2E",
  },
  applicationName: "LotoAnalítica",
  // iOS: abre em tela cheia quando adicionado à Tela de Início.
  appleWebApp: {
    capable: true,
    title: "LotoAnalítica",
    statusBarStyle: "default",
    startupImage: SPLASH_IOS.map(([w, h, dpr]) => ({
      url: `/icons/splash-${w * dpr}x${h * dpr}.png`,
      media: `(device-width: ${w}px) and (device-height: ${h}px) and (-webkit-device-pixel-ratio: ${dpr}) and (orientation: portrait)`,
    })),
  },
  formatDetection: { telephone: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${instrumentSerif.variable} ${workSans.variable} ${plexMono.variable}`}>
      <body suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
        />
        <PlanoUsuarioProvider>
          <PwaProvider>
            <SemAnunciosProvider>
              <VisitaLandingBeacon />
              {children}
              <Footer />
              {/* App mobile (PWA): escondidos no desktop via app/pwa.css */}
              <ConviteInstalacao />
              <BottomNav />
              <AvisosApp />
              <Analytics />
              <SpeedInsights />
              <AdsenseGate />
            </SemAnunciosProvider>
          </PwaProvider>
        </PlanoUsuarioProvider>
      </body>
    </html>
  );
}
