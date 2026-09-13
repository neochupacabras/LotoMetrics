// Regra pura "esse perfil é premium?" — sem nenhum import de servidor
// (nada de next/headers), pra poder ser usada tanto em Server Components
// (via lib/plano.ts, que reexporta) quanto em Client Components (ex.:
// components/auth/PlanoUsuarioProvider.tsx). Extraído de lib/plano.ts na
// Fase 1 do plano de implementação (tarefa 1.6): o provider do cliente
// checava só `plan === "premium"`, ignorando plan_expires_at — alguém com
// um Pix vencido continuava sem anúncios e com os botões de Premium
// habilitados no client, mesmo já sendo `free` no servidor.

export interface PerfilComPlano {
  plan?: string | null;
  plan_expires_at?: string | null;
}

export function calcularIsPremium(perfil: PerfilComPlano | null | undefined): boolean {
  if (perfil?.plan !== "premium") return false;
  return !perfil.plan_expires_at || new Date(perfil.plan_expires_at) > new Date();
}
