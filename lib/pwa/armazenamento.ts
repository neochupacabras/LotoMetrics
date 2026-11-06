"use client";

import { useSyncExternalStore } from "react";

// localStorage como "store externo" do React (useSyncExternalStore): lê sem
// setState em efeito, não quebra a hidratação (no servidor devolve o
// valor padrão) e atualiza todos os componentes que leem a mesma chave
// quando ela é gravada aqui ou em outra aba.

const EVENTO = "la:armazenamento";

function inscrever(aoMudar: () => void) {
  window.addEventListener("storage", aoMudar);
  window.addEventListener(EVENTO, aoMudar);
  return () => {
    window.removeEventListener("storage", aoMudar);
    window.removeEventListener(EVENTO, aoMudar);
  };
}

export function lerLocal(chave: string): string | null {
  try {
    return localStorage.getItem(chave);
  } catch {
    return null;
  }
}

export function gravarLocal(chave: string, valor: string | null) {
  try {
    if (valor === null) localStorage.removeItem(chave);
    else localStorage.setItem(chave, valor);
  } catch {
    return;
  }
  window.dispatchEvent(new Event(EVENTO));
}

export function useLocal(chave: string): string | null {
  return useSyncExternalStore(
    inscrever,
    () => lerLocal(chave),
    () => null
  );
}

const nada = () => () => {};

// true só depois da hidratação — para componentes que dependem de APIs do
// navegador não piscarem um estado errado no HTML do servidor.
export function useNoCliente(): boolean {
  return useSyncExternalStore(nada, () => true, () => false);
}
