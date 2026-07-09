import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { BrincadeiraGuardaRoupa, CalculadoraCnk } from "./ConteudoClient";

const TITULO = "Combinatória: a matemática de contar escolhas sem contar de um em um";
const DESCRICAO = "Entenda combinatória com exemplos do dia a dia: guarda-roupa, cardápio, times de futebol e loteria. Com componentes interativos e a fórmula C(n,k) explicada do zero.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: `${SITE_URL}/matematica/combinatoria` },
  openGraph: { title: TITULO, description: DESCRICAO, url: `${SITE_URL}/matematica/combinatoria`, siteName: SITE_NAME, locale: "pt_BR", type: "article", images: [`${SITE_URL}/opengraph-image`] },
};

export default function ArtigoCombinatoriaPage() {
  return (
    <>
      <Masthead matematicaAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow">
          <Link href="/matematica" className="breadcrumb">← Matemática sem mistério</Link>
        </p>

        <div className="mat-artigo-header mat-artigo-header--pine">
          <span className="mat-artigo-emoji">🎽</span>
          <div>
            <p className="mat-artigo-conceito">Combinações e arranjos (em inglês: <em>combinatorics</em>)</p>
            <h1 className="titulo-edicao">Combinatória</h1>
          </div>
        </div>

        <p className="subtitulo-edicao">
          A arte de contar possibilidades sem precisar listar todas elas —
          e por que a Lotofácil tem mais de 3 milhões de combinações possíveis
          mesmo usando apenas os números de 1 a 25.
        </p>

        <BrincadeiraGuardaRoupa />

        <h2 className="mat-h2">O que acabou de acontecer aí?</h2>
        <p>
          Você acabou de usar combinatória sem saber. Quando você tem 5 camisas,
          4 calças e 3 pares de tênis, o número total de visuais diferentes é
          simplesmente 5 × 4 × 3 = 60. Isso tem um nome formal:
          <strong> Princípio Multiplicativo</strong>.
        </p>
        <p>
          A lógica é simples: para cada uma das 5 camisas, você pode combinar com
          qualquer uma das 4 calças — são 5 × 4 = 20 combinações de cima e baixo.
          Para cada uma dessas 20 combinações, você pode calçar qualquer um dos
          3 tênis. Total: 20 × 3 = 60 visuais distintos.
        </p>
        <p>
          Perceba que nem precisamos listar os 60 visuais para saber que são 60.
          Esse é o poder da combinatória: <strong>contar sem enumerar</strong>.
        </p>

        <div className="mat-box mat-box--pine">
          <p className="mat-box__titulo">📐 Princípio Multiplicativo</p>
          <p>
            Se uma escolha pode ser feita de <strong>m</strong> formas e, para
            cada uma dessas formas, uma segunda escolha pode ser feita de{" "}
            <strong>n</strong> formas, então o total de maneiras de fazer as
            duas escolhas juntas é <strong>m × n</strong>.
          </p>
          <p style={{ marginTop: 8 }}>
            Isso se estende para quantas escolhas você quiser encadear:
            m₁ × m₂ × m₃ × ... × mₖ. Cada etapa multiplica as possibilidades.
          </p>
        </div>

        <h2 className="mat-h2">Quando a ordem importa — e quando não importa</h2>
        <p>
          Agora imagine uma situação diferente: você tem 5 amigos — Ana, Bruno,
          Carla, Diego e Eva — e quer escolher 2 para ir a um show com você.
          Quantas formas existem de fazer essa escolha?
        </p>
        <p>
          A resposta depende de uma pergunta crucial: <strong>a ordem importa?</strong>
        </p>
        <p>
          Se você está escolhendo um <em>grupo</em> para ir ao show, chamar
          "Ana e Bruno" é a mesma coisa que chamar "Bruno e Ana". A ordem não importa.
          Esse tipo de seleção se chama <strong>combinação</strong>{" "}
          (em inglês: <em>combination</em>).
        </p>
        <p>
          Se você está escolhendo o <em>primeiro lugar</em> e o
          <em> segundo lugar</em> de uma corrida, "Ana em 1º, Bruno em 2º" é
          completamente diferente de "Bruno em 1º, Ana em 2º". A ordem importa.
          Esse tipo de seleção se chama <strong>arranjo</strong> ou
          <strong> permutação</strong> (em inglês: <em>permutation</em>).
        </p>

        <div className="mat-svg-wrap">
          <svg viewBox="0 0 680 220" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", maxWidth: 680 }}>
            {/* Título Permutação */}
            <text x="10" y="28" fontFamily="var(--font-display)" fontSize="14" fill="var(--ink)" fontWeight="bold">Arranjo (ordem IMPORTA) — Ana→Bruno ≠ Bruno→Ana</text>
            {["Ana→Bruno", "Bruno→Ana", "Ana→Carla", "Carla→Ana", "..."].map((txt, i) => (
              <g key={i} transform={`translate(${10 + i * 130}, 40)`}>
                <rect width="120" height="38" rx="4" fill={i % 2 === 0 ? "#1e4b3c" : "#8e3a2a"} opacity="0.12"/>
                <rect width="120" height="38" rx="4" fill="none" stroke={i % 2 === 0 ? "#1e4b3c" : "#8e3a2a"} strokeWidth="1.5"/>
                <text x="60" y="24" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12" fill={i % 2 === 0 ? "#1e4b3c" : "#8e3a2a"}>{txt}</text>
              </g>
            ))}
            <text x="10" y="102" fontFamily="var(--font-mono)" fontSize="11" fill="var(--rust)">Total: 5 × 4 = 20 arranjos possíveis</text>

            {/* Título Combinação */}
            <text x="10" y="140" fontFamily="var(--font-display)" fontSize="14" fill="var(--ink)" fontWeight="bold">Combinação (ordem NÃO importa) — Ana+Bruno = Bruno+Ana</text>
            {["Ana+Bruno", "Ana+Carla", "Ana+Diego", "Ana+Eva", "Bruno+Carla", "..."].map((txt, i) => (
              <g key={i} transform={`translate(${10 + (i % 3) * 215}, ${160 + Math.floor(i/3) * 44})`}>
                <rect width="200" height="36" rx="4" fill="#1e4b3c" opacity="0.1"/>
                <rect width="200" height="36" rx="4" fill="none" stroke="#1e4b3c" strokeWidth="1.5"/>
                <text x="100" y="23" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12" fill="#1e4b3c">{txt}</text>
              </g>
            ))}
            <text x="10" y="215" fontFamily="var(--font-mono)" fontSize="11" fill="var(--pine)">Total: C(5,2) = 10 combinações únicas</text>
          </svg>
        </div>

        <h2 className="mat-h2">A fórmula de C(n, k) — sem decoreba</h2>
        <p>
          Para calcular quantas formas existem de escolher{" "}
          <strong>k itens</strong> de um grupo de <strong>n elementos</strong>
          sem se importar com a ordem, existe a fórmula de combinação. Mas em vez
          de decorar, vamos entender de onde ela vem.
        </p>
        <p>
          <strong>Passo 1:</strong> Imagine que a ordem importa. Quantas formas
          existem de escolher 2 amigos de 5 em que a ordem importa? Para a
          primeira posição, temos 5 opções. Para a segunda, restam 4.
          Total de arranjos: 5 × 4 = 20.
        </p>
        <p>
          <strong>Passo 2:</strong> Mas a ordem não importa. Cada par de amigos
          aparece 2 vezes nos 20 arranjos (Ana-Bruno e Bruno-Ana são o mesmo par).
          Então dividimos por 2: 20 ÷ 2 = 10 combinações.
        </p>
        <p>
          Generalizando: escolher k de n (sem ordem) = arranjos ÷ ordens possíveis
          de k itens = (n × (n−1) × ... × (n−k+1)) ÷ (k × (k−1) × ... × 1).
        </p>

        <div className="mat-formula">
          <div className="mat-formula__linha">C(n, k) = n! ÷ [ k! × (n − k)! ]</div>
          <div className="mat-formula__exemplo">C(5, 2) = 5! ÷ (2! × 3!) = 120 ÷ (2 × 6) = 120 ÷ 12 = 10 ✓</div>
        </div>

        <p>
          O símbolo "!" é o <Link href="/matematica/fatorial" className="breadcrumb">fatorial</Link> —
          5! significa 5 × 4 × 3 × 2 × 1 = 120. O artigo sobre fatorial explica
          por que esse número cresce de forma absurda conforme n aumenta.
        </p>

        <h2 className="mat-h2">Experimente você mesmo</h2>
        <p>
          Use a calculadora abaixo para explorar qualquer combinação de n e k.
          Repare como o resultado cresce rapidamente — e o que acontece quando
          você testa os valores da Lotofácil (n=25, k=15) ou da Mega-Sena (n=60, k=6).
        </p>

        <CalculadoraCnk />

        <h2 className="mat-h2">Por que a Lotofácil tem 3 milhões de combinações?</h2>
        <p>
          Na Lotofácil, você escolhe 15 números de um universo de 25. A ordem
          não importa — tanto faz a sequência em que você marcou os números na
          volante. Isso é exatamente uma combinação C(25, 15).
        </p>
        <p>
          Use a calculadora com n=25 e k=15: você verá <strong>3.268.760</strong>.
          Esse é o número total de formas diferentes de marcar uma Lotofácil —
          e por isso a chance de acertar as 15 dezenas com uma única aposta
          simples é de 1 em 3.268.760.
        </p>
        <p>
          Por que a Mega-Sena é mais difícil mesmo escolhendo menos números (6)?
          Porque o universo é muito maior (60 números). C(60, 6) = 50.063.860 —
          cerca de 15 vezes mais combinações possíveis do que a Lotofácil.
        </p>

        <div className="mat-box mat-box--ochre">
          <p className="mat-box__titulo">🎯 Comparação entre loterias</p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem", fontFamily: "var(--font-mono)" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--line)" }}>
                  <th style={{ textAlign: "left", padding: "6px 8px", color: "var(--ochre)" }}>Loteria</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", color: "var(--ochre)" }}>Universo (n)</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", color: "var(--ochre)" }}>Escolhidos (k)</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", color: "var(--ochre)" }}>C(n, k)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Lotofácil", "25", "15", "3.268.760"],
                  ["Mega-Sena", "60", "6", "50.063.860"],
                  ["Quina", "80", "5", "24.040.016"],
                  ["Dupla Sena", "50", "6", "15.890.700"],
                  ["Dia de Sorte", "31", "7", "2.629.575"],
                ].map(([nome, n, k, cnk]) => (
                  <tr key={nome} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "6px 8px" }}>{nome}</td>
                    <td style={{ textAlign: "right", padding: "6px 8px" }}>{n}</td>
                    <td style={{ textAlign: "right", padding: "6px 8px" }}>{k}</td>
                    <td style={{ textAlign: "right", padding: "6px 8px", fontWeight: 700, color: "var(--ochre)" }}>{cnk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <h2 className="mat-h2">Combinatória no cotidiano</h2>

        <p>
          <strong>Cardápio executivo:</strong> um restaurante oferece 4 opções de
          prato principal, 3 de acompanhamento e 2 de bebida. São 4 × 3 × 2 = 24
          combinações possíveis — mesmo que o cardápio caiba em meia folha.
        </p>
        <p>
          <strong>Senha numérica de 4 dígitos:</strong> com os dígitos de 0 a 9,
          existem 10 × 10 × 10 × 10 = 10.000 senhas possíveis (a ordem importa e
          repetições são permitidas — isso é uma <em>variação com repetição</em>).
          Se não puder repetir dígitos: 10 × 9 × 8 × 7 = 5.040 senhas
          (arranjo sem repetição).
        </p>
        <p>
          <strong>Time de futebol:</strong> quantos times de 11 jogadores você
          pode escalar a partir de um elenco de 23? C(23, 11) = 1.352.078.
          Dá para escalar um time diferente a cada jogo durante mais de
          36.000 anos sem repetir.
        </p>
        <p>
          <strong>Sequência de DNA:</strong> o DNA usa apenas 4 bases (A, T, C, G).
          Mas um gene com 1.000 bases pode ter 4¹⁰⁰⁰ sequências diferentes —
          um número maior do que o número de átomos no universo observável.
          Isso explica a diversidade biológica infinita com um alfabeto mínimo.
        </p>

        <h2 className="mat-h2">Uma intuição importante: por que dividir pelo fatorial?</h2>
        <p>
          Quando calculamos arranjos (ordem importa), contamos "Ana-Bruno" e
          "Bruno-Ana" como duas coisas diferentes. Quando queremos combinações,
          precisamos "desfazer" essa contagem dupla dividindo pelo número de
          formas de reordenar os k elementos escolhidos.
        </p>
        <p>
          Quantas formas existem de reordenar k elementos entre si? Isso é o
          fatorial de k: k!. Para k=2: 2! = 2 ordens (AB e BA). Para k=3:
          3! = 6 ordens (ABC, ACB, BAC, BCA, CAB, CBA). Dividir pelo fatorial
          cancela todas as reordenações, deixando só as combinações únicas.
        </p>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 4 pontos</p>
          <ol className="mat-resumo__lista">
            <li>Princípio Multiplicativo: escolhas encadeadas se multiplicam — m₁ × m₂ × m₃.</li>
            <li>Quando a ordem importa: é arranjo (permutação). Quando não importa: é combinação.</li>
            <li>C(n, k) = n! ÷ (k! × (n−k)!) — divide pelo fatorial para eliminar ordens duplicadas.</li>
            <li>Na loteria, C(n, k) dá o total de combinações possíveis e determina a probabilidade da faixa principal.</li>
          </ol>
        </div>

        <div className="aviso-legal" style={{ marginTop: 36 }}>
          Este artigo é conteúdo educativo. Os exemplos de loteria ilustram aplicações
          reais do conceito — não são estratégias de jogo.
        </div>

        <p style={{ marginTop: 24 }}>
          <Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link>
        </p>
      </main>
    </>
  );
}
