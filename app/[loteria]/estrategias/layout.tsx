import Subnav from "@/components/Subnav";
import Masthead from "@/components/Masthead";
import { CodigoLoteria } from "@/lib/types";

export default async function EstrategiasLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ loteria: string }>;
}) {
  const { loteria } = await params;
  return (
    <>
      <Masthead loteriaAtiva={loteria as CodigoLoteria} />
      <main>{children}</main>
    </>
  );
}
