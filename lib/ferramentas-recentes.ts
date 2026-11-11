"use client";

import { gravarLocal, lerLocal, useLocal } from "@/lib/pwa/armazenamento";
import type { CodigoLoteria } from "@/lib/types";

// Ferramentas usadas recentemente — POR APARELHO (localStorage), decisão B
// do redesign: sem tabela nova e sem mandar navegação ao servidor. Os
// favoritos, que precisam valer em todo lugar, ficam em profiles.

const CHAVE = "la:ferramentas-recentes";
const MAXIMO = 8;

export interface UsoRecente {
  id: string; // id em lib/ferramentas.ts
  loteria: CodigoLoteria;
  quando: number; // epoch ms
}

function parse(bruto: string | null): UsoRecente[] {
  if (!bruto) return [];
  try {
    const dados = JSON.parse(bruto);
    return Array.isArray(dados)
      ? dados.filter((d): d is UsoRecente => typeof d?.id === "string" && typeof d?.loteria === "string" && typeof d?.quando === "number")
      : [];
  } catch {
    return [];
  }
}

export function registrarUso(id: string, loteria: CodigoLoteria) {
  const atuais = parse(lerLocal(CHAVE)).filter((u) => !(u.id === id && u.loteria === loteria));
  const nova = [{ id, loteria, quando: Date.now() }, ...atuais].slice(0, MAXIMO);
  gravarLocal(CHAVE, JSON.stringify(nova));
}

export function useRecentes(): UsoRecente[] {
  return parse(useLocal(CHAVE));
}
