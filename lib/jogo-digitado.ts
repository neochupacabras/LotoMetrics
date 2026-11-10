// Lê um jogo digitado ou colado ("05 12 23 34 41 60", "5,12,23", "05-12-23",
// "051223344160" copiado do WhatsApp) para o campo do simulador. Função pura,
// testada em lib/jogo-digitado.test.ts.
//
// Sempre devolve `numeros` (os válidos lidos até aqui, sem repetição, na
// ordem digitada) para a grade acompanhar o que a pessoa digita, mesmo com
// erro em outro número.

export interface ConfigJogo {
  dezenaMin: number;
  dezenaMax: number;
  qtd: number;
  // Super Sete: 7 colunas de 0 a 9, cada algarismo é uma coluna.
  superSete?: boolean;
  // "na Mega-Sena", "no Super Sete" — usado nas mensagens de erro.
  ondeLoteria: string;
}

export interface JogoLido {
  numeros: number[];
  erro: string | null;
  completo: boolean;
}

const dz = (n: number) => String(n).padStart(2, "0");

export function lerJogoDigitado(texto: string, cfg: ConfigJogo): JogoLido {
  if (cfg.superSete) {
    const algarismos = texto.replace(/\D/g, "").split("").map(Number);
    const numeros = algarismos.slice(0, cfg.qtd);
    const erro = algarismos.length > cfg.qtd
      ? `São ${cfg.qtd} colunas ${cfg.ondeLoteria}, uma por algarismo; você digitou ${algarismos.length}.`
      : null;
    return { numeros, erro, completo: !erro && numeros.length === cfg.qtd };
  }

  const tokens: string[] = [];
  let erro: string | null = null;
  for (const t of texto.match(/\d+/g) ?? []) {
    if (t.length <= 2) {
      tokens.push(t);
    } else if (t.length % 2 === 0) {
      // Números colados sem separador: "051223" = 05, 12, 23.
      for (let i = 0; i < t.length; i += 2) tokens.push(t.slice(i, i + 2));
    } else {
      erro ??= `Não entendi "${t}". Separe os números com espaço ou vírgula.`;
    }
  }

  const numeros: number[] = [];
  const vistos = new Set<number>();
  let total = 0;
  for (const t of tokens) {
    const n = Number(t);
    total++;
    if (n < cfg.dezenaMin || n > cfg.dezenaMax) {
      erro ??= `O ${dz(n)} não existe ${cfg.ondeLoteria}: os números vão de ${dz(cfg.dezenaMin)} a ${dz(cfg.dezenaMax)}.`;
      continue;
    }
    if (vistos.has(n)) {
      erro ??= `O ${dz(n)} aparece duas vezes.`;
      continue;
    }
    vistos.add(n);
    if (numeros.length < cfg.qtd) numeros.push(n);
  }

  if (!erro && total > cfg.qtd) {
    erro = `O jogo ${cfg.ondeLoteria} tem ${cfg.qtd} números; você digitou ${total}.`;
  }

  return { numeros, erro, completo: !erro && numeros.length === cfg.qtd };
}

// Texto do campo a partir dos números (quando a pessoa usa a grade).
export function jogoParaTexto(numeros: number[], superSete = false): string {
  return superSete ? numeros.join(" ") : [...numeros].sort((a, b) => a - b).map(dz).join(" ");
}
