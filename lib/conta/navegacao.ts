// Mapa de navegação da área de membros — fonte única para a lombada
// (desktop/tablet), a barra inferior e a folha "Conta" (celular).
//
// Só entram aqui rotas que EXISTEM. As seções planejadas na proposta
// (docs/membros/REDESIGN_AREA_MEMBROS.md) — Ferramentas e Loterias — são
// acrescentadas conforme cada uma for entregue.

export type IconeNav =
  | "painel"
  | "jogos"
  | "bolao"
  | "desempenho"
  | "assinatura"
  | "api"
  | "alertas"
  | "perfil";

export interface ItemNav {
  href: string;
  rotulo: string;
  icone: IconeNav;
  // Prefixos de rota que também marcam o item como ativo.
  ativoEm?: string[];
  // Recurso exclusivo de assinantes: mostra o selo/cadeado conforme o plano.
  premium?: boolean;
}

export interface GrupoNav {
  rotulo: string | null;
  itens: ItemNav[];
}

export const NAV_MEMBROS: GrupoNav[] = [
  {
    rotulo: null,
    itens: [{ href: "/conta", rotulo: "Painel", icone: "painel" }],
  },
  {
    rotulo: "Meu jogo",
    itens: [
      { href: "/conta/jogos", rotulo: "Jogos salvos", icone: "jogos" },
      { href: "/conta/boloes", rotulo: "Bolões", icone: "bolao" },
      {
        href: "/conta/carteira",
        rotulo: "Desempenho",
        icone: "desempenho",
        ativoEm: ["/conta/carteira", "/conta/meu-ano"],
        premium: true,
      },
      { href: "/conta/alertas", rotulo: "Alertas", icone: "alertas" },
    ],
  },
  {
    rotulo: "Conta",
    itens: [
      { href: "/conta/assinatura", rotulo: "Assinatura", icone: "assinatura" },
      { href: "/conta/api", rotulo: "API de dados", icone: "api", premium: true },
      {
        href: "/conta/perfil",
        rotulo: "Perfil e segurança",
        icone: "perfil",
        ativoEm: ["/conta/perfil", "/conta/nova-senha"],
      },
    ],
  },
];

// Abas da seção Desempenho (as duas URLs continuam as de sempre).
export const ABAS_DESEMPENHO = [
  { href: "/conta/carteira", rotulo: "Carteira do apostador" },
  { href: "/conta/meu-ano", rotulo: "Meu ano na loteria" },
];

export function itemAtivo(item: ItemNav, pathname: string): boolean {
  if (item.href === "/conta") return pathname === "/conta";
  const prefixos = item.ativoEm ?? [item.href];
  return prefixos.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

// Título da seção atual, usado na barra superior.
export function tituloSecao(pathname: string): string {
  for (const grupo of NAV_MEMBROS) {
    for (const item of grupo.itens) {
      if (itemAtivo(item, pathname)) return item.rotulo;
    }
  }
  return "Minha conta";
}
