import type { Metadata } from "next";
import Footer from "@/components/Footer";
import "./globals.css";

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
    <html lang="pt-BR">
      <body suppressHydrationWarning>
        {children}
        <Footer />
      </body>
    </html>
  );
}
