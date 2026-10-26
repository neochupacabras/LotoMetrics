// Foto do bilhete como comprovante do bolão — lógica PURA (sem banco, sem
// rede) pra poder ser testada com textos de OCR de exemplo.

export const BUCKET_BILHETES = "bolao-bilhetes";
export const LIMITE_FOTOS_POR_BOLAO = 10;
// A Vercel limita o corpo da requisição a 4,5 MB; a UI reduz a foto antes de
// enviar (lado maior 1600px, JPEG), então 4 MB sobra com folga.
export const TAMANHO_MAXIMO_FOTO_BYTES = 4 * 1024 * 1024;

export type TipoImagem = "image/jpeg" | "image/png" | "image/webp";

// Confere o conteúdo (magic bytes), nunca só o Content-Type informado pelo
// cliente — o arquivo vai pro storage e pro Google Vision.
export function detectarTipoImagem(bytes: Uint8Array): TipoImagem | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

export const EXTENSAO_POR_TIPO: Record<TipoImagem, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export interface VerificacaoBilhete {
  // Índices (0-based, na ordem de bolao_jogos) dos jogos achados no texto.
  encontrados: number[];
  numerosLidos: number;
}

// Procura cada jogo do bolão no texto lido do bilhete. Os números do
// bilhete saem na ordem de leitura (o OCR pode quebrar linhas onde quiser),
// então a busca é por JANELA na sequência inteira de números: um jogo de k
// dezenas está no bilhete se alguma janela de k números consecutivos tem
// exatamente as mesmas dezenas, em qualquer ordem. A comparação é estrita
// de propósito — um comprovante que "quase" confere não comprova nada; o
// organizador vê quantos jogos conferiram e envia outra foto se faltar.
export function verificarJogosNoTexto(texto: string, jogos: number[][]): VerificacaoBilhete {
  const numeros = (texto.match(/\b\d{1,2}\b/g) ?? []).map(Number);
  const encontrados: number[] = [];

  jogos.forEach((jogo, indice) => {
    const k = jogo.length;
    if (k === 0 || numeros.length < k) return;
    const alvo = [...jogo].sort((a, b) => a - b);
    for (let i = 0; i + k <= numeros.length; i++) {
      const janela = numeros.slice(i, i + k).sort((a, b) => a - b);
      if (janela.every((n, pos) => n === alvo[pos])) {
        encontrados.push(indice);
        return;
      }
    }
  });

  return { encontrados, numerosLidos: numeros.length };
}

// Une os jogos encontrados em todas as fotos do bolão.
export function unirEncontrados(porFoto: number[][]): number[] {
  return [...new Set(porFoto.flat())].sort((a, b) => a - b);
}
