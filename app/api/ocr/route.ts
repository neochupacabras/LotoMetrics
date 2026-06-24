import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 30;

// Limites por loteria
const LIMITES: Record<string, { min: number; max: number; qtd: number }> = {
  lotofacil: { min: 1,  max: 25, qtd: 15 },
  megasena:  { min: 1,  max: 60, qtd: 6  },
};

// Extrai números válidos do texto retornado pelo Vision
function extrairDezenas(
  texto: string,
  loteria: string
): { dezenas: number[]; confianca: "alta" | "media" | "baixa" } {
  const { min, max, qtd } = LIMITES[loteria] ?? LIMITES.lotofacil;

  // Remove tudo que não é número ou separador
  // Aceita formatos: "01 02 03", "01-02-03", "01/02/03", "01,02,03"
  const numeros = (texto.match(/\b\d{1,2}\b/g) ?? [])
    .map(Number)
    .filter(n => n >= min && n <= max);

  // Remover duplicatas mantendo a ordem
  const unicos = [...new Set(numeros)];

  // Confiança baseada em quantos números válidos foram encontrados
  const confianca =
    unicos.length === qtd ? "alta" :
    unicos.length >= qtd - 2 ? "media" : "baixa";

  // Se encontrou mais que o esperado, pega os primeiros (ordem do bilhete)
  // Se encontrou menos, retorna o que tem para o usuário corrigir
  return {
    dezenas: unicos.slice(0, qtd).sort((a, b) => a - b),
    confianca,
  };
}

export async function POST(request: Request) {
  // Verificar autenticação e plano premium
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

  const isPremium =
    profile?.plan === "premium" &&
    (!profile.plan_expires_at || new Date(profile.plan_expires_at) > new Date());

  if (!isPremium) {
    return NextResponse.json(
      { erro: "O conferidor por foto é um recurso Premium." },
      { status: 403 }
    );
  }

  // Ler a imagem e a loteria do form data
  let imageBase64: string;
  let mimeType: string;
  let loteria: string;

  try {
    const formData = await request.formData();
    const arquivo = formData.get("imagem") as File | null;
    loteria = (formData.get("loteria") as string) ?? "lotofacil";

    if (!arquivo) {
      return NextResponse.json({ erro: "Nenhuma imagem enviada." }, { status: 400 });
    }

    // Validar tipo e tamanho (máx 10MB)
    if (!arquivo.type.startsWith("image/")) {
      return NextResponse.json({ erro: "O arquivo precisa ser uma imagem." }, { status: 400 });
    }
    if (arquivo.size > 10 * 1024 * 1024) {
      return NextResponse.json({ erro: "Imagem muito grande. Máximo 10MB." }, { status: 400 });
    }

    const buffer = await arquivo.arrayBuffer();
    imageBase64 = Buffer.from(buffer).toString("base64");
    mimeType = arquivo.type;
  } catch {
    return NextResponse.json({ erro: "Erro ao processar a imagem." }, { status: 400 });
  }

  // Chamar Google Cloud Vision API
  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { erro: "Serviço de OCR não configurado." },
      { status: 503 }
    );
  }

  try {
    const visionRes = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: imageBase64,
              },
              features: [
                {
                  type: "DOCUMENT_TEXT_DETECTION", // Melhor para textos impressos
                  maxResults: 1,
                },
              ],
              imageContext: {
                languageHints: ["pt"], // Português para melhor precisão
              },
            },
          ],
        }),
      }
    );

    if (!visionRes.ok) {
      const err = await visionRes.text();
      console.error("Vision API error:", err);
      return NextResponse.json(
        { erro: "Não foi possível processar a imagem. Tente com melhor iluminação." },
        { status: 502 }
      );
    }

    const visionData = await visionRes.json();
    const textoCompleto =
      visionData.responses?.[0]?.fullTextAnnotation?.text ?? "";

    if (!textoCompleto) {
      return NextResponse.json({
        dezenas: [],
        confianca: "baixa",
        textoDetectado: "",
        aviso: "Não foi possível ler texto na imagem. Tente com melhor iluminação e enquadramento.",
      });
    }

    const { dezenas, confianca } = extrairDezenas(textoCompleto, loteria);

    return NextResponse.json({
      dezenas,
      confianca,
      textoDetectado: textoCompleto.slice(0, 500), // debug limitado
      aviso:
        confianca === "baixa"
          ? "Poucas dezenas foram lidas com segurança. Verifique e corrija manualmente."
          : confianca === "media"
          ? "Algumas dezenas podem estar faltando. Confirme antes de conferir."
          : null,
    });
  } catch (err) {
    console.error("OCR error:", err);
    return NextResponse.json(
      { erro: "Erro ao processar a imagem. Tente novamente." },
      { status: 500 }
    );
  }
}
