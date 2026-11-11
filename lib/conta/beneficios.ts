import type { CodigoLoteria } from "@/lib/types";

// O que o Premium acrescenta ao plano gratuito, com ONDE usar cada coisa —
// a tela de assinatura (/conta/assinatura) mostra isso ao assinante como
// "o que está incluído" e ao free como informação, sem tom de venda.
//
// Só entra o que o código de fato libera pelo plano (conferido em
// 10-11/11/2026): calcularIsPremium no servidor ou o plano no cliente. Se
// um benefício mudar, mude aqui E em app/premium/page.tsx (a página
// pública de planos ainda tem a própria lista).

export interface Beneficio {
  id: string;
  nome: string;
  detalhe: string;
  // Onde usar. Função porque parte das ferramentas abre na loteria de
  // contexto; null = acontece sozinho (ex.: sem anúncios).
  onde: ((loteria: CodigoLoteria) => { href: string; rotulo: string }) | null;
}

export interface GrupoBeneficios {
  titulo: string;
  itens: Beneficio[];
}

export const BENEFICIOS_PREMIUM: GrupoBeneficios[] = [
  {
    titulo: "Seus jogos no automático",
    itens: [
      {
        id: "email-resultado",
        nome: "Resultado dos jogos salvos por e-mail",
        detalhe: "Depois de cada sorteio, quantos pontos cada jogo fez e se houve prêmio.",
        onde: () => ({ href: "/conta/alertas", rotulo: "Alertas" }),
      },
      {
        id: "relatorio",
        nome: "Relatório mensal em PDF",
        detalhe: "Desempenho de todos os jogos no mês, por e-mail e para baixar.",
        onde: () => ({ href: "/conta/jogos", rotulo: "Jogos salvos" }),
      },
      {
        id: "carteira",
        nome: "Carteira do apostador e Meu ano",
        detalhe: "Gasto, prêmios e saldo de cada jogo, e a retrospectiva do ano.",
        onde: () => ({ href: "/conta/carteira", rotulo: "Desempenho" }),
      },
    ],
  },
  {
    titulo: "Ferramentas sem limite",
    itens: [
      {
        id: "simulador",
        nome: "Simulador com o histórico completo",
        detalhe: "Todos os concursos em vez dos últimos 100, e a comparação de dois jogos.",
        onde: (l) => ({ href: `/${l}/simulador`, rotulo: "Simulador" }),
      },
      {
        id: "conferidor",
        nome: "Conferidor ilimitado",
        detalhe: "Quantos jogos quiser por vez, também por foto do bilhete, em todas as loterias.",
        onde: (l) => ({ href: `/${l}/conferidor`, rotulo: "Conferidor" }),
      },
      {
        id: "gerador",
        nome: "Gerador no modo avançado",
        detalhe: "Todos os filtros estatísticos combinados.",
        onde: (l) => ({ href: `/${l}/gerador`, rotulo: "Gerador" }),
      },
      {
        id: "heatmap",
        nome: "Heatmap em todos os períodos",
        detalhe: "Histórico completo e os últimos 500, 100 e 50 concursos.",
        onde: (l) => ({ href: `/${l}/heatmap`, rotulo: "Heatmap" }),
      },
      {
        id: "csv",
        nome: "Histórico em CSV",
        detalhe: "Todos os concursos de qualquer loteria, prontos para a planilha.",
        onde: (l) => ({ href: `/${l}/resultados`, rotulo: "Resultados" }),
      },
    ],
  },
  {
    titulo: "Para grupos e para quem programa",
    itens: [
      {
        id: "bolao-pro",
        nome: "Bolão Pro em todos os seus bolões",
        detalhe: "Até 100 cotas e aviso do resultado por e-mail para os participantes.",
        onde: () => ({ href: "/conta/boloes", rotulo: "Bolões" }),
      },
      {
        id: "api",
        nome: "API de dados",
        detalhe: "1.000 requisições por mês, até 3 chaves ativas.",
        onde: () => ({ href: "/conta/api", rotulo: "API de dados" }),
      },
      {
        id: "sem-anuncios",
        nome: "Nenhum anúncio",
        detalhe: "O script de anúncios nem é carregado para você, em nenhuma página.",
        onde: null,
      },
    ],
  },
];
