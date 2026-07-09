import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { CalculadoraFatorial } from "./ConteudoClient";

const TITULO = "Fatorial: o número que cresce mais rápido do que qualquer coisa que você já viu";
const DESCRICAO = "Entenda o fatorial com exemplos concretos: baralho, senhas, permutações e a fórmula de combinações. Por que 52! torna cada embaralhamento único no universo.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: `${SITE_URL}/matematica/fatorial` },
  openGraph: { title: TITULO, description: DESCRICAO, url: `${SITE_URL}/matematica/fatorial`, siteName: SITE_NAME, locale: "pt_BR", type: "article", images: [`${SITE_URL}/opengraph-image`] },
};

export default function ArtigoFatorialPage() {
  return (
    <>
      <Masthead matematicaAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow">
          <Link href="/matematica" className="breadcrumb">← Matemática sem mistério</Link>
        </p>
        <div className="mat-artigo-header mat-artigo-header--rust">
          <span className="mat-artigo-emoji">💥</span>
          <div>
            <p className="mat-artigo-conceito">Fatorial e crescimento explosivo (em inglês: <em>factorial and explosive growth</em>)</p>
            <h1 className="titulo-edicao">Fatorial</h1>
          </div>
        </div>
        <p className="subtitulo-edicao">
          O número que cresce mais rápido do que qualquer coisa que você já viu —
          e por que toda vez que você embaralha um baralho direito, aquela ordem
          provavelmente nunca existiu antes na história do universo.
        </p>

        <CalculadoraFatorial />

        <h2 className="mat-h2">O que é fatorial?</h2>
        <p>
          Fatorial de um número <strong>n</strong> — escrito como <strong>n!</strong>
          — é o produto de todos os números inteiros positivos de 1 até n.
        </p>
        <div className="mat-formula">
          <div className="mat-formula__linha">n! = n × (n−1) × (n−2) × ... × 2 × 1</div>
          <div className="mat-formula__exemplo">
            1! = 1{"\n"}
            2! = 2 × 1 = 2{"\n"}
            3! = 3 × 2 × 1 = 6{"\n"}
            4! = 4 × 3 × 2 × 1 = 24{"\n"}
            5! = 5 × 4 × 3 × 2 × 1 = 120{"\n"}
            10! = 3.628.800{"\n"}
            20! = 2.432.902.008.176.640.000
          </div>
        </div>
        <p>
          Por convenção matemática, 0! = 1. Parece estranho, mas é necessário
          para que as fórmulas de combinação funcionem corretamente (o
          "número de formas de ordenar zero itens" é 1 — há exatamente uma
          forma de não fazer nada).
        </p>

        <h2 className="mat-h2">Por que o fatorial aparece em contagem?</h2>
        <p>
          O fatorial surge naturalmente quando perguntamos: de quantas formas
          diferentes posso arranjar (ordenar) n objetos distintos?
        </p>
        <p>
          Imagine 3 livros — "A", "B" e "C" — numa prateleira. De quantas formas
          você pode organizá-los? Para a primeira posição, tem 3 escolhas. Para
          a segunda, restam 2. Para a terceira, resta 1. Total: 3 × 2 × 1 = 6.
        </p>
        <p>
          Essas 6 organizações são: ABC, ACB, BAC, BCA, CAB, CBA. Exatamente
          3! = 6. Cada arranjo possível de n objetos é chamado de{" "}
          <strong>permutação</strong> (em inglês: <em>permutation</em>), e o
          total de permutações de n objetos distintos é sempre n!.
        </p>

        <h2 className="mat-h2">O baralho que nunca existiu</h2>
        <p>
          Um baralho padrão tem 52 cartas. Quantas ordens diferentes ele pode
          ser embaralhado? A resposta é 52!.
        </p>
        <p>
          Use a calculadora acima com n=52. Você verá um número com{" "}
          <strong>68 dígitos</strong>:
        </p>
        <div className="mat-formula">
          <div className="mat-formula__linha">52! ≈ 8,07 × 10⁶⁷</div>
          <div className="mat-formula__exemplo">
            = 80.658.175.170.943.878.571.660.636.856.403.766.975.289.505.440.883.277.824.000.000.000.000
          </div>
        </div>
        <p>
          Para ter uma noção do tamanho: o número estimado de átomos no universo
          observável é aproximadamente 10⁸⁰. O 52! ≈ 8 × 10⁶⁷ já está na mesma
          ordem de grandeza.
        </p>

        <div className="mat-box mat-box--rust">
          <p className="mat-box__titulo">🃏 A consequência prática</p>
          <p>
            Imagine que toda pessoa que já existiu na Terra (estimados 100 bilhões
            de pessoas) tivesse embaralhado um baralho a cada segundo desde o
            Big Bang (13,8 bilhões de anos = aproximadamente 4,35 × 10¹⁷ segundos).
          </p>
          <p style={{ marginTop: 8 }}>
            Total de embaralhamentos: 100 × 10⁹ × 4,35 × 10¹⁷ ≈ 4,35 × 10²⁸.
          </p>
          <p style={{ marginTop: 8 }}>
            Isso é uma fração infinitesimal de 52! ≈ 8 × 10⁶⁷. A diferença entre
            os dois é de 39 ordens de magnitude.
          </p>
          <p style={{ marginTop: 8 }}>
            <strong>Conclusão:</strong> toda vez que você embaralha um baralho
            completamente (com vários cortes e riffle shuffles), a ordem resultante
            das 52 cartas quase certamente nunca existiu antes — e não vai existir
            de novo. Você acaba de criar algo único no universo.
          </p>
        </div>

        <h2 className="mat-h2">Fatorial e a fórmula de combinações</h2>
        <p>
          O fatorial é o ingrediente principal da fórmula de{" "}
          <Link href="/matematica/combinatoria" className="breadcrumb">combinações</Link>:
        </p>
        <div className="mat-formula">
          <div className="mat-formula__linha">C(n, k) = n! ÷ [ k! × (n − k)! ]</div>
          <div className="mat-formula__exemplo">
            C(25, 15) = 25! ÷ (15! × 10!) = 3.268.760 — combinações da Lotofácil
          </div>
        </div>
        <p>
          O denominador <strong>k!</strong> cancela as diferentes ordens dos
          k itens escolhidos (porque numa combinação, a ordem não importa).
          O denominador <strong>(n−k)!</strong> cancela os itens não escolhidos.
          O n! do numerador conta todas as permutações possíveis.
        </p>
        <p>
          Sem o fatorial, não seria possível calcular eficientemente o número
          de combinações possíveis — teríamos que listar tudo manualmente,
          o que é impraticável para números como 25 ou 60.
        </p>

        <h2 className="mat-h2">O crescimento explosivo na prática</h2>
        <p>
          O que torna o fatorial tão especial é a velocidade com que cresce.
          Compare com outras funções para n=10:
        </p>
        <div className="mat-box mat-box--ochre">
          <p className="mat-box__titulo">📈 Crescimento comparado (n = 10, 20, 30)</p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", fontFamily: "var(--font-mono)" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--line)" }}>
                  <th style={{ textAlign: "left", padding: "6px 8px", color: "var(--ochre)" }}>Função</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", color: "var(--ochre)" }}>n = 10</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", color: "var(--ochre)" }}>n = 20</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", color: "var(--ochre)" }}>n = 30</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["n (linear)", "10", "20", "30"],
                  ["n² (quadrático)", "100", "400", "900"],
                  ["2ⁿ (exponencial)", "1.024", "1.048.576", "1.073.741.824"],
                  ["n! (fatorial)", "3.628.800", "2,4 × 10¹⁸", "2,7 × 10³²"],
                ].map(([fn, v10, v20, v30]) => (
                  <tr key={fn} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "6px 8px" }}>{fn}</td>
                    <td style={{ textAlign: "right", padding: "6px 8px" }}>{v10}</td>
                    <td style={{ textAlign: "right", padding: "6px 8px" }}>{v20}</td>
                    <td style={{ textAlign: "right", padding: "6px 8px", fontWeight: 700 }}>{v30}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: 8, fontSize: "0.82rem" }}>
            O fatorial ultrapassa o exponencial rapidamente — e nunca mais olha para trás.
          </p>
        </div>

        <h2 className="mat-h2">Onde mais o fatorial aparece</h2>
        <p>
          <strong>Criptografia (em inglês: <em>cryptography</em>):</strong> a segurança
          de muitos sistemas depende de problemas computacionalmente difíceis que
          envolvem o fatorial. Percorrer todas as permutações possíveis é
          inviável para n grande.
        </p>
        <p>
          <strong>Algoritmos de busca:</strong> o problema do "caixeiro-viajante"
          — encontrar o caminho mais curto entre n cidades — tem (n−1)!/2
          rotas possíveis. Para 20 cidades, são mais de 60 trilhões de rotas.
          Por isso algoritmos aproximados são necessários.
        </p>
        <p>
          <strong>Análise combinatória em genética:</strong> o número de formas
          de herdar características de dois pais envolve fatoriais. Com 23
          pares de cromossomos, existem 2²³ = 8,4 milhões de combinações
          possíveis de cromossomos para um único filho — e isso sem contar
          a recombinação genética.
        </p>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 4 pontos</p>
          <ol className="mat-resumo__lista">
            <li>n! = n × (n−1) × ... × 2 × 1. Cresce explosivamente — 20! já tem 19 dígitos.</li>
            <li>Representa o número de formas de organizar n objetos em ordem (permutações).</li>
            <li>É o ingrediente da fórmula C(n,k) = n! ÷ (k! × (n−k)!) para combinações sem ordem.</li>
            <li>52! torna cada embaralhamento de baralho praticamente único no universo.</li>
          </ol>
        </div>

        <p style={{ marginTop: 24 }}>
          <Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link>
        </p>
      </main>
    </>
  );
}
