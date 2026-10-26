// Leitura de texto por OCR (Google Cloud Vision). Usado pelo comprovante do
// bolão; o conferidor por foto (app/api/ocr/route.ts) tem a sua própria
// cópia e não foi tocado de propósito.

export type LeituraOcr =
  | { ok: true; texto: string }
  | { ok: false; status: number; erro: string };

export async function lerTextoDaImagem(base64: string): Promise<LeituraOcr> {
  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
  if (!apiKey) return { ok: false, status: 503, erro: "Serviço de leitura de bilhete não configurado." };

  try {
    const res = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64 },
            features: [{ type: "DOCUMENT_TEXT_DETECTION", maxResults: 1 }],
            imageContext: { languageHints: ["pt"] },
          },
        ],
      }),
    });
    if (!res.ok) {
      const detalhe = await res.text();
      console.error("Vision API error:", detalhe.slice(0, 300));
      return { ok: false, status: 502, erro: "Não foi possível ler a imagem. Tente com melhor iluminação." };
    }
    const data = await res.json();
    return { ok: true, texto: data.responses?.[0]?.fullTextAnnotation?.text ?? "" };
  } catch (err) {
    console.error("OCR error:", (err as Error).message);
    return { ok: false, status: 500, erro: "Erro ao ler a imagem. Tente novamente." };
  }
}
