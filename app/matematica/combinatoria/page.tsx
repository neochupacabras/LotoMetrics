import Link from "next/link";
import Masthead from "@/components/Masthead";
import { BrincadeiraGuardaRoupa, fat, comb, CalculadoraCnk } from "./ConteudoClient";
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
            <p className="mat-artigo-conceito">Combinações e permutações</p>
            <h1 className="titulo-edicao">Combinatória</h1>
          </div>
        </div>

        <p className="subtitulo-edicao">
          Por que é impossível escolher roupa diferente todo dia por uma vida inteira
          — e como o mesmo raciocínio explica por que a Lotofácil tem 3 milhões de
          combinações possíveis.
        </p>

        {/* ── Card de abertura interativo ── */}
        <BrincadeiraGuardaRoupa />

        <h2 className="mat-h2">O que acabou de acontecer aí?</h2>
        <p>
          Você acabou de fazer combinatória sem saber. Quando você tem 5 camisas,
          4 calças e 3 pares de tênis, o número total de looks possíveis é simplesmente
          5 × 4 × 3 = 60. Isso tem um nome: <strong>Princípio Multiplicativo</strong>.
        </p>
        <p>
          A lógica é: para cada uma das 5 camisas, você pode combinar com qualquer
          uma das 4 calças (5 × 4 = 20 combinações de cima e baixo). Para cada uma
          dessas 20 combinações, você pode calçar qualquer um dos 3 tênis.
          Total: 20 × 3 = 60.
        </p>

        {/* ── Box conceito ── */}
        <div className="mat-box mat-box--pine">
          <p className="mat-box__titulo">📐 Princípio Multiplicativo</p>
          <p>
            Se uma escolha pode ser feita de <strong>m</strong> maneiras e, para
            cada uma dessas maneiras, uma segunda escolha pode ser feita de{" "}
            <strong>n</strong> maneiras, então o total de formas de fazer
            as duas escolhas é <strong>m × n</strong>.
          </p>
          <p>
            Funciona para qualquer número de escolhas encadeadas:
            m₁ × m₂ × m₃ × ... × mₖ
          </p>
        </div>

        <h2 className="mat-h2">Quando a ordem importa — e quando não importa</h2>
        <p>
          Agora um cenário diferente: você tem 5 amigos e quer escolher 2 para ir
          a um show com você. Quantas formas você tem de fazer isso?
        </p>
        <p>
          Se você chamar Ana e Bruno, é o mesmo grupo de se chamar Bruno e Ana.
          A <strong>ordem não importa</strong> — você está formando um grupo,
          não uma fila. Esse tipo de seleção se chama <strong>Combinação</strong>.
        </p>

        {/* ── Ilustração SVG: combinação vs permutação ── */}
        <div className="mat-svg-wrap">
          <svg viewBox="0 0 680 200" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", maxWidth: 680 }}>
            {/* Permutação */}
            <text x="10" y="28" fontFamily="var(--font-display)" fontSize="14" fill="var(--ink)" fontWeight="bold">Permutação — a ordem IMPORTA</text>
            {["Ana→Bruno", "Bruno→Ana"].map((txt, i) => (
              <g key={i} transform={`translate(${10 + i * 200}, 45)`}>
                <rect width="170" height="40" rx="4" fill={i === 0 ? "#1e4b3c" : "#8e3a2a"} opacity="0.15"/>
                <rect width="170" height="40" rx="4" fill="none" stroke={i === 0 ? "#1e4b3c" : "#8e3a2a"} strokeWidth="1.5"/>
                <text x="85" y="25" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13" fill={i === 0 ? "#1e4b3c" : "#8e3a2a"}>{txt}</text>
              </g>
            ))}
            <text x="420" y="72" fontFamily="var(--font-body)" fontSize="13" fill="var(--rust)" fontWeight="bold">= 2 resultados diferentes</text>

            {/* Combinação */}
            <text x="10" y="138" fontFamily="var(--font-display)" fontSize="14" fill="var(--ink)" fontWeight="bold">Combinação — a ordem NÃO importa</text>
            <g transform="translate(10, 150)">
              <rect width="170" height="40" rx="4" fill="#1e4b3c" opacity="0.15"/>
              <rect width="170" height="40" rx="4" fill="none" stroke="#1e4b3c" strokeWidth="1.5"/>
              <text x="85" y="25" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13" fill="#1e4b3c">Ana + Bruno</text>
            </g>
            <g transform="translate(200, 150)">
              <rect width="170" height="40" rx="4" fill="#b9802c" opacity="0.1"/>
              <rect width="170" height="40" rx="4" fill="none" stroke="#b9802c" strokeWidth="1.5" strokeDasharray="6 3"/>
              <text x="85" y="25" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13" fill="#b9802c">Bruno + Ana</text>
              <text x="85" y="52" textAnchor="middle" fontFamily="var(--font-body)" fontSize="11" fill="#b9802c">← mesmo grupo!</text>
            </g>
            <text x="420" y="178" fontFamily="var(--font-body)" fontSize="13" fill="var(--pine)" fontWeight="bold">= 1 resultado único</text>
          </svg>
        </div>

        <h2 className="mat-h2">A fórmula de C(n, k)</h2>
        <p>
          Para calcular quantas formas existem de escolher <strong>k</strong> itens
          de um grupo de <strong>n</strong>, sem se importar com a ordem, existe
          uma fórmula. Vamos entendê-la em partes, sem decorar nada.
        </p>
        <p>
          Primeiro: se a ordem <em>importasse</em>, o número de formas de escolher
          2 amigos de 5 seria 5 × 4 = 20 (para o 1º lugar temos 5 opções; para o
          2º, só 4 restam). Mas a ordem não importa — e como cada par aparece
          2 vezes (Ana-Bruno e Bruno-Ana), dividimos por 2. Resultado: 20 ÷ 2 = 10.
        </p>

        <div className="mat-formula">
          <div className="mat-formula__linha">
            C(n, k) = n! ÷ (k! × (n−k)!)
          </div>
          <div className="mat-formula__exemplo">
            C(5, 2) = 5! ÷ (2! × 3!) = 120 ÷ (2 × 6) = 120 ÷ 12 = <strong>10</strong>
          </div>
        </div>

        <p>
          O símbolo "!" é o <Link href="/matematica/fatorial" className="breadcrumb">fatorial</Link>{" "}
          — 5! significa 5 × 4 × 3 × 2 × 1 = 120. O artigo sobre fatorial explica
          por que esse número cresce de forma absurda.
        </p>

        {/* ── Calculadora interativa ── */}
        <CalculadoraCnk />

        <h2 className="mat-h2">Agora a conexão com a Lotofácil</h2>
        <p>
          Na Lotofácil, você escolhe 15 números de um universo de 25. A ordem
          não importa — tanto faz se você marcou o 3 antes do 17 ou depois.
          Isso é exatamente uma combinação: C(25, 15).
        </p>
        <p>
          Use a calculadora acima com n=25 e k=15: você vai ver{" "}
          <strong>3.268.760</strong> — que é exatamente o número de combinações
          possíveis da Lotofácil, e portanto a probabilidade de ganhar na
          faixa principal com uma aposta simples é 1 em 3.268.760.
        </p>

        <div className="mat-box mat-box--ochre">
          <p className="mat-box__titulo">🎯 Conexão com a loteria</p>
          <div className="tabela-scroll">
            <table className="tabela-dados">
              <thead>
                <tr>
                  <th>Loteria</th>
                  <th className="num">Universo (n)</th>
                  <th className="num">Escolhidos (k)</th>
                  <th className="num">C(n, k)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Lotofácil</td>
                  <td className="num">25</td>
                  <td className="num">15</td>
                  <td className="num">3.268.760</td>
                </tr>
                <tr>
                  <td>Mega-Sena</td>
                  <td className="num">60</td>
                  <td className="num">6</td>
                  <td className="num">50.063.860</td>
                </tr>
                <tr>
                  <td>Quina</td>
                  <td className="num">80</td>
                  <td className="num">5</td>
                  <td className="num">24.040.016</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: 12 }}>
            Quanto maior o universo e menor a proporção escolhida, mais
            difícil fica. C(60, 6) é ~15 vezes maior que C(25, 15) —
            por isso a Mega-Sena é muito mais difícil que a Lotofácil.
          </p>
        </div>

        <h2 className="mat-h2">Combinatória no cotidiano</h2>
        <p>
          <strong>Cardápio de restaurante:</strong> se um prato executivo tem
          4 opções de carne, 3 de acompanhamento e 2 de bebida, são
          4 × 3 × 2 = 24 pratos executivos diferentes — mesmo que o cardápio
          caiba numa folha.
        </p>
        <p>
          <strong>Senha de 4 dígitos:</strong> com dígitos de 0 a 9, existem
          10 × 10 × 10 × 10 = 10.000 senhas possíveis. Se a senha não puder
          repetir dígitos, são 10 × 9 × 8 × 7 = 5.040 (ordem importa =
          permutação, não combinação).
        </p>
        <p>
          <strong>Time de futebol:</strong> quantos times de 11 jogadores
          diferentes você pode escalar de um grupo de 20? C(20, 11) = 167.960.
          Dá pra escalar times diferentes toda rodada por 10 anos e ainda
          ter combinações sobrando.
        </p>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 3 pontos</p>
          <ol className="mat-resumo__lista">
            <li>Quando a ordem <strong>importa</strong>, é <em>permutação</em> (fila, senha, pódio).</li>
            <li>Quando a ordem <strong>não importa</strong>, é <em>combinação</em> (grupo, time, loteria).</li>
            <li>C(n, k) = n! ÷ (k! × (n−k)!) calcula o número de combinações possíveis.</li>
          </ol>
        </div>

        <div className="aviso-legal" style={{ marginTop: 36 }}>
          Este artigo é conteúdo educativo de matemática. Os exemplos de loteria
          ilustram aplicações reais do conceito — não são estratégias de jogo.
        </div>

        <p style={{ marginTop: 24 }}>
          <Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link>
        </p>
      </main>
    </>
  );
}
