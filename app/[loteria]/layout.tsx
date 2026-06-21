import { notFound } from "next/navigation";
import Masthead from "@/components/Masthead";
import { isCodigoLoteriaValido } from "@/lib/format";

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
