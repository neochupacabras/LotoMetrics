import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Footer from "@/components/Footer";
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

export const metadata: Metadata = {
  title: "LotoMetrics — Resultados e estatísticas de loteria",
  description:
    "Resultados oficiais e estatísticas de Lotofácil e Mega-Sena: frequência, atraso, ciclos e mais.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${plexSans.variable} ${plexMono.variable}`}>
      {/* suppressHydrationWarning aqui: algumas extensões de navegador (ad
          blockers, gerenciadores de senha, etc.) injetam atributos no
          <body> antes do React hidratar — ex.: bis_register,
          __processed_...__. Isso não tem relação com o app, é o cenário
          descrito na própria documentação do React para esse aviso. */}
      <body suppressHydrationWarning>
        {children}
        <Footer />

        {/* COMPONENTE ADICIONADA AQUI */}
        <Analytics />
      </body>
    </html>
  );
}
