import Subnav from "@/components/Subnav";
import { CodigoLoteria } from "@/lib/types";

export default async function FechamentosLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ loteria: string }>;
}) {
  const { loteria } = await params;
  return (
    <>
      <Subnav codigoLoteria={loteria as CodigoLoteria} ativa="fechamentos" />
      {children}
    </>
  );
}
