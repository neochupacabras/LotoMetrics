import { notFound } from "next/navigation";
import Masthead from "@/components/Masthead";
import { isCodigoLoteriaValido, LOTERIAS } from "@/lib/format";

// Sem isto, o segmento dinâmico [loteria] nunca é elegível para cache —
// nenhuma página sob /[loteria]/* (mesmo as que declaram `revalidate`)
// chega a usar ISR, porque o Next trata um segmento dinâmico sem
// generateStaticParams como sempre-renderizado-no-servidor. As 9 loterias
// são um conjunto pequeno e fixo, então vale sempre pré-listar todas.
export async function generateStaticParams() {
  return Object.keys(LOTERIAS).map((loteria) => ({ loteria }));
}

export default async function LoteriaLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ loteria: string }>;
}) {
  const { loteria } = await params;

  if (!isCodigoLoteriaValido(loteria)) {
    notFound();
  }

  return (
    <>
      <Masthead loteriaAtiva={loteria} />
      <main>{children}</main>
    </>
  );
}
