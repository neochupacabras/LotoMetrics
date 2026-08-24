"use client";

import { useState } from "react";

interface Desafio {
  pergunta: string;
  opcaoA: string;
  opcaoB: string;
  veredito: string;
  explicacao: string;
}

const DESAFIOS: Desafio[] = [
  {
    pergunta: "O que é mais provável sair junto num sorteio da Lotofácil?",
    opcaoA: "2 dezenas seguidas (ex: 7 e 8)",
    opcaoB: "2 dezenas quaisquer (ex: 3 e 19)",
    veredito: "As duas têm quase a mesma chance",
    explicacao:
      "Qualquer par específico de dezenas tem cerca de 35% de chance de sair junto em algum concurso. A combinatória não faz distinção entre \"seguidas\" e \"quaisquer\" — o cérebro humano é que vê um padrão especial em números consecutivos.",
  },
  {
    pergunta: "Qual tem mais chance de sair no próximo concurso?",
    opcaoA: "Um número que não sai há 50 concursos",
    opcaoB: "Um número que acabou de sair no concurso passado",
    veredito: "As duas têm exatamente a mesma chance",
    explicacao:
      "Cada sorteio é um evento independente — a loteria não tem memória do que já aconteceu. Achar que um número \"atrasado\" está mais perto de sair é a falácia do apostador, um dos vieses mais comuns em jogos de azar.",
  },
  {
    pergunta: "Qual soma de dezenas é mais comum na Lotofácil?",
    opcaoA: "Uma soma próxima de 195",
    opcaoB: "Uma soma bem baixa, tipo 60",
    veredito: "Somas próximas de 195 são muito mais comuns",
    explicacao:
      "A soma das 15 dezenas sorteadas segue uma curva em sino: existem muito mais combinações que somam perto da média (195) do que combinações com soma muito baixa ou muito alta. Não é sorte, é contagem.",
  },
  {
    pergunta: "Em quantos sorteios da Lotofácil saem pelo menos 4 dezenas seguidas?",
    opcaoA: "Na maioria dos sorteios (mais de 80%)",
    opcaoB: "Raramente (menos de 20%)",
    veredito: "Na maioria — cerca de 87% dos sorteios",
    explicacao:
      "Sequências de dezenas consecutivas são muito mais comuns do que a intuição sugere: 87% dos sorteios da Lotofácil têm pelo menos 4 dezenas seguidas. Evitar sequências no seu jogo não te aproxima do \"padrão típico\" — é o oposto.",
  },
  {
    pergunta: "Qual distribuição de pares e ímpares é mais comum na Lotofácil?",
    opcaoA: "7 pares e 8 ímpares (ou o contrário)",
    opcaoB: "Todas as 15 dezenas pares, ou todas ímpares",
    veredito: "7-8 é muito mais comum",
    explicacao:
      "Existem muito mais combinações possíveis com uma distribuição equilibrada (7-8) do que com uma distribuição extrema (15-0). A diferença não é sorte — é que uma categoria tem muito mais combinações válidas que a outra.",
  },
  {
    pergunta: "Evitar números populares (1 a 31, tipo datas de aniversário) muda o quê?",
    opcaoA: "Aumenta a chance de você ganhar",
    opcaoB: "Aumenta o prêmio, se você ganhar",
    veredito: "Só o valor do prêmio, não a chance de ganhar",
    explicacao:
      "A probabilidade de qualquer combinação sair é sempre a mesma. Mas como muita gente aposta em datas (1 a 31), sorteios com esse perfil tendem a ter mais ganhadores dividindo o mesmo prêmio — reduzindo o valor recebido por pessoa.",
  },
];

export default function DesafioIntuicao() {
  const [indice, setIndice] = useState(0);
  const [revelado, setRevelado] = useState(false);

  const atual = DESAFIOS[indice];

  function proximo() {
    setIndice((i) => (i + 1) % DESAFIOS.length);
    setRevelado(false);
  }

  return (
    <div className="desafio-intuicao">
      <p className="eyebrow">Teste sua intuição</p>
      <h2 className="desafio-intuicao__pergunta">{atual.pergunta}</h2>

      <div className="desafio-intuicao__opcoes">
        <button
          type="button"
          className="desafio-intuicao__opcao"
          onClick={() => setRevelado(true)}
        >
          {atual.opcaoA}
        </button>
        <button
          type="button"
          className="desafio-intuicao__opcao"
          onClick={() => setRevelado(true)}
        >
          {atual.opcaoB}
        </button>
      </div>

      {revelado && (
        <div className="desafio-intuicao__resultado">
          <p className="desafio-intuicao__veredito">{atual.veredito}</p>
          <p className="desafio-intuicao__explicacao">{atual.explicacao}</p>
          <button type="button" className="desafio-intuicao__proxima" onClick={proximo}>
            Tentar outra →
          </button>
        </div>
      )}
    </div>
  );
}
