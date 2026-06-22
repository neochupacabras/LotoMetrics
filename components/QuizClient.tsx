"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

// ─── Banco de perguntas ──────────────────────────────────────────────────────

interface Pergunta {
  afirmacao: string;
  resposta: "verdade" | "mito";
  explicacao: string;
  link?: { href: string; label: string };
}

const BANCO: Pergunta[] = [
  // ── MITOS ─────────────────────────────────────────────────────────────────
  {
    afirmacao:
      'Um número que não saiu nos últimos 20 concursos da Lotofácil está "devendo" sair e tem chance maior no próximo.',
    resposta: "mito",
    explicacao:
      "Cada sorteio é um evento independente — a loteria não tem memória dos concursos anteriores. Um número com atraso de 20 concursos tem exatamente a mesma chance (60%) de sair no próximo que um número que acabou de sair. Isso é a falácia do apostador.",
    link: { href: "/dicas/atraso", label: "Artigo: Atraso" },
  },
  {
    afirmacao:
      "Jogar 16 dezenas na Lotofácil (R$56) dá mais retorno por real apostado do que jogar 15 dezenas (R$3,50).",
    resposta: "mito",
    explicacao:
      "A probabilidade de ganhar sobe proporcionalmente ao custo: 16x a probabilidade por 16x o preço. A probabilidade por real gasto é numericamente idêntica em qualquer quantidade de dezenas. Não há 'desconto' em apostas maiores.",
    link: { href: "/dicas/mais-dezenas-vale-a-pena", label: "Artigo: Mais dezenas" },
  },
  {
    afirmacao:
      "A combinação 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15 tem menos chance de sair na Lotofácil porque parece muito óbvia.",
    resposta: "mito",
    explicacao:
      "Toda combinação específica de 15 dezenas tem exatamente a mesma probabilidade: 1 em 3.268.760. A loteria não sabe — e não se importa — se uma sequência parece óbvia ou aleatória para um ser humano.",
    link: { href: "/dicas/par-impar", label: "Artigo: Par/Ímpar" },
  },
  {
    afirmacao:
      "Jogar sempre os mesmos números toda semana aumenta a chance acumulada de ganhar, comparado a quem muda os números.",
    resposta: "mito",
    explicacao:
      "Cada concurso é independente dos anteriores. Jogar os mesmos números sempre tem a mesma chance por concurso que jogar qualquer outra combinação. O histórico de apostas passadas não altera a probabilidade do próximo sorteio.",
    link: { href: "/dicas/atraso", label: "Artigo: Atraso" },
  },
  {
    afirmacao:
      "Usar a Surpresinha (escolha aleatória automática) reduz as chances de ganhar porque a máquina não escolhe números 'estratégicos'.",
    resposta: "mito",
    explicacao:
      "Toda combinação tem exatamente a mesma probabilidade, independente de quem escolheu. A sensação de controle ao escolher os próprios números não tem nenhuma base matemática — isso é chamado de ilusão de controle.",
    link: { href: "/dicas/vieses-cognitivos", label: "Artigo: Vieses cognitivos" },
  },
  {
    afirmacao:
      "Combinações com distribuição par/ímpar equilibrada (como 7-8) têm mais chance de sair porque a loteria 'prefere equilíbrio'.",
    resposta: "mito",
    explicacao:
      "Toda combinação específica tem a mesma chance. O que é verdade é que existem mais combinações de 15 dezenas com distribuição 7-8 (31,2%) do que com distribuição extrema. Mas isso explica apenas por que esse padrão aparece mais no histórico — não há nenhuma preferência do sorteio.",
    link: { href: "/dicas/par-impar", label: "Artigo: Par/Ímpar" },
  },
  {
    afirmacao:
      "Se uma dezena saiu em 5 concursos seguidos, é sinal de que o mecanismo de sorteio está viciado.",
    resposta: "mito",
    explicacao:
      "Sequências de aparições repetidas são esperadas em qualquer processo aleatório honesto. Com 60% de chance de sair em cada concurso (Lotofácil), ver uma dezena aparecer 5 vezes seguidas é algo que acontece regularmente. Ausência de padrão seria o resultado suspeito.",
    link: { href: "/dicas/frequencia", label: "Artigo: Frequência" },
  },
  {
    afirmacao:
      'Como a Lotofácil sorteia 60% das dezenas a cada concurso, a chance de qualquer aposta ganhar na faixa 1 é de "cerca de 60%".',
    resposta: "mito",
    explicacao:
      "60% é a chance de uma dezena específica sair — não de uma combinação inteira de 15 dezenas ganhar. A probabilidade de uma aposta simples ganhar a faixa 1 é 1 em 3.268.760, independente de quantas dezenas são sorteadas por vez.",
    link: { href: "/dicas/como-os-premios-sao-calculados", label: "Artigo: Como os prêmios são calculados" },
  },

  // ── VERDADES ──────────────────────────────────────────────────────────────
  {
    afirmacao:
      "Numa combinação aleatória de 15 dezenas da Lotofácil, é mais provável ter pelo menos 4 dezenas seguidas do que não ter nenhuma sequência de 3.",
    resposta: "verdade",
    explicacao:
      "Isso foi verificado contando todas as 3.268.760 combinações possíveis: 87,4% delas têm pelo menos 4 dezenas consecutivas. Já combinações sem nenhuma sequência de 3 ou mais são apenas 0,28% do total. Com 15 dezenas em 25, sobra pouco espaço para espaçar tudo uniformemente.",
    link: { href: "/dicas/sequencias", label: "Artigo: Sequências" },
  },
  {
    afirmacao:
      "Se você ganhar a faixa principal da Lotofácil junto com outros 9 apostadores, receberá 10 vezes menos do que se tivesse ganhado sozinho.",
    resposta: "verdade",
    explicacao:
      "O prêmio da faixa principal é rateado igualmente entre todos os ganhadores daquele concurso. 10 ganhadores = cada um recebe 1/10 do fundo disponível. Um ganhador único leva tudo. Esse é o sistema de rateio.",
    link: { href: "/dicas/como-os-premios-sao-calculados", label: "Artigo: Como os prêmios são calculados" },
  },
  {
    afirmacao:
      "A Caixa destina mais de 56% de toda a arrecadação da Lotofácil para custos operacionais e repasses sociais — sem distribuir como prêmio.",
    resposta: "verdade",
    explicacao:
      "Somente 43,35% da arrecadação da Lotofácil vira prêmio bruto. Os outros 56,65% cobrem custos operacionais, comissão das lotéricas e repasses ao governo federal (saúde, esporte, cultura, educação, seguridade social).",
    link: { href: "/dicas/retorno-ao-apostador", label: "Artigo: Retorno ao apostador" },
  },
  {
    afirmacao:
      "Escolher dezenas acima de 31 na Mega-Sena pode aumentar o valor que você recebe se ganhar, sem alterar sua chance de ganhar.",
    resposta: "verdade",
    explicacao:
      "Como muitos apostadores usam datas (aniversários, etc.), dezenas de 1 a 31 são mais populares. Dezenas acima de 31 são sistematicamente menos jogadas, o que reduz a probabilidade de dividir o prêmio com outros ganhadores — sem mudar em nada a probabilidade de ganhar.",
    link: { href: "/dicas/numeros-populares", label: "Artigo: Números populares" },
  },
  {
    afirmacao:
      "Um ciclo da Lotofácil — quando todas as 25 dezenas saem pelo menos uma vez — dura, em média, menos de 5 concursos.",
    resposta: "verdade",
    explicacao:
      "Como a Lotofácil sorteia 60% das dezenas a cada concurso, os ciclos fecham rápido. O cálculo exato (via equação de valor esperado, sem simulação) dá 4,77 concursos em média. A Mega-Sena, que sorteia só 10%, tem ciclos de ~45 concursos em média.",
    link: { href: "/dicas/ciclos", label: "Artigo: Ciclos" },
  },
  {
    afirmacao:
      "Na Mega-Sena, a maioria dos sorteios possíveis não repete nenhuma dezena do concurso anterior.",
    resposta: "verdade",
    explicacao:
      "Com apenas 6 de 60 dezenas sorteadas por vez (10%), a sobreposição esperada entre dois sorteios consecutivos é mínima. Calculando exatamente: 51,6% de todos os sorteios possíveis não têm nenhuma dezena em comum com o sorteio anterior.",
    link: { href: "/dicas/repetidas", label: "Artigo: Repetidas" },
  },
  {
    afirmacao:
      "Duas apostas da Lotofácil com combinações diferentes têm, juntas, quase exatamente o dobro da chance de ganhar do que uma aposta simples.",
    resposta: "verdade",
    explicacao:
      'Para probabilidades muito pequenas (como 1 em 3,2 milhões), "quase o dobro" é a expressão correta: a chance real é 2 × (1/3.268.760) × (1 − 1/3.268.760), que é tão próxima do dobro exato que a diferença é menor que 0,00003%. Quanto maior o número de apostas, mais esse princípio se mantém válido.',
    link: { href: "/dicas/retorno-ao-apostador", label: "Artigo: Retorno ao apostador" },
  },
  {
    afirmacao:
      "O número de primos disponíveis entre 1 e 25 é menor do que o número de primos entre 1 e 60.",
    resposta: "verdade",
    explicacao:
      "Existem 9 primos entre 1 e 25 (2, 3, 5, 7, 11, 13, 17, 19, 23) e 17 primos entre 1 e 60. Isso significa que a média de primos por sorteio é 5,4 na Lotofácil e 1,7 na Mega-Sena — uma diferença que a combinatória explica inteiramente.",
    link: { href: "/dicas/primos", label: "Artigo: Primos" },
  },
  {
    afirmacao:
      "Um apostador que joga Lotofácil todo dia durante um ano vai, em média, receber de volta menos da metade do que apostou.",
    resposta: "verdade",
    explicacao:
      "O retorno bruto da Lotofácil é 43,35% da arrecadação. No longo prazo, independente de quantas vezes você joga ou qual estratégia usa, a expectativa matemática é perder R$56,65 a cada R$100 apostados. Loteria é entretenimento com custo esperado, não investimento.",
    link: { href: "/dicas/retorno-ao-apostador", label: "Artigo: Retorno ao apostador" },
  },
  {
    afirmacao:
      "Mais de 57% das combinações possíveis da Lotofácil têm exatamente 7 ou 8 dezenas pares.",
    resposta: "verdade",
    explicacao:
      "A distribuição 7 pares/8 ímpares representa 31,2% e 8/7 representa 26% das combinações possíveis. Juntas somam 57,2%. Isso acontece porque há 12 dezenas pares e 13 ímpares entre 1 e 25 — a distribuição esperada por combinatória é naturalmente próxima de 7-8.",
    link: { href: "/dicas/par-impar", label: "Artigo: Par/Ímpar" },
  },
  {
    afirmacao:
      "Na Mega-Sena, existe uma categoria em que quase 36% dos sorteios possíveis não apresentam nenhum número da sequência de Fibonacci.",
    resposta: "verdade",
    explicacao:
      "Há apenas 9 valores de Fibonacci entre 1 e 60 (1, 2, 3, 5, 8, 13, 21, 34, 55). Com 6 dezenas sorteadas de 60, a probabilidade de nenhuma ser Fibonacci é 35,97%. Isso mostra que a sequência de Fibonacci não tem nenhuma propriedade especial no contexto de sorteios.",
    link: { href: "/dicas/fibonacci", label: "Artigo: Fibonacci" },
  },
  {
    afirmacao:
      "Na grade do volante da Mega-Sena (10 linhas × 6 colunas), o centro contém mais dezenas do que a borda.",
    resposta: "verdade",
    explicacao:
      "Na grade 10×6 da Mega-Sena, a moldura (borda) tem 28 dezenas e o centro tem 32 — o centro é maior. Isso é o oposto da Lotofácil, onde a grade 5×5 tem 16 dezenas na borda e só 9 no centro. A geometria do volante determina essa proporção.",
    link: { href: "/dicas/moldura-centro", label: "Artigo: Moldura e Centro" },
  },
  {
    afirmacao:
      "O viés de confirmação faz com que apostadores se lembrem mais das vezes em que sua 'estratégia funcionou' do que das que não funcionou.",
    resposta: "verdade",
    explicacao:
      "O viés de confirmação é o processo mental de buscar e lembrar seletivamente evidências que confirmam crenças existentes. Em loteria, isso faz sistemas parecerem mais eficientes do que são — você lembra do concurso em que 'acertou', mas descarta os que 'falharam'.",
    link: { href: "/dicas/vieses-cognitivos", label: "Artigo: Vieses cognitivos" },
  },
  {
    afirmacao:
      "Dois apostadores com jogos completamente diferentes têm exatamente a mesma probabilidade de ganhar a faixa principal de um mesmo concurso.",
    resposta: "verdade",
    explicacao:
      "Toda combinação específica de 15 dezenas tem probabilidade 1/3.268.760 de ser sorteada. Não importa se os números parecem 'estratégicos', 'aleatórios', 'quentes' ou 'frios' — a probabilidade é idêntica para todas.",
    link: { href: "/dicas/frequencia", label: "Artigo: Frequência" },
  },
];

