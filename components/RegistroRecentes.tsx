"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ferramentaDaUrl } from "@/lib/ferramentas";
import { registrarUso } from "@/lib/ferramentas-recentes";

// Anota no localStorage a ferramenta aberta (/megasena/gerador…) para a
// lista "Usadas recentemente" da Central de ferramentas. Nada sai do
// aparelho; nenhuma renderização.
export default function RegistroRecentes() {
  const pathname = usePathname();
  useEffect(() => {
    const achada = pathname ? ferramentaDaUrl(pathname) : null;
    if (achada) registrarUso(achada.ferramenta.id, achada.loteria);
  }, [pathname]);
  return null;
}
