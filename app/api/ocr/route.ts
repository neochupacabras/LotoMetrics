import { NextResponse, after } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { calcularIsPremium } from "@/lib/plano";
import { logToolEvent, logError } from "@/lib/telemetry";
import { LOTERIAS_COM_OCR } from "@/lib/ocr-suporte";

export const runtime = "nodejs";
export const maxDuration = 30;

// Tarefa 2.5 do plano de implementação (21/09/2026): trocado de 50/dia
// para 100/mês -- o limite diário resetava rápido demais para quem tenta
// conferir vários bilhetes de uma vez (ex.: bolão com vários jogos).
const LIMITE_MENSAL = 100;

const LIMITES_LOTERIA: Record<string, { min: number; max: number; qtd: number }> = {
  lotofacil: { min: 1, max: 25, qtd: 15 },
  megasena:  { min: 1, max: 60, qtd: 6  },
};

function extrairDezenas(
  texto: string,
  loteria: string
): { dezenas: number[]; confianca: "alta" | "media" | "baixa" } {
  // A UI (ConferidorClient) já esconde a aba de foto pra loterias fora de
  // LOTERIAS_COM_OCR — este limite é defesa em profundidade, não o
  // caminho normal.
  const limites = LIMITES_LOTERIA[loteria];
  if (!limites) {
    throw new Error(`OCR sem faixa conhecida para a loteria "${loteria}"`);
  }
  const { min, max, qtd } = limites;
  const numeros = (texto.match(/\b\d{1,2}\b/g) ?? [])
    .map(Number)
    .filter(n => n >= min && n <= max);
  const unicos = [...new Set(numeros)];
  const confianca =
    unicos.length === qtd ? "alta" :
    unicos.length >= qtd - 2 ? "media" : "baixa";
  return { dezenas: unicos.slice(0, qtd).sort((a, b) => a - b), confianca };
}

// ── Rate limiting via coluna ocr_usage no profile ─────────────────────────────
// Usa o service role: ocr_usage não é mais gravável pelo client autenticado
// (ver migration 20260914000000_restrict_profiles_update.sql) — só o
// próprio servidor pode incrementar o contador. userId sempre vem de
// supabase.auth.getUser() da sessão, nunca do corpo da requisição.
async function verificarEIncrementarLimite(
  userId: string
): Promise<{ permitido: boolean; restantes: number }> {
  const admin = createAdminClient();
  const mesAtual = new Date().toISOString().slice(0, 7); // "YYYY-MM" -- o
  // nome do campo (`data`) e o formato mudaram de dia pra mês; contadores
  // antigos no formato "YYYY-MM-DD" simplesmente não batem mais e resetam
  // pra 0 no primeiro uso depois do deploy -- sem migration necessária.

  const { data: profile } = await admin
    .from("profiles")
    .select("ocr_usage")
    .eq("id", userId)
    .single();

  const uso = profile?.ocr_usage as { data: string; count: number } | null;
  const usageMes = uso?.data === mesAtual ? uso.count : 0;

  if (usageMes >= LIMITE_MENSAL) {
    return { permitido: false, restantes: 0 };
  }

  // Incrementar
  await admin
    .from("profiles")
    .update({ ocr_usage: { data: mesAtual, count: usageMes + 1 } })
    .eq("id", userId);

  return { permitido: true, restantes: LIMITE_MENSAL - usageMes - 1 };
}

// Segundos até 00h do dia 1º do mês seguinte -- usado no header
// Retry-After quando o limite mensal é atingido.
function segundosAteProximoMes(): number {
  const agora = new Date();
  const proximoMes = new Date(Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth() + 1, 1));
  return Math.max(0, Math.round((proximoMes.getTime() - agora.getTime()) / 1000));
}

