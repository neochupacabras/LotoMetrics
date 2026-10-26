"use client";

import { createContext, useContext, useEffect, useState } from "react";

// Páginas específicas (hoje: a página pública de um bolão Pro) podem pedir
// "sem anúncios" mesmo pra visitante anônimo. O AdSense é um script global
// do layout (components/AdsenseGate.tsx), então a página sinaliza por
// contexto e o gate decide. A ordem é segura: o gate só injeta o script
// depois que o plano do visitante carrega (um fetch assíncrono), e o
// efeito de <SemAnuncios /> roda já na hidratação — bem antes disso.

interface Ctx {
  semAnuncios: boolean;
  setSemAnuncios: (v: boolean) => void;
}

const SemAnunciosContext = createContext<Ctx>({ semAnuncios: false, setSemAnuncios: () => {} });

export function SemAnunciosProvider({ children }: { children: React.ReactNode }) {
  const [semAnuncios, setSemAnuncios] = useState(false);
  return (
    <SemAnunciosContext.Provider value={{ semAnuncios, setSemAnuncios }}>
      {children}
    </SemAnunciosContext.Provider>
  );
}

export function useSemAnuncios(): boolean {
  return useContext(SemAnunciosContext).semAnuncios;
}

// Renderize numa página que deve ficar sem anúncios. Não renderiza nada.
export default function SemAnuncios({ ativo }: { ativo: boolean }) {
  const { setSemAnuncios } = useContext(SemAnunciosContext);
  useEffect(() => {
    if (!ativo) return;
    setSemAnuncios(true);
    return () => setSemAnuncios(false);
  }, [ativo, setSemAnuncios]);
  return null;
}
