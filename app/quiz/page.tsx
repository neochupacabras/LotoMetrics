import type { Metadata } from "next";
import QuizClient from "@/components/QuizClient";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Verdade ou Mito? — Quiz de probabilidades de loteria",
  description:
    "10 afirmações sobre loteria e probabilidade. Você consegue separar os fatos matemáticos reais dos mitos populares?",
  alternates: { canonical: `${SITE_URL}/quiz` },
  openGraph: {
    title: "Verdade ou Mito? Quiz de probabilidades de loteria",
    description:
      "10 afirmações sobre loteria e probabilidade. Você consegue separar os fatos dos mitos?",
    url: `${SITE_URL}/quiz`,
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "website",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

export default function QuizPage() {
  return (
    <>
      <Masthead quizAtivo />
      <main className="container secao" style={{ maxWidth: 720 }}>
        <QuizClient />
      </main>
    </>
  );
}
