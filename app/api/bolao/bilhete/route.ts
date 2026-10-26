import { NextResponse, after } from "next/server";
import { randomUUID } from "node:crypto";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { calcularIsPremium } from "@/lib/plano-premium";
import { bolaoEhPro } from "@/lib/bolao-limites";
import {
  BUCKET_BILHETES,
  EXTENSAO_POR_TIPO,
  LIMITE_FOTOS_POR_BOLAO,
  TAMANHO_MAXIMO_FOTO_BYTES,
  detectarTipoImagem,
  verificarJogosNoTexto,
} from "@/lib/bolao-bilhete";
import { lerTextoDaImagem } from "@/lib/ocr-vision";
import { logToolEvent } from "@/lib/telemetry";

export const runtime = "nodejs";
export const maxDuration = 30;

// Foto do bilhete como comprovante do bolão (Fase 4, recurso do Bolão Pro).
// Fluxo: confere sessão + dono + plano Pro -> valida a imagem pelo conteúdo
// -> rate limit -> OCR -> procura os jogos do bolão no texto -> guarda a foto
// no bucket PRIVADO e os metadados em bolao_bilhetes. Tudo com service role
// depois de checar dono e plano; o bolaoId nunca é confiado sem conferir
// owner_id contra a sessão.
function erro(mensagem: string, status: number) {
  return NextResponse.json({ ok: false, erro: mensagem }, { status });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return erro("Faça login para enviar a foto do bilhete.", 401);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return erro("Não foi possível ler o envio.", 400);
  }
  const bolaoId = formData.get("bolaoId");
  const arquivo = formData.get("imagem");
  if (typeof bolaoId !== "string" || !(arquivo instanceof File)) {
    return erro("Envie a foto do bilhete.", 400);
  }
  if (arquivo.size === 0) return erro("A imagem está vazia.", 400);
  if (arquivo.size > TAMANHO_MAXIMO_FOTO_BYTES) {
    return erro("Imagem muito grande (máximo 4 MB). Tire a foto de novo ou reduza o tamanho.", 413);
  }

  const admin = createAdminClient();
  const { data: bolao } = await admin
    .from("boloes")
    .select("id, loteria, pro_ate, owner_id")
    .eq("id", bolaoId)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!bolao) return erro("Bolão não encontrado.", 404);

  const { data: perfil } = await supabase
    .from("profiles")
    .select("plan, plan_expires_at")
    .eq("id", user.id)
    .single();
  if (!bolaoEhPro(bolao, calcularIsPremium(perfil))) {
    return erro("A foto do bilhete como comprovante é um recurso do Bolão Pro.", 403);
  }

  const { count: fotosExistentes } = await admin
    .from("bolao_bilhetes")
    .select("id", { count: "exact", head: true })
    .eq("bolao_id", bolao.id);
  if ((fotosExistentes ?? 0) >= LIMITE_FOTOS_POR_BOLAO) {
    return erro(`Limite de ${LIMITE_FOTOS_POR_BOLAO} fotos por bolão. Remova uma para enviar outra.`, 400);
  }

  const bytes = new Uint8Array(await arquivo.arrayBuffer());
  const tipo = detectarTipoImagem(bytes);
  if (!tipo) return erro("Formato não suportado. Envie uma foto JPG, PNG ou WebP.", 400);

  // 20 fotos por dia por usuário (cada leitura custa uma chamada ao Vision).
  const { data: permitido, error: erroRl } = await admin.rpc("consumir_rate_limit", {
    p_chave: `bolao-bilhete:user:${user.id}`,
    p_max: 20,
    p_janela_segundos: 86400,
  });
  if (erroRl) console.error("rate limit indisponível:", erroRl.message);
  if (permitido === false) return erro("Limite diário de fotos atingido. Tente amanhã.", 429);

  const leitura = await lerTextoDaImagem(Buffer.from(bytes).toString("base64"));
  if (!leitura.ok) return erro(leitura.erro, leitura.status);

  const { data: jogosRows } = await admin
    .from("bolao_jogos")
    .select("dezenas")
    .eq("bolao_id", bolao.id)
    .order("ordem");
  const jogos = (jogosRows ?? []).map((j) => j.dezenas as number[]);
  const verificacao = verificarJogosNoTexto(leitura.texto, jogos);

  const caminho = `${bolao.id}/${randomUUID()}.${EXTENSAO_POR_TIPO[tipo]}`;
  const { error: erroUpload } = await admin.storage
    .from(BUCKET_BILHETES)
    .upload(caminho, bytes, { contentType: tipo, upsert: false });
  if (erroUpload) {
    console.error("upload do bilhete:", erroUpload.message);
    return erro("Não foi possível guardar a foto. Tente novamente.", 500);
  }

  const { error: erroInsert } = await admin.from("bolao_bilhetes").insert({
    bolao_id: bolao.id,
    storage_path: caminho,
    jogos_encontrados: verificacao.encontrados,
    numeros_lidos: verificacao.numerosLidos,
  });
  if (erroInsert) {
    console.error("registro do bilhete:", erroInsert.message);
    await admin.storage.from(BUCKET_BILHETES).remove([caminho]);
    return erro("Não foi possível registrar a foto. Tente novamente.", 500);
  }

  after(() =>
    logToolEvent({
      eventName: "tool_completed",
      tool: "bolao_bilhete",
      lottery: bolao.loteria,
      userId: user.id,
      success: true,
      metadata: { encontrados: verificacao.encontrados.length, total: jogos.length },
    })
  );

  return NextResponse.json({
    ok: true,
    encontrados: verificacao.encontrados.length,
    total: jogos.length,
    numerosLidos: verificacao.numerosLidos,
    aviso:
      verificacao.numerosLidos === 0
        ? "Não consegui ler números na foto. Ela foi guardada como comprovante visual; tente uma foto mais nítida para a conferência automática."
        : verificacao.encontrados.length === 0
          ? "Nenhum jogo do bolão foi encontrado nesta foto. Ela foi guardada, mas confira se é o bilhete certo."
          : null,
  });
}
