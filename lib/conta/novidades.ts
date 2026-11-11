// Novidades exibidas no Painel da área de membros. Lista CURADA à mão, só
// com entregas reais (datas tiradas do histórico do git em main) — não é
// um feed automático. Ao lançar algo que o assinante deva notar, acrescente
// no TOPO e mantenha poucas linhas: o Painel mostra só as 4 primeiras.

export interface Novidade {
  data: string; // AAAA-MM-DD
  titulo: string;
  descricao: string;
  href: string;
}

export const NOVIDADES: Novidade[] = [
  {
    data: "2026-11-10",
    titulo: "Aviso do seu jogo a cada sorteio",
    descricao: "Depois de simular um jogo, receba por notificação ou e-mail se ele ganhou, a cada sorteio.",
    href: "/megasena/simulador",
  },
  {
    data: "2026-11-10",
    titulo: "Recordes das loterias",
    descricao: "O maior prêmio de cada loteria da Caixa, com data, concurso e número de ganhadores.",
    href: "/recordes",
  },
  {
    data: "2026-11-10",
    titulo: "Quanto rende o prêmio",
    descricao: "Quanto um prêmio rende por mês na poupança, no Tesouro Selic e num CDB, já sem o imposto.",
    href: "/calculadoras/quanto-rende-o-premio",
  },
  {
    data: "2026-11-06",
    titulo: "LotoAnalítica no celular",
    descricao: "Instale o app e receba resultados e a conferência dos seus jogos por notificação.",
    href: "/aplicativo",
  },
  {
    data: "2026-10-26",
    titulo: "Organizador de bolão",
    descricao: "Link para o grupo, controle de quem pagou e conferência automática do resultado.",
    href: "/conta/boloes",
  },
];
