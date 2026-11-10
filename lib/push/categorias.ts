// Categorias de notificação push — fonte única usada pela tela de
// preferências (client), pela validação das rotas /api/push/* e pelo envio
// no servidor. Para criar uma categoria nova: acrescente aqui, inclua o id
// no CHECK da tabela push_inscricoes (migration) e chame
// notificarInscricoes()/notificarUsuario() de lib/push/servidor.ts no ponto
// do backend que gera o evento.

export type CategoriaPush = "resultado" | "acumulado" | "meus_jogos" | "bolao";

export interface DefinicaoCategoria {
  id: CategoriaPush;
  titulo: string;
  descricao: string;
  // Pessoais: dependem de conta (jogos/bolões do usuário). São removidas da
  // inscrição quando o usuário sai da conta naquele aparelho.
  requerLogin: boolean;
  // Categorias que fazem sentido filtrar por loteria (resultado/acúmulo).
  porLoteria: boolean;
  padrao: boolean;
}

export const CATEGORIAS_PUSH: readonly DefinicaoCategoria[] = [
  {
    id: "resultado",
    titulo: "Resultado do sorteio",
    descricao: "As dezenas sorteadas assim que o resultado oficial é publicado.",
    requerLogin: false,
    porLoteria: true,
    padrao: true,
  },
  {
    id: "acumulado",
    titulo: "Prêmio acumulado",
    descricao: "Aviso quando a loteria acumula, com a estimativa do próximo prêmio.",
    requerLogin: false,
    porLoteria: true,
    padrao: true,
  },
  {
    id: "meus_jogos",
    titulo: "Conferência dos meus jogos",
    descricao: "Quantos pontos os jogos salvos na sua conta fizeram (recurso Premium).",
    requerLogin: true,
    porLoteria: false,
    padrao: true,
  },
  {
    id: "bolao",
    titulo: "Resultado dos meus bolões",
    descricao: "Conferência automática dos bolões que você organiza.",
    requerLogin: true,
    porLoteria: false,
    padrao: true,
  },
];

export const IDS_CATEGORIAS = new Set<string>(CATEGORIAS_PUSH.map((c) => c.id));
export const CATEGORIAS_PESSOAIS = new Set<string>(
  CATEGORIAS_PUSH.filter((c) => c.requerLogin).map((c) => c.id)
);

// Formato do payload JSON que o servidor envia e o service worker
// (public/sw.js) exibe. Mantenha os dois em sincronia.
export interface PayloadPush {
  titulo: string;
  corpo: string;
  // Caminho relativo do próprio site (o service worker recusa outra origem).
  url: string;
  // Notificações com a mesma tag substituem a anterior em vez de empilhar.
  tag: string;
  // "alerta_jogo": aviso de jogo do simulador (lib/notificacoes/alertas-jogo-envio.ts),
  // fora de push_inscricoes.categorias porque é por jogo, não por tipo.
  categoria: CategoriaPush | "teste" | "alerta_jogo";
  acoes?: { acao: string; titulo: string; url: string }[];
}
