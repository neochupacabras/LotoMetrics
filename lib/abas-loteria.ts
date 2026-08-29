// Nem toda loteria tem todas as ferramentas — a mecânica de aposta de
// algumas não se encaixa em certos modelos. Fonte única de verdade usada
// tanto pela navegação (Subnav) quanto pelo sitemap, pra elas não
// divergirem: uma ferramenta que o Subnav esconde (mostra um aviso de
// indisponibilidade) não deveria aparecer no sitemap como se fosse
// conteúdo funcional pleno.
export const ABAS_EXCLUIDAS_POR_LOTERIA: Record<string, readonly string[]> = {
  // Lotomania e Super Sete: a mecânica de aposta de nenhuma das duas se
  // encaixa no modelo de fechamento (ver lib/fechamento-config.ts e
  // lib/bolao-opcoes.ts).
  lotomania: ["fechamentos", "bolao"],
  // Super Sete: além de fechamentos/bolão, não tem "trincas de dezenas"
  // nem "escolher dezenas de um universo comum" — a mecânica é de colunas
  // independentes de 0 a 9 (mesmo critério de lib/categorias.ts para
  // "duques-trincas").
  supersete: ["fechamentos", "bolao", "ineditas", "data-da-sorte"],
};

export function abaAplicavel(codigoLoteria: string, aba: string): boolean {
  return !(ABAS_EXCLUIDAS_POR_LOTERIA[codigoLoteria] ?? []).includes(aba);
}
