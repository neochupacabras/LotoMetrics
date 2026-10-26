import { createAdminClient } from "@/lib/supabase/server";
import { BUCKET_BILHETES, unirEncontrados } from "@/lib/bolao-bilhete";

// Fotos de bilhete de um bolão, com URL assinada de 1 hora (o bucket é
// privado). Server-only: quem chama já decidiu que pode ver (dono no
// editor; qualquer portador do link na página pública).

export interface FotoBilhete {
  id: string;
  url: string | null;
  jogosEncontrados: number[];
  criadoEm: string;
}

export interface ComprovanteBolao {
  fotos: FotoBilhete[];
  // Quantos jogos do bolão aparecem em PELO MENOS uma das fotos.
  jogosVerificados: number;
}

export async function carregarComprovante(bolaoId: string): Promise<ComprovanteBolao> {
  const admin = createAdminClient();
  const { data: linhas } = await admin
    .from("bolao_bilhetes")
    .select("id, storage_path, jogos_encontrados, criado_em")
    .eq("bolao_id", bolaoId)
    .order("criado_em");

  const lista = linhas ?? [];
  if (lista.length === 0) return { fotos: [], jogosVerificados: 0 };

  const { data: assinadas } = await admin.storage
    .from(BUCKET_BILHETES)
    .createSignedUrls(
      lista.map((l) => l.storage_path),
      3600
    );
  const urlPorCaminho = new Map((assinadas ?? []).map((a) => [a.path, a.signedUrl]));

  const fotos = lista.map((l) => ({
    id: l.id,
    url: urlPorCaminho.get(l.storage_path) ?? null,
    jogosEncontrados: (l.jogos_encontrados as number[]) ?? [],
    criadoEm: l.criado_em,
  }));

  return {
    fotos,
    jogosVerificados: unirEncontrados(fotos.map((f) => f.jogosEncontrados)).length,
  };
}