// ─── Tipos e helpers ────────────────────────────────────────────────────────

type Fase = "intro" | "quiz" | "resultado";
type Resposta = "verdade" | "mito" | null;

function embaralhar<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function mensagemFinal(acertos: number, total: number) {
  const pct = acertos / total;
  if (pct === 1) return { emoji: "🎯", texto: "Perfeito! Você conhece a matemática da loteria melhor que a maioria." };
  if (pct >= 0.8) return { emoji: "⭐", texto: "Excelente! Você domina bem a diferença entre fatos e mitos." };
  if (pct >= 0.6) return { emoji: "📊", texto: "Bom resultado. Vale explorar os artigos de dicas para solidificar o conhecimento." };
  if (pct >= 0.4) return { emoji: "🎲", texto: "Muitas crenças populares sobre loteria têm uma matemática surpreendente por trás. Leia os artigos!" };
  return { emoji: "📚", texto: "A matemática da loteria desfaz muitos mitos populares. Os artigos de dicas explicam cada um deles." };
}

// ─── Componente ──────────────────────────────────────────────────────────────

const TOTAL_POR_SESSAO = 10;

export default function QuizClient() {
  const [fase, setFase] = useState<Fase>("intro");
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [atual, setAtual] = useState(0);
  const [respostaDada, setRespostaDada] = useState<Resposta>(null);
  const [acertos, setAcertos] = useState(0);

  const comecar = useCallback(() => {
    setPerguntas(embaralhar(BANCO).slice(0, TOTAL_POR_SESSAO));
    setAtual(0);
    setRespostaDada(null);
    setAcertos(0);
    setFase("quiz");
  }, []);

  const responder = useCallback(
    (r: "verdade" | "mito") => {
      if (respostaDada !== null) return;
      setRespostaDada(r);
      if (r === perguntas[atual].resposta) {
        setAcertos((a) => a + 1);
      }
    },
    [respostaDada, perguntas, atual]
  );

  const proxima = useCallback(() => {
    if (atual + 1 >= TOTAL_POR_SESSAO) {
      setFase("resultado");
    } else {
      setAtual((a) => a + 1);
      setRespostaDada(null);
    }
  }, [atual]);

  // ── Tela de introdução ──────────────────────────────────────────────────
  if (fase === "intro") {
    return (
      <div className="quiz-intro">
        <p className="eyebrow">Quiz</p>
        <h1 className="titulo-edicao">Verdade ou Mito?</h1>
        <p className="subtitulo-edicao">
          {TOTAL_POR_SESSAO} afirmações sobre loteria e probabilidade. Você consegue
          separar os fatos matemáticos dos mitos populares?
        </p>
        <div className="quiz-intro-meta">
          <span>{TOTAL_POR_SESSAO} perguntas</span>
          <span>·</span>
          <span>Sem tempo limite</span>
          <span>·</span>
          <span>Perguntas diferentes a cada sessão</span>
        </div>
        <button type="button" className="botao-gerar quiz-btn-comecar" onClick={comecar}>
          Começar o quiz
        </button>
      </div>
    );
  }

  // ── Tela de resultado ───────────────────────────────────────────────────
  if (fase === "resultado") {
    const { emoji, texto } = mensagemFinal(acertos, TOTAL_POR_SESSAO);
    return (
      <div className="quiz-resultado">
        <p className="eyebrow">Resultado</p>
        <div className="quiz-resultado-placar">
          <span className="quiz-resultado-numero">{acertos}</span>
          <span className="quiz-resultado-total">/{TOTAL_POR_SESSAO}</span>
        </div>
        <p className="quiz-resultado-emoji">{emoji}</p>
        <p className="quiz-resultado-mensagem">{texto}</p>

        <div className="quiz-resultado-acoes">
          <button type="button" className="botao-gerar" onClick={comecar}>
            Jogar novamente
          </button>
          <Link href="/dicas" className="botao-copiar quiz-btn-dicas">
            Ver todos os artigos →
          </Link>
        </div>
      </div>
    );
  }

  // ── Tela de pergunta ────────────────────────────────────────────────────
  const p = perguntas[atual];
  const respondeu = respostaDada !== null;
  const acertou = respostaDada === p.resposta;

  return (
    <div className="quiz-wrapper">
      {/* Progresso */}
      <div className="quiz-progresso">
        <div className="quiz-progresso-barra">
          <div
            className="quiz-progresso-fill"
            style={{ width: `${(atual / TOTAL_POR_SESSAO) * 100}%` }}
          />
        </div>
        <span className="quiz-progresso-label">
          {atual + 1} / {TOTAL_POR_SESSAO}
        </span>
      </div>

      {/* Card da pergunta */}
      <div
        className="quiz-card"
        data-estado={respondeu ? (acertou ? "correto" : "errado") : "neutro"}
      >
        <p className="quiz-card-tag">
          {respondeu
            ? acertou
              ? "✓ Correto"
              : `✗ Errado — é ${p.resposta === "verdade" ? "Verdade" : "Mito"}`
            : "Verdade ou Mito?"}
        </p>
        <p className="quiz-card-afirmacao">"{p.afirmacao}"</p>
      </div>

      {/* Botões de resposta */}
      {!respondeu ? (
        <div className="quiz-botoes">
          <button
            type="button"
            className="quiz-btn-verdade"
            onClick={() => responder("verdade")}
          >
            ✓ Verdade
          </button>
          <button
            type="button"
            className="quiz-btn-mito"
            onClick={() => responder("mito")}
          >
            ✗ Mito
          </button>
        </div>
      ) : (
        <div className="quiz-explicacao">
          <p className="quiz-explicacao-texto">{p.explicacao}</p>
          {p.link && (
            <Link href={p.link.href} className="quiz-explicacao-link">
              {p.link.label} ↗
            </Link>
          )}
          <button type="button" className="botao-gerar quiz-btn-proxima" onClick={proxima}>
            {atual + 1 < TOTAL_POR_SESSAO ? "Próxima pergunta →" : "Ver resultado →"}
          </button>
        </div>
      )}

      {/* Placar parcial */}
      <div className="quiz-placar-parcial">
        {respondeu ? `${acertos + (acertou ? 1 : 0)} acertos em ${atual + 1} pergunta${atual + 1 > 1 ? "s" : ""}` : `${acertos} acerto${acertos !== 1 ? "s" : ""} até agora`}
      </div>
    </div>
  );
}
