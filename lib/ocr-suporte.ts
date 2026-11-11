// Loterias com conferência por foto do bilhete (app/api/ocr/route.ts).
// Compartilhado com a tela (components/ConferidorClient.tsx) e com os textos
// do Premium (lib/ferramentas.ts). Desde 11/11/2026 vale para as 9: a faixa
// e o tamanho do jogo de cada uma ficam em lib/ocr-bilhete.ts (Super Sete
// lê um algarismo por coluna; na +Milionária os trevos são marcados à mão).
// Antes só Lotofácil e Mega-Sena tinham faixa conhecida pelo OCR.
import { CONFIG_OCR } from "./ocr-bilhete";

export const LOTERIAS_COM_OCR: ReadonlySet<string> = new Set(Object.keys(CONFIG_OCR));
