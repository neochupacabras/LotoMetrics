import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { SimuladorMoeda } from "./ConteudoClient";

const TITULO = "Probabilidade: o que significa '50% de chance' — e por que isso não é o que parece";
const DESCRICAO = "Entenda probabilidade de verdade: moeda honesta, falácia do apostador, independência de eventos e como a previsão do tempo usa probabilidade. Com simulador interativo.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: `${SITE_URL}/matematica/probabilidade` },
  openGraph: { title: TITULO, description: DESCRICAO, url: `${SITE_URL}/matematica/probabilidade`, siteName: SITE_NAME, locale: "pt_BR", type: "article", images: [`${SITE_URL}/opengraph-image`] },
};

export default function ArtigoProbabilidadePage() {
  return (
    <>
      <Masthead matematicaAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow">
          <Link href="/matematica" className="breadcrumb">← Matemática sem mistério</Link>
        </p>
        <div className="mat-artigo-header mat-artigo-header--ochre">
          <span className="mat-artigo-emoji">🎲</span>
          <div>
            <p className="mat-artigo-conceito">Probabilidade clássica e frequentista (em inglês: <em>classical and frequentist probability</em>)</p>
            <h1 className="titulo-edicao">Probabilidade</h1>
          </div>
        </div>
        <p className="subtitulo-edicao">
          O que significa dizer que algo tem "50% de chance" — e por que jogar
          cara ou coroa 10 vezes sem sair coroa não significa absolutamente nada
          para o 11º lançamento.
        </p>

        <SimuladorMoeda />

        <h2 className="mat-h2">O que é probabilidade de verdade?</h2>
        <p>
          Probabilidade é uma forma matemática de medir <strong>incerteza</strong>.
          Ela não diz o que vai acontecer — diz o quão provável é cada resultado
          possível. O valor vai de 0 (impossível) a 1 (certo), e geralmente
          expressamos como porcentagem: 0,5 = 50%.
        </p>
        <p>
          Existem duas formas principais de pensar em probabilidade, e é importante
          entender as duas:
        </p>

        <div className="mat-box mat-box--ochre">
          <p className="mat-box__titulo">📐 Duas definições de probabilidade</p>
          <p>
            <strong>Clássica (teórica):</strong> P(evento) = casos favoráveis ÷ casos possíveis.
            Funciona quando todos os resultados são igualmente prováveis.
            Uma moeda tem 1 face cara de 2 possíveis → P(cara) = 1/2 = 50%.
            Uma dado tem 1 face "6" de 6 possíveis → P(6) = 1/6 ≈ 16,7%.
          </p>
          <p style={{ marginTop: 10 }}>
            <strong>Frequentista (empírica):</strong> P(evento) ≈ vezes que aconteceu ÷ total de tentativas.
            Você lança a moeda 10.000 vezes e conta as caras. Com o tempo, a proporção
            se aproxima de 50%. Essa definição funciona quando não conhecemos a teoria
            ou quando queremos verificar experimentalmente.
          </p>
        </div>

        <p>
          Use o simulador acima para ver a definição frequentista em ação: lance
          a moeda poucas vezes e o resultado será caótico. Lance 10.000 vezes
          e a frequência de caras estará muito próxima de 50%.
        </p>

        <h2 className="mat-h2">Cada lançamento é independente — a moeda não tem memória</h2>
        <p>
          Você lançou uma moeda 10 vezes seguidas e saiu cara todas as vezes.
          Qual é a probabilidade de sair coroa no 11º lançamento?
        </p>
        <p>
          A resposta é: <strong>50%</strong>. Exatamente a mesma de sempre.
        </p>
        <p>
          A moeda não sabe que saiu cara 10 vezes. Ela não tem memória, não tem
          dívida, não tem obrigação de "compensar". Cada lançamento é um{" "}
          <strong>evento independente</strong> — o resultado anterior não influencia
          o próximo de forma alguma.
        </p>
        <p>
          Isso é contraintuitivo porque nosso cérebro é treinado para detectar
          padrões. Quando vemos cara, cara, cara, cara, cara, cara... esperamos
          que a sequência "mude". Mas a moeda não sabe disso.
        </p>

        <div className="mat-box mat-box--rust">
          <p className="mat-box__titulo">⚠️ Falácia do apostador</p>
          <p>
            Acreditar que "coroa está devendo" depois de muitas caras seguidas
            é a <strong>falácia do apostador</strong> (em inglês:{" "}
            <em>gambler's fallacy</em>) — um dos erros mais documentados em
            psicologia do comportamento.
          </p>
          <p style={{ marginTop: 8 }}>
            O caso mais famoso aconteceu no Cassino de Monte Carlo em 1913:
            a roleta saiu "preto" 26 vezes seguidas. Os apostadores perderam
            milhões apostando em "vermelho" a cada rodada, convictos de que
            a sequência tinha que acabar. Ela acabou — mas não porque estava
            "devendo". Acabou porque a probabilidade sempre existiu.
          </p>
          <p style={{ marginTop: 8 }}>
            Na Lotofácil, a dezena 17 não tem mais chance de sair por não ter
            saído nos últimos 30 concursos. Cada sorteio começa do zero.
          </p>
        </div>

        <h2 className="mat-h2">Probabilidade composta: eventos em sequência</h2>
        <p>
          O que muda quando consideramos múltiplos eventos? Aí a probabilidade
          de <em>sequências</em> se torna interessante.
        </p>
        <p>
          A probabilidade de sair cara <em>duas vezes seguidas</em> é:
          P(cara) × P(cara) = 1/2 × 1/2 = 1/4 = 25%. Para três vezes seguidas:
          1/2 × 1/2 × 1/2 = 1/8 = 12,5%. Para 10 vezes seguidas:
          (1/2)¹⁰ = 1/1024 ≈ 0,1%.
        </p>
        <p>
          Ou seja: a sequência de 10 caras é rara <em>antes de começar</em>.
          Mas depois que as 9 primeiras caras já saíram, a probabilidade de
          sair cara na 10ª é, de novo, 50%. O evento futuro não é afetado
          pelos eventos passados.
        </p>

        <div className="mat-formula">
          <div className="mat-formula__linha">P(A e B independentes) = P(A) × P(B)</div>
          <div className="mat-formula__exemplo">P(cara 10 vezes seguidas) = (1/2)¹⁰ = 1/1024 ≈ 0,098%</div>
        </div>

        <h2 className="mat-h2">Probabilidade não é certeza — mesmo com 99%</h2>
        <p>
          "70% de chance de chuva" não significa que vai chover 70% do dia.
          Significa: em situações meteorológicas idênticas a esta, medidas
          historicamente, choveu em 70 de cada 100 casos.
        </p>
        <p>
          Probabilidade descreve o <em>longo prazo de eventos repetidos</em>.
          Num evento único, ela quantifica incerteza — "mais provável que sim
          do que não". Um paciente com 99% de sobrevivência em uma cirurgia
          ainda tem 1% de não sobreviver. Isso não é pessimismo — é honestidade matemática.
        </p>

        <h2 className="mat-h2">A probabilidade do "quase" — por que tão perto machuca</h2>
        <p>
          Um caso especial que confunde muitas pessoas: acertar 14 de 15 dezenas
          na Lotofácil parece "quase" ganhar. Mas a probabilidade de acertar
          exatamente 14 (faixa 2) é 1 em 228.854 — muito diferente de 1 em
          3.268.760 da faixa 1, mas ainda remotíssima.
        </p>
        <p>
          O "quase" existe na nossa percepção, não na matemática. A distância
          entre "1 dezena errada" e "0 dezenas erradas" em termos de probabilidade
          é de 14× — não de "quase nada".
        </p>

        <h2 className="mat-h2">Probabilidade condicional: P(A | B)</h2>
        <p>
          A probabilidade condicional (em inglês: <em>conditional probability</em>)
          responde: "qual a probabilidade de A acontecer, <em>dado que</em> B já aconteceu?"
        </p>
        <p>
          Exemplo: uma pessoa tossindo. P(gripe) talvez seja 10% na população geral.
          Mas P(gripe | tossindo) é maior — a informação de que a pessoa tosse
          aumenta a probabilidade de gripe. Isso é o{" "}
          <strong>Teorema de Bayes</strong> (em inglês: <em>Bayes' theorem</em>),
          base de diagnósticos médicos, filtros de spam e muito mais.
        </p>

        <div className="mat-box mat-box--pine">
          <p className="mat-box__titulo">📐 Probabilidade condicional</p>
          <p>P(A | B) = P(A e B) ÷ P(B)</p>
          <p style={{ marginTop: 8 }}>
            Lê-se: "probabilidade de A dado B". O denominador P(B) "restringe"
            o universo de possibilidades ao cenário em que B já aconteceu.
          </p>
          <p style={{ marginTop: 8 }}>
            Importante: P(A | B) ≠ P(B | A). A probabilidade de ter gripe dado
            que tosse ≠ probabilidade de tossir dado que tem gripe. Confundir
            os dois é um erro grave chamado de falácia da transposição condicional
            (em inglês: <em>transposition fallacy</em>).
          </p>
        </div>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 4 pontos</p>
          <ol className="mat-resumo__lista">
            <li>P(evento) = casos favoráveis ÷ casos totais (quando todos têm a mesma chance).</li>
            <li>Eventos independentes não se influenciam — a moeda não tem memória, nem a loteria.</li>
            <li>P(A e B) = P(A) × P(B) para eventos independentes. Sequências se tornam muito raras.</li>
            <li>Probabilidade condicional P(A|B): o conhecimento de B muda a probabilidade de A.</li>
          </ol>
        </div>

        <p style={{ marginTop: 24 }}>
          <Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link>
        </p>
      </main>
    </>
  );
}
