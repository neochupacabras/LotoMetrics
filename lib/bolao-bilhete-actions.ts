"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { BUCKET_BILHETES } from "@/lib/bolao-bilhete";

// Remove uma foto de bilhete do bolão (arquivo no storage + registro). Só o
// dono do bolão; o bilheteId é sempre cruzado com o bolaoId E com o dono.
export async function excluirBilheteAction(
  bolaoId: string,
  bilheteId: string
): Promise<{ ok: boolean; erro?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, erro: "Não autenticado." };

  const admin = createAdminClient();
  const { data: bolao } = await admin
    .from("boloes")
    .select("id")
    .eq("id", bolaoId)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!bolao) return { ok: false, erro: "Bolão não encontrado." };

  const { data: foto } = await admin
    .from("bolao_bilhetes")
    .select("id, storage_path")
    .eq("id", bilheteId)
    .eq("bolao_id", bolao.id)
    .maybeSingle();
  if (!foto) return { ok: false, erro: "Foto não encontrada." };

  const { error: erroStorage } = await admin.storage.from(BUCKET_BILHETES).remove([foto.storage_path]);
  if (erroStorage) {
    console.error("excluirBilheteAction storage:", erroStorage.message);
    return { ok: false, erro: "Não foi possível remover a foto. Tente novamente." };
  }
  const { error } = await admin.from("bolao_bilhetes").delete().eq("id", foto.id);
  if (error) return { ok: false, erro: "Não foi possível remover a foto. Tente novamente." };

  revalidatePath(`/conta/boloes/${bolaoId}`);
  return { ok: true };
}
