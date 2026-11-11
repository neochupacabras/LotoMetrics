"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ferramentaPorId } from "@/lib/ferramentas";

// Favoritar/desfavoritar uma ferramenta (Central de ferramentas). Lê a
// lista atual, aplica a mudança e grava — com o client da sessão, na
// coluna liberada pela migration 20261111000100_favoritos_membros.sql.
// Só aceita ids do registro (lib/ferramentas.ts); o banco também confere
// o formato com um CHECK.
export async function alternarFavoritoAction(
  id: string,
  favoritar: boolean
): Promise<{ ok: true; favoritos: string[] } | { ok: false; erro: string }> {
  if (!ferramentaPorId(id)) return { ok: false, erro: "Ferramenta desconhecida." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, erro: "Sua sessão expirou. Entre de novo." };

  const { data: perfil, error: erroLeitura } = await supabase
    .from("profiles")
    .select("ferramentas_favoritas")
    .eq("id", user.id)
    .single();
  if (erroLeitura) return { ok: false, erro: "Favoritos indisponíveis no momento." };

  const atuais = ((perfil?.ferramentas_favoritas as string[] | null) ?? []).filter((x) => ferramentaPorId(x));
  const favoritos = favoritar ? [...new Set([...atuais, id])] : atuais.filter((x) => x !== id);

  const { error } = await supabase.from("profiles").update({ ferramentas_favoritas: favoritos }).eq("id", user.id);
  if (error) return { ok: false, erro: "Não foi possível salvar agora. Tente de novo." };

  revalidatePath("/conta/ferramentas");
  revalidatePath("/conta");
  return { ok: true, favoritos };
}
