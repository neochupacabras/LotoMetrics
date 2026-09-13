// Loterias com faixa de dezenas conhecida pelo OCR do conferidor por foto
// (app/api/ocr/route.ts). Compartilhado com o client (components/
// ConferidorClient.tsx, components/ConferidorFoto.tsx) pra esconder a aba
// "Foto do bilhete" em vez de deixar o usuário fotografar um bilhete que
// seria lido com a faixa errada — antes, qualquer loteria fora de
// Lotofácil/Mega-Sena caía silenciosamente na faixa da Lotofácil (1-25),
// o que produzia dezenas erradas pra Quina, Lotomania, Dia de Sorte,
// +Milionária, Timemania e Dupla Sena (achado #1.7 do plano de
// implementação, 13/09/2026). Super Sete nunca teve essa aba — o acerto é
// por coluna, não por dezena — e continua fora por esse outro motivo.
export const LOTERIAS_COM_OCR = new Set(["lotofacil", "megasena"]);