export async function POST(request: Request) {
  const inicio = Date.now();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { erro: "Faça login para usar o conferidor por foto." },
      { status: 401 }
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, plan_expires_at")
    .eq("id", user.id)
    .single();

  const isPremium = calcularIsPremium(profile);

  if (!isPremium) {
    after(() =>
      logToolEvent({ eventName: "paywall_view", tool: "conferidor-ocr", userId: user.id, plan: "free" })
    );
    return NextResponse.json(
      { erro: "O conferidor por foto é um recurso Premium." },
      { status: 403 }
    );
  }

  // ── Rate limiting ────────────────────────────────────────────────────────────
  const { permitido, restantes } = await verificarEIncrementarLimite(user.id);

  if (!permitido) {
    return NextResponse.json(
      {
        erro: `Limite mensal de ${LIMITE_MENSAL} leituras atingido. Renova no início do próximo mês.`,
        limiteMensal: LIMITE_MENSAL,
        restantes: 0,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(LIMITE_MENSAL),
          "X-RateLimit-Remaining": "0",
          "Retry-After": String(segundosAteProximoMes()),
        },
      }
    );
  }

  // ── Processar imagem ─────────────────────────────────────────────────────────
  let imageBase64: string;
  let loteria: string;

  try {
    const formData = await request.formData();
    const arquivo = formData.get("imagem") as File | null;
    loteria = (formData.get("loteria") as string) ?? "lotofacil";

    if (!LOTERIAS_COM_OCR.has(loteria)) {
      return NextResponse.json(
        { erro: "O conferidor por foto ainda só está disponível para Lotofácil e Mega-Sena." },
        { status: 400 }
      );
    }

    if (!arquivo) {
      return NextResponse.json({ erro: "Nenhuma imagem enviada." }, { status: 400 });
    }
    if (!arquivo.type.startsWith("image/")) {
      return NextResponse.json({ erro: "O arquivo precisa ser uma imagem." }, { status: 400 });
    }
    if (arquivo.size > 10 * 1024 * 1024) {
      return NextResponse.json({ erro: "Imagem muito grande. Máximo 10MB." }, { status: 400 });
    }

    const buffer = await arquivo.arrayBuffer();
    imageBase64 = Buffer.from(buffer).toString("base64");
  } catch {
    return NextResponse.json({ erro: "Erro ao processar a imagem." }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ erro: "Serviço de OCR não configurado." }, { status: 503 });
  }

  try {
    const visionRes = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [{
            image: { content: imageBase64 },
            features: [{ type: "DOCUMENT_TEXT_DETECTION", maxResults: 1 }],
            imageContext: { languageHints: ["pt"] },
          }],
        }),
      }
    );

    if (!visionRes.ok) {
      const detalhe = await visionRes.text();
      console.error("Vision API error:", detalhe);
      after(() => {
        logToolEvent({ eventName: "tool_failed", tool: "conferidor-ocr", userId: user.id, plan: "premium" });
        logError({ source: "ocr", message: `Vision API error: ${detalhe.slice(0, 300)}`, userId: user.id });
      });
      return NextResponse.json(
        { erro: "Não foi possível processar a imagem. Tente com melhor iluminação." },
        { status: 502 }
      );
    }

    const visionData = await visionRes.json();
    const textoCompleto = visionData.responses?.[0]?.fullTextAnnotation?.text ?? "";

    if (!textoCompleto) {
      return NextResponse.json({
        dezenas: [],
        confianca: "baixa",
        restantes,
        aviso: "Não foi possível ler texto na imagem. Tente com melhor iluminação e enquadramento.",
      });
    }

    const { dezenas, confianca } = extrairDezenas(textoCompleto, loteria);

    after(() =>
      logToolEvent({
        eventName: "tool_completed",
        tool: "conferidor-ocr",
        lottery: loteria,
        userId: user.id,
        plan: "premium",
        success: true,
        durationMs: Date.now() - inicio,
        metadata: { confianca, qtdDezenasLidas: dezenas.length },
      })
    );

    return NextResponse.json(
      {
        dezenas,
        confianca,
        restantes,
        aviso:
          confianca === "baixa"
            ? "Poucas dezenas foram lidas com segurança. Verifique e corrija manualmente."
            : confianca === "media"
            ? "Algumas dezenas podem estar faltando. Confirme antes de conferir."
            : null,
      },
      {
        headers: {
          "X-RateLimit-Limit": String(LIMITE_MENSAL),
          "X-RateLimit-Remaining": String(restantes),
        },
      }
    );
  } catch (err) {
    console.error("OCR error:", err);
    after(() => {
      logToolEvent({ eventName: "tool_failed", tool: "conferidor-ocr", userId: user.id, plan: "premium" });
      logError({ source: "ocr", message: (err as Error).message, userId: user.id });
    });
    return NextResponse.json({ erro: "Erro ao processar a imagem. Tente novamente." }, { status: 500 });
  }
}
