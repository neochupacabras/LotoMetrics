// Textos de compartilhamento do bolão (WhatsApp e card OG) — puros, pra
// testar sem rede. O resultado é sempre BRUTO (antes do imposto de renda) e
// só cita valor quando existe um valor firme (nada de prêmio "indeterminado"
// ou acumulado vira número).

export interface ResumoResultadoBolao {
  concurso: number;
  melhorAcerto: number;
  premiados: number;
  totalJogos: number;
  premioTotalCents: number;
  porCotaCents: number;
  indeterminado: boolean;
  acumulado: boolean;
}

export function formatarMoedaCents(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Linha de destaque do resultado, usada no card e na mensagem.
export function descreverResultado(r: ResumoResultadoBolao): string {
  const acertos = `${r.melhorAcerto} acerto${r.melhorAcerto !== 1 ? "s" : ""}`;
  if (r.premiados === 0) return `Melhor jogo: ${acertos} — sem prêmio desta vez`;
  if (r.porCotaCents > 0) {
    return `Melhor jogo: ${acertos} — ${formatarMoedaCents(r.porCotaCents)} por cota (bruto)`;
  }
  return `Melhor jogo: ${acertos} — ${r.premiados} jogo${r.premiados !== 1 ? "s" : ""} premiado${r.premiados !== 1 ? "s" : ""}`;
}

export function montarMensagemWhatsapp(opts: {
  titulo: string;
  nomeLoteria: string;
  url: string;
  resultado?: ResumoResultadoBolao | null;
}): string {
  const { titulo, nomeLoteria, url, resultado } = opts;
  if (resultado) {
    return [
      `Resultado do bolão "${titulo}" (${nomeLoteria}, concurso ${resultado.concurso}):`,
      descreverResultado(resultado),
      "Confira os jogos e o rateio:",
      url,
    ].join("\n");
  }
  return [`Bolão "${titulo}" (${nomeLoteria}):`, "Veja os jogos e quem já pagou:", url].join("\n");
}

export function urlWhatsapp(mensagem: string): string {
  return `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
}
