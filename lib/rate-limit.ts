import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";

// SEC-006 (auditoria 27/10/2026): rate limit genérico — reaproveita o RPC
// consumir_rate_limit (migration 20261028000000), executado pelo service
// role. Fail-open: se o RPC falhar, deixa passar (melhor que travar gente
// legítima) e registra no console. Defesa em profundidade, não substitui
// os limites do Supabase Auth.
//
// Extraído de lib/auth-actions.ts para ser reutilizado pelas rotas de push
// (/api/push/*) sem duplicar a lógica.
export async function consumirLimite(chave: string, max: number, janelaSegundos: number): Promise<boolean> {
  try {
    const { data, error } = await createAdminClient().rpc("consumir_rate_limit", {
      p_chave: chave,
      p_max: max,
      p_janela_segundos: janelaSegundos,
    });
    if (error) {
      console.error("rate limit indisponível:", error.message);
      return true;
    }
    return data !== false;
  } catch {
    return true;
  }
}

export function hashCurto(valor: string): string {
  return createHash("sha256").update(valor).digest("hex").slice(0, 32);
}

export async function dentroDoLimitePorIp(prefixo: string, max: number, janelaSegundos: number): Promise<boolean> {
  let ip = "desconhecido";
  try {
    const forwarded = (await headers()).get("x-forwarded-for") ?? "";
    ip = forwarded.split(",")[0]?.trim() || "desconhecido";
  } catch {
    // fora de um request (ex.: script) — usa a chave genérica
  }
  return consumirLimite(`${prefixo}:${hashCurto(ip)}`, max, janelaSegundos);
}
